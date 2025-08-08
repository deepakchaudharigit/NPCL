'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Default':
        return 'An error occurred during authentication.'
      case 'CredentialsSignin':
        return 'Invalid credentials. Please check your email and password.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Server Configuration Error'
      case 'AccessDenied':
        return 'Access Denied'
      case 'Verification':
        return 'Verification Failed'
      case 'CredentialsSignin':
        return 'Sign In Failed'
      case 'SessionRequired':
        return 'Authentication Required'
      default:
        return 'Authentication Error'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getErrorTitle(error)}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="space-y-4">
            <div className="text-center">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Back to home
              </Link>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 mb-1">Debug Info:</p>
              <p className="text-xs text-gray-800 font-mono">Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}