import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectTables() {
  const tables = ['products', 'categories', 'customers', 'orders', 'order_items', 'admins', 'promo_codes'];

  console.log("=== INSPECTING LIVE SUPABASE SCHEMA COLUMNS ===\n");

  for (const table of tables) {
    console.log(`Checking table: "${table}"...`);
    const { data, error } = await supabase.from(table).select('*').limit(1);

    if (error) {
      console.log(`  ❌ Error querying table "${table}": ${error.message} (Code: ${error.code})`);
    } else if (data && data.length > 0) {
      console.log(`  ✅ Table "${table}" columns:`, Object.keys(data[0]));
    } else {
      console.log(`  ℹ️  Table "${table}" exists but is empty. Fetching row structure...`);
      // Try an insert with invalid column to get schema error or inspect
      const { error: insErr } = await supabase.from(table).insert([{ __invalid_column_test__: true }]);
      console.log(`  Schema hint from invalid insert:`, insErr?.message);
    }
  }
}

inspectTables();
