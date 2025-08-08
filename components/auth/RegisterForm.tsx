'use client'

import { useState } from 'react'

interface RegisterFormProps {
  onSubmit: (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) => void
  isLoading: boolean
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="label">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="input mt-1"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input mt-1"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="input mt-1"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="input mt-1"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  )
}