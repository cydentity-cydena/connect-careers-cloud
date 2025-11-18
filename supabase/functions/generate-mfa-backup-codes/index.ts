import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate cryptographically secure backup code
function generateSecureCode(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(array[i] % characters.length);
  }
  return code;
}

// Secure hash function using PBKDF2
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
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
  
  const hashArray = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 8 secure backup codes
    const codes: string[] = [];
    const codeHashes: string[] = [];

    for (let i = 0; i < 8; i++) {
      const code = generateSecureCode();
      codes.push(code);
      codeHashes.push(await hashCode(code));
    }

    // Delete existing backup codes
    const { error: deleteError } = await supabase
      .from('mfa_backup_codes')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old codes:', deleteError);
      throw new Error('Failed to reset backup codes');
    }

    // Store hashed codes
    const { error: insertError } = await supabase
      .from('mfa_backup_codes')
      .insert(
        codeHashes.map(hash => ({
          user_id: user.id,
          code_hash: hash,
        }))
      );

    if (insertError) {
      console.error('Error storing backup codes:', insertError);
      throw new Error('Failed to store backup codes');
    }

    return new Response(
      JSON.stringify({ codes }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating backup codes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate backup codes' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
