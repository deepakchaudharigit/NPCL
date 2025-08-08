/**
 * Client-Side Role-Based Access Control Utilities
 * Safe to use in client components and browser code
 * Does not import server-side dependencies
 */

// import { UserRole } from '@/types'
import { UserRoleEnum } from '@/lib/constants/roles'

import { use } from 'react'

console.log("Testing username in lib-rbac.client", UserRoleEnum.ADMIN);

// Permission definitions (same as server-side)
export const permissions = {
  // User management
  'users.view': [UserRoleEnum.ADMIN],
  'users.create': [UserRoleEnum.ADMIN],
  'users.update': [UserRoleEnum.ADMIN],
  'users.delete': [UserRoleEnum.ADMIN],

  // Power units
  'power-units.view': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR, UserRoleEnum.VIEWER],
  'power-units.create': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR],
  'power-units.update': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR],
  'power-units.delete': [UserRoleEnum.ADMIN],

  // Maintenance
  'maintenance.view': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR, UserRoleEnum.VIEWER],
  'maintenance.create': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR],
  'maintenance.update': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR],
  'maintenance.delete': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR],

  // Reports
  'reports.view': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR, UserRoleEnum.VIEWER],
  'reports.create': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR],
  'reports.delete': [UserRoleEnum.ADMIN],

  // System configuration
  'system.config': [UserRoleEnum.ADMIN],
  'system.audit': [UserRoleEnum.ADMIN],

  // Dashboard
  'dashboard.view': [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR, UserRoleEnum.VIEWER],
  'dashboard.admin': [UserRoleEnum.ADMIN],
} as const

export type Permission = keyof typeof permissions

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(UserRoleEnum: UserRoleEnum, permission: Permission): boolean {
  // Handle invalid permissions gracefully
  if (!permissions[permission]) {
    return false
  }
  return permissions[permission].includes(UserRoleEnum)
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(UserRoleEnum: UserRoleEnum, permissionList: Permission[]): boolean {
  return permissionList.some(permission => hasPermission(UserRoleEnum, permission))
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(UserRoleEnum: UserRoleEnum, permissionList: Permission[]): boolean {
  return permissionList.every(permission => hasPermission(UserRoleEnum, permission))
}

/**
 * Client-side hook for checking permissions (to be used with useSession)
 */
export function checkUserPermission(UserRoleEnum: UserRoleEnum | undefined, permission: Permission): boolean {
  if (!UserRoleEnum) return false
  return hasPermission(UserRoleEnum, permission)
}

/**
 * Role hierarchy helper
 */
export const roleHierarchy = {
  [UserRoleEnum.VIEWER]: 1,
  [UserRoleEnum.OPERATOR]: 2,
  [UserRoleEnum.ADMIN]: 3,
}

/**
 * Check if a role has higher or equal level than another role
 */
export function hasRoleLevel(UserRoleEnum: UserRoleEnum, requiredRole: UserRoleEnum): boolean {
  return roleHierarchy[UserRoleEnum] >= roleHierarchy[requiredRole]
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRoleEnum): string {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'Administrator'
    case UserRoleEnum.OPERATOR:
      return 'Operator'
    case UserRoleEnum.VIEWER:
      return 'Viewer'
    default:
      return 'Unknown'
  }
}

/**
 * Get user role description
 */
export function getRoleDescription(role: UserRoleEnum): string {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'Full system access including user management and system configuration'
    case UserRoleEnum.OPERATOR:
      return 'Can manage power units, maintenance, and generate reports'
    case UserRoleEnum.VIEWER:
      return 'Read-only access to dashboard and reports'
    default:
      return 'No description available'
  }
}

/**
 * Get available roles for user creation (based on current user role)
 */
export function getAvailableRoles(currentUserRoleEnum: UserRoleEnum): UserRoleEnum[] {
  switch (currentUserRoleEnum) {
    case UserRoleEnum.ADMIN:
      return [UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR, UserRoleEnum.VIEWER]
    case UserRoleEnum.OPERATOR:
      return [UserRoleEnum.VIEWER] // Operators can only create viewers
    default:
      return [] // Viewers cannot create users
  }
}