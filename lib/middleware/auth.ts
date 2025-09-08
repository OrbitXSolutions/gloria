/**
 * Auth Middleware Integration
 * ===========================
 * Enhanced middleware for auth flows with new utilities
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AUTH_CONFIG } from '@/lib/config/auth';

export async function authMiddleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth required routes
  const authRequiredPaths = ['/profile', '/orders', '/favorites'];
  const isAuthRequired = authRequiredPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if auth required and user not logged in
  if (isAuthRequired && !user) {
    const redirectUrl = new URL(AUTH_CONFIG.REDIRECTS.LOGIN_REQUIRED, request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from auth pages
  const authPages = ['/auth/login', '/auth/register'];
  const isAuthPage = authPages.includes(request.nextUrl.pathname);
  
  if (isAuthPage && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || AUTH_CONFIG.REDIRECTS.AFTER_LOGIN;
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return supabaseResponse;
}