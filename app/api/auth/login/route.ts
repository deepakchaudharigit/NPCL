/**
 * API Login Route
 * Handles direct API authentication for testing and external integrations with credential validation and audit logging.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Log login attempt for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Login attempt for:', email)
    }

    // Find user in database (same logic as NextAuth)
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
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Log successful API login for audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'api_login',
        resource: 'auth',
        details: { method: 'api', endpoint: '/api/auth/login' },
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      }
    }).catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Audit log failed:', error)
      }
    })

    // Return successful authentication response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Login error:', error)
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
