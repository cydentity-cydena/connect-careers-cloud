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
        // List all files in user's folder
        const { data: files } = await adminClient.storage
          .from(bucket)
          .list(userId);
        
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${userId}/${f.name}`);
          await adminClient.storage.from(bucket).remove(filePaths);
          console.log(`Deleted ${filePaths.length} files from ${bucket} for user ${userId}`);
        }
      } catch (err) {
        console.error(`Error cleaning ${bucket} for user ${userId}:`, err);
        // Continue with other buckets
      }
    }

    // Delete user from auth.users (cascades to profiles and other tables with ON DELETE CASCADE)
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
