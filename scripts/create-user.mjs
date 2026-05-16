/**
 * Creates a new user in Supabase and sets them as active admin
 * Usage: node scripts/create-user.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ehzikjukkowxvfkfiyxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoemlranVra293eHZma2ZpeXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDU0MjUsImV4cCI6MjA4NDA4MTQyNX0.FpqKa1pQgXNUCRaovR91zVw9SPp9ewA3_9Bm9IQfAzs';

const EMAIL = 'm_rovariz@hotmail.com';
const PASSWORD = 'Nu4qreq15$';

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('Signing up user:', EMAIL);
  const { data, error } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: {
      data: { full_name: 'Matheus Rovariz' }
    }
  });

  if (error) {
    console.error('Signup error:', error.message);
    
    // Try signing in instead (user might already exist)
    console.log('Trying sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD,
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError.message);
      return;
    }
    
    console.log('Signed in! User ID:', signInData.user?.id);
    console.log('Session token:', signInData.session?.access_token?.substring(0, 50) + '...');
    return;
  }

  console.log('Signup success!');
  console.log('User ID:', data.user?.id);
  console.log('Email confirmed:', data.user?.email_confirmed_at ? 'YES' : 'NO - confirmation needed');
  
  if (data.session) {
    console.log('Logged in immediately (no email confirmation required)');
    console.log('Access token (first 50 chars):', data.session.access_token.substring(0, 50));
  }
}

main().catch(console.error);
