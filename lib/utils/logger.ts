import { createClient } from '@/lib/supabase/client';
import { createSsrClient } from '@/lib/supabase/server';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface BaseLogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    source?: string;
    userAgent?: string;
}

interface APILogEntry {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    requestBody?: any;
    responseBody?: any;
    headers?: Record<string, string>;
    queryParams?: Record<string, any>;
    error?: string;
}

interface PerformanceLogEntry {
    operationName: string;
    duration: number;
    metadata?: Record<string, any>;
}

class Logger {
    private isEnabled: boolean;
    private sessionId: string;
    private userId?: string;
    private supabase: any;

    constructor() {
        this.isEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
        this.sessionId = this.generateSessionId();
        this.supabase = createClient();
        this.initializeUser();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async initializeUser() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            this.userId = user?.id;
        } catch (error) {
            // Ignore auth errors for logging
        }
    }

    private getUserAgent(): string {
        return typeof window !== 'undefined' ? window.navigator.userAgent : 'Server';
    }

    private getClientIP(): string | undefined {
        // This will be handled by middleware/server-side
        return undefined;
    }

    // API Request Logging
    async logAPIRequest(entry: APILogEntry): Promise<void> {
        if (!this.isEnabled) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[API Request]', entry);
            }
            return;
        }

        try {
            await this.supabase.rpc('add_api_log', {
                p_method: entry.method,
                p_url: entry.url,
                p_status_code: entry.statusCode,
                p_duration_ms: entry.duration,
                p_request_body: entry.requestBody || null,
                p_response_body: entry.responseBody || null,
                p_user_agent: this.getUserAgent(),
                p_user_id: this.userId || null,
                p_error_message: entry.error || null,
                p_headers: entry.headers || null,
                p_query_params: entry.queryParams || null,
            });
        } catch (error) {
            console.error('Failed to log API request:', error);
        }
    }

    // Application Logging
    async log(entry: BaseLogEntry): Promise<void> {
        if (!this.isEnabled) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[${entry.level.toUpperCase()}]`, entry.message, entry.context);
            }
            return;
        }

        try {
            await this.supabase.rpc('add_app_log', {
                p_level: entry.level,
                p_message: entry.message,
                p_context: entry.context || null,
                p_user_id: this.userId || null,
                p_user_agent: entry.userAgent || this.getUserAgent(),
                p_source: entry.source || 'client',
            });
        } catch (error) {
            console.error('Failed to log application event:', error);
        }
    }

    // Performance Logging
    async logPerformance(entry: PerformanceLogEntry): Promise<void> {
        if (!this.isEnabled) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Performance]', entry);
            }
            return;
        }

        try {
            await this.supabase.rpc('add_performance_log', {
                p_operation_name: entry.operationName,
                p_duration_ms: entry.duration,
                p_metadata: entry.metadata || null,
                p_user_id: this.userId || null,
            });
        } catch (error) {
            console.error('Failed to log performance:', error);
        }
    }

    // Client Request Logging (for frontend API calls)
    async logClientRequest(entry: {
        url: string;
        method: string;
        duration: number;
        statusCode?: number;
        requestBody?: any;
        responseBody?: any;
        error?: string;
    }): Promise<void> {
        if (!this.isEnabled) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Client Request]', entry);
            }
            return;
        }

        try {
            await this.supabase.rpc('add_client_log', {
                p_session_id: this.sessionId,
                p_url: entry.url,
                p_method: entry.method,
                p_duration_ms: entry.duration,
                p_user_agent: this.getUserAgent(),
                p_request_body: entry.requestBody || null,
                p_response_body: entry.responseBody || null,
                p_status_code: entry.statusCode || null,
                p_user_id: this.userId || null,
                p_error_message: entry.error || null,
            });
        } catch (error) {
            console.error('Failed to log client request:', error);
        }
    }

    // Convenience methods
    info(message: string, context?: Record<string, any>, source?: string) {
        return this.log({ level: 'info', message, context, source });
    }

    warn(message: string, context?: Record<string, any>, source?: string) {
        return this.log({ level: 'warn', message, context, source });
    }

    error(message: string, context?: Record<string, any>, source?: string) {
        return this.log({ level: 'error', message, context, source });
    }

    debug(message: string, context?: Record<string, any>, source?: string) {
        return this.log({ level: 'debug', message, context, source });
    }

    // Update user ID when auth state changes
    setUserId(userId: string | null) {
        this.userId = userId || undefined;
    }

    // Performance measurement helper
    async measurePerformance<T>(
        operationName: string,
        operation: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        const startTime = performance.now();
        let result: T;
        let error: Error | undefined;

        try {
            result = await operation();
            return result;
        } catch (err) {
            error = err as Error;
            throw err;
        } finally {
            const duration = Math.round(performance.now() - startTime);

            await this.logPerformance({
                operationName,
                duration,
                metadata: {
                    ...metadata,
                    success: !error,
                    error: error?.message,
                },
            });

            if (error) {
                await this.error(`Operation failed: ${operationName}`, {
                    error: error.message,
                    duration,
                    metadata,
                });
            }
        }
    }
}

// Create singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { APILogEntry, PerformanceLogEntry, BaseLogEntry };
