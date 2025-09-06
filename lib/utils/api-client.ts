import { logger } from './logger';

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    logPerformance?: boolean;
    skipLogging?: boolean;
}

interface FetchResponse<T = any> extends Response {
    data?: T;
}

class APIClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;
    private defaultTimeout: number;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        this.defaultTimeout = 30000; // 30 seconds
    }

    private async parseResponse(response: Response): Promise<any> {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            try {
                return await response.json();
            } catch (error) {
                logger.warn('Failed to parse JSON response', { error: (error as Error).message });
                return null;
            }
        } else if (contentType?.includes('text/')) {
            return await response.text();
        } else {
            return await response.blob();
        }
    }

    private buildURL(endpoint: string, params?: Record<string, any>): string {
        const url = new URL(endpoint, this.baseURL || window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    private shouldSkipBodyLogging(body: any): boolean {
        // Skip logging sensitive data
        const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'credit_card'];

        if (typeof body === 'object' && body !== null) {
            const bodyStr = JSON.stringify(body).toLowerCase();
            return sensitiveFields.some(field => bodyStr.includes(field));
        }

        return false;
    }

    private sanitizeBody(body: any): any {
        if (!body || typeof body !== 'object') return body;

        const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'credit_card', 'cvv'];
        const sanitized = { ...body };

        Object.keys(sanitized).forEach(key => {
            if (sensitiveFields.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    async request<T = any>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<FetchResponse<T>> {
        const {
            timeout = this.defaultTimeout,
            retries = 1,
            logPerformance = true,
            skipLogging = false,
            ...fetchOptions
        } = options;

        const startTime = performance.now();
        const url = this.buildURL(endpoint);
        const method = fetchOptions.method || 'GET';

        // Prepare headers
        const headers = {
            ...this.defaultHeaders,
            ...fetchOptions.headers,
        };

        // Parse request body
        let requestBody: any;
        if (fetchOptions.body) {
            try {
                requestBody = typeof fetchOptions.body === 'string'
                    ? JSON.parse(fetchOptions.body)
                    : fetchOptions.body;
            } catch {
                requestBody = fetchOptions.body;
            }
        }

        let response: Response;
        let responseData: any;
        let attempt = 0;

        while (attempt <= retries) {
            try {
                // Create timeout controller
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                // Make request
                response = await fetch(url, {
                    ...fetchOptions,
                    headers,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // Parse response
                responseData = await this.parseResponse(response);

                // Log successful request
                if (!skipLogging) {
                    const duration = Math.round(performance.now() - startTime);

                    await logger.logAPIRequest({
                        method,
                        url,
                        statusCode: response.status,
                        duration,
                        requestBody: this.shouldSkipBodyLogging(requestBody) ? '[SENSITIVE_DATA]' : this.sanitizeBody(requestBody),
                        responseBody: response.status >= 400 ? responseData : (responseData && Object.keys(responseData).length > 100 ? '[LARGE_RESPONSE]' : responseData),
                        headers: Object.fromEntries(response.headers.entries()),
                    });

                    // Log performance if enabled
                    if (logPerformance) {
                        await logger.logPerformance({
                            operationName: `API_${method}_${endpoint.replace(/\/api\//, '').replace(/\//g, '_')}`,
                            duration,
                            metadata: {
                                url,
                                statusCode: response.status,
                                success: response.ok,
                            },
                        });
                    }
                }

                // Handle response
                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    (error as any).status = response.status;
                    (error as any).response = responseData;

                    if (!skipLogging) {
                        await logger.error('API request failed', {
                            method,
                            url,
                            statusCode: response.status,
                            error: error.message,
                            responseData,
                        });
                    }

                    throw error;
                }

                // Success - attach data to response
                (response as FetchResponse<T>).data = responseData;
                return response as FetchResponse<T>;

            } catch (error) {
                const duration = Math.round(performance.now() - startTime);

                if (attempt === retries) {
                    // Final attempt failed - log error
                    if (!skipLogging) {
                        await logger.logAPIRequest({
                            method,
                            url,
                            statusCode: 0,
                            duration,
                            requestBody: this.shouldSkipBodyLogging(requestBody) ? '[SENSITIVE_DATA]' : this.sanitizeBody(requestBody),
                            error: (error as Error).message,
                        });

                        await logger.error('API request failed after retries', {
                            method,
                            url,
                            attempts: attempt + 1,
                            error: (error as Error).message,
                            duration,
                        });
                    }

                    throw error;
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                attempt++;
            }
        }

        // This should never be reached, but TypeScript requires it
        throw new Error('Unexpected error in request method');
    }

    // Convenience methods
    async get<T = any>(endpoint: string, params?: Record<string, any>, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
        const url = params ? this.buildURL(endpoint, params) : endpoint;
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method'>): Promise<FetchResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method'>): Promise<FetchResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T = any>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method'>): Promise<FetchResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export for direct use
export default apiClient;
