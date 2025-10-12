import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email: string;
  password?: string;
  fullName: string;
  username?: string;
  role: 'candidate' | 'employer' | 'recruiter';
  isOAuthCompletion?: boolean;
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

    // Input validation schema
    const SignupSchema = z.object({
      email: z.string().email({ message: "Invalid email format" }).max(255),
      password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100).optional(),
      fullName: z.string().min(1).max(200),
      role: z.enum(['candidate', 'employer', 'recruiter']),
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, { 
        message: "Username can only contain letters, numbers, hyphens and underscores" 
      }).optional(),
      companyName: z.string().max(200).optional(),
      oauthToken: z.string().optional(),
      isOAuthCompletion: z.boolean().optional()
    });

    const rawBody = await req.json();
    const validatedData = SignupSchema.parse(rawBody);
    const { email, password, fullName, username, role, isOAuthCompletion } = validatedData;

    console.log('Starting secure signup for:', email, 'with role:', role);

    // Validate professional email for employers and recruiters
    const publicEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'live.com', 'msn.com'];
    if (role === 'employer' || role === 'recruiter') {
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (publicEmailDomains.includes(emailDomain)) {
        throw new Error('Employers and recruiters must use a professional/company email address, not a personal email');
      }
    }

    // Validate username only for candidates (skip for OAuth as it's auto-generated)
    if (role === 'candidate' && !isOAuthCompletion) {
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

    let userId: string;
    let existingUser: any = null;

    // For OAuth completion, user already exists
    if (isOAuthCompletion) {
      // Get the user ID from the JWT token in the Authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization header for OAuth completion');
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (userError || !user) {
        console.error('Failed to get user from token:', userError);
        throw new Error('Failed to get user from token');
      }
      
      userId = user.id;
      existingUser = user;
      console.log('OAuth completion for existing user:', userId);
    } else {
      // Regular signup - create new user
      if (!password) {
        throw new Error('Password is required for regular signup');
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

      userId = authData.user.id;
      console.log('Auth user created:', userId);
    }

    // Auto-generate username for OAuth candidates if not provided
    let finalUsername = username;
    if (isOAuthCompletion && role === 'candidate' && !username) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      finalUsername = `user_${randomSuffix}`;
      console.log('Auto-generated username for OAuth candidate:', finalUsername);
    }

    const profileUpdate: any = { id: userId, full_name: fullName };
    if (finalUsername && finalUsername.trim()) {
      profileUpdate.username = finalUsername.toLowerCase();
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: existingUser?.email || email,
        ...profileUpdate,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile update failed:', profileError);
      // Cleanup: delete the auth user if profile update fails (only for new signups)
      if (!isOAuthCompletion) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      throw new Error('Failed to update profile');
    }

    console.log('Profile updated successfully');

    // 3. Assign role using service role (idempotent)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role: role,
        },
        { onConflict: 'user_id,role' }
      );

    if (roleError) {
      console.error('Role assignment failed:', roleError);
      // Cleanup: delete the auth user if role assignment fails (only for new signups)
      if (!isOAuthCompletion) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      throw new Error('Failed to assign user role');
    }

    console.log('Role assigned successfully:', role);

    // 4. If candidate, create candidate profile and XP data (idempotent)
    if (role === 'candidate') {
      // Candidate profile
      const { data: existingCand } = await supabaseAdmin
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingCand) {
        const { error: candidateError } = await supabaseAdmin
          .from('candidate_profiles')
          .insert({
            user_id: userId,
            title: '',
            years_experience: 0,
          });

        if (candidateError) {
          console.error('Candidate profile creation failed:', candidateError);
          if (!isOAuthCompletion) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
          }
          throw new Error('Failed to create candidate profile');
        }
        console.log('Candidate profile created successfully');
      } else {
        console.log('Candidate profile already exists, skipping');
      }

      // Candidate XP
      const { data: existingXp } = await supabaseAdmin
        .from('candidate_xp')
        .select('id')
        .eq('candidate_id', userId)
        .maybeSingle();

      if (!existingXp) {
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
          if (!isOAuthCompletion) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
          }
          throw new Error('Failed to initialize candidate XP');
        }
        console.log('Candidate XP initialized successfully');
      } else {
        console.log('Candidate XP already exists, skipping');
      }
    }

    // 5. If employer, create employer credits (idempotent)
    if (role === 'employer') {
      const { data: existingCredits } = await supabaseAdmin
        .from('employer_credits')
        .select('id')
        .eq('employer_id', userId)
        .maybeSingle();

      if (!existingCredits) {
        const { error: creditsError } = await supabaseAdmin
          .from('employer_credits')
          .insert({
            employer_id: userId,
            credits: 0,
            total_purchased: 0,
          });

        if (creditsError) {
          console.error('Employer credits initialization failed:', creditsError);
          if (!isOAuthCompletion) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
          }
          throw new Error('Failed to initialize employer credits');
        }
        console.log('Employer credits initialized successfully');
      } else {
        console.log('Employer credits already exist, skipping');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: email,
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