import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSafeInsert() {
  console.log("Testing safe order insertion with JSONB shipping_address fallback...");

  const safePayload = {
    total_amount: 899,
    status: 'Pending',
    shipping_address: {
      full_name: 'Friend Order Test',
      phone: '9876543210',
      address_line: '123 Beach Road',
      city: 'Chennai',
      pincode: '600001',
      items_summary: 'Belgian Chocolate Brownie x2',
      items: [
        { id: '1', title: 'Belgian Chocolate Brownie', price: 449, quantity: 2 }
      ]
    }
  };

  // Try insert
  const { data, error } = await supabase
    .from('orders')
    .insert([safePayload])
    .select();

  console.log("Insert result data:", data);
  console.log("Insert result error:", error);
}

testSafeInsert();
