/**
 * Role-Based Access Control (RBAC) System
 * Manages user permissions, role hierarchies, and access control for different features in NPCL Dashboard.
 */

import { UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { redirect } from 'next/navigation'

// Permission definitions with strict type checking
export const permissions: Record<string, UserRole[]> = {
  // User management
  'users.view': [UserRole.ADMIN],
  'users.create': [UserRole.ADMIN],
  'users.update': [UserRole.ADMIN],
  'users.delete': [UserRole.ADMIN],
  // Power units
  'power-units.view': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
  'power-units.create': [UserRole.ADMIN, UserRole.OPERATOR],
  'power-units.update': [UserRole.ADMIN, UserRole.OPERATOR],
  'power-units.delete': [UserRole.ADMIN],
  // Maintenance
  'maintenance.view': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
  'maintenance.create': [UserRole.ADMIN, UserRole.OPERATOR],
  'maintenance.update': [UserRole.ADMIN, UserRole.OPERATOR],
  'maintenance.delete': [UserRole.ADMIN, UserRole.OPERATOR],
  // Reports
  'reports.view': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
  'reports.create': [UserRole.ADMIN, UserRole.OPERATOR],
  'reports.delete': [UserRole.ADMIN],
  // System configuration
  'system.config': [UserRole.ADMIN],
  'system.audit': [UserRole.ADMIN],
  // Dashboard
  'dashboard.view': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
  'dashboard.admin': [UserRole.ADMIN],
}

// Type definitions for enhanced type safety
export type Permission = keyof typeof permissions

// Role hierarchy with numerical levels for comparison
export const roleHierarchy = {
  [UserRole.VIEWER]: 1,
  [UserRole.OPERATOR]: 2,
  [UserRole.ADMIN]: 3,
} as const

// Core permission checking functions
export function hasPermission(userRole: UserRole | null | undefined, permission: Permission | null | undefined): boolean {
  if (!userRole || !permission) return false
  if (!permissions[permission]) return false
  return permissions[permission].includes(userRole)
}

export function hasAnyPermission(userRole: UserRole | null | undefined, permissionList: Permission[]): boolean {
  if (!userRole || !Array.isArray(permissionList) || permissionList.length === 0) return false
  return permissionList.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole | null | undefined, permissionList: Permission[]): boolean {
  if (!userRole || !Array.isArray(permissionList) || permissionList.length === 0) return false
  return permissionList.every(permission => hasPermission(userRole, permission))
}

// Server-side authentication and authorization functions
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(): Promise<SessionUser | null> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect('/auth/login')
    }
    return user
  } catch (error) {
    console.error('Error in requireAuth:', error)
    redirect('/auth/login')
    return null
  }
}

export async function requirePermission(permission: Permission): Promise<SessionUser | null> {
  try {
    const user = await requireAuth()
    if (!user || !hasPermission(user.role, permission)) {
      redirect('/dashboard?error=insufficient-permissions')
    }
    return user
  } catch (error) {
    console.error('Error in requirePermission:', error)
    redirect('/dashboard?error=insufficient-permissions')
    return null
  }
}

// Role-based access control functions
export async function requireAdmin(): Promise<SessionUser | null> {
  return await requirePermission('users.view')
}

export async function requireOperatorOrAdmin(): Promise<SessionUser | null> {
  try {
    const user = await requireAuth()
    if (!user || !hasAnyPermission(user.role, ['power-units.create', 'maintenance.create'])) {
      redirect('/dashboard?error=insufficient-permissions')
    }
    return user
  } catch (error) {
    console.error('Error in requireOperatorOrAdmin:', error)
    redirect('/dashboard?error=insufficient-permissions')
    return null
  }
}

// Client-side permission checking utilities
export function checkUserPermission(userRole: UserRole | undefined | null, permission: Permission): boolean {
  return hasPermission(userRole, permission)
}

export function hasRoleLevel(userRole: UserRole | null | undefined, requiredRole: UserRole | null | undefined): boolean {
  if (!userRole || !requiredRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Role display and description utilities
export function getRoleDisplayName(role: UserRole | null | undefined): string {
  if (!role) return 'Unknown'
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator'
    case UserRole.OPERATOR:
      return 'Operator'
    case UserRole.VIEWER:
      return 'Viewer'
    default:
      return 'Unknown'
  }
}

export function getRoleDescription(role: UserRole | null | undefined): string {
  if (!role) return 'No description available'
  switch (role) {
    case UserRole.ADMIN:
      return 'Full system access including user management and system configuration'
    case UserRole.OPERATOR:
      return 'Can manage power units, maintenance, and generate reports'
    case UserRole.VIEWER:
      return 'Read-only access to dashboard and reports'
    default:
      return 'No description available'
  }
}

// User role management utilities
export function getAvailableRoles(currentUserRole: UserRole | null | undefined): UserRole[] {
  if (!currentUserRole) return []
  switch (currentUserRole) {
    case UserRole.ADMIN:
      return [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER]
    case UserRole.OPERATOR:
      return [UserRole.VIEWER]
    case UserRole.VIEWER:
    default:
      return []
  }
}

// System introspection and validation utilities
export function getAllPermissions(): Permission[] {
  return Object.keys(permissions) as Permission[]
}

export function getAllRoles(): UserRole[] {
  return Object.values(UserRole)
}

export function isValidPermission(permission: string): permission is Permission {
  return permission in permissions
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return getAllPermissions().filter(permission => hasPermission(role, permission))
}

// Development debugging utility for RBAC system
export function debugPermissions(): void {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log('RBAC Debug Info:')
    console.log('Permissions object:', permissions)
    console.log('Available permissions:', getAllPermissions())
    console.log('Role hierarchy:', roleHierarchy)
    console.log('Available roles:', getAllRoles())
  }
}