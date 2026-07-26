import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminInsert() {
  console.log('Inserting roshinibrownies@gmail.com into admins table...');

  const { data, error } = await supabase.from('admins').insert([{
    email: 'roshinibrownies@gmail.com',
    role: 'Super Admin'
  }]);

  console.log('Insert error:', error);
  console.log('Insert data:', data);

  const { data: updated } = await supabase.from('admins').select('*');
  console.log('\nAdmins table rows in Supabase:');
  console.log(updated);
}

testAdminInsert();
