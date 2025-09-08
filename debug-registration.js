const { createClient } = require('@supabase/supabase-js');

// Test registration with both client approaches
async function debugRegistration() {
    console.log('=== DEBUGGING REGISTRATION ISSUE ===\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing');
    console.log();
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('❌ Missing Supabase environment variables');
        return;
    }
    
    // Create Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created successfully\n');
    
    // Test 1: Basic connectivity
    console.log('Test 1: Basic connectivity...');
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('❌ Auth getSession failed:', error.message);
        } else {
            console.log('✅ Auth getSession successful');
        }
    } catch (e) {
        console.error('❌ Auth connectivity failed:', e.message);
    }
    
    // Test 2: Health check table (this is what registration tries to do)
    console.log('\nTest 2: Health check table access...');
    try {
        const { data, error } = await supabase.from('health_check').select('*').limit(1);
        if (error) {
            console.log('⚠️  health_check table error:', error.message);
            console.log('   This might cause registration to fail if it depends on health_check table');
        } else {
            console.log('✅ health_check table accessible');
        }
    } catch (e) {
        console.error('❌ health_check table test failed:', e.message);
    }
    
    // Test 3: Try a test registration (with fake data)
    console.log('\nTest 3: Test registration attempt...');
    const testEmail = 'test-' + Date.now() + '@example.com';
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123',
            options: {
                data: {
                    firstName: 'Test',
                    lastName: 'User',
                    fullName: 'Test User',
                    first_name: 'Test',
                    last_name: 'User',
                    full_name: 'Test User',
                },
                emailRedirectTo: 'http://localhost:3000/auth/confirm'
            }
        });
        
        if (error) {
            console.error('❌ Registration failed:', error.message);
            console.error('   Error details:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Registration successful!');
            console.log('   User ID:', data.user?.id);
            console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
            console.log('   Session:', data.session ? 'Present' : 'None (email confirmation required)');
        }
    } catch (e) {
        console.error('❌ Registration attempt failed:', e.message);
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
}

// Load .env file for this script
require('dotenv').config();
debugRegistration().then(() => process.exit(0)).catch(console.error);