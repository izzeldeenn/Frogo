#!/usr/bin/env node

// Diagnostic script for Supabase connection issues
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Starting Supabase diagnostic...\n');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT SET');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Validate URL format
if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost:8090')) {
  console.log('\n❌ Invalid Supabase URL format. Expected supabase.co or localhost:8090');
  process.exit(1);
}

// Validate key format
if (supabaseAnonKey.length < 20) {
  console.log('\n❌ Invalid Supabase key format. Key too short.');
  process.exit(1);
}

console.log('\n✅ Environment variables validated');

// Test connection
console.log('\n🔄 Testing Supabase connection...');

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test basic connectivity
  supabase.from('users').select('id').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Supabase connection failed:');
        console.log('Error:', error);
        console.log('Details:', JSON.stringify(error, null, 2));
        
        // Provide specific troubleshooting advice
        if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
          console.log('\n🔧 Network Error Troubleshooting:');
          console.log('1. Check your internet connection');
          console.log('2. Verify the Supabase URL is correct');
          console.log('3. Check if Supabase project is active');
          console.log('4. Verify CORS settings in Supabase dashboard');
          console.log('5. Try accessing the Supabase URL directly in browser');
        }
        
        process.exit(1);
      } else {
        console.log('✅ Supabase connection successful!');
        console.log('Data:', data);
      }
    })
    .catch(err => {
      console.log('❌ Unexpected error:', err.message);
      process.exit(1);
    });
    
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
  process.exit(1);
}
