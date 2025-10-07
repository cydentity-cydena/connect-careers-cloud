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
  username: string;
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

    const { email, password, fullName, username, role }: SignupRequest = await req.json();

    console.log('Starting secure signup for:', email, 'with role:', role);

    // Validate username only for candidates
    if (role === 'candidate') {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!username || !usernameRegex.test(username)) {
        throw new Error('Invalid username format. Must be 3-20 characters with letters, numbers, and underscores only.');
      }

      // Check if username already exists
      const { data: existingUsername } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (existingUsername) {
        throw new Error('Username already taken. Please choose another.');
      }
    }

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

    // 2. Update profile with full_name and username (if provided)
    const profileUpdate: any = { full_name: fullName };
    if (username && username.trim()) {
      profileUpdate.username = username.toLowerCase();
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update failed:', profileError);
      // Cleanup: delete the auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error('Failed to update profile');
    }

    console.log('Profile updated successfully');

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

    // 4. If candidate, create candidate profile and XP data
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

      // Initialize XP data for candidate
      const { error: xpError } = await supabaseAdmin
        .from('candidate_xp')
        .insert({
          candidate_id: userId,
          total_xp: 0,
          level: 1,
          profile_completion_percent: 0,
        });

      if (xpError) {
        console.error('Candidate XP initialization failed:', xpError);
        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Failed to initialize candidate XP');
      }

      console.log('Candidate XP initialized successfully');
    }

    // 5. If employer, create employer credits
    if (role === 'employer') {
      const { error: creditsError } = await supabaseAdmin
        .from('employer_credits')
        .insert({
          employer_id: userId,
          credits: 0,
          total_purchased: 0,
        });

      if (creditsError) {
        console.error('Employer credits initialization failed:', creditsError);
        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Failed to initialize employer credits');
      }

      console.log('Employer credits initialized successfully');
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