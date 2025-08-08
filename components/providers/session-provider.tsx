/**
 * Session Provider Component
 * Wraps NextAuth session provider with custom configuration for automatic session refresh in NPCL Dashboard.
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import type { Session } from 'next-auth'

interface SessionProviderProps {
  children: ReactNode
  session?: Session | null
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </NextAuthSessionProvider>
  )
}

export default SessionProvider