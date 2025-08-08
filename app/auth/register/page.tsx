'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleRegister = async (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Account created successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your NPCL account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-md">
              {success}
            </div>
          )}

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}