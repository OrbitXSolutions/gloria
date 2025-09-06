import { useCallback, useRef } from 'react';
import { useLogger } from '@/components/_core/providers/logger-provider';

// Hook for tracking user interactions
export function useUserActions() {
    const { logUserAction } = useLogger();

    const logButtonClick = useCallback((buttonName: string, context?: Record<string, any>) => {
        logUserAction('button_click', { buttonName, ...context });
    }, [logUserAction]);

    const logFormSubmission = useCallback((formName: string, success: boolean, context?: Record<string, any>) => {
        logUserAction('form_submission', { formName, success, ...context });
    }, [logUserAction]);

    const logProductView = useCallback((productId: string, productName: string, context?: Record<string, any>) => {
        logUserAction('product_view', { productId, productName, ...context });
    }, [logUserAction]);

    const logProductAddToCart = useCallback((productId: string, quantity: number, context?: Record<string, any>) => {
        logUserAction('add_to_cart', { productId, quantity, ...context });
    }, [logUserAction]);

    const logProductRemoveFromCart = useCallback((productId: string, quantity: number, context?: Record<string, any>) => {
        logUserAction('remove_from_cart', { productId, quantity, ...context });
    }, [logUserAction]);

    const logCheckoutStep = useCallback((step: string, context?: Record<string, any>) => {
        logUserAction('checkout_step', { step, ...context });
    }, [logUserAction]);

    const logSearch = useCallback((query: string, resultsCount: number, context?: Record<string, any>) => {
        logUserAction('search', { query, resultsCount, ...context });
    }, [logUserAction]);

    const logNavigation = useCallback((from: string, to: string, context?: Record<string, any>) => {
        logUserAction('navigation', { from, to, ...context });
    }, [logUserAction]);

    const logFilterChange = useCallback((filterType: string, filterValue: string, context?: Record<string, any>) => {
        logUserAction('filter_change', { filterType, filterValue, ...context });
    }, [logUserAction]);

    const logSortChange = useCallback((sortBy: string, sortOrder: string, context?: Record<string, any>) => {
        logUserAction('sort_change', { sortBy, sortOrder, ...context });
    }, [logUserAction]);

    return {
        logButtonClick,
        logFormSubmission,
        logProductView,
        logProductAddToCart,
        logProductRemoveFromCart,
        logCheckoutStep,
        logSearch,
        logNavigation,
        logFilterChange,
        logSortChange,
        logUserAction, // Generic action logger
    };
}

// Hook for performance monitoring
export function usePerformanceTracking() {
    const { logger } = useLogger();
    const timers = useRef<Map<string, number>>(new Map());

    const startTimer = useCallback((operationName: string) => {
        timers.current.set(operationName, performance.now());
    }, []);

    const endTimer = useCallback(async (operationName: string, metadata?: Record<string, any>) => {
        const startTime = timers.current.get(operationName);
        if (startTime) {
            const duration = Math.round(performance.now() - startTime);
            await logger.logPerformance({
                operationName,
                duration,
                metadata,
            });
            timers.current.delete(operationName);
            return duration;
        }
        return null;
    }, [logger]);

    const measureAsync = useCallback(async <T>(
        operationName: string,
        operation: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> => {
        return logger.measurePerformance(operationName, operation, metadata);
    }, [logger]);

    const measureSync = useCallback(<T>(
        operationName: string,
        operation: () => T,
        metadata?: Record<string, any>
    ): T => {
        const startTime = performance.now();
        let result: T;
        let error: Error | undefined;

        try {
            result = operation();
            return result;
        } catch (err) {
            error = err as Error;
            throw err;
        } finally {
            const duration = Math.round(performance.now() - startTime);

            logger.logPerformance({
                operationName,
                duration,
                metadata: {
                    ...metadata,
                    success: !error,
                    error: error?.message,
                },
            });

            if (error) {
                logger.error(`Operation failed: ${operationName}`, {
                    error: error.message,
                    duration,
                    metadata,
                });
            }
        }
    }, [logger]);

    // Common performance measurements
    const measurePageLoad = useCallback(() => {
        if (typeof window !== 'undefined' && window.performance) {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            logger.logPerformance({
                operationName: 'page_load',
                duration: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                metadata: {
                    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
                    url: window.location.pathname,
                },
            });
        }
    }, [logger]);

    return {
        startTimer,
        endTimer,
        measureAsync,
        measureSync,
        measurePageLoad,
    };
}

// Hook for error tracking with context
export function useErrorTracking() {
    const { logError, logger } = useLogger();

    const trackError = useCallback((error: Error, context?: Record<string, any>) => {
        logError(error, context);
    }, [logError]);

    const trackAPIError = useCallback((error: any, endpoint: string, method: string = 'GET') => {
        logError(error, {
            type: 'api_error',
            endpoint,
            method,
            statusCode: error.status,
            responseData: error.response,
        });
    }, [logError]);

    const trackValidationError = useCallback((field: string, value: any, error: string) => {
        logger.warn('Validation error', {
            type: 'validation_error',
            field,
            value,
            error,
        }, 'validation');
    }, [logger]);

    const trackJavaScriptError = useCallback((error: ErrorEvent) => {
        logger.error('JavaScript error', {
            type: 'javascript_error',
            message: error.message,
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno,
            error: error.error?.stack,
        }, 'javascript');
    }, [logger]);

    const trackUnhandledPromiseRejection = useCallback((error: PromiseRejectionEvent) => {
        logger.error('Unhandled promise rejection', {
            type: 'unhandled_promise_rejection',
            reason: error.reason,
            promise: error.promise,
        }, 'javascript');
    }, [logger]);

    // Set up global error handlers
    const setupGlobalErrorHandlers = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('error', trackJavaScriptError);
            window.addEventListener('unhandledrejection', trackUnhandledPromiseRejection);

            return () => {
                window.removeEventListener('error', trackJavaScriptError);
                window.removeEventListener('unhandledrejection', trackUnhandledPromiseRejection);
            };
        }
    }, [trackJavaScriptError, trackUnhandledPromiseRejection]);

    return {
        trackError,
        trackAPIError,
        trackValidationError,
        trackJavaScriptError,
        trackUnhandledPromiseRejection,
        setupGlobalErrorHandlers,
    };
}

// Hook for A/B testing logging
export function useABTestingLogs() {
    const { logger } = useLogger();

    const logExperimentExposure = useCallback((
        experimentName: string,
        variant: string,
        context?: Record<string, any>
    ) => {
        logger.info('A/B test exposure', {
            type: 'ab_test_exposure',
            experimentName,
            variant,
            ...context,
        }, 'ab_testing');
    }, [logger]);

    const logExperimentConversion = useCallback((
        experimentName: string,
        variant: string,
        conversionType: string,
        value?: number,
        context?: Record<string, any>
    ) => {
        logger.info('A/B test conversion', {
            type: 'ab_test_conversion',
            experimentName,
            variant,
            conversionType,
            value,
            ...context,
        }, 'ab_testing');
    }, [logger]);

    return {
        logExperimentExposure,
        logExperimentConversion,
    };
}
