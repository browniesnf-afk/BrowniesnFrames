import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rapihhocsnmckogsmokp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCoupons() {
  console.log("=== TESTING SUPABASE PROMO CODES INTEGRATION ===\n");

  // 1. Seed WELCOME10 into Supabase promo_codes table using exact table column schema
  console.log("1️⃣  Seeding 'WELCOME10' (10% OFF) into Supabase promo_codes table...");
  const { data: existing } = await supabase.from('promo_codes').select('*').eq('code', 'WELCOME10').maybeSingle();

  if (!existing) {
    const { data: created, error } = await supabase.from('promo_codes').insert([{
      code: 'WELCOME10',
      discount_percent: 10,
      min_order_value: 0,
      is_active: true
    }]).select().single();

    if (error) {
      console.error("  ❌ Failed to seed WELCOME10:", error.message);
    } else {
      console.log("  ✅ Successfully created WELCOME10 promo code in Supabase! ID:", created.id);
    }
  } else {
    console.log("  ✅ WELCOME10 already exists in Supabase! Active status:", existing.is_active);
  }

  // 2. Validate real code WELCOME10 against Supabase
  console.log("\n2️⃣  Validating code 'WELCOME10' against Supabase...");
  const { data: validCode } = await supabase.from('promo_codes').select('*').eq('code', 'WELCOME10').maybeSingle();
  if (validCode && validCode.is_active) {
    console.log(`  ✅ PASS: WELCOME10 verified in Supabase! Discount: ${validCode.discount_percent}% OFF`);
  } else {
    console.error("  ❌ FAIL: WELCOME10 not found or inactive.");
  }

  // 3. Validate fake code FAKECODE99 against Supabase
  console.log("\n3️⃣  Validating fake code 'FAKECODE99' against Supabase...");
  const { data: fakeCode } = await supabase.from('promo_codes').select('*').eq('code', 'FAKECODE99').maybeSingle();
  if (!fakeCode) {
    console.log("  ✅ PASS: Fake code 'FAKECODE99' correctly REJECTED (does not exist in database)!");
  } else {
    console.error("  ❌ FAIL: Fake code was accepted.");
  }

  console.log("\n=== PROMO CODE INTEGRATION TEST COMPLETE ===");
}

testCoupons();
