import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Authorization check: Verify user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles || !roles.some(r => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating demo test accounts...');
    const results = {
      employer: null as any,
      recruiter: null as any,
      recruiter2: null as any
    };

    // Create employer account: sarah.thompson.employer0@cydena.demo
    try {
      const employerEmail = 'sarah.thompson.employer0@cydena.demo';
      const employerPassword = 'Demo123!';
      
      console.log(`Creating employer account: ${employerEmail}`);
      
      // Check if account exists
      const { data: existingProf } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', employerEmail)
        .maybeSingle();

      let employerId: string;

      if (existingProf?.id) {
        console.log('Employer account already exists, updating...');
        employerId = existingProf.id;
      } else {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: employerEmail,
          password: employerPassword,
          email_confirm: true,
          user_metadata: { full_name: 'Sarah Thompson' }
        });

        if (authError) {
          throw new Error(`Failed to create employer auth: ${authError.message}`);
        }

        employerId = authData!.user.id;
      }

      // Update profile
      await supabaseAdmin.from('profiles').update({
        full_name: 'Sarah Thompson',
        username: 'sarah_thompson_hr',
        location: 'London',
        bio: 'HR Manager at TechCorp'
      }).eq('id', employerId);

      // Ensure employer role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: employerId,
        role: 'employer'
      }, { onConflict: 'user_id,role' });

      // Create or update employer credits
      await supabaseAdmin.from('employer_credits').upsert({
        employer_id: employerId,
        credits: 50,
        annual_allocation: 100
      }, { onConflict: 'employer_id' });

      // Create company
      const { data: existingCompany } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('created_by', employerId)
        .eq('name', 'TechCorp')
        .maybeSingle();

      if (!existingCompany) {
        await supabaseAdmin.from('companies').insert({
          created_by: employerId,
          name: 'TechCorp',
          description: 'TechCorp is a leading provider of cybersecurity solutions and services in the technology sector.',
          industry: 'Technology',
          size: '51-200',
          location: 'TechCorp Office, UK',
          website: 'https://www.techcorp.com'
        });
      }

      results.employer = {
        email: employerEmail,
        password: employerPassword,
        success: true,
        userId: employerId
      };

    } catch (error: any) {
      console.error('Error creating employer:', error);
      results.employer = {
        email: 'sarah.thompson.employer0@cydena.demo',
        success: false,
        error: error.message
      };
    }

    // Create recruiter account: patricia.evans.recruiter0@cydena.demo
    try {
      const recruiterEmail = 'patricia.evans.recruiter0@cydena.demo';
      const recruiterPassword = 'Demo123!';
      
      console.log(`Creating recruiter account: ${recruiterEmail}`);
      
      // Check if account exists
      const { data: existingProf } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', recruiterEmail)
        .maybeSingle();

      let recruiterId: string;

      if (existingProf?.id) {
        console.log('Recruiter account already exists, updating...');
        recruiterId = existingProf.id;
      } else {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: recruiterEmail,
          password: recruiterPassword,
          email_confirm: true,
          user_metadata: { full_name: 'Patricia Evans' }
        });

        if (authError) {
          throw new Error(`Failed to create recruiter auth: ${authError.message}`);
        }

        recruiterId = authData!.user.id;
      }

      // Update profile
      await supabaseAdmin.from('profiles').update({
        full_name: 'Patricia Evans',
        username: 'patricia_evans_recruiter',
        location: 'Manchester',
        bio: 'Professional recruiter specializing in cybersecurity talent acquisition.'
      }).eq('id', recruiterId);

      // Ensure recruiter role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: recruiterId,
        role: 'recruiter'
      }, { onConflict: 'user_id,role' });

      // Create a test client
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('recruiter_id', recruiterId)
        .eq('company_name', 'CyberSecure Ltd')
        .maybeSingle();

      if (!existingClient) {
        await supabaseAdmin.from('clients').insert({
          recruiter_id: recruiterId,
          company_name: 'CyberSecure Ltd',
          contact_name: 'John Smith',
          contact_email: 'john.smith@cybersecure.com',
          industry: 'Technology',
          status: 'active',
          notes: 'Test client for demo recruiter account'
        });
      }

      results.recruiter = {
        email: recruiterEmail,
        password: recruiterPassword,
        success: true,
        userId: recruiterId
      };

    } catch (error: any) {
      console.error('Error creating recruiter:', error);
      results.recruiter = {
        email: 'patricia.evans.recruiter0@cydena.demo',
        success: false,
        error: error.message
      };
    }

    // Create second recruiter account: james.evans.recruiter0@cydena.demo
    try {
      const recruiterEmail = 'james.evans.recruiter0@cydena.demo';
      const recruiterPassword = 'Demo123!';
      
      console.log(`Creating recruiter account: ${recruiterEmail}`);
      
      // Check if account exists
      const { data: existingProf } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', recruiterEmail)
        .maybeSingle();

      let recruiterId: string;

      if (existingProf?.id) {
        console.log('Recruiter account already exists, updating...');
        recruiterId = existingProf.id;
      } else {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: recruiterEmail,
          password: recruiterPassword,
          email_confirm: true,
          user_metadata: { full_name: 'James Evans' }
        });

        if (authError) {
          throw new Error(`Failed to create recruiter auth: ${authError.message}`);
        }

        recruiterId = authData!.user.id;
      }

      // Update profile
      await supabaseAdmin.from('profiles').update({
        full_name: 'James Evans',
        username: 'james_evans_recruiter',
        location: 'Birmingham',
        bio: 'Senior recruiter focused on security engineering and penetration testing roles.'
      }).eq('id', recruiterId);

      // Ensure recruiter role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: recruiterId,
        role: 'recruiter'
      }, { onConflict: 'user_id,role' });

      // Create a test client
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('recruiter_id', recruiterId)
        .eq('company_name', 'SecureNet Solutions')
        .maybeSingle();

      if (!existingClient) {
        await supabaseAdmin.from('clients').insert({
          recruiter_id: recruiterId,
          company_name: 'SecureNet Solutions',
          contact_name: 'Emma Davis',
          contact_email: 'emma.davis@securenet.com',
          industry: 'Cybersecurity',
          status: 'active',
          notes: 'Test client for second demo recruiter account'
        });
      }

      results.recruiter2 = {
        email: recruiterEmail,
        password: recruiterPassword,
        success: true,
        userId: recruiterId
      };

    } catch (error: any) {
      console.error('Error creating second recruiter:', error);
      results.recruiter2 = {
        email: 'james.evans.recruiter0@cydena.demo',
        success: false,
        error: error.message
      };
    }

    console.log('Demo test accounts creation completed');

    return new Response(
      JSON.stringify({
        message: 'Demo test accounts created successfully',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in create-demo-test-accounts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
