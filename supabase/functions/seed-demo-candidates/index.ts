import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate random candidate data
function generateCandidate(index: number) {
  const firstNames = ["John", "Jane", "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry", "Iris", "Jack", "Kate", "Leo", "Maya", "Nick", "Olivia", "Paul", "Quinn", "Rachel"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  const titles = ["Security Analyst", "Penetration Tester", "SOC Analyst", "Security Engineer", "Threat Hunter", "Incident Responder", "Security Consultant", "Cloud Security Engineer", "Application Security Engineer", "Forensics Analyst"];
  const locations = ["Washington DC", "San Francisco CA", "New York NY", "Austin TX", "Seattle WA", "Boston MA", "Chicago IL", "Los Angeles CA", "Denver CO", "Atlanta GA"];
  const clearances = [null, "Secret", "Top Secret"];
  const certs = [
    { name: "CISSP", issuer: "ISC2" },
    { name: "CEH", issuer: "EC-Council" },
    { name: "CompTIA Security+", issuer: "CompTIA" },
    { name: "CompTIA CySA+", issuer: "CompTIA" },
    { name: "OSCP", issuer: "Offensive Security" },
    { name: "GPEN", issuer: "GIAC" },
    { name: "GCIA", issuer: "GIAC" },
    { name: "CCSP", issuer: "ISC2" }
  ];

  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const title = titles[index % titles.length];
  const location = locations[index % locations.length];
  const yearsExp = 2 + (index % 12);
  const clearance = index % 3 === 0 ? clearances[index % clearances.length] : null;
  
  const numCerts = 1 + (index % 3);
  const selectedCerts = [];
  for (let i = 0; i < numCerts; i++) {
    const cert = certs[(index + i) % certs.length];
    selectedCerts.push({
      ...cert,
      issue_date: `${2018 + (index % 7)}-0${1 + (index % 9)}-15`
    });
  }

  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@cydena.demo`,
    password: "Demo123!",
    full_name: `${firstName} ${lastName}`,
    profile: {
      title,
      years_experience: yearsExp,
      ...(clearance ? { security_clearance: clearance } : {}),
      linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`,
      ...(index % 3 === 0 ? { github_url: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}${index}` } : {})
    },
    certs: selectedCerts,
    xp: {
      total_xp: 250 - (index * 2),
      points_balance: 250 - (index * 2),
      level: Math.max(1, 5 - Math.floor(index / 20)),
      profile_completion_percent: Math.max(65, 95 - index)
    },
    location,
    bio: `${title} with ${yearsExp} years of experience in cybersecurity. ${selectedCerts.map(c => c.name).join(', ')} certified professional.`
  };
}

// Helper function to generate employer data
function generateEmployer(index: number) {
  const firstNames = ["Sarah", "Michael", "Jennifer", "William", "Jessica", "James", "Ashley", "Robert", "Amanda", "Christopher"];
  const lastNames = ["Thompson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Allen", "Young", "King"];
  const companies = ["TechCorp", "CyberSecure", "SecureNet", "DefenseWorks", "InfoGuard", "DataShield", "NetSecure", "CloudGuard", "CyberDefense", "SecureTech"];
  const industries = ["Technology", "Finance", "Healthcare", "Government", "Retail", "Manufacturing", "Education", "Energy"];
  const sizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
  
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const companyBase = companies[index % companies.length];
  const companyName = index > 9 ? `${companyBase} ${Math.floor(index / 10)}` : companyBase;
  const industry = industries[index % industries.length];
  const size = sizes[index % sizes.length];

  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.employer${index}@cydena.demo`,
    password: "Demo123!",
    full_name: `${firstName} ${lastName}`,
    location: `City ${index}`,
    bio: `HR Manager at ${companyName}`,
    company: {
      name: companyName,
      description: `${companyName} is a leading provider of cybersecurity solutions and services in the ${industry.toLowerCase()} sector.`,
      industry: industry,
      size: size,
      location: `City ${index}, State`,
      website: `https://www.${companyBase.toLowerCase()}.com`
    }
  };
}

// Helper function to generate recruiter data
function generateRecruiter(index: number) {
  const names = ["Patricia", "Richard", "Linda", "Joseph", "Barbara"];
  const lastNames = ["Evans", "Collins", "Stewart", "Morris", "Rogers"];
  
  const firstName = names[index % names.length];
  const lastName = lastNames[index % lastNames.length];

  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.recruiter${index}@cydena.demo`,
    password: "Demo123!",
    full_name: `${firstName} ${lastName}`,
    location: `Metro ${index}`,
    bio: `Professional recruiter specializing in cybersecurity talent acquisition.`
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting demo users seeding...');
    const results = {
      candidates: [] as any[],
      employers: [] as any[],
      recruiters: [] as any[]
    };

    // Seed 100 candidates
    console.log('Seeding 100 candidates...');
    for (let i = 0; i < 100; i++) {
      try {
        const candidate = generateCandidate(i);
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: candidate.email,
          password: candidate.password,
          email_confirm: true,
          user_metadata: { full_name: candidate.full_name }
        });

        if (authError) {
          console.error(`Error creating candidate ${candidate.email}:`, authError);
          results.candidates.push({ email: candidate.email, success: false, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Update profile
        await supabaseAdmin.from('profiles').update({
          location: candidate.location,
          bio: candidate.bio
        }).eq('id', userId);

        // Create candidate role
        await supabaseAdmin.from('user_roles').insert({
          user_id: userId,
          role: 'candidate'
        });

        // Create candidate profile
        await supabaseAdmin.from('candidate_profiles').insert({
          user_id: userId,
          ...candidate.profile
        });

        // Create certifications
        if (candidate.certs.length > 0) {
          await supabaseAdmin.from('certifications').insert(
            candidate.certs.map(cert => ({
              candidate_id: userId,
              ...cert
            }))
          );
        }

        // Create candidate XP
        await supabaseAdmin.from('candidate_xp').insert({
          candidate_id: userId,
          ...candidate.xp
        });

        results.candidates.push({ email: candidate.email, success: true });
        if (i % 10 === 0) console.log(`Seeded ${i + 1} candidates...`);

      } catch (error: any) {
        console.error(`Error seeding candidate ${i}:`, error);
        results.candidates.push({ success: false, error: error.message });
      }
    }

    // Seed 50 employers
    console.log('Seeding 50 employers...');
    for (let i = 0; i < 50; i++) {
      try {
        const employer = generateEmployer(i);
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: employer.email,
          password: employer.password,
          email_confirm: true,
          user_metadata: { full_name: employer.full_name }
        });

        if (authError) {
          console.error(`Error creating employer ${employer.email}:`, authError);
          results.employers.push({ email: employer.email, success: false, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Update profile
        await supabaseAdmin.from('profiles').update({
          location: employer.location,
          bio: employer.bio
        }).eq('id', userId);

        // Create employer role
        await supabaseAdmin.from('user_roles').insert({
          user_id: userId,
          role: 'employer'
        });

        // Create employer credits
        await supabaseAdmin.from('employer_credits').insert({
          employer_id: userId,
          credits: 10,
          annual_allocation: 100
        });

        // Create company profile
        await supabaseAdmin.from('companies').insert({
          name: employer.company.name,
          description: employer.company.description,
          industry: employer.company.industry,
          size: employer.company.size,
          location: employer.company.location,
          website: employer.company.website,
          created_by: userId
        });

        results.employers.push({ email: employer.email, success: true });
        if (i % 10 === 0) console.log(`Seeded ${i + 1} employers...`);

      } catch (error: any) {
        console.error(`Error seeding employer ${i}:`, error);
        results.employers.push({ success: false, error: error.message });
      }
    }

    // Seed 5 recruiters
    console.log('Seeding 5 recruiters...');
    for (let i = 0; i < 5; i++) {
      try {
        const recruiter = generateRecruiter(i);
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: recruiter.email,
          password: recruiter.password,
          email_confirm: true,
          user_metadata: { full_name: recruiter.full_name }
        });

        if (authError) {
          console.error(`Error creating recruiter ${recruiter.email}:`, authError);
          results.recruiters.push({ email: recruiter.email, success: false, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Update profile
        await supabaseAdmin.from('profiles').update({
          location: recruiter.location,
          bio: recruiter.bio
        }).eq('id', userId);

        // Create recruiter role
        await supabaseAdmin.from('user_roles').insert({
          user_id: userId,
          role: 'recruiter'
        });

        results.recruiters.push({ email: recruiter.email, success: true });
        console.log(`Seeded recruiter ${i + 1}...`);

      } catch (error: any) {
        console.error(`Error seeding recruiter ${i}:`, error);
        results.recruiters.push({ success: false, error: error.message });
      }
    }

    const candidateSuccess = results.candidates.filter(r => r.success).length;
    const employerSuccess = results.employers.filter(r => r.success).length;
    const recruiterSuccess = results.recruiters.filter(r => r.success).length;
    
    console.log(`Seeding complete: ${candidateSuccess} candidates, ${employerSuccess} employers, ${recruiterSuccess} recruiters`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${candidateSuccess} candidates, ${employerSuccess} employers, ${recruiterSuccess} recruiters`,
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
