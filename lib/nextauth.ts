/**
 * NextAuth Configuration
 * Handles authentication setup with credentials provider, JWT sessions, and role-based access control for NPCL Dashboard.
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { serverEnv, isDevelopment, isProduction } from '@/config/env.server'
import { authConfig } from '@/config/auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  // Using JWT strategy instead of database sessions for better performance
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'Enter your email'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Enter your password'
        }
      },
      async authorize(credentials) {
        if (isDevelopment) {
          console.log('Authorization attempt for:', credentials?.email)
        }
        
        // Return null for missing credentials to prevent authentication
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
            }
          })

          if (!user) {
            return null
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password)
          
          if (!isValidPassword) {
            return null
          }
          
          // Log successful login for audit purposes
          prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'login',
              resource: 'auth',
              details: { method: 'credentials' },
              ipAddress: 'unknown',
              userAgent: 'unknown',
            }
          }).catch(error => {
            if (isDevelopment) {
              console.error('Audit log failed:', error)
            }
          })

          const returnUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
          
          if (isDevelopment) {
            console.log('User authenticated:', { id: returnUser.id, email: returnUser.email, role: returnUser.role })
          }
          return returnUser
        } catch (error: any) {
          if (isDevelopment) {
            console.error('Authentication error:', error)
          }
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: authConfig.session.maxAge,
    updateAge: authConfig.session.updateAge,
  },

  jwt: {
    maxAge: authConfig.session.maxAge,
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add user information to token during initial signin
      if (user) {
        if (isDevelopment) {
          console.log('Adding user to JWT token:', { id: user.id, role: user.role })
        }
        token.id = user.id
        token.role = user.role
      }

      // Handle session updates when user data changes
      if (trigger === 'update' && session) {
        if (isDevelopment) {
          console.log('Updating JWT token from session')
        }
        if (session.user) {
          token.name = session.user.name
          token.email = session.user.email
        }
      }

      return token
    },

    async session({ session, token }) {
      // Add token information to session for client access
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        
        if (isDevelopment) {
          console.log('Session created for user:', { 
            id: session.user.id, 
            email: session.user.email, 
            role: session.user.role 
          })
        }
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Allow signin if user was validated in authorize callback
      if (isDevelopment) {
        console.log('SignIn callback - user validated:', user?.email)
      }
      return true
    },

    async redirect({ url, baseUrl }) {
      if (isDevelopment) {
        console.log('Redirect callback:', { url, baseUrl })
      }
      
      // Handle relative URLs by converting to absolute
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`
        return redirectUrl
      }
      
      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Allow localhost URLs in development environment
      if (isDevelopment && url.includes('localhost')) {
        try {
          const urlObj = new URL(url)
          if (urlObj.hostname === 'localhost') {
            return url
          }
        } catch (e) {
          if (isDevelopment) {
            console.error('Invalid URL in redirect:', url, e)
          }
        }
      }
      
      // Default redirect to dashboard for security
      const defaultUrl = `${baseUrl}/dashboard`
      return defaultUrl
    }
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        if (isDevelopment) {
          console.log('User signing out:', token.id)
        }
        
        // Log logout event for audit trail
        prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: 'logout',
            resource: 'auth',
            details: { method: 'nextauth' },
            ipAddress: 'unknown',
            userAgent: 'unknown',
          }
        }).catch(error => {
          if (isDevelopment) {
            console.error('Logout audit log failed:', error)
          }
        })
      }
    },

    async signIn({ user, account, profile, isNewUser }) {
      if (isDevelopment) {
        console.log('Successful signin event:', { 
          userId: user.id, 
          email: user.email, 
          isNewUser 
        })
      }
    },

    async session({ session, token }) {
      if (isDevelopment) {
        console.log('Session event:', { 
          userId: session.user?.id, 
          email: session.user?.email 
        })
      }
    }
  },

  // Security configuration
  secret: serverEnv.NEXTAUTH_SECRET,
  useSecureCookies: isProduction,
  
  cookies: {
    sessionToken: {
      name: isProduction 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: authConfig.session.maxAge,
      }
    },
    callbackUrl: {
      name: isProduction 
        ? '__Secure-next-auth.callback-url' 
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      }
    },
    csrfToken: {
      name: isProduction 
        ? '__Host-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      }
    }
  },

  // Enable debug logging only in development
  debug: isDevelopment,
  
  // Custom logger for development debugging
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (isDevelopment) {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  },
}
