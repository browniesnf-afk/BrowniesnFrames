import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
  const { data, error } = await supabase.from('promo_codes').select('*');
  console.log('Select error:', error);
  console.log('Select data:', data);
  
  // Try inserting just code and discount_percent
  const { data: insData, error: insError } = await supabase.from('promo_codes').insert([{ code: 'BASHA', discount_percent: 10 }]);
  console.log('Insert basic error:', insError);
  console.log('Insert basic data:', insData);
}

inspectColumns();
