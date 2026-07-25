import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase products table query...');
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log('SUCCESS! Products table exists and is accessible. Count:', data ? data.length : 0);
  }
}

testConnection();
