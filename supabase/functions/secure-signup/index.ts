import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'candidate' | 'employer';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, fullName, role }: SignupRequest = await req.json();

    console.log('Starting secure signup for:', email, 'with role:', role);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      throw authError;
    }

    const userId = authData.user.id;
    console.log('Auth user created:', userId);

    // 2. Create profile (automatically created by trigger, but we verify)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile verification failed:', profileError);
      // Profile should be created by trigger, if not we have an issue
    }

    // 3. Assign role using service role (bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
      });

    if (roleError) {
      console.error('Role assignment failed:', roleError);
      // Cleanup: delete the auth user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error('Failed to assign user role');
    }

    console.log('Role assigned successfully:', role);

    // 4. If candidate, create candidate profile
    if (role === 'candidate') {
      const { error: candidateError } = await supabaseAdmin
        .from('candidate_profiles')
        .insert({
          user_id: userId,
          title: '',
          years_experience: 0,
        });

      if (candidateError) {
        console.error('Candidate profile creation failed:', candidateError);
        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Failed to create candidate profile');
      }

      console.log('Candidate profile created successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: authData.user.email,
          role: role,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Signup failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});