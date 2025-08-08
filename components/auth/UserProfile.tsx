'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getRoleDisplayName, getRoleDescription } from '@/lib/rbac.client'

export function UserProfile() {
  const { user, logout, isLoading } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  if (!user) {
    return null
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-medium text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
          <div className="flex items-center mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'ADMIN' 
                ? 'bg-red-100 text-red-800'
                : user.role === 'OPERATOR'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getRoleDisplayName(user.role)}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {user.id}
              </dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Permissions</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getRoleDescription(user.role)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => {/* TODO: Implement profile edit */}}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Profile
            </button>
            
            <button
              onClick={logout}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}