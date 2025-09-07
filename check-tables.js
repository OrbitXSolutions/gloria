const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
    try {
        console.log('🔍 Checking what tables exist in your database...\n');

        // Check for logging tables
        const tables = ['app_logs', 'api_logs', 'client_logs', 'performance_logs'];

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('count(*)', { count: 'exact', head: true });

                if (error) {
                    console.log(`❌ ${table}: Does not exist`);
                } else {
                    console.log(`✅ ${table}: Exists (${data || 0} records)`);
                }
            } catch (err) {
                console.log(`❌ ${table}: Error checking - ${err.message}`);
            }
        }

        console.log('\n💡 If tables don\'t exist, you need to run the database migration to create them.');

    } catch (error) {
        console.error('💥 Failed to check tables:', error.message);
    }
}

checkTables().then(() => process.exit(0));
