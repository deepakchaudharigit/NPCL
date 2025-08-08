import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { 
  getAuthenticatedUser, 
  hasRequiredRole, 
  logAuditEvent,
  createUnauthorizedResponse,
  createForbiddenResponse
} from '@/lib/auth-utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
    name: string
  }
}

/**
 * Get authenticated user using NextAuth.js session
 * This is the proper way to handle authentication with NextAuth.js
 */
export async function requireAuth() {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      return {
        user: null,
        response: NextResponse.json(
          createUnauthorizedResponse('Authentication required. Please sign in.'),
          { status: 401 }
        ),
      }
    }

    return { user, response: null }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: 'Authentication error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Require admin role for access
 */
export async function requireAdmin() {
  const authResult = await requireAuth()
  const { user, response } = authResult
  
  if (response) return { user: null, response }
  
  if (!hasRequiredRole(user!.role, UserRole.ADMIN)) {
    return {
      user: null,
      response: NextResponse.json(
        createForbiddenResponse('Admin access required'),
        { status: 403 }
      ),
    }
  }

  return { user, response: null }
}

/**
 * Require operator or admin role for access
 */
export async function requireOperatorOrAdmin() {
  const authResult = await requireAuth()
  const { user, response } = authResult
  
  if (response) return { user: null, response }
  
  if (!hasRequiredRole(user!.role, UserRole.OPERATOR)) {
    return {
      user: null,
      response: NextResponse.json(
        createForbiddenResponse('Operator or Admin access required'),
        { status: 403 }
      ),
    }
  }

  return { user, response: null }
}

/**
 * Require specific role for access
 */
export async function requireRole(requiredRole: UserRole) {
  const authResult = await requireAuth()
  const { user, response } = authResult
  
  if (response) return { user: null, response }
  
  if (!hasRequiredRole(user!.role, requiredRole)) {
    return {
      user: null,
      response: NextResponse.json(
        createForbiddenResponse(`${requiredRole} access required`),
        { status: 403 }
      ),
    }
  }

  return { user, response: null }
}

// Export the logAuditEvent function for convenience
export { logAuditEvent }