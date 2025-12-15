import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's token to verify they're authenticated
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the requesting user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    console.log(`User ${userId} (${user.email}) requested account deletion`);

    // Use admin client for deletion operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user's files from storage buckets
    const buckets = ['avatars', 'resumes', 'verification-documents', 'course-proofs', 'post-images'];
    
    for (const bucket of buckets) {
      try {
        const { data: files } = await adminClient.storage.from(bucket).list(userId);
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${userId}/${f.name}`);
          await adminClient.storage.from(bucket).remove(filePaths);
          console.log(`Deleted ${filePaths.length} files from ${bucket} for user ${userId}`);
        }
      } catch (err) {
        console.error(`Error cleaning ${bucket} for user ${userId}:`, err);
      }
    }

    // Delete all user-related data from tables (order matters due to foreign keys)
    const tablesToClean = [
      'post_reactions',
      'comment_reactions', 
      'post_comments',
      'activity_feed',
      'direct_messages',
      'notifications',
      'user_achievements',
      'user_badges',
      'reward_points',
      'community_activities',
      'peer_endorsements',
      'candidate_skills',
      'certifications',
      'certification_verification_requests',
      'course_completions',
      'candidate_resumes',
      'education',
      'work_experience',
      'candidate_xp',
      'candidate_verifications',
      'candidate_profiles',
      'applications',
      'referrals',
      'referral_codes',
      'mfa_backup_codes',
      'user_roles',
    ];

    for (const table of tablesToClean) {
      try {
        const column = ['peer_endorsements'].includes(table) 
          ? 'from_user_id' 
          : ['direct_messages'].includes(table)
          ? 'sender_id'
          : ['post_reactions', 'comment_reactions', 'post_comments', 'activity_feed', 'community_activities', 'notifications'].includes(table)
          ? 'user_id'
          : 'candidate_id';
        
        const { error } = await adminClient.from(table).delete().eq(column, userId);
        if (error) {
          // Try alternate column names
          const altColumns = ['user_id', 'candidate_id', 'employer_id', 'recruiter_id'];
          for (const alt of altColumns) {
            const { error: altError } = await adminClient.from(table).delete().eq(alt, userId);
            if (!altError) break;
          }
        }
        console.log(`Cleaned ${table} for user ${userId}`);
      } catch (err) {
        console.log(`Skipped ${table}: ${err}`);
      }
    }

    // Also clean recipient messages
    await adminClient.from('direct_messages').delete().eq('recipient_id', userId);
    // Clean endorsements received
    await adminClient.from('peer_endorsements').delete().eq('to_user_id', userId);

    // Finally delete the profile (should cascade but be explicit)
    await adminClient.from('profiles').delete().eq('id', userId);
    console.log(`Deleted profile for user ${userId}`);

    // Delete user from auth.users
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error(`Error deleting user ${userId}:`, deleteError);
      throw deleteError;
    }

    console.log(`User ${userId} account and data successfully deleted`);

    return new Response(
      JSON.stringify({ success: true, message: "Account and all associated data deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-my-account function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete account. Please contact support." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
