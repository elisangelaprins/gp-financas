export function logError( context: string, error: unknown): void {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}]:`, error);
    };
    // Sentry.captureException(error);
};