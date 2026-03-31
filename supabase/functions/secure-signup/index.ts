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
  isFounding200?: boolean;
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
      isOAuthCompletion: z.boolean().optional(),
      isFounding200: z.boolean().optional()
    });

    const rawBody = await req.json();
    const validatedData = SignupSchema.parse(rawBody);
    const { email, password, fullName, username, role, isOAuthCompletion, isFounding200 } = validatedData;

    // Defense in depth: Explicitly reject privileged roles even though Zod already restricts
    const FORBIDDEN_SIGNUP_ROLES = ['admin', 'staff'];
    if (FORBIDDEN_SIGNUP_ROLES.includes(role)) {
      throw new Error('This role requires administrative approval');
    }

    console.log('Starting secure signup for:', email, 'with role:', role, isFounding200 ? '(Founding 200)' : '');

    // Open registration - no allowlist required for candidates, employers, and recruiters
    if (isOAuthCompletion) {
      console.log('OAuth completion - proceeding with profile setup');
    } else if (isFounding200) {
      console.log('Founding 200 signup - checking availability');
      
      // Check if Founding 200 is still available
      const { data: availability, error: availError } = await supabaseAdmin
        .rpc('check_founding_200_availability');
        
      if (availError) {
        console.error('Error checking Founding 200 availability:', availError);
        throw new Error('Failed to verify Founding 200 availability');
      }
      
      if (!availability) {
        throw new Error('The Founding 200 program has reached capacity. Please join our waitlist!');
      }
    } else {
      console.log('Open registration for role:', role);
    }

    // Validate professional email for employers and recruiters
    const publicEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'live.com', 'msn.com'];
    
    // For OAuth completions, verify role matches email domain
    if (isOAuthCompletion && (role === 'employer' || role === 'recruiter')) {
      const emailDomain = email.split('@')[1]?.toLowerCase();
      
      if (publicEmailDomains.includes(emailDomain)) {
        console.error('OAuth user attempted to claim employer/recruiter role with personal email:', email);
        throw new Error('Employer and recruiter accounts require a professional company email address. Please use a different authentication method or contact support.');
      }
      
      console.log('OAuth role validated against email domain:', { email, role });
    }
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
    let verificationUrl: string | null = null;

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

      // 1. Create auth user with email_confirm: true (auto-confirmed, no verification needed)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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

      // Auto-generate referral code for candidate
      const { data: existingCode } = await supabaseAdmin
        .from('referral_codes')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingCode) {
        const { data: generatedCode, error: codeGenError } = await supabaseAdmin
          .rpc('generate_referral_code', { p_user_id: userId });

        if (codeGenError) {
          console.error('Failed to generate referral code:', codeGenError);
        } else if (generatedCode) {
          const { error: codeInsertError } = await supabaseAdmin
            .from('referral_codes')
            .insert({
              user_id: userId,
              code: generatedCode
            });

          if (codeInsertError) {
            console.error('Failed to insert referral code:', codeInsertError);
          } else {
            console.log('Referral code generated successfully:', generatedCode);
          }
        }
      } else {
        console.log('Referral code already exists, skipping');
      }

      // Link to any existing pipeline_candidates record with matching email
      console.log('Checking for existing pipeline candidate with email:', email);
      const { data: pipelineCandidate, error: pipelineCheckError } = await supabaseAdmin
        .from('pipeline_candidates')
        .select('id, profile_id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (pipelineCheckError) {
        console.error('Error checking pipeline candidates:', pipelineCheckError);
      } else if (pipelineCandidate && !pipelineCandidate.profile_id) {
        console.log('Found unlinked pipeline candidate, linking profile_id:', pipelineCandidate.id);
        const { error: linkError } = await supabaseAdmin
          .from('pipeline_candidates')
          .update({ profile_id: userId })
          .eq('id', pipelineCandidate.id);

        if (linkError) {
          console.error('Error linking pipeline candidate to profile:', linkError);
        } else {
          console.log('Successfully linked pipeline candidate to profile');
        }
      } else if (pipelineCandidate?.profile_id) {
        console.log('Pipeline candidate already linked to profile:', pipelineCandidate.profile_id);
      } else {
        console.log('No pipeline candidate found with this email');
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

    // Mark user as Founding 200 member if applicable
    if (isFounding200 && role === 'candidate') {
      const { error: founding200Error } = await supabaseAdmin
        .rpc('mark_as_founding_200', { user_id: userId });
        
      if (founding200Error) {
        console.error('Failed to mark as Founding 200:', founding200Error);
        // Don't fail the entire signup if this fails, just log it
      } else {
        console.log('User marked as Founding 200 member');
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
        emailVerificationRequired: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Sanitize error messages - only return safe, user-facing messages
    const safeErrorMessages: Record<string, string> = {
      'This role requires administrative approval': 'This role requires administrative approval',
      'The Founding 200 program has reached capacity. Please join our waitlist!': 'The Founding 200 program has reached capacity. Please join our waitlist!',
      'Employer and recruiter accounts require a professional company email address. Please use a different authentication method or contact support.': 'Employer and recruiter accounts require a professional company email address.',
      'Employers and recruiters must use a professional/company email address, not a personal email': 'Employers and recruiters must use a professional/company email address.',
      'Invalid username format. Must be 3-20 characters with letters, numbers, and underscores only.': 'Invalid username format.',
      'Username already taken. Please choose another.': 'Username already taken.',
      'Password is required for regular signup': 'Password is required.',
      'No authorization header for OAuth completion': 'Authentication required.',
      'Failed to get user from token': 'Authentication failed.',
    };
    
    const userMessage = safeErrorMessages[error.message] || 'Signup failed. Please try again.';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: userMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});