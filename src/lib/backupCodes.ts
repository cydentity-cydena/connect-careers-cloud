import { supabase } from "@/integrations/supabase/client";

// Generate backup codes for a user using secure server-side generation
export async function generateBackupCodes(userId: string): Promise<string[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  const { data, error } = await supabase.functions.invoke('generate-mfa-backup-codes', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error || !data?.codes) {
    console.error('Error generating backup codes:', error);
    throw new Error('Failed to generate backup codes');
  }

  return data.codes;
}

// Verify a backup code against stored hash
async function verifyCodeHash(code: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    
    // Decode the stored hash (salt + hash combined in base64)
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    
    // Hash the provided code with the same salt
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(code),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const computedHash = new Uint8Array(derivedBits);
    
    // Constant-time comparison
    if (computedHash.length !== storedHashBytes.length) return false;
    
    let match = true;
    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== storedHashBytes[i]) match = false;
    }
    
    return match;
  } catch (error) {
    console.error('Error verifying code hash:', error);
    return false;
  }
}

// Verify and consume a backup code
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  try {
    // Fetch all unused backup codes for this user
    const { data: backupCodes, error } = await supabase
      .from('mfa_backup_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false);

    if (error || !backupCodes || backupCodes.length === 0) {
      return false;
    }
    
    // Try to verify against each stored hash
    for (const backupCode of backupCodes) {
      if (await verifyCodeHash(code, backupCode.code_hash)) {

        // Mark code as used
        const { error: updateError } = await supabase
          .from('mfa_backup_codes')
          .update({
            used: true,
            used_at: new Date().toISOString(),
          })
          .eq('id', backupCode.id);

        if (updateError) {
          console.error('Error marking backup code as used:', updateError);
          return false;
        }

        return true;
      }
    }
    
    // No matching code found
    return false;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
}

// Get count of remaining backup codes
export async function getRemainingBackupCodes(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('mfa_backup_codes')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('used', false);

  if (error) {
    console.error('Error getting backup code count:', error);
    return 0;
  }

  return data?.length || 0;
}
