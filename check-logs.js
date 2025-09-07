const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLogs() {
    try {
        console.log('🔍 Checking app_logs table for recent entries...\n');

        const { data: logs, error } = await supabase
            .from('app_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('❌ Error fetching logs:', error.message);
            return;
        }

        if (!logs || logs.length === 0) {
            console.log('❌ No logs found in app_logs table');
            console.log('💡 Try registering or logging in to generate some logs');
            return;
        }

        console.log(`✅ Found ${logs.length} recent log entries:`);
        console.log('==========================================');

        logs.forEach((log, index) => {
            const timestamp = new Date(log.created_at).toLocaleString();
            console.log(`${index + 1}. [${log.level?.toUpperCase()}] ${timestamp}`);
            console.log(`   📍 Source: ${log.source}`);
            console.log(`   📝 Message: ${log.message}`);
            console.log(`   🏷️  Category: ${log.category}`);

            if (log.user_id) {
                console.log(`   👤 User ID: ${log.user_id}`);
            }

            if (log.context) {
                console.log(`   📋 Context: ${JSON.stringify(log.context, null, 4)}`);
            }

            console.log('   ' + '─'.repeat(50));
        });

    } catch (error) {
        console.error('💥 Failed to check logs:', error.message);
    }
}

checkLogs().then(() => process.exit(0));
