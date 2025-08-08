/**
 * Tests for NextAuth Configuration and Callbacks
 */

// --- Mocks (safe order) ---

const mockPrismaUserFindUnique = jest.fn();
const mockVerifyPassword = jest.fn();


jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockPrismaUserFindUnique,
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyPassword: mockVerifyPassword,
}))

// Optional mock for next-auth if needed for other imports
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}))

// --- Imports ---
import { authOptions } from '@/lib/nextauth'
import { UserRole } from '@prisma/client'
import { verifyPassword } from '@/lib/auth'

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should have correct providers configured', () => {
    expect(authOptions.providers).toHaveLength(1)
    expect(authOptions.providers[0].name.toLowerCase()).toBe('credentials')
  })

  it('should use JWT strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('should have correct pages configured', () => {
    expect(authOptions.pages?.signIn).toBe('/auth/login')
    expect(authOptions.pages?.signOut).toBe('/auth/logout')
    expect(authOptions.pages?.error).toBe('/auth/error')
  })

  it('should have callbacks configured', () => {
    expect(authOptions.callbacks?.jwt).toBeDefined()
    expect(authOptions.callbacks?.session).toBeDefined()
    expect(authOptions.callbacks?.signIn).toBeDefined()
    expect(authOptions.callbacks?.redirect).toBeDefined()
  })

  // ---- Credentials Provider Tests ----
  describe('Credentials Provider', () => {
    it('should authorize valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: UserRole.ADMIN,
        name: 'Test User',
      }

      mockPrismaUserFindUnique.mockResolvedValue(mockUser)
      mockVerifyPassword.mockResolvedValue(true)

      const credentialsProvider = authOptions.providers[0] as any
      const authorizeFunction = credentialsProvider.authorize

      const result = await authorizeFunction(
        { email: 'test@example.com', password: 'password123' },
        {}
      )

      expect(result).toEqual({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.ADMIN,
      })
    })

    it('should reject if user not found', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(null)

      const credentialsProvider = authOptions.providers[0] as any
      const authorizeFunction = credentialsProvider.authorize

      const result = await authorizeFunction(
        { email: 'no-user@example.com', password: 'wrongpass' },
        {}
      )

      expect(result).toBeNull()
    })

    it('should reject if password is invalid', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: UserRole.ADMIN,
        name: 'Test User',
      }

      mockPrismaUserFindUnique.mockResolvedValue(mockUser)
      mockVerifyPassword.mockResolvedValue(false)

      const credentialsProvider = authOptions.providers[0] as any
      const authorizeFunction = credentialsProvider.authorize

      const result = await authorizeFunction(
        { email: 'test@example.com', password: 'wrongpass' },
        {}
      )

      expect(result).toBeNull()
    })

    it('should reject missing credentials', async () => {
      const credentialsProvider = authOptions.providers[0] as any
      const authorizeFunction = credentialsProvider.authorize

      const result = await authorizeFunction(
        { email: '', password: '' },
        {}
      )

      expect(result).toBeNull()
    })
  })

  // ---- JWT Callback Tests ----
  describe('JWT Callback', () => {
    it('should add user data to token on sign in', async () => {
      const jwtCallback = authOptions.callbacks?.jwt as any

      const token = {}
      const user = { id: 'user123', role: UserRole.ADMIN }

      const result = await jwtCallback({ token, user })

      expect(result.id).toBe('user123')
      expect(result.role).toBe(UserRole.ADMIN)
    })

    it('should update token from session on update trigger', async () => {
      const jwtCallback = authOptions.callbacks?.jwt as any

      const token = { id: 'user123', role: UserRole.ADMIN }
      const session = {
        user: {
          name: 'Updated User',
          email: 'updated@example.com',
        },
      }

      const result = await jwtCallback({
        token,
        trigger: 'update',
        session,
      })

      expect(result.name).toBe('Updated User')
      expect(result.email).toBe('updated@example.com')
    })
  })

  // ---- Session Callback Tests ----
  describe('Session Callback', () => {
    it('should populate session.user with token data', async () => {
      const sessionCallback = authOptions.callbacks?.session as any

      const session = { user: {} }
      const token = { id: 'user123', role: UserRole.ADMIN }

      const result = await sessionCallback({ session, token })

      expect(result.user.id).toBe('user123')
      expect(result.user.role).toBe(UserRole.ADMIN)
    })
  })

  // ---- SignIn Callback ----
  describe('SignIn Callback', () => {
    it('should allow valid users to sign in', async () => {
      const signInCallback = authOptions.callbacks?.signIn as any

      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: UserRole.ADMIN,
      }

      const result = await signInCallback({ user, account: {}, profile: {} })

      expect(result).toBe(true)
    })
  })

  // ---- Redirect Callback ----
  describe('Redirect Callback', () => {
    const redirectCallback = authOptions.callbacks?.redirect as any

    it('should return full URL for relative path', async () => {
      const result = await redirectCallback({
        url: '/dashboard',
        baseUrl: 'http://localhost:3000',
      })

      expect(result).toBe('http://localhost:3000/dashboard')
    })

    it('should return same-origin URL as is', async () => {
      const result = await redirectCallback({
        url: 'http://localhost:3000/profile',
        baseUrl: 'http://localhost:3000',
      })

      expect(result).toBe('http://localhost:3000/profile')
    })

    it('should fallback to dashboard on external URL', async () => {
      const result = await redirectCallback({
        url: 'https://phishing-site.com',
        baseUrl: 'http://localhost:3000',
      })

      expect(result).toBe('http://localhost:3000/dashboard')
    })
  })
})
