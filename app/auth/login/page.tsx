'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { login, isLoading } = useAuth()

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams.get('error')

  useEffect(() => {
    // Redirect if already authenticated
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }

    // Handle error from URL params
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password')
          break
        case 'AccessDenied':
          setError('Access denied')
          break
        case 'Configuration':
          setError('Server configuration error')
          break
        default:
          setError('An error occurred during sign in')
      }
    }
  }, [status, router, callbackUrl, errorParam])

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('')

    try {
      const result = await login(data)
      
      if (!result.success) {
        setError(result.error || 'Login failed')
      }
      // Success is handled by the login function (redirect to dashboard)
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to NPCL Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Back to home
            </Link>
          </div>

          {/* Development helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 mb-2">Development Test Accounts:</p>
              <div className="text-xs space-y-1">
                <div>Admin: admin@npcl.com / admin123</div>
                <div>Operator: operator@npcl.com / operator123</div>
                <div>Viewer: viewer@npcl.com / viewer123</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}