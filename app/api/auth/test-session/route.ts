import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'

/**
 * Test endpoint for session debugging
 * GET /api/auth/test-session
 * 
 * This endpoint is useful for:
 * - Debugging session issues
 * - Testing authentication in development
 * - Postman/API testing
 * - Verifying session data structure
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No active session found',
          authenticated: false,
          session: null
        },
        { status: 401 }
      )
    }

    // Return detailed session information for debugging
    return NextResponse.json({
      success: true,
      message: 'Session retrieved successfully',
      authenticated: true,
      session: {
        user: session.user,
        expires: session.expires,
      },
      debug: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      }
    })
  } catch (error) {
    console.error('Test session error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : 'Session test failed'
      },
      { status: 500 }
    )
  }
}