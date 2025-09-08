'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function SupabaseDebugPage() {
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const runTests = async () => {
        setLoading(true);
        const results: any = {};

        try {
            // Test 1: Environment variables (both client and window)
            results.env = {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
                key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
                urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
                keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
                location: typeof window !== 'undefined' ? window.location.href : 'server',
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
            };

            // Test 1.5: Raw environment check
            if (typeof window !== 'undefined') {
                // @ts-ignore - for debugging
                results.windowEnv = window.process?.env || 'No window.process';
            }

            // Test 2: Client creation
            try {
                const client = getSupabaseClient();
                results.client = { status: 'created', success: true };

                // Test 3: Network connectivity test
                try {
                    const networkTest = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
                        method: 'GET',
                        headers: {
                            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                        },
                    });
                    
                    results.networkTest = {
                        success: true,
                        status: networkTest.status,
                        statusText: networkTest.statusText,
                        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
                    };
                } catch (e: any) {
                    results.networkTest = {
                        success: false,
                        error: e.message,
                        name: e.name,
                        stack: e.stack?.substring(0, 200),
                    };
                }

                // Test 4: Health check query
                try {
                    const { data, error } = await client
                        .from('health_check')
                        .select('*')
                        .limit(1);
                    
                    results.healthCheck = {
                        success: !error,
                        error: error?.message,
                        data: data?.length || 0,
                    };
                } catch (e: any) {
                    results.healthCheck = {
                        success: false,
                        error: e.message,
                        details: e,
                    };
                }

                // Test 5: Auth service
                try {
                    const { data: session } = await client.auth.getSession();
                    results.auth = {
                        success: true,
                        hasSession: !!session.session,
                    };
                } catch (e: any) {
                    results.auth = {
                        success: false,
                        error: e.message,
                    };
                }
            } catch (e: any) {
                results.client = {
                    status: 'failed',
                    error: e.message,
                    success: false,
                };
            }
        } catch (e: any) {
            results.error = e.message;
        }

        setResults(results);
        setLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Supabase Debug Page</h1>
            
            <button
                onClick={runTests}
                disabled={loading}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Run Tests'}
            </button>

            <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-bold mb-2">Environment Variables</h2>
                    <pre className="text-sm">{JSON.stringify(results.env, null, 2)}</pre>
                </div>

                {results.windowEnv && (
                    <div className="bg-yellow-100 p-4 rounded">
                        <h2 className="font-bold mb-2">Window Environment</h2>
                        <pre className="text-sm">{JSON.stringify(results.windowEnv, null, 2)}</pre>
                    </div>
                )}

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-bold mb-2">Client Creation</h2>
                    <pre className="text-sm">{JSON.stringify(results.client, null, 2)}</pre>
                </div>

                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="font-bold mb-2">Direct Network Test</h2>
                    <pre className="text-sm">{JSON.stringify(results.networkTest, null, 2)}</pre>
                </div>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-bold mb-2">Health Check Query</h2>
                    <pre className="text-sm">{JSON.stringify(results.healthCheck, null, 2)}</pre>
                </div>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-bold mb-2">Auth Service</h2>
                    <pre className="text-sm">{JSON.stringify(results.auth, null, 2)}</pre>
                </div>

                {results.error && (
                    <div className="bg-red-100 p-4 rounded">
                        <h2 className="font-bold mb-2">Error</h2>
                        <pre className="text-sm text-red-600">{results.error}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
