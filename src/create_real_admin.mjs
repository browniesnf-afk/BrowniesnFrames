import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRealAdmin() {
  const email = 'roshiniadmin786@gmail.com';
  const password = 'Roshini786@';

  console.log(`1. Attempting sign in for ${email}...`);
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInData?.user) {
    console.log('User already exists and signed in successfully!');
    console.log('User ID:', signInData.user.id);
  } else {
    console.log('Sign in notice:', signInErr?.message);
    console.log(`2. Attempting signUp for ${email}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpErr) {
      console.error('SignUp Error:', signUpErr.message);
    } else {
      console.log('SignUp Success!');
      console.log('User ID:', signUpData.user?.id);
      console.log('Session:', signUpData.session ? 'Active' : 'Email confirmation required');
    }
  }
}

createRealAdmin();
