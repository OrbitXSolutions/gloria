"use client";
import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function SupabaseDebug() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setResult(null);

        try {
            console.log('Environment check:');
            console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
            console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing');

            const supabase = getSupabaseClient();

            // Try a simple query that should work with any Supabase project
            const { data, error } = await supabase.auth.getSession();

            setResult({
                success: !error,
                error: error?.message,
                hasSession: !!data?.session,
                sessionInfo: data?.session ? { user: data.session.user?.email } : null
            });
        } catch (e: any) {
            setResult({
                success: false,
                error: e.message,
                stack: e.stack
            });
        }
        setLoading(false);
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-bold mb-2">Supabase Debug</h3>
            <button
                onClick={testConnection}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Connection'}
            </button>

            {result && (
                <div className="mt-4">
                    <h4 className="font-semibold">Result:</h4>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div className="mt-2 text-xs text-gray-600">
                <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...' || 'Not found'}</p>
                <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</p>
            </div>
        </div>
    );
}
