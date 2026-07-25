import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCustomer() {
  console.log('Testing insert customer into Supabase...');
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      full_name: 'Inayath Basha',
      phone: '9345704295',
      email: '9345704295@customer.store'
    }])
    .select('*');

  if (error) {
    console.error('Customer Insert Error:', error);
  } else {
    console.log('Customer Insert SUCCESS! Inserted:', data);
  }

  const { data: allCust, error: fetchErr } = await supabase.from('customers').select('*');
  console.log('All Customers in table count:', allCust?.length, 'Fetch error:', fetchErr);
}

testCustomer();
