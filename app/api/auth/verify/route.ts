import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createUnauthorizedResponse } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

/**
 * Verify current session and return user information
 * GET /api/auth/verify
 * 
 * This endpoint uses NextAuth.js session to verify authentication.
 * No Authorization header needed - uses session cookies.
 * 
 * Returns: { success: boolean, user?: object, error?: string }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      return NextResponse.json(
        createUnauthorizedResponse('No active session found. Please sign in.'),
        { status: 401 }
      )
    }

    // Get additional user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            auditLogs: true,
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found in database',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Session is valid',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        auditLogCount: userData._count.auditLogs,
      },
      session: {
        valid: true,
        authMethod: 'nextauth-session'
      }
    })

  } catch (error) {
    console.error('Session verification error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint information
 * POST /api/auth/verify
 */
export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint only supports GET requests',
    availableEndpoints: {
      verify: 'GET /api/auth/verify - Verify current session',
      signin: 'Use NextAuth.js signin at /api/auth/signin',
      signout: 'Use NextAuth.js signout at /api/auth/signout'
    },
    note: 'This application uses NextAuth.js for authentication. Use the built-in endpoints for sign in/out.'
  }, { status: 405 })
}