import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function discover() {
  const fieldsToTest = [
    { total_amount: 100 },
    { total: 100 },
    { status: 'Pending' },
    { customer_name: 'Test' },
    { customer_phone: '123' },
    { shipping_address: {} },
    { address: '123' },
    { items: 'test' },
    { items_summary: 'test' }
  ];

  for (const field of fieldsToTest) {
    const key = Object.keys(field)[0];
    const { error } = await supabase.from('orders').insert([field]);
    if (error && error.message.includes('Could not find')) {
      console.log(`❌ Column '${key}' DOES NOT exist.`);
    } else if (error && error.message.includes('violates row-level security policy')) {
      console.log(`✅ Column '${key}' EXISTS! (RLS blocked insertion)`);
    } else if (error) {
      console.log(`❓ Column '${key}' response:`, error.message);
    } else {
      console.log(`🎉 Column '${key}' SUCCESS! Inserted!`);
    }
  }
}

discover();
