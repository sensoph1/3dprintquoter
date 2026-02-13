import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_ITEMS = [
  { name: "Dragon Phone Stand", price: 1500 },
  { name: "Flexi Octopus", price: 800 },
  { name: "Cable Organizer", price: 500 },
  { name: "Geometric Plant Pot", price: 1200 },
  { name: "Desk Organizer Set", price: 2000 },
  { name: "Articulated Dragon", price: 2500 },
  { name: "Phone Dock", price: 1000 },
  { name: "Pencil Holder", price: 600 },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
    const body = await req.json().catch(() => ({}));
    const count = Math.min(body.count || 3, 10); // Max 10 orders

    // Get Square connection
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

    const squareEnvironment = Deno.env.get("SQUARE_ENVIRONMENT") || "sandbox";
    if (squareEnvironment !== "sandbox") {
      return new Response(
        JSON.stringify({ error: "Test orders only allowed in sandbox mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiBaseUrl = "https://connect.squareupsandbox.com";
    const headers = {
      Authorization: `Bearer ${connection.access_token}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-01-18",
    };

    const createdOrders: any[] = [];

    for (let i = 0; i < count; i++) {
      const item = TEST_ITEMS[Math.floor(Math.random() * TEST_ITEMS.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;

      // Randomize date within last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(Math.floor(Math.random() * 12) + 9); // 9am - 9pm

      // Create order (without COMPLETED state - payment will complete it)
      const orderBody = {
        idempotency_key: `test-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        order: {
          location_id: connection.location_id,
          line_items: [
            {
              name: item.name,
              quantity: String(quantity),
              base_price_money: {
                amount: item.price,
                currency: "USD",
              },
            },
          ],
        },
      };

      const orderResponse = await fetch(`${apiBaseUrl}/v2/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderBody),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.order) {
        console.error("Failed to create order:", orderData);
        continue;
      }

      const order = orderData.order;
      const totalAmount = order.total_money?.amount || item.price * quantity;

      // Create payment with sandbox test nonce to complete the order
      const paymentBody = {
        idempotency_key: `pay-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        source_id: "cnon:card-nonce-ok", // Sandbox test nonce - always succeeds
        amount_money: {
          amount: totalAmount,
          currency: "USD",
        },
        order_id: order.id,
        location_id: connection.location_id,
      };

      const paymentResponse = await fetch(`${apiBaseUrl}/v2/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentBody),
      });

      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok && paymentData.payment) {
        createdOrders.push({
          orderId: order.id,
          item: item.name,
          quantity,
          total: totalAmount / 100,
        });
      } else {
        console.error("Failed to create payment:", paymentData);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdOrders.length} test orders`,
        orders: createdOrders,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create test orders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
