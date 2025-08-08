import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'

/**
 * Test endpoint for login debugging and user JWT information
 * GET /api/auth/test-login
 * 
 * This endpoint is useful for:
 * - Testing authentication flow
 * - Debugging login issues
 * - Getting current user JWT information
 * - Postman/API testing
 * - Development and testing environments
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated - please login first',
          authenticated: false,
          loginUrl: '/api/auth/signin',
          instructions: 'Use NextAuth.js signin flow: POST /api/auth/signin/credentials'
        },
        { status: 401 }
      )
    }

    // Get additional user information from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found in database',
          sessionUser: session.user
        },
        { status: 404 }
      )
    }

    // Return comprehensive user and session information
    return NextResponse.json({
      success: true,
      message: 'User authenticated successfully',
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        auditLogCount: user._count.auditLogs,
      },
      session: {
        expires: session.expires,
        user: session.user,
      },
      debug: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        sessionStrategy: 'jwt',
        provider: 'credentials',
      },
      nextAuthInfo: {
        signInUrl: '/api/auth/signin',
        signOutUrl: '/api/auth/signout',
        sessionUrl: '/api/auth/session',
        csrfUrl: '/api/auth/csrf',
      }
    })
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : 'Login test failed'
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for testing login credentials
 * POST /api/auth/test-login
 * 
 * Body: { email: string, password: string }
 * 
 * This endpoint tests credentials without creating a session
 * Useful for debugging authentication issues
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required',
          example: { email: 'user@example.com', password: 'password123' }
        },
        { status: 400 }
      )
    }

    // Import auth utilities
    const { verifyPassword } = await import('@/lib/auth')

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          email: email.toLowerCase()
        },
        { status: 404 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid password',
          email: user.email
        },
        { status: 401 }
      )
    }

    // Return success without creating session
    return NextResponse.json({
      success: true,
      message: 'Credentials are valid',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      note: 'This endpoint only validates credentials. Use NextAuth signin for actual login.',
      nextSteps: {
        signIn: 'POST /api/auth/signin/credentials',
        session: 'GET /api/auth/session',
      }
    })
  } catch (error) {
    console.error('Test login POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : 'Credential test failed'
      },
      { status: 500 }
    )
  }
}