"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const email = params.get('email');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setStatus('sending'); setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
      if (resendError) { setError(resendError.message); setStatus('error'); return; }
      setStatus('sent');
    } catch (e: any) { setError(e?.message || 'Failed to resend'); setStatus('error'); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify Your Email</h1>
          <p className="text-sm text-gray-600">We\'ve sent a verification link to:</p>
          <p className="font-medium text-gray-900 break-all">{email || 'your email address'}</p>
        </div>
        <p className="text-xs text-gray-500 text-center">Check inbox & spam. After clicking the link, return to sign in.</p>
        <div className="flex flex-col gap-3">
          <a href={`mailto:${email ?? ''}`} className="w-full inline-flex items-center justify-center h-10 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition">Open Mail App</a>
          <button onClick={handleResend} disabled={!email || status === 'sending'} className="w-full inline-flex items-center justify-center h-10 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50">
            {status === 'sending' ? 'Resending…' : status === 'sent' ? 'Verification Sent ✓' : 'Resend Email'}
          </button>
          {error && <div className="text-xs text-red-600 text-center">{error}</div>}
        </div>
        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-gray-700 hover:underline">Back to Sign In</Link>
        </div>
      </div>
    </main>
  );
}
// (Removed duplicate legacy implementation below to avoid redeclaration errors)
