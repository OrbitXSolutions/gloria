"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function ConfirmCallbackPage() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Processing confirmation…');
    const params = useSearchParams();

    useEffect(() => {
        async function verify() {
            try {
                const supabase = getSupabaseClient();
                const token_hash = params.get('token_hash');
                const type = params.get('type') as any; // EmailOtpType
                // If token_hash present, attempt explicit verification (matches previous route.ts behavior)
                if (token_hash && type) {
                    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
                    if (error) {
                        console.error('[Confirm][verifyOtp][Error]', error);
                        setStatus('error');
                        setMessage(error.message || 'Verification failed.');
                        return;
                    }
                }
                // After possible explicit verify, check session
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    setStatus('success');
                    setMessage('Email confirmed successfully! You can sign in now.');
                } else {
                    setStatus('error');
                    setMessage('Could not establish a session. Try signing in.');
                }
            } catch (e: any) {
                console.error('[Confirm][Unhandled]', e);
                setStatus('error');
                setMessage(e?.message || 'Unexpected error.');
            }
        }
        verify();
    }, [params]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6 text-center">
                <h1 className="text-2xl font-semibold">Email Confirmation</h1>
                <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>{message}</p>
                <div className="space-y-3">
                    <Link href="/auth/login" className="inline-flex items-center justify-center w-full h-10 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition">Go to Sign In</Link>
                    <Link href="/" className="block text-xs text-gray-500 hover:underline">Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
