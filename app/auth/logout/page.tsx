'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function LogoutPage() {
  const { logout, isLoading } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Signing out...</p>
      </div>
    </div>
  )
}