import { NextRequest, NextResponse } from 'next/server';
import { createSsrClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createSsrClient();

        const checks = {
            timestamp: new Date().toISOString(),
            supabaseConnection: false,
            categoriesTable: false,
            loggingRpcFunctions: false,
            errors: [] as string[]
        };

        // Test 1: Basic Supabase connection
        try {
            const { data, error } = await supabase.from('categories').select('count').limit(1);
            if (error) {
                checks.errors.push(`Supabase connection error: ${error.message}`);
            } else {
                checks.supabaseConnection = true;
            }
        } catch (error) {
            checks.errors.push(`Supabase connection failed: ${error}`);
        }

        // Test 2: Categories table access
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name_en')
                .eq('is_deleted', false)
                .limit(1);

            if (error) {
                checks.errors.push(`Categories table error: ${error.message}`);
            } else {
                checks.categoriesTable = true;
            }
        } catch (error) {
            checks.errors.push(`Categories table access failed: ${error}`);
        }

        // Test 3: Logging RPC functions
        try {
            await supabase.rpc('add_app_log', {
                p_level: 'info',
                p_message: 'Health check test log',
                p_user_id: null,
                p_category: 'health_check',
                p_source: 'api',
                p_context: { test: true },
                p_stack_trace: null,
            });
            checks.loggingRpcFunctions = true;
        } catch (error) {
            checks.errors.push(`Logging RPC function error: ${error}`);
        }

        const allHealthy = checks.supabaseConnection &&
            checks.categoriesTable &&
            checks.loggingRpcFunctions;

        return NextResponse.json({
            status: allHealthy ? 'healthy' : 'unhealthy',
            checks,
        }, {
            status: allHealthy ? 200 : 500
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: 'Health check failed',
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        }, {
            status: 500
        });
    }
}
