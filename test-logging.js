const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLogging() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('❌ Missing environment variables');
        console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        return;
    }

    try {
        console.log('Testing logging functionality...');

        // Test add_app_log function
        const { data, error } = await supabase.rpc('add_app_log', {
            p_level: 'info',
            p_message: 'Test log entry from CLI',
            p_user_id: null,
            p_category: 'test',
            p_source: 'cli_test',
            p_context: { test: true, timestamp: new Date().toISOString() },
            p_stack_trace: null,
        });

        if (error) {
            console.error('Logging test failed:', error);
        } else {
            console.log('✅ Logging test successful!');

            // Check if the log was created
            const { data: logs, error: fetchError } = await supabase
                .from('app_logs')
                .select('*')
                .eq('source', 'cli_test')
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError) {
                console.error('Failed to fetch test log:', fetchError);
            } else if (logs && logs.length > 0) {
                console.log('✅ Test log found in database:', logs[0].message);
            } else {
                console.log('❌ Test log not found in database');
            }
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testLogging().then(() => process.exit(0));