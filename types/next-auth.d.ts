import { UserRole } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: UserRole
  }
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
}

export interface SessionData {
  user: AuthUser
  expires: string
}