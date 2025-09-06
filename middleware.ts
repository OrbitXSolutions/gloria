import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { createSsrClient } from "./lib/supabase/server";

// Logging middleware
async function loggingMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Skip logging for static files and certain paths
  const skipPaths = [
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/images/',
    '/icons/',
    '/fonts/',
  ];

  const shouldSkip = skipPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (shouldSkip) {
    return null; // Don't log, but continue processing
  }

  // Extract request details
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'Unknown';

  // Get request body for POST/PUT/PATCH
  let requestBody: any = null;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await request.clone().text();
      if (body) {
        requestBody = JSON.parse(body);
        // Sanitize sensitive data
        const sanitized = sanitizeRequestBody(requestBody);
        requestBody = sanitized;
      }
    } catch (error) {
      requestBody = 'Non-JSON body';
    }
  }

  return {
    requestId,
    method,
    url,
    userAgent,
    ip,
    requestBody,
    startTime,
    headers: Object.fromEntries(request.headers.entries()),
  };
}

function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'credit_card', 'cvv'];
  const sanitized = JSON.parse(JSON.stringify(body));

  function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(sensitive => key.toLowerCase().includes(sensitive))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    });

    return obj;
  }

  return sanitizeObject(sanitized);
}

async function logAPIRequest(logData: {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  requestBody?: any;
  userAgent: string;
  ip: string;
  headers: Record<string, string>;
}) {
  // Only log in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_LOGGING !== 'true') {
    console.log('[API Request]', logData);
    return;
  }

  try {
    // Create Supabase client for logging
    const supabase = await createSsrClient();

    // Try to get user ID (don't fail if not authenticated)
    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // Ignore auth errors for logging
    }

    // Log to Supabase
    await supabase.rpc('add_api_log', {
      p_method: logData.method,
      p_path: logData.url,
      p_status_code: logData.statusCode,
      p_response_time: logData.duration,
      p_request_body: logData.requestBody,
      p_response_body: null, // Response body not available in middleware
      p_user_agent: logData.userAgent,
      p_ip_address: logData.ip,
      p_user_id: userId,
      p_error_details: null, // Could be enhanced to include error details
    });
  } catch (error) {
    console.error('Failed to log API request to Supabase:', error);
  }
}

export async function middleware(request: NextRequest) {
  // Handle language preference
  const lang = request.nextUrl.searchParams.get("lang");
  const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
  if (lang && lang !== locale) {
    request.cookies.set("NEXT_LOCALE", lang);
  }

  // Collect logging data
  const loggingData = await loggingMiddleware(request);

  // Process the request with Supabase session handling
  const response = await updateSession(request);

  // Add logging headers and log API requests
  if (loggingData) {
    const duration = Date.now() - loggingData.startTime;

    // Add headers to response
    response.headers.set('x-request-id', loggingData.requestId);
    response.headers.set('x-response-time', `${duration}ms`);

    // Log API requests only (not page requests)
    if (request.nextUrl.pathname.startsWith('/api/')) {
      logAPIRequest({
        ...loggingData,
        statusCode: response.status,
        duration,
      }).catch(error => {
        console.error('Failed to log API request:', error);
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
