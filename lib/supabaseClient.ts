/**
 * Supabase Browser/Universal Client Factory
 * ----------------------------------------
 * Centralized creation of a Supabase client with required environment variables.
 * Falls back to alternative env names if the NEXT_PUBLIC_ variants are missing.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Minimal public shape used by auth registration helper
export interface PublicSupabaseClient extends SupabaseClient { }

let cachedClient: PublicSupabaseClient | null = null;

export function getSupabaseClient(): PublicSupabaseClient {
    if (cachedClient) return cachedClient;

    const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        '';
    const anon =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        '';

    console.info('[Supabase][ClientInit]', {
        url: url ? `${url.substring(0, 20)}...` : 'MISSING',
        anonKey: anon ? `${anon.substring(0, 20)}...` : 'MISSING',
        env: typeof window === 'undefined' ? 'server' : 'client'
    });

    if (!url || !anon) {
        console.error('[Supabase][ConfigError]', {
            message: 'Missing Supabase environment variables',
            required: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
            fallbackTried: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
            url: url || 'undefined',
            anon: anon ? 'present' : 'undefined'
        });
        throw new Error('Supabase environment variables not configured');
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        console.error('[Supabase][URLError]', { url, error: e });
        throw new Error(`Invalid Supabase URL format: ${url}`);
    }

    try {
        cachedClient = createClient(url, anon, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
            global: {
                headers: {
                    'X-Debug-Source': 'gloria-app'
                }
            }
        });

        console.info('[Supabase][ClientCreated]', { 
            success: true,
            url: url.substring(0, 30) + '...',
            timestamp: new Date().toISOString()
        });
        
        return cachedClient;
    } catch (error: any) {
        console.error('[Supabase][ClientCreationError]', {
            error: error.message,
            stack: error.stack,
            url: url.substring(0, 30) + '...'
        });
        throw error;
    }
} export function getOrigin(): string {
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
    return (
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    );
}
