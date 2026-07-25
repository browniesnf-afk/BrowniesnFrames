import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnose() {
  console.log("=== DEEP DIAGNOSTIC: ORDER SAVE & REALTIME ===\n");

  // Step 1: Check RLS status on orders table
  console.log("1️⃣  Placing a REAL test order (mimicking Checkout.tsx logic)...");
  const testPayload = {
    total_amount: 399,
    status: 'Pending',
    shipping_address: {
      order_code: 'ORD-DIAG-' + Date.now(),
      full_name: 'Diagnostic Test User',
      phone: '9000000001',
      address: '1 Diagnostic Lane',
      city: 'Chennai',
      pincode: '600001',
      items_summary: 'Test Brownie x1',
      cart_items: [{ id: 'test-1', title: 'Test Brownie', price: 399, quantity: 1, size: null }],
      subTotal: 399,
      discount: 0,
      appliedCoupon: null,
      total: 399
    }
  };

  const { data: insertData, error: insertError } = await supabase
    .from('orders')
    .insert([testPayload])
    .select();

  if (insertError) {
    console.error("❌ ORDER SAVE FAILED:", insertError.code, insertError.message);
    if (insertError.code === '42501') {
      console.log("   ⚠️  RLS is still ENABLED. Run this in Supabase SQL Editor:");
      console.log("   ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;");
    }
  } else {
    console.log("✅ ORDER SAVED TO SUPABASE SUCCESSFULLY!");
    console.log("   Inserted order ID:", insertData?.[0]?.id);
    console.log("   Full row:", JSON.stringify(insertData?.[0], null, 2));
  }

  // Step 2: Fetch all orders from DB (what Admin sees)
  console.log("\n2️⃣  Fetching ALL orders from Supabase (Admin Panel view)...");
  const { data: allOrders, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error("❌ FETCH FAILED:", fetchError.message);
  } else {
    console.log(`✅ Found ${allOrders?.length || 0} total orders in Supabase`);
    if (allOrders && allOrders.length > 0) {
      allOrders.slice(0, 3).forEach((o, i) => {
        console.log(`   Order #${i+1}: ID=${o.id}, Status=${o.status}, Customer=${o.shipping_address?.full_name || o.customer_name || 'N/A'}, Phone=${o.shipping_address?.phone || o.customer_phone || 'N/A'}, Amount=₹${o.total_amount}`);
      });
    }
  }

  // Step 3: Check orders table status update (UUID vs non-UUID ID)
  if (allOrders && allOrders.length > 0) {
    console.log("\n3️⃣  Testing Admin status update on first order...");
    const firstOrder = allOrders[0];
    console.log(`   Updating order ID: "${firstOrder.id}" (type: ${typeof firstOrder.id})`);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firstOrder.id);
    if (!isUUID) {
      console.error("   ❌ ORDER ID IS NOT A VALID UUID — this causes the '22P02 invalid uuid' error!");
      console.log("   Orders with IDs like 'ORD-123456' cannot be updated via Supabase .eq('id', ...) because 'id' column is UUID type.");
    } else {
      const { error: updateError } = await supabase.from('orders').update({ status: 'Confirmed' }).eq('id', firstOrder.id);
      if (updateError) {
        console.error("   ❌ Status update failed:", updateError.message);
      } else {
        console.log("   ✅ Status update succeeded!");
        // Revert
        await supabase.from('orders').update({ status: firstOrder.status }).eq('id', firstOrder.id);
      }
    }
  }

  // Step 4: Test Realtime subscription capability
  console.log("\n4️⃣  Testing Supabase Realtime subscription...");
  let realtimeFired = false;
  const channel = supabase.channel('diagnostic_realtime_test')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      realtimeFired = true;
      console.log("   ✅ REALTIME FIRED! Event:", payload.eventType, "New data:", payload.new?.id);
    })
    .subscribe();

  await new Promise(r => setTimeout(r, 2000));
  console.log(`   Realtime channel status: ${channel.state}`);

  // Insert a row to trigger realtime
  const triggerPayload = {
    total_amount: 1,
    status: 'Pending',
    shipping_address: { full_name: 'Realtime Trigger Test', phone: '9000000002', items_summary: 'RT Test' }
  };
  await supabase.from('orders').insert([triggerPayload]);
  await new Promise(r => setTimeout(r, 3000));

  if (realtimeFired) {
    console.log("   ✅ Realtime is WORKING CORRECTLY — subscription fired on insert!");
  } else {
    console.log("   ⚠️  Realtime did NOT fire. Possible causes:");
    console.log("      - Realtime is not enabled for the 'orders' table in Supabase Dashboard → Database → Replication.");
    console.log("      - Run in Supabase SQL Editor: ALTER PUBLICATION supabase_realtime ADD TABLE orders;");
  }

  await supabase.removeChannel(channel);

  console.log("\n=== DIAGNOSTIC COMPLETE ===");
}

diagnose().catch(e => console.error("Fatal error:", e));
