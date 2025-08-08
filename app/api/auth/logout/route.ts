/**
 * Logout API Route
 * Provides logout guidance and logs logout events for audit purposes without invalidating NextAuth sessions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, logAuditEvent, createUnauthorizedResponse } from '@/lib/auth-utils'

// GET endpoint provides logout guidance and instructions
export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: '/api/auth/logout',
    message: 'This endpoint provides logout guidance. Use NextAuth.js for actual signout.',
    instructions: {
      browser: 'Use signOut() from next-auth/react',
      apiClient: 'POST to /api/auth/signout with a valid CSRF token',
      redirectLogout: '/api/auth/signout'
    },
    notes: [
      'Session and cookie cleanup is handled automatically by NextAuth.js.',
      'This endpoint does not terminate the session.',
      'Use POST to this endpoint to log logout intent before signout.'
    ]
  })
}

// POST endpoint logs logout intent for audit trail
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json(createUnauthorizedResponse('No active session found'), {
        status: 401,
      })
    }

    // Log logout intent for audit purposes
    await logAuditEvent(
      user.id,
      'logout_initiated',
      'auth',
      {
        source: 'API',
        endpoint: '/api/auth/logout',
        userAgent: req.headers.get('user-agent') || 'unknown',
        note: 'Logout intent logged. Use /api/auth/signout to complete logout.',
      },
      req
    )

    return NextResponse.json({
      success: true,
      message: 'Logout event logged successfully',
      nextSteps: {
        frontend: 'Call signOut() from next-auth/react',
        api: 'POST to /api/auth/signout with CSRF token',
        directRedirect: '/api/auth/signout',
      }
    })
  } catch (error) {
    console.error('Logout logging failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
