'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/utils/logger';
import { useSupabase } from '@/components/_core/providers/SupabaseProvider';

interface LoggerContextType {
    logger: typeof logger;
    logUserAction: (action: string, data?: Record<string, any>) => Promise<void>;
    logPageView: (page: string, metadata?: Record<string, any>) => Promise<void>;
    logError: (error: Error, context?: Record<string, any>) => Promise<void>;
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

export function LoggerProvider({ children }: { children: ReactNode }) {
    const { user } = useSupabase();

    // Update logger with user info when auth state changes
    useEffect(() => {
        logger.setUserId(user?.id || null);
    }, [user]);

    // Log page views automatically
    useEffect(() => {
        const logPageView = () => {
            if (typeof window !== 'undefined') {
                logger.info('Page viewed', {
                    page: window.location.pathname,
                    referrer: document.referrer,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                }, 'page_view');
            }
        };

        // Log initial page view
        logPageView();

        // Log navigation changes (for SPAs)
        const handleRouteChange = () => {
            setTimeout(logPageView, 100); // Small delay to ensure URL has updated
        };

        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', handleRouteChange);

        // Listen for pushState/replaceState (programmatic navigation)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(history, args);
            handleRouteChange();
        };

        history.replaceState = function (...args) {
            originalReplaceState.apply(history, args);
            handleRouteChange();
        };

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
        };
    }, []);

    const logUserAction = async (action: string, data?: Record<string, any>) => {
        await logger.info(`User action: ${action}`, {
            action,
            ...data,
            timestamp: new Date().toISOString(),
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }, 'user_action');
    };

    const logPageView = async (page: string, metadata?: Record<string, any>) => {
        await logger.info('Page view', {
            page,
            ...metadata,
            timestamp: new Date().toISOString(),
        }, 'page_view');
    };

    const logError = async (error: Error, context?: Record<string, any>) => {
        await logger.error(error.message, {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            ...context,
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
            timestamp: new Date().toISOString(),
        }, 'error');
    };

    const contextValue: LoggerContextType = {
        logger,
        logUserAction,
        logPageView,
        logError,
    };

    return (
        <LoggerContext.Provider value={contextValue}>
            {children}
        </LoggerContext.Provider>
    );
}

export function useLogger(): LoggerContextType {
    const context = useContext(LoggerContext);
    if (context === undefined) {
        throw new Error('useLogger must be used within a LoggerProvider');
    }
    return context;
}

// Error boundary component with logging
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class LoggedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to our logging system
        logger.error('React Error Boundary caught error', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            errorInfo: {
                componentStack: errorInfo.componentStack,
            },
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
            timestamp: new Date().toISOString(),
        }, 'react_error');
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We've logged the error and will look into it.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
