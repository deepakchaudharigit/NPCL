// ----------------------------
// Safe Mock Declarations
// ----------------------------
const mockPrismaUserFindMany = jest.fn()
const mockPrismaUserFindUnique = jest.fn()
const mockWithAdminAuth = jest.fn()
const mockLogAuditEvent = jest.fn()

// 👇 Safe error classes to use later
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// ----------------------------
// Mock Modules AFTER defining mocks
// ----------------------------
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: mockPrismaUserFindMany,
      findUnique: mockPrismaUserFindUnique,
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/nextauth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/auth-utils', () => ({
  withAdminAuth: mockWithAdminAuth,
  logAuditEvent: mockLogAuditEvent,
  AuthenticationError,
  DatabaseError,
}))

// ----------------------------
// Imports (after mocks)
// ----------------------------
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/auth/users/route'
import { UserRole } from '@prisma/client'
import { AuthenticationError as AuthError } from '@/lib/auth-utils'

// ----------------------------
// Test Suite
// ----------------------------
describe('/api/auth/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockWithAdminAuth.mockImplementation((handler: any) => {
      return async (req: any) => {
        const mockAdminUser = {
          id: 'admin-123',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          name: 'Admin User',
        }
        return handler(req, mockAdminUser)
      }
    })
  })

  describe('GET /api/auth/users', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [
        {
          id: 'user1',
          name: 'User 1',
          email: 'user1@example.com',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { auditLogs: 5, reports: 2 },
        },
        {
          id: 'user2',
          name: 'User 2',
          email: 'user2@example.com',
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { auditLogs: 1, reports: 0 },
        },
      ]

      mockPrismaUserFindMany.mockResolvedValue(mockUsers)

      const req = new NextRequest('http://localhost:3000/api/auth/users')
      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].email).toBe('user1@example.com')

      expect(mockPrismaUserFindMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              auditLogs: true,
              reports: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should deny access for non-admin users', async () => {
      // Simulate access control denial
      mockWithAdminAuth.mockImplementation(() => {
        throw new AuthError('Admin access required')
      })

      const req = new NextRequest('http://localhost:3000/api/auth/users')

      await expect(GET(req)).rejects.toThrow('Admin access required')
    })
  })
})
