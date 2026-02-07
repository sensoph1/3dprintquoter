// Creates a test order + payment in Square sandbox
// Usage: node scripts/test-square-order.mjs

const ACCESS_TOKEN = process.env.SQUARE_TOKEN || 'EAAAlwuuKc9G7fDuDnxUfsLoAAJKHEMxtv8BooEB3Gl4UdXvNYZPFp0-ULilWGKN';
const BASE_URL = 'https://connect.squareupsandbox.com/v2';

const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2024-01-18',
};

async function api(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('API Error:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

async function listCatalog() {
  const res = await fetch(`${BASE_URL}/catalog/list?types=ITEM`, { headers });
  const data = await res.json();
  return data.objects || [];
}

async function getLocation() {
  const res = await fetch(`${BASE_URL}/locations`, { headers });
  const data = await res.json();
  return data.locations?.[0];
}

async function main() {
  console.log('Fetching location...');
  const location = await getLocation();
  if (!location) { console.error('No location found'); process.exit(1); }
  console.log(`Location: ${location.name} (${location.id})\n`);

  console.log('Fetching catalog items...');
  const items = await listCatalog();

  if (items.length === 0) {
    console.log('No catalog items found. Push your inventory to Square first.');
    process.exit(0);
  }

  console.log(`Found ${items.length} catalog item(s):`);
  items.forEach((item, i) => {
    const variation = item.item_data?.variations?.[0];
    const price = variation?.item_variation_data?.price_money?.amount;
    console.log(`  ${i + 1}. ${item.item_data?.name} — $${price ? (price / 100).toFixed(2) : '?'} (${variation?.id})`);
  });

  // Pick up to 3 items for the test order
  const orderItems = items.slice(0, 3).map(item => {
    const variation = item.item_data?.variations?.[0];
    return {
      catalog_object_id: variation?.id,
      quantity: '1',
    };
  });

  console.log(`\nCreating order with ${orderItems.length} item(s)...`);
  const orderRes = await api('/orders', {
    order: {
      location_id: location.id,
      line_items: orderItems,
    },
    idempotency_key: crypto.randomUUID(),
  });

  const order = orderRes.order;
  console.log(`Order created: ${order.id}`);
  console.log(`Total: $${(order.total_money.amount / 100).toFixed(2)}`);

  // Create payment with sandbox test nonce
  console.log('\nCreating payment...');
  const paymentRes = await api('/payments', {
    source_id: 'cnon:card-nonce-ok',  // sandbox test nonce — always succeeds
    idempotency_key: crypto.randomUUID(),
    amount_money: order.total_money,
    order_id: order.id,
    location_id: location.id,
  });

  console.log(`Payment completed: ${paymentRes.payment.id}`);
  console.log(`Status: ${paymentRes.payment.status}`);
  console.log('\nDone! Go to your app and hit "Sync Sales" to pull this in.');
}

main().catch(console.error);
