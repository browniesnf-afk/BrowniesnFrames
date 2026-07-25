import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectTable() {
  // Attempt inserting minimal record to check valid columns
  const minPayload = {
    total_amount: 500,
    status: 'Pending'
  };
  const res = await supabase.from('orders').insert([minPayload]).select();
  console.log("Minimal insert res:", res);

  // If minPayload worked, let's delete it or check
  if (res.data && res.data.length > 0) {
    console.log("Single inserted record structure:", res.data[0]);
  }
}

inspectTable();
