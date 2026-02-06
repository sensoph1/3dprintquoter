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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Square OAuth URL
    const squareAppId = Deno.env.get("SQUARE_APP_ID");
    const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "production";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!squareAppId) {
      return new Response(
        JSON.stringify({ error: "Square App ID not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OAuth scopes needed for transactions and catalog
    const scopes = [
      "MERCHANT_PROFILE_READ",
      "ORDERS_READ",
      "ITEMS_READ",
      "ITEMS_WRITE",
      "INVENTORY_READ",
      "INVENTORY_WRITE",
      "PAYMENTS_READ",
    ].join("+");

    // State includes user ID for callback verification
    const state = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));

    const baseUrl = squareEnvironment === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com";

    const redirectUri = `${supabaseUrl}/functions/v1/square-callback`;

    const authUrl = `${baseUrl}/oauth2/authorize?client_id=${squareAppId}&scope=${scopes}&session=false&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return new Response(
      JSON.stringify({ url: authUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate auth URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
