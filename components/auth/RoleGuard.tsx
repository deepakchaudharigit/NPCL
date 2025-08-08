'use client'

import { ReactNode } from 'react'
import { UserRole } from '@prisma/client'
import { useAuth } from '@/hooks/use-auth'
import { Permission } from '@/lib/rbac'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requiredPermission?: Permission
  fallback?: ReactNode
  requireAll?: boolean // If true, user must have ALL specified roles/permissions
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { user, hasRole, hasAnyRole, hasPermission, isAuthenticated } = useAuth()

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = requireAll
      ? allowedRoles.every(role => hasRole(role))
      : hasAnyRole(allowedRoles)

    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function OperatorOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.OPERATOR, UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Higher-order component for role-based rendering
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  fallback?: ReactNode
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}