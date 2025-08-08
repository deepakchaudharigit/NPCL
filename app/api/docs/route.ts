import { NextResponse } from 'next/server'

/**
 * API Documentation Endpoint
 * Provides comprehensive API documentation and usage examples for NPCL Dashboard authentication and endpoints.
 */
export async function GET() {
  return NextResponse.json({
    title: 'NPCL Dashboard API Documentation',
    version: '1.0.0',
    description: 'JSON API for NPCL Power Management Dashboard',
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    
    authentication: {
      description: 'The API uses NextAuth.js for authentication with session-based auth',
      methods: {
        session: {
          description: 'NextAuth.js session-based authentication (recommended)',
          flow: [
            '1. POST /api/auth/signin/credentials with email/password',
            '2. Session cookie is set automatically by NextAuth.js',
            '3. Subsequent requests use session cookie for authentication',
            '4. Session expires based on configuration (default: 24 hours)'
          ],
          example: {
            signin: {
              url: '/api/auth/signin/credentials',
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'email=admin@npcl.com&password=admin123&csrfToken=<csrf-token>'
            },
            usage: {
              note: 'Session cookies are automatically included in requests'
            }
          }
        },
        webApp: {
          description: 'For web applications using next-auth/react',
          flow: [
            '1. Use signIn() function from next-auth/react',
            '2. Session is managed automatically',
            '3. Use useSession() hook to access session data'
          ]
        }
      },
      notes: [
        'This application uses NextAuth.js for secure authentication',
        'No manual JWT token management required',
        'CSRF protection is built-in',
        'Session cookies are HTTP-only and secure'
      ]
    },

    endpoints: {
      authentication: {
        'POST /api/auth/signin/credentials': {
          description: 'NextAuth.js credentials signin (built-in)',
          body: { email: 'string', password: 'string', csrfToken: 'string' },
          response: 'Redirects or returns session data',
          note: 'This is handled by NextAuth.js automatically'
        },
        'POST /api/auth/signout': {
          description: 'NextAuth.js signout (built-in)',
          response: 'Clears session and redirects',
          note: 'This is handled by NextAuth.js automatically'
        },
        'GET /api/auth/session': {
          description: 'Get current session (built-in)',
          response: { user: 'object', expires: 'string' },
          note: 'This is handled by NextAuth.js automatically'
        },
        'GET /api/auth/verify': {
          description: 'Verify current session and get user info',
          response: { success: true, user: 'object', session: 'object' }
        },
        'POST /api/auth/logout': {
          description: 'Log logout event (use NextAuth signout for actual logout)',
          response: { success: true, message: 'string', nextSteps: 'object' }
        },
        'POST /api/auth/test-login': {
          description: 'Test credentials without creating session',
          body: { email: 'string', password: 'string' },
          response: { success: true, user: 'object' }
        }
      },

      dashboard: {
        'GET /api/dashboard/stats': {
          description: 'Get dashboard statistics',
          auth: 'Required (any role)',
          response: {
            success: true,
            data: {
              totalPowerGeneration: 'number',
              totalCapacity: 'number',
              averageEfficiency: 'number',
              unitsOnline: 'number',
              unitsOffline: 'number',
              unitsInMaintenance: 'number',
              unitsWithErrors: 'number'
            }
          }
        },
        'GET /api/dashboard/power-units': {
          description: 'Get power units data',
          auth: 'Required (any role)',
          response: { success: true, data: 'array of power units' }
        }
      },

      health: {
        'GET /api/health': {
          description: 'Health check endpoint',
          auth: 'Not required',
          response: { status: 'healthy', database: 'connected', timestamp: 'iso-string' }
        }
      }
    },

    examples: {
      'Web Application Login': {
        description: 'Using next-auth/react in a React component',
        code: `
import { signIn, signOut, useSession } from 'next-auth/react'

function LoginComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  
  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  
  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn('credentials')}>Sign in</button>
    </>
  )
}
        `
      },
      'API Access with Session': {
        step1: {
          description: 'Sign in through NextAuth.js',
          request: {
            method: 'POST',
            url: '/api/auth/signin/credentials',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'email=admin@npcl.com&password=admin123&csrfToken=<csrf-token>'
          },
          note: 'Session cookie is set automatically'
        },
        step2: {
          description: 'Access protected endpoints (session cookie included automatically)',
          request: {
            method: 'GET',
            url: '/api/dashboard/stats',
            note: 'No Authorization header needed - session cookie is used'
          },
          response: {
            success: true,
            data: { totalPowerGeneration: 1250.5, totalCapacity: 2000, averageEfficiency: 85.2 }
          }
        }
      },
      'Verify Current Session': {
        description: 'Check if user is authenticated',
        request: {
          method: 'GET',
          url: '/api/auth/verify'
        },
        response: {
          success: true,
          user: { id: '1', name: 'Admin User', email: 'admin@npcl.com', role: 'ADMIN' },
          session: { valid: true, authMethod: 'nextauth-session' }
        }
      }
    },

    errorCodes: {
      400: 'Bad Request - Invalid input data',
      401: 'Unauthorized - Authentication required or invalid session',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      500: 'Internal Server Error - Server error occurred'
    },

    testAccounts: {
      admin: { email: 'admin@npcl.com', password: 'admin123', role: 'ADMIN' },
      operator: { email: 'operator@npcl.com', password: 'operator123', role: 'OPERATOR' },
      viewer: { email: 'viewer@npcl.com', password: 'viewer123', role: 'VIEWER' }
    },

    notes: [
      'This API uses NextAuth.js for secure session-based authentication',
      'No manual JWT token management required',
      'Session cookies are HTTP-only and secure',
      'CSRF protection is built-in with NextAuth.js',
      'All authenticated actions are logged for audit purposes',
      'Use HTTPS in production environments',
      'Rate limiting may apply in production'
    ],

    migration: {
      fromJWT: {
        description: 'If migrating from JWT-based auth to NextAuth.js',
        changes: [
          'Replace /api/auth/login with NextAuth.js signin',
          'Remove Authorization headers - use session cookies',
          'Use NextAuth.js built-in endpoints',
          'Update client code to use next-auth/react'
        ]
      }
    },

    tools: {
      nextAuthEndpoints: {
        description: 'Built-in NextAuth.js endpoints',
        endpoints: {
          signin: '/api/auth/signin',
          signout: '/api/auth/signout',
          session: '/api/auth/session',
          csrf: '/api/auth/csrf',
          providers: '/api/auth/providers'
        }
      },
      curl: {
        description: 'Example curl commands (note: session management is complex with curl)',
        verify: 'curl -X GET http://localhost:3000/api/auth/verify --cookie-jar cookies.txt --cookie cookies.txt',
        stats: 'curl -X GET http://localhost:3000/api/dashboard/stats --cookie-jar cookies.txt --cookie cookies.txt',
        note: 'For API testing, consider using a web browser or tools that handle cookies automatically'
      }
    }
  })
}