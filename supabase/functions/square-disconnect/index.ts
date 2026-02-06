import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get connection to revoke token
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: connection, error: connError } = await supabaseAdmin
      .from("square_connections")
      .select("access_token")
      .eq("user_id", user.id)
      .single();

    if (connection?.access_token) {
      // Revoke the access token with Square
      const squareAppId = Deno.env.get("SQUARE_APP_ID");
      const squareAppSecret = Deno.env.get("SQUARE_APP_SECRET");
      const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "production";

      const baseUrl = squareEnvironment === "sandbox"
        ? "https://connect.squareupsandbox.com"
        : "https://connect.squareup.com";

      try {
        await fetch(`${baseUrl}/oauth2/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Square-Version": "2024-01-18",
          },
          body: JSON.stringify({
            client_id: squareAppId,
            client_secret: squareAppSecret,
            access_token: connection.access_token,
          }),
        });
      } catch (revokeError) {
        // Log but don't fail if revoke fails
        console.error("Token revoke error (non-fatal):", revokeError);
      }
    }

    // Delete the connection record
    const { error: deleteError } = await supabaseAdmin
      .from("square_connections")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to disconnect" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Disconnect error:", error);
    return new Response(
      JSON.stringify({ error: "Disconnect failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
