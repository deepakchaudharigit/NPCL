/**
 * Middleware Configuration
 * Handles route protection, authentication checks, and role-based access control for the NPCL Dashboard application.
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Define routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/error',
      '/api/auth',
    ]

    // Check if current route is publicly accessible
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route) || pathname === route
    )

    // Allow access to public routes without authentication
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Redirect unauthenticated users to login page
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Apply role-based access control for authenticated users
    const userRole = token.role as UserRole

    // Routes restricted to administrators only
    const adminRoutes = [
      '/admin',
      '/api/admin',
      '/api/auth/users',
      '/dashboard/users',
      '/dashboard/system-config',
    ]

    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url))
    }

    // Routes accessible to operators and administrators
    const operatorRoutes = [
      '/dashboard/power-units/create',
      '/dashboard/power-units/edit',
      '/dashboard/maintenance',
      '/api/dashboard/power-units',
      '/api/dashboard/maintenance',
    ]

    const isOperatorRoute = operatorRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isOperatorRoute && userRole === UserRole.VIEWER) {
      return NextResponse.redirect(new URL('/dashboard?error=insufficient-permissions', req.url))
    }

    // Add user context to API route headers for authentication
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      // Inject user information into request headers for API routes
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', token.id)
      requestHeaders.set('x-user-role', userRole)
      requestHeaders.set('x-user-email', token.email || '')

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Define publicly accessible routes
        const publicRoutes = [
          '/',
          '/auth/login',
          '/auth/register',
          '/auth/error',
          '/api/auth',
        ]

        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route) || pathname === route
        )

        if (isPublicRoute) {
          return true
        }

        // Require valid token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Match all request paths except static files and assets
    // Excludes: _next/static, _next/image, favicon.ico, and public folder
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}