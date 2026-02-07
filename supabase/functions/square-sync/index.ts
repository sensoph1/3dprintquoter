import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SquareConnection {
  user_id: string;
  merchant_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  location_id: string | null;
}

async function refreshTokenIfNeeded(
  supabase: any,
  connection: SquareConnection
): Promise<string> {
  const expiresAt = new Date(connection.expires_at);
  const now = new Date();

  // Refresh if expires in less than 5 minutes
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return connection.access_token;
  }

  const squareAppId = Deno.env.get("SQUARE_APP_ID");
  const squareAppSecret = Deno.env.get("SQUARE_APP_SECRET");
  const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "production";

  const baseUrl = squareEnvironment === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";

  const response = await fetch(`${baseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Square-Version": "2024-01-18",
    },
    body: JSON.stringify({
      client_id: squareAppId,
      client_secret: squareAppSecret,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error("Failed to refresh token");
  }

  // Update stored tokens
  await supabase
    .from("square_connections")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(data.expires_at).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", connection.user_id);

  return data.access_token;
}

async function pullTransactions(
  accessToken: string,
  locationId: string | null,
  lastSyncTime?: string
): Promise<any[]> {
  const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "production";
  const apiBaseUrl = squareEnvironment === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";

  // Use orders API to get completed orders
  const beginTime = lastSyncTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const searchBody: any = {
    return_entries: false,
    limit: 100,
    query: {
      filter: {
        state_filter: {
          states: ["COMPLETED"],
        },
        date_time_filter: {
          created_at: {
            start_at: beginTime,
          },
        },
      },
      sort: {
        sort_field: "CREATED_AT",
        sort_order: "DESC",
      },
    },
  };

  if (locationId) {
    searchBody.location_ids = [locationId];
  }

  const response = await fetch(`${apiBaseUrl}/v2/orders/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-01-18",
    },
    body: JSON.stringify(searchBody),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Orders search error:", data);
    throw new Error("Failed to fetch orders");
  }

  const orders = data.orders || [];
  const transactions: any[] = [];

  for (const order of orders) {
    if (!order.line_items) continue;

    for (const lineItem of order.line_items) {
      transactions.push({
        squareOrderId: order.id,
        date: order.created_at,
        name: lineItem.name || "Unknown Item",
        quantity: parseInt(lineItem.quantity || "1"),
        unitPrice: lineItem.base_price_money
          ? lineItem.base_price_money.amount / 100
          : (lineItem.total_money?.amount || 0) / 100 / parseInt(lineItem.quantity || "1"),
        totalPrice: lineItem.total_money ? lineItem.total_money.amount / 100 : 0,
        category: lineItem.catalog_object_id || "",
        note: lineItem.note || "",
      });
    }
  }

  return transactions;
}

async function pushCatalogItem(
  accessToken: string,
  item: any,
  locationId: string | null
): Promise<{ catalogId: string; variationId: string }> {
  const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "production";
  const apiBaseUrl = squareEnvironment === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";

  const apiHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Square-Version": "2024-01-18",
  };

  // If updating an existing item, fetch current version first
  let itemVersion: number | undefined;
  let variationVersion: number | undefined;
  if (item.squareCatalogId && !item.squareCatalogId.startsWith("#")) {
    const getRes = await fetch(`${apiBaseUrl}/v2/catalog/object/${item.squareCatalogId}`, {
      headers: apiHeaders,
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      itemVersion = existing.object?.version;
      variationVersion = existing.object?.item_data?.variations?.[0]?.version;
    }
  }

  // Use idempotency key based on item id
  const idempotencyKey = `upsert-${item.id}-${Date.now()}`;

  const variationObj: any = {
    type: "ITEM_VARIATION",
    id: item.squareVariationId || `#var-${item.id}`,
    item_variation_data: {
      name: "Regular",
      pricing_type: "FIXED_PRICING",
      track_inventory: true,
      price_money: {
        amount: Math.round((item.unitPrice || 0) * 100),
        currency: "USD",
      },
    },
  };
  if (variationVersion !== undefined) {
    variationObj.version = variationVersion;
  }

  const catalogObject: any = {
    type: "ITEM",
    id: item.squareCatalogId || `#new-${item.id}`,
    item_data: {
      name: item.name,
      description: item.category || "",
      variations: [variationObj],
    },
  };
  if (itemVersion !== undefined) {
    catalogObject.version = itemVersion;
  }

  const response = await fetch(`${apiBaseUrl}/v2/catalog/object`, {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      idempotency_key: idempotencyKey,
      object: catalogObject,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Catalog upsert error:", data);
    throw new Error(`Failed to push item: ${item.name}`);
  }

  const catalogId = data.catalog_object?.id || item.squareCatalogId;
  const variationId = data.catalog_object?.item_data?.variations?.[0]?.id || item.squareVariationId;

  // Set inventory count via Inventory API
  if (locationId && item.qty !== undefined) {
    try {
      const inventoryRes = await fetch(`${apiBaseUrl}/v2/inventory/changes/batch-create`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          idempotency_key: `inv-${item.id}-${Date.now()}`,
          changes: [
            {
              type: "PHYSICAL_COUNT",
              physical_count: {
                catalog_object_id: variationId,
                location_id: locationId,
                quantity: String(item.qty),
                state: "IN_STOCK",
                occurred_at: new Date().toISOString(),
              },
            },
          ],
        }),
      });
      if (!inventoryRes.ok) {
        console.error("Inventory count error:", await inventoryRes.json());
      }
    } catch (err) {
      console.error("Inventory count failed:", err);
    }
  }

  return { catalogId, variationId };
}

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

    // Get request body
    const body = await req.json();
    const { action, items, lastSyncTime } = body;

    if (!action || !["pull", "push", "both"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action. Must be 'pull', 'push', or 'both'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Square connection using service role for reading tokens
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: connection, error: connError } = await supabaseAdmin
      .from("square_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Square not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refresh token if needed
    const accessToken = await refreshTokenIfNeeded(supabaseAdmin, connection);

    const result: any = { success: true };

    // Pull transactions
    if (action === "pull" || action === "both") {
      const transactions = await pullTransactions(
        accessToken,
        connection.location_id,
        lastSyncTime
      );
      result.transactions = transactions;
      result.pullCount = transactions.length;
    }

    // Push inventory items to catalog
    if (action === "push" || action === "both") {
      if (!items || !Array.isArray(items)) {
        return new Response(
          JSON.stringify({ error: "Items array required for push action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const pushResults: any[] = [];
      for (const item of items) {
        try {
          const { catalogId, variationId } = await pushCatalogItem(accessToken, item, connection.location_id);
          pushResults.push({
            id: item.id,
            name: item.name,
            success: true,
            squareCatalogId: catalogId,
            squareVariationId: variationId,
          });
        } catch (error) {
          pushResults.push({
            id: item.id,
            name: item.name,
            success: false,
            error: error.message,
          });
        }
      }
      result.pushResults = pushResults;
      result.pushCount = pushResults.filter((r) => r.success).length;
    }

    // Update last sync time
    await supabaseAdmin
      .from("square_connections")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Sync failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
