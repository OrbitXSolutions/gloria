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

    // Environment check
    if (typeof window === 'undefined') {
        // Server-side, check for required env vars
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('[Register][EnvCheck] Missing Supabase environment variables on server');
            return { ok: false, error: 'Authentication service is not properly configured. Please contact support.' };
        }
    } else {
        // Client-side, warn if env vars not available (they should be)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('[Register][EnvCheck] Supabase environment variables not available on client');
        }
    }

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
        // Optional connectivity test - don't fail if health_check table doesn't exist
        console.info('[Register][ConnTest] Testing Supabase connectivity...');
        try {
            const { error: healthError } = await supabase.from('health_check').select('count').limit(1);
            if (healthError && !healthError.message.includes('relation "health_check" does not exist')) {
                console.warn('[Register][ConnTest][Warning]', healthError);
                // Continue anyway - this is just a warning, not a hard failure
            } else {
                console.info('[Register][ConnTest] Connection OK');
            }
        } catch (healthCheckError: any) {
            // Health check is optional - log but don't fail registration
            console.warn('[Register][ConnTest][Warning] Health check failed, continuing anyway:', healthCheckError.message);
        }
    } catch (e: any) {
        console.error('[Register][ClientInit][Failed]', e);
        return { ok: false, error: 'Authentication service configuration error. Please contact support.' };
    } 
    
    const origin = getOrigin();
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

    // Retry mechanism for network issues
    const maxRetries = 2;
    let lastError: any = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.info(`[Register][Attempt ${attempt}/${maxRetries}] Starting registration...`);
            
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
                
                // Check if this is a retryable error
                const isNetworkError = error.message?.includes('fetch failed') || 
                                     error.message?.includes('ENOTFOUND') || 
                                     (error as any).status === 0;
                
                if (isNetworkError && attempt < maxRetries) {
                    console.warn(`[Register][Retry] Network error on attempt ${attempt}, retrying...`);
                    lastError = error;
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
                
                // Provide more specific error messages based on error type
                let userMessage = 'Registration failed.';
                if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || (error as any).status === 0) {
                    userMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
                } else if (error.message?.includes('User already registered')) {
                    userMessage = 'An account with this email already exists. Please try logging in instead.';
                } else if (error.message?.includes('Invalid email')) {
                    userMessage = 'Please enter a valid email address.';
                } else if (error.message?.includes('Password')) {
                    userMessage = 'Password does not meet requirements. Please try a different password.';
                } else if (error.message) {
                    userMessage = error.message;
                }
                
                return { ok: false, error: userMessage };
            }

            // Success! Break out of retry loop
            const needsVerification = !data.session;
            console.info('[Register][Success]', { userId: data.user?.id, needsVerification, attempt });
            if (typeof window !== 'undefined') {
                // Navigate user to verify-email screen (soft navigation)
                const target = `/auth/verify-email?email=${encodeURIComponent(email)}`;
                if (window.location.pathname !== target) {
                    window.location.assign(target);
                }
            }
            return { ok: true, email };
            
        } catch (err: any) {
            console.error(`[Register][Attempt ${attempt}][Unhandled]`, { message: err?.message, name: err?.name, cause: err?.cause });
            lastError = err;
            
            // Check if this is a retryable error
            const isNetworkError = err?.message?.includes('fetch failed') || 
                                 err?.message?.includes('ENOTFOUND') || 
                                 err?.cause?.code === 'ENOTFOUND';
            
            if (isNetworkError && attempt < maxRetries) {
                console.warn(`[Register][Retry] Network error on attempt ${attempt}, retrying...`);
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }
            
            // If not retryable or max retries reached, fall through to error handling
        }
    }
    
    // If we get here, all retries failed
    console.error('[Register][AllRetriesFailed]', { lastError: lastError?.message });
    
    // Provide specific error messages for network issues
    let userMessage = 'Unexpected error occurred.';
    if (lastError?.message?.includes('fetch failed') || lastError?.message?.includes('ENOTFOUND') || lastError?.cause?.code === 'ENOTFOUND') {
        userMessage = 'Unable to connect to authentication service. Please check your internet connection and try again later.';
    } else if (lastError?.message) {
        userMessage = lastError.message;
    }
    
    return { ok: false, error: userMessage };
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
