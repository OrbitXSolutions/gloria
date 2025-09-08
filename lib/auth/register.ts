/**
 * Auth Registration Helper
 * ========================
 * Implements email/password user registration via Supabase with metadata & redirect.
 *
 * ENVIRONMENT REQUIREMENTS
 * - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (or fallbacks SUPABASE_URL / SUPABASE_ANON_KEY)
 * - Supabase Auth Settings:
 *    * Email Confirmations ENABLED
 *    * Site URL includes your primary origin
 *    * Additional Redirect URLs includes <origin>/auth/confirm
 * ROUTES ADDED:
 *    /auth/verify-email   (user instruction screen)
 *    /auth/confirm        (Supabase email confirmation callback landing)
 * TEST HARNESS: import { testRegister } from this module & run in a client component or a dev script.
 */
import { getSupabaseClient, getOrigin } from '@/lib/supabaseClient';

export interface RegisterPayload {
    firstName: string; lastName: string; email: string; phone?: string; password: string; confirmPassword: string;
}
export interface RegisterResult { ok: boolean; email?: string; error?: string; }

function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
    console.info('[Register][Start]');
    const { firstName, lastName } = payload;
    let { email } = payload;
    const { phone, password, confirmPassword } = payload;

    // Basic client-side validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        console.warn('[Register][Validation] Missing required fields');
        return { ok: false, error: 'Missing required fields.' };
    }
    if (password !== confirmPassword) {
        console.warn('[Register][Validation] Password mismatch');
        return { ok: false, error: 'Passwords do not match.' };
    }
    email = normalizeEmail(email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        console.warn('[Register][Validation] Invalid email format');
        return { ok: false, error: 'Invalid email format.' };
    }

    let supabase;
    try {
        supabase = getSupabaseClient();
        // Test connectivity before attempting signUp
        console.info('[Register][ConnTest] Testing Supabase connectivity...');
        const { data: healthCheck, error: healthError } = await supabase.from('health_check').select('*').limit(1);
        if (healthError && !healthError.message.includes('relation "health_check" does not exist')) {
            console.error('[Register][ConnTest][Failed]', healthError);
            return { ok: false, error: 'Unable to connect to authentication service. Please try again.' };
        }
        console.info('[Register][ConnTest] Connection OK');
    } catch (e: any) {
        console.error('[Register][ClientInit][Failed]', e);
        return { ok: false, error: e.message || 'Supabase not configured' };
    } const origin = getOrigin();
    // Environment-aware redirect selection.
    // Order of precedence:
    // 1. Explicit override via NEXT_PUBLIC_FORCE_LOCAL_REDIRECT
    // 2. If running in browser and host looks like localhost / 127.* / *.github.dev use that host
    // 3. Fallback to computed origin
    const emailRedirectTo = (() => {
        if (process.env.NEXT_PUBLIC_FORCE_LOCAL_REDIRECT === 'true') {
            return 'http://localhost:3000/auth/confirm';
        }
        if (typeof window !== 'undefined') {
            const h = window.location.host;
            if (/^(localhost:|127\.|0\.0\.0\.0:)/.test(h)) return `http://${h}/auth/confirm`;
            if (h.endsWith('github.dev')) return `https://${h}/auth/confirm`;
        }
        return `${origin}/auth/confirm`;
    })();
    console.info('[Register][Supabase.signUp] Initiating', { email, redirect: emailRedirectTo });

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Include both camelCase and snake_case for downstream compatibility
                data: {
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`.trim(),
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    phone: phone || null,
                },
                emailRedirectTo,
            },
        });

        if (error) {
            console.error('[Register][SupabaseError]', { name: error.name, message: error.message, status: (error as any).status, stack: error.stack, redirect: emailRedirectTo });
            return { ok: false, error: error.message || 'Registration failed.' };
        }

        // When email confirmations enabled, no session is returned.
        const needsVerification = !data.session;
        console.info('[Register][Success]', { userId: data.user?.id, needsVerification });
        if (typeof window !== 'undefined') {
            // Navigate user to verify-email screen (soft navigation)
            const target = `/auth/verify-email?email=${encodeURIComponent(email)}`;
            if (window.location.pathname !== target) {
                window.location.assign(target);
            }
        }
        return { ok: true, email };
    } catch (err: any) {
        console.error('[Register][Unhandled]', { message: err?.message, name: err?.name, cause: err?.cause });
        return { ok: false, error: err?.message || 'Unexpected error.' };
    }
}

// Simple test harness utility (dev only)
export async function testRegister(fixtures: RegisterPayload[]) {
    for (const f of fixtures) {
        // Clone to avoid mutation noise
        const res = await registerUser({ ...f });
        console.info('[TestRegister][Result]', { inputEmail: f.email, ...res });
    }
}
