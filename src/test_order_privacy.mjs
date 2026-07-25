import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCustomerPrivacy(targetPhone) {
  console.log(`Checking strict order privacy for phone: "${targetPhone}"...`);

  // 1. Get customer ID
  const { data: cust } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', targetPhone)
    .maybeSingle();

  const customerId = cust?.id;
  console.log(`Found Customer ID for ${targetPhone}:`, customerId);

  // 2. Fetch orders matching either customer_id OR shipping_address->>'phone'
  const { data: allOrders, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  console.log(`Total orders in DB: ${allOrders?.length || 0}`);

  // Strict filter for targetPhone
  const filtered = (allOrders || []).filter(order => {
    const addr = order.shipping_address || {};
    const matchesPhone = addr.phone === targetPhone;
    const matchesId = customerId && order.customer_id === customerId;
    return matchesPhone || matchesId;
  });

  console.log(`Filtered orders for ${targetPhone}: ${filtered.length}`);
  filtered.forEach(o => {
    console.log(` - Order ID: ${o.id}, Phone: ${o.shipping_address?.phone}, Total: ${o.total_amount}`);
  });
}

async function runTests() {
  await testCustomerPrivacy("9876543210");
  console.log("------------------------");
  await testCustomerPrivacy("9990001112");
}

runTests();
