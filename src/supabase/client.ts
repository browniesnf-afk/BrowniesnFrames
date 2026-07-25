import { createClient } from '@supabase/supabase-js';

// Hardcoded fallback so the app never crashes even if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
