import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  name: string
}

/* -------------------------------------------------------------------------- */
/*                         Custom Error Classes                               */
/* -------------------------------------------------------------------------- */

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/* -------------------------------------------------------------------------- */
/*                         Authenticated User Fetchers                        */
/* -------------------------------------------------------------------------- */

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, name: true },
    })

    return user
  } catch (error: any) {
    console.error('Authentication error:', error)
    if (isDatabaseError(error)) throw new DatabaseError('Database connection failed')
    return null
  }
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new AuthenticationError('Authentication required')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, name: true },
    })

    if (!user) throw new AuthenticationError('User not found')
    return user
  } catch (error: any) {
    console.error('requireAuthenticatedUser error:', error)

    if (error instanceof AuthenticationError || error instanceof DatabaseError) throw error
    if (isDatabaseError(error)) throw new DatabaseError('Database connection failed')

    throw new AuthenticationError('Authentication failed')
  }
}

/* -------------------------------------------------------------------------- */
/*                             Error Type Checker                             */
/* -------------------------------------------------------------------------- */

function isDatabaseError(error: any): boolean {
  const dbCodes = [
    'P1001', 'P1002', 'P1003', 'P1008', 'P1009', 'P1010', 'P1011', 'P1012',
    'P1013', 'P1014', 'P1015', 'P1016', 'P1017', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT',
  ]

  return (
    dbCodes.includes(error?.code) ||
    error?.message?.includes('Database connection failed') ||
    error?.message?.includes('Connection terminated') ||
    error?.message?.includes('connect ECONNREFUSED') ||
    error?.message?.includes('timeout')
  )
}

/* -------------------------------------------------------------------------- */
/*                        Role-Based Access Utilities                         */
/* -------------------------------------------------------------------------- */

export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    OPERATOR: 2,
    ADMIN: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/* -------------------------------------------------------------------------- */
/*                         Audit Logging (non-blocking)                       */
/* -------------------------------------------------------------------------- */

export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  details?: any,
  req?: NextRequest,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req?.ip || req?.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req?.headers.get('user-agent') || 'unknown',
      },
    })
  } catch (error) {
    console.error('Audit log failed:', error)
    if (isDatabaseError(error)) throw new DatabaseError('Audit logging failed - database unavailable')
  }
}

/* -------------------------------------------------------------------------- */
/*                          Standard Error Responses                          */
/* -------------------------------------------------------------------------- */

export function createUnauthorizedResponse(message = 'Authentication required') {
  return {
    success: false,
    error: message,
    code: 'UNAUTHORIZED',
    status: 401,
  }
}

export function createForbiddenResponse(message = 'Insufficient permissions') {
  return {
    success: false,
    error: message,
    code: 'FORBIDDEN',
    status: 403,
  }
}

export function createServerErrorResponse(message = 'Internal server error') {
  return {
    success: false,
    error: message,
    code: 'INTERNAL_ERROR',
    status: 500,
  }
}

/* -------------------------------------------------------------------------- */
/*                 Higher-Order Middleware for Route Protection               */
/* -------------------------------------------------------------------------- */

export function withAuth<T extends any[]>(
  handler: (req: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T) => {
    try {
      const user = await requireAuthenticatedUser()
      return await handler(req, user, ...args)
    } catch (error) {
      const { response, status } = handleAuthError(error)
      return NextResponse.json(response, { status })
    }
  }
}

export function withAdminAuth<T extends any[]>(
  handler: (req: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T) => {
    try {
      const user = await requireAuthenticatedUser()

      if (!hasRequiredRole(user.role, UserRole.ADMIN)) {
        return NextResponse.json(createUnauthorizedResponse('Admin access required'), { status: 401 })
      }

      return await handler(req, user, ...args)
    } catch (error) {
      const { response, status } = handleAuthError(error)
      return NextResponse.json(response, { status })
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                      General Auth Error Catch Utility                      */
/* -------------------------------------------------------------------------- */

export function handleAuthError(error: unknown) {
  if (error instanceof DatabaseError) {
    return { response: createServerErrorResponse(error.message), status: 500 }
  }

  if (error instanceof AuthenticationError) {
    return { response: createUnauthorizedResponse(error.message), status: 401 }
  }

  return {
    response: createServerErrorResponse('An unexpected error occurred'),
    status: 500,
  }
}
