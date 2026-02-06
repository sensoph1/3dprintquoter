import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return Response.redirect(`${appUrl}?square_error=${encodeURIComponent(errorDescription || error)}`);
    }

    if (!code || !state) {
      return Response.redirect(`${appUrl}?square_error=Missing+code+or+state`);
    }

    // Decode state to get user ID
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return Response.redirect(`${appUrl}?square_error=Invalid+state`);
    }

    const { userId, timestamp } = stateData;

    // Check state is not too old (15 minutes)
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      return Response.redirect(`${appUrl}?square_error=Authorization+expired`);
    }

    // Exchange code for tokens
    const squareAppId = Deno.env.get("SQUARE_APP_ID");
    const squareAppSecret = Deno.env.get("SQUARE_APP_SECRET");
    const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "production";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const baseUrl = squareEnvironment === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com";

    const redirectUri = `${supabaseUrl}/functions/v1/square-callback`;

    const tokenResponse = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18",
      },
      body: JSON.stringify({
        client_id: squareAppId,
        client_secret: squareAppSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error("Token exchange error:", tokenData);
      return Response.redirect(`${appUrl}?square_error=${encodeURIComponent(tokenData.error_description || "Token+exchange+failed")}`);
    }

    const { access_token, refresh_token, expires_at, merchant_id } = tokenData;

    // Get merchant info for display name
    const apiBaseUrl = squareEnvironment === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com";

    const merchantResponse = await fetch(`${apiBaseUrl}/v2/merchants/${merchant_id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Square-Version": "2024-01-18",
      },
    });

    const merchantData = await merchantResponse.json();
    const merchantName = merchantData.merchant?.business_name || "Square Merchant";

    // Get primary location
    const locationsResponse = await fetch(`${apiBaseUrl}/v2/locations`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Square-Version": "2024-01-18",
      },
    });

    const locationsData = await locationsResponse.json();
    const primaryLocation = locationsData.locations?.find((l: any) => l.status === "ACTIVE") || locationsData.locations?.[0];
    const locationId = primaryLocation?.id;
    const locationName = primaryLocation?.name || "Main Location";

    // Store tokens in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: upsertError } = await supabase
      .from("square_connections")
      .upsert({
        user_id: userId,
        merchant_id,
        merchant_name: merchantName,
        access_token,
        refresh_token,
        expires_at: new Date(expires_at).toISOString(),
        location_id: locationId,
        location_name: locationName,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("Database error:", upsertError);
      return Response.redirect(`${appUrl}?square_error=Database+error`);
    }

    return Response.redirect(`${appUrl}?square_connected=true`);
  } catch (error) {
    console.error("Callback error:", error);
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";
    return Response.redirect(`${appUrl}?square_error=Unexpected+error`);
  }
});
