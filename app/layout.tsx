/**
 * Root Layout Component
 * Main layout wrapper that provides session context and global styling for the entire NPCL Dashboard application.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NPCL Dashboard',
  description: 'Power Management Dashboard for NPCL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}