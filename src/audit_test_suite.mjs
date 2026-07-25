import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('=== STARTING FULL END-TO-END SUPABASE AUDIT ===\n');

  // 1. Audit Categories
  console.log('1. Testing Categories Table...');
  const { data: cats, error: catErr } = await supabase.from('categories').select('*');
  console.log('   Categories query:', catErr ? `ERROR: ${catErr.message}` : `OK (${cats.length} records)`);

  // 2. Audit Products
  console.log('2. Testing Products Table...');
  const { data: prods, error: prodErr } = await supabase.from('products').select('*');
  console.log('   Products query:', prodErr ? `ERROR: ${prodErr.message}` : `OK (${prods.length} records)`);

  // 3. Audit Customers (Upsert)
  console.log('3. Testing Customers Table Upsert (Name: Inayath Basha, Phone: 9345704295)...');
  const { data: custInsert, error: custErr } = await supabase
    .from('customers')
    .upsert([{
      full_name: 'Inayath Basha',
      phone: '9345704295',
      email: '9345704295@customer.store'
    }], { onConflict: 'phone' })
    .select('*');
  console.log('   Customer upsert:', custErr ? `ERROR: ${custErr.message}` : `OK (Inserted/Updated ID: ${custInsert?.[0]?.id})`);

  // 4. Audit Orders
  console.log('4. Testing Orders Table Insert & Fetch...');
  const { data: orderData, error: orderErr } = await supabase
    .from('orders')
    .insert([{
      customer_id: custInsert?.[0]?.id,
      total_amount: 1299,
      status: 'Confirmed',
      items_summary: 'Premium Gift Hamper x1'
    }])
    .select('*');
  console.log('   Order insert:', orderErr ? `ERROR: ${orderErr.message}` : `OK (Order ID: ${orderData?.[0]?.id})`);

  // 5. Audit Final Stats Calculation
  console.log('\n5. Testing Live Admin Stats Calculation...');
  const { data: allOrders } = await supabase.from('orders').select('total_amount');
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });

  const totalSales = allOrders?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;
  console.log('   Calculated Total Sales: ₹' + totalSales);
  console.log('   Calculated Total Orders:', allOrders?.length);
  console.log('   Calculated Active Products:', prodCount);
  console.log('   Calculated Customers:', custCount);

  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit();
