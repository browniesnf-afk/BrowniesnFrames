import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMasterSchema() {
  console.log("=== VERIFYING MASTER SCHEMA OPERATIONS FOR ALL TABLES ===\n");

  // 1. Test Products Payload
  console.log("1. Testing Products table insert with all expected columns...");
  const sampleProduct = {
    title: 'Schema Test Brownie',
    slug: 'schema-test-brownie-' + Date.now(),
    description: 'Test description',
    price: 299,
    stock: 50,
    category: 'Brownies',
    badge: 'Bestseller',
    images: ['/images/home_brownies.jpg'],
    sizes: ['Single', 'Pack of 6'],
    metadata: { test: true },
    is_active: true,
    is_featured: false
  };

  const { data: prodData, error: prodErr } = await supabase.from('products').insert([sampleProduct]).select();
  if (prodErr) {
    console.error("  ❌ Products error:", prodErr.message);
  } else {
    console.log("  ✅ Products payload inserted cleanly! ID:", prodData?.[0]?.id);
    // Cleanup
    if (prodData?.[0]?.id) await supabase.from('products').delete().eq('id', prodData[0].id);
  }

  // 2. Test Orders Payload
  console.log("\n2. Testing Orders table insert with all expected columns...");
  const sampleOrder = {
    customer_name: 'Schema Test Customer',
    customer_phone: '9999988888',
    items_summary: 'Test Item x1',
    total_amount: 399,
    status: 'Pending',
    subtotal: 399,
    discount: 0,
    shipping_address: { full_name: 'Schema Test Customer', phone: '9999988888' }
  };

  const { data: orderData, error: orderErr } = await supabase.from('orders').insert([sampleOrder]).select();
  if (orderErr) {
    console.error("  ❌ Orders error:", orderErr.message);
  } else {
    console.log("  ✅ Orders payload inserted cleanly! ID:", orderData?.[0]?.id);
    if (orderData?.[0]?.id) await supabase.from('orders').delete().eq('id', orderData[0].id);
  }

  // 3. Test Categories Payload
  console.log("\n3. Testing Categories table...");
  const { data: catData, error: catErr } = await supabase.from('categories').select('*').limit(1);
  if (catErr) console.error("  ❌ Categories error:", catErr.message);
  else console.log("  ✅ Categories query successful!");

  // 4. Test Customers Payload
  console.log("\n4. Testing Customers table...");
  const { data: custData, error: custErr } = await supabase.from('customers').select('*').limit(1);
  if (custErr) console.error("  ❌ Customers error:", custErr.message);
  else console.log("  ✅ Customers query successful!");

  // 5. Test Promo Codes Payload
  console.log("\n5. Testing Promo Codes table...");
  const { data: promoData, error: promoErr } = await supabase.from('promo_codes').select('*').limit(1);
  if (promoErr) console.error("  ❌ Promo Codes notice:", promoErr.message);
  else console.log("  ✅ Promo Codes query successful!");

  console.log("\n=== VERIFICATION COMPLETE ===");
}

testMasterSchema();
