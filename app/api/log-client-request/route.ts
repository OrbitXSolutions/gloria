import { NextRequest, NextResponse } from 'next/server';
import { createSsrClient } from '@/lib/supabase/server';

interface ClientLogRequest {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    context?: Record<string, any>;
    source?: string;
}

export async function POST(request: NextRequest) {
    try {
        const logData: ClientLogRequest = await request.json();

        // Validate required fields
        if (!logData.level || !logData.message) {
            return NextResponse.json(
                { error: 'Missing required fields: level, message' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = await createSsrClient();

        // Get user ID if authenticated
        let userId: string | null = null;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id || null;
        } catch {
            // Continue without user ID
        }

        // Get client info from headers
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') ||
            'Unknown';

        // Log to Supabase
        await supabase.rpc('add_client_log', {
            p_action: `${logData.level}: ${logData.message}`,
            p_user_id: userId,
            p_details: logData.context || null,
            p_user_agent: userAgent,
            p_session_id: null, // Could be enhanced to track sessions
            p_component: logData.source || 'client',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to log client message:', error);
        return NextResponse.json(
            { error: 'Failed to log message' },
            { status: 500 }
        );
    }
}
