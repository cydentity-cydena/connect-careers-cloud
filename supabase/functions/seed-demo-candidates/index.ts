import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const demoCandidates = [
  {
    email: "john.smith.demo@cydena.com",
    password: "Demo123!",
    full_name: "John Smith",
    profile: { title: "Security Analyst", years_experience: 8, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/johnsmith", github_url: "https://github.com/johnsmith" },
    certs: [
      { name: "CISSP", issuer: "ISC2", issue_date: "2020-03-15", expiry_date: "2026-03-15" },
      { name: "CEH", issuer: "EC-Council", issue_date: "2019-06-20", expiry_date: "2026-06-20" },
      { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2018-01-10" }
    ],
    xp: { total_xp: 250, points_balance: 250, level: 5, profile_completion_percent: 95 },
    location: "Washington, DC",
    bio: "Experienced security analyst with a passion for threat detection and incident response. CISSP and CEH certified professional with 8+ years in cybersecurity."
  },
  {
    email: "jane.doe.demo@cydena.com",
    password: "Demo123!",
    full_name: "Jane Doe",
    profile: { title: "Penetration Tester", years_experience: 6, linkedin_url: "https://linkedin.com/in/janedoe", github_url: "https://github.com/janedoe", portfolio_url: "https://janedoe.com" },
    certs: [
      { name: "OSCP", issuer: "Offensive Security", issue_date: "2021-08-15" },
      { name: "CEH", issuer: "EC-Council", issue_date: "2020-04-12", expiry_date: "2027-04-12" }
    ],
    xp: { total_xp: 215, points_balance: 215, level: 4, profile_completion_percent: 92 },
    location: "San Francisco, CA",
    bio: "Penetration tester specializing in web application security. OSCP certified with experience in red team operations."
  },
  {
    email: "alice.johnson.demo@cydena.com",
    password: "Demo123!",
    full_name: "Alice Johnson",
    profile: { title: "Incident Responder", years_experience: 7, security_clearance: "Top Secret", linkedin_url: "https://linkedin.com/in/alicejohnson" },
    certs: [
      { name: "GPEN", issuer: "GIAC", issue_date: "2021-02-20", expiry_date: "2025-02-20" },
      { name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2020-09-10" }
    ],
    xp: { total_xp: 180, points_balance: 180, level: 4, profile_completion_percent: 90 },
    location: "New York, NY",
    bio: "Incident response specialist with expertise in digital forensics and malware analysis. GPEN and CySA+ certified."
  },
  {
    email: "bob.smith.demo@cydena.com",
    password: "Demo123!",
    full_name: "Bob Smith",
    profile: { title: "SOC Analyst", years_experience: 4, linkedin_url: "https://linkedin.com/in/bobsmith", github_url: "https://github.com/bobsmith" },
    certs: [
      { name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2022-01-15" },
      { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2021-05-20" }
    ],
    xp: { total_xp: 165, points_balance: 165, level: 3, profile_completion_percent: 88 },
    location: "Austin, TX",
    bio: "SOC analyst with strong skills in SIEM management and threat hunting. CySA+ and Security+ certified."
  },
  {
    email: "carol.davis.demo@cydena.com",
    password: "Demo123!",
    full_name: "Carol Davis",
    profile: { title: "Security Analyst", years_experience: 5, linkedin_url: "https://linkedin.com/in/caroldavis" },
    certs: [{ name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2021-11-10" }],
    xp: { total_xp: 145, points_balance: 145, level: 3, profile_completion_percent: 87 },
    location: "Seattle, WA",
    bio: "Security analyst focused on vulnerability management and security architecture. CompTIA CySA+ certified."
  },
  {
    email: "michael.brown.demo@cydena.com",
    password: "Demo123!",
    full_name: "Michael Brown",
    profile: { title: "Security Consultant", years_experience: 10, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/michaelbrown", portfolio_url: "https://michaelbrown.com" },
    certs: [{ name: "CISSP", issuer: "ISC2", issue_date: "2018-07-15", expiry_date: "2024-07-15" }],
    xp: { total_xp: 125, points_balance: 125, level: 3, profile_completion_percent: 85 },
    location: "Boston, MA",
    bio: "Security consultant with extensive experience in compliance and risk management. CISSP certified professional."
  },
  {
    email: "emma.wilson.demo@cydena.com",
    password: "Demo123!",
    full_name: "Emma Wilson",
    profile: { title: "Penetration Tester", years_experience: 5, linkedin_url: "https://linkedin.com/in/emmawilson", github_url: "https://github.com/emmawilson" },
    certs: [{ name: "CEH", issuer: "EC-Council", issue_date: "2021-03-20", expiry_date: "2028-03-20" }],
    xp: { total_xp: 115, points_balance: 115, level: 2, profile_completion_percent: 84 },
    location: "Chicago, IL",
    bio: "Penetration tester with expertise in network security and social engineering. CEH certified professional."
  },
  {
    email: "david.chen.demo@cydena.com",
    password: "Demo123!",
    full_name: "David Chen",
    profile: { title: "Security Engineer", years_experience: 6, linkedin_url: "https://linkedin.com/in/davidchen", github_url: "https://github.com/davidchen" },
    certs: [
      { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2020-08-15" },
      { name: "CCNA", issuer: "Cisco", issue_date: "2019-12-10", expiry_date: "2025-12-10" }
    ],
    xp: { total_xp: 105, points_balance: 105, level: 2, profile_completion_percent: 82 },
    location: "Los Angeles, CA",
    bio: "Security engineer specializing in network security and infrastructure hardening. Security+ and CCNA certified."
  },
  {
    email: "sarah.martinez.demo@cydena.com",
    password: "Demo123!",
    full_name: "Sarah Martinez",
    profile: { title: "Threat Hunter", years_experience: 7, security_clearance: "Top Secret", linkedin_url: "https://linkedin.com/in/sarahmartinez" },
    certs: [
      { name: "GCIA", issuer: "GIAC", issue_date: "2021-05-15", expiry_date: "2025-05-15" },
      { name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2020-03-20" }
    ],
    xp: { total_xp: 98, points_balance: 98, level: 2, profile_completion_percent: 80 },
    location: "Denver, CO",
    bio: "Threat hunter with advanced skills in malware analysis and threat intelligence. GCIA and CySA+ certified."
  },
  {
    email: "james.taylor.demo@cydena.com",
    password: "Demo123!",
    full_name: "James Taylor",
    profile: { title: "Security Architect", years_experience: 12, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/jamestaylor", portfolio_url: "https://jamestaylor.com" },
    certs: [
      { name: "CISSP", issuer: "ISC2", issue_date: "2017-04-10", expiry_date: "2023-04-10" },
      { name: "CISM", issuer: "ISACA", issue_date: "2018-09-15", expiry_date: "2024-09-15" }
    ],
    xp: { total_xp: 92, points_balance: 92, level: 2, profile_completion_percent: 79 },
    location: "Atlanta, GA",
    bio: "Security architect designing enterprise security solutions. CISSP and CISM certified with 12+ years experience."
  },
  {
    email: "lisa.anderson.demo@cydena.com",
    password: "Demo123!",
    full_name: "Lisa Anderson",
    profile: { title: "SOC Analyst", years_experience: 3, linkedin_url: "https://linkedin.com/in/lisaanderson" },
    certs: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2022-02-10" }],
    xp: { total_xp: 87, points_balance: 87, level: 2, profile_completion_percent: 77 },
    location: "Phoenix, AZ",
    bio: "SOC analyst with experience in incident detection and response. CompTIA Security+ certified."
  },
  {
    email: "kevin.murphy.demo@cydena.com",
    password: "Demo123!",
    full_name: "Kevin Murphy",
    profile: { title: "Security Analyst", years_experience: 5, linkedin_url: "https://linkedin.com/in/kevinmurphy", github_url: "https://github.com/kevinmurphy" },
    certs: [
      { name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2021-06-15" },
      { name: "CEH", issuer: "EC-Council", issue_date: "2020-11-20", expiry_date: "2027-11-20" }
    ],
    xp: { total_xp: 82, points_balance: 82, level: 2, profile_completion_percent: 76 },
    location: "Portland, OR",
    bio: "Security analyst specializing in vulnerability assessment and penetration testing. CySA+ and CEH certified."
  },
  {
    email: "rachel.green.demo@cydena.com",
    password: "Demo123!",
    full_name: "Rachel Green",
    profile: { title: "Forensics Analyst", years_experience: 6, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/rachelgreen" },
    certs: [
      { name: "GCFE", issuer: "GIAC", issue_date: "2021-08-10", expiry_date: "2025-08-10" },
      { name: "CHFI", issuer: "EC-Council", issue_date: "2020-05-15", expiry_date: "2027-05-15" }
    ],
    xp: { total_xp: 78, points_balance: 78, level: 1, profile_completion_percent: 74 },
    location: "Miami, FL",
    bio: "Digital forensics analyst with expertise in incident investigation. GCFE and CHFI certified professional."
  },
  {
    email: "thomas.white.demo@cydena.com",
    password: "Demo123!",
    full_name: "Thomas White",
    profile: { title: "Penetration Tester", years_experience: 4, linkedin_url: "https://linkedin.com/in/thomaswhite", github_url: "https://github.com/thomaswhite" },
    certs: [{ name: "CEH", issuer: "EC-Council", issue_date: "2022-03-20", expiry_date: "2029-03-20" }],
    xp: { total_xp: 73, points_balance: 73, level: 1, profile_completion_percent: 72 },
    location: "Dallas, TX",
    bio: "Penetration tester focused on application security and code review. CEH certified professional."
  },
  {
    email: "amanda.lee.demo@cydena.com",
    password: "Demo123!",
    full_name: "Amanda Lee",
    profile: { title: "Security Engineer", years_experience: 4, linkedin_url: "https://linkedin.com/in/amandalee", github_url: "https://github.com/amandalee" },
    certs: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2021-09-10" }],
    xp: { total_xp: 69, points_balance: 69, level: 1, profile_completion_percent: 71 },
    location: "San Diego, CA",
    bio: "Security engineer with strong background in cloud security. CompTIA Security+ certified."
  },
  {
    email: "daniel.harris.demo@cydena.com",
    password: "Demo123!",
    full_name: "Daniel Harris",
    profile: { title: "Cloud Security Engineer", years_experience: 7, linkedin_url: "https://linkedin.com/in/danielharris", github_url: "https://github.com/danielharris", portfolio_url: "https://danielharris.dev" },
    certs: [
      { name: "CCSP", issuer: "ISC2", issue_date: "2021-07-15", expiry_date: "2027-07-15" },
      { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2020-02-20" }
    ],
    xp: { total_xp: 65, points_balance: 65, level: 1, profile_completion_percent: 69 },
    location: "Minneapolis, MN",
    bio: "Cloud security engineer specializing in AWS and Azure security. CCSP and Security+ certified."
  },
  {
    email: "michelle.clark.demo@cydena.com",
    password: "Demo123!",
    full_name: "Michelle Clark",
    profile: { title: "Security Analyst", years_experience: 4, linkedin_url: "https://linkedin.com/in/michelleclark" },
    certs: [{ name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2022-01-10" }],
    xp: { total_xp: 61, points_balance: 61, level: 1, profile_completion_percent: 68 },
    location: "Philadelphia, PA",
    bio: "Security analyst with expertise in security monitoring and log analysis. CySA+ certified professional."
  },
  {
    email: "ryan.lewis.demo@cydena.com",
    password: "Demo123!",
    full_name: "Ryan Lewis",
    profile: { title: "Application Security Engineer", years_experience: 6, linkedin_url: "https://linkedin.com/in/ryanlewis", github_url: "https://github.com/ryanlewis", portfolio_url: "https://ryanlewis.dev" },
    certs: [{ name: "CSSLP", issuer: "ISC2", issue_date: "2021-04-15", expiry_date: "2027-04-15" }],
    xp: { total_xp: 57, points_balance: 57, level: 1, profile_completion_percent: 66 },
    location: "Charlotte, NC",
    bio: "Application security engineer focused on secure SDLC. CSSLP certified professional."
  },
  {
    email: "sophia.walker.demo@cydena.com",
    password: "Demo123!",
    full_name: "Sophia Walker",
    profile: { title: "SOC Analyst", years_experience: 3, linkedin_url: "https://linkedin.com/in/sophiawalker" },
    certs: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2022-06-20" }],
    xp: { total_xp: 53, points_balance: 53, level: 1, profile_completion_percent: 65 },
    location: "Detroit, MI",
    bio: "SOC analyst with strong analytical and problem-solving skills. Security+ certified."
  },
  {
    email: "eric.thompson.demo@cydena.com",
    password: "Demo123!",
    full_name: "Eric Thompson",
    profile: { title: "Security Consultant", years_experience: 9, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/ericthompson" },
    certs: [{ name: "CISSP", issuer: "ISC2", issue_date: "2019-10-15", expiry_date: "2025-10-15" }],
    xp: { total_xp: 50, points_balance: 50, level: 1, profile_completion_percent: 63 },
    location: "Las Vegas, NV",
    bio: "Security consultant specializing in penetration testing and security assessments. CISSP certified."
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user has admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log('Starting demo candidates seeding...');
    const results = [];

    for (const candidate of demoCandidates) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: candidate.email,
          password: candidate.password,
          email_confirm: true,
          user_metadata: {
            full_name: candidate.full_name
          }
        });

        if (authError) {
          console.error(`Error creating user ${candidate.email}:`, authError);
          results.push({ email: candidate.email, success: false, error: authError.message });
          continue;
        }

        const userId = authData.user.id;
        console.log(`Created user: ${candidate.email} with ID: ${userId}`);

        // Update profile with additional data
        await supabaseAdmin
          .from('profiles')
          .update({
            location: candidate.location,
            bio: candidate.bio
          })
          .eq('id', userId);

        // Create candidate profile
        await supabaseAdmin
          .from('candidate_profiles')
          .insert({
            user_id: userId,
            ...candidate.profile
          });

        // Create certifications
        if (candidate.certs.length > 0) {
          await supabaseAdmin
            .from('certifications')
            .insert(
              candidate.certs.map(cert => ({
                candidate_id: userId,
                ...cert
              }))
            );
        }

        // Create candidate XP
        await supabaseAdmin
          .from('candidate_xp')
          .insert({
            candidate_id: userId,
            ...candidate.xp
          });

        results.push({ email: candidate.email, success: true, userId });
        console.log(`Successfully seeded: ${candidate.email}`);

      } catch (error: any) {
        console.error(`Error seeding ${candidate.email}:`, error);
        results.push({ email: candidate.email, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Seeding complete: ${successCount}/${demoCandidates.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully seeded ${successCount} demo candidates`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Seeding error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
