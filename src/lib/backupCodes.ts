import { supabase } from "@/integrations/supabase/client";

// Generate a random backup code
function generateCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Simple hash function for backup codes
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate backup codes for a user
export async function generateBackupCodes(userId: string): Promise<string[]> {
  const codes: string[] = [];
  const codeHashes: string[] = [];

  // Generate 8 backup codes
  for (let i = 0; i < 8; i++) {
    const code = generateCode();
    codes.push(code);
    codeHashes.push(await hashCode(code));
  }

  // Delete any existing backup codes for this user
  await supabase
    .from('mfa_backup_codes')
    .delete()
    .eq('user_id', userId);

  // Store hashed codes in database
  const { error } = await supabase
    .from('mfa_backup_codes')
    .insert(
      codeHashes.map(hash => ({
        user_id: userId,
        code_hash: hash,
      }))
    );

  if (error) {
    console.error('Error storing backup codes:', error);
    throw new Error('Failed to generate backup codes');
  }

  return codes;
}

// Verify and consume a backup code
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  try {
    const codeHash = await hashCode(code);

    // Find unused backup code with this hash
    const { data: backupCodes, error } = await supabase
      .from('mfa_backup_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code_hash', codeHash)
      .eq('used', false)
      .limit(1);

    if (error || !backupCodes || backupCodes.length === 0) {
      return false;
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('mfa_backup_codes')
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', backupCodes[0].id);

    if (updateError) {
      console.error('Error marking backup code as used:', updateError);
      return false;
    }

    return true;
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
