// ----------------------------
// Mocks (define inside jest.mock)
// ----------------------------
const mockPrismaUserFindUnique = jest.fn()
const mockPrismaUserCreate = jest.fn()
const mockHashPassword = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockPrismaUserFindUnique,
      create: mockPrismaUserCreate,
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  hashPassword: mockHashPassword,
}))

// ----------------------------
// Imports (after mocks)
// ----------------------------
import { POST } from '@/app/api/auth/register/route'
import { createMockUser } from '../../utils/test-factories'
import {
  createMockRequest,
  expectSuccessResponse,
  expectErrorResponse,
} from '../../utils/test-helpers.utils'

// ----------------------------
// Test Suite
// ----------------------------
describe('POST /api/auth/register', () => {
  const baseValidUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'VIEWER',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockHashPassword.mockResolvedValue('$2a$12$hashedpassword')
    mockPrismaUserFindUnique.mockResolvedValue(null)
  })

  it('registers a new user successfully', async () => {
    const newUser = createMockUser({ ...baseValidUser, id: 'user-1' })
    mockPrismaUserCreate.mockResolvedValue(newUser)

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: baseValidUser,
    })

    const res = await POST(req)
    const data = await expectSuccessResponse(res)

    expect(mockHashPassword).toHaveBeenCalledWith(baseValidUser.password)
    expect(mockPrismaUserCreate).toHaveBeenCalledWith({
      data: {
        name: baseValidUser.name,
        email: baseValidUser.email,
        password: '$2a$12$hashedpassword',
        role: 'VIEWER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    expect(data.data).toEqual(newUser)
    expect(data.message).toBe('User created successfully')
  })

  it('defaults role to VIEWER when not provided', async () => {
    const newUser = createMockUser()
    mockPrismaUserCreate.mockResolvedValue(newUser)

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      },
    })

    const res = await POST(req)
    await expectSuccessResponse(res)

    expect(mockPrismaUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'VIEWER' }),
      }),
    )
  })

  it('returns 409 if user already exists', async () => {
    mockPrismaUserFindUnique.mockResolvedValue(createMockUser())

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: baseValidUser,
    })

    const res = await POST(req)
    await expectErrorResponse(res, 409, 'User with this email already exists')

    expect(mockPrismaUserCreate).not.toHaveBeenCalled()
  })

  it('validates full invalid payload', async () => {
    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'J',
        email: 'invalid-email',
        password: '123',
      },
    })

    const res = await POST(req)
    const data = await expectErrorResponse(res, 400, 'Invalid input data')

    expect(Array.isArray(data.errors)).toBe(true)
    expect(mockPrismaUserFindUnique).not.toHaveBeenCalled()
    expect(mockPrismaUserCreate).not.toHaveBeenCalled()
  })

  it('validates individual field errors', async () => {
    const base = { ...baseValidUser }

    await expectErrorResponse(
      await POST(createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { ...base, name: 'J' },
      })),
      400,
      'Invalid input data',
    )

    await expectErrorResponse(
      await POST(createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { ...base, email: 'bad' },
      })),
      400,
      'Invalid input data',
    )

    await expectErrorResponse(
      await POST(createMockRequest('/api/auth/register', {
        method: 'POST',
        body: { ...base, password: '12' },
      })),
      400,
      'Invalid input data',
    )
  })

  it('handles missing required fields', async () => {
    const cases = [
      { name: 'John', password: 'password123' },
      { email: 'john@example.com', name: 'John' },
      { email: 'john@example.com', password: 'password123' },
    ]

    for (const body of cases) {
      const req = createMockRequest('/api/auth/register', {
        method: 'POST',
        body,
      })
      await expectErrorResponse(req && (await POST(req)), 400, 'Invalid input data')
    }
  })

  it('rejects invalid role', async () => {
    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: {
        ...baseValidUser,
        role: 'INVALID_ROLE',
      },
    })

    const res = await POST(req)
    await expectErrorResponse(res, 400, 'Invalid input data')
  })

  it('handles database lookup failure', async () => {
    mockPrismaUserFindUnique.mockRejectedValue(new Error('DB lookup failed'))

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: baseValidUser,
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.success).toBe(false)
  })

  it('handles password hashing errors', async () => {
    mockHashPassword.mockRejectedValue(new Error('Hashing error'))

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: baseValidUser,
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.success).toBe(false)
  })

  it('handles Prisma user creation errors', async () => {
    mockPrismaUserCreate.mockRejectedValue(new Error('User creation error'))

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: baseValidUser,
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.success).toBe(false)
  })

  it('handles malformed JSON input', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'invalid-json',
    })

    const res = await POST(req as any)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.success).toBe(false)
  })

  it('should trim whitespace from inputs (if implemented)', async () => {
    const userWithWhitespace = {
      name: '  John Doe  ',
      email: '  john@example.com  ',
      password: 'password123',
    }

    mockPrismaUserCreate.mockResolvedValue(createMockUser())

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: userWithWhitespace,
    })

    const res = await POST(req)
    await expectSuccessResponse(res)
  })

  it('should handle case-insensitive email match', async () => {
    mockPrismaUserFindUnique.mockResolvedValue(createMockUser({
      email: 'JOHN@EXAMPLE.COM',
    }))

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: {
        ...baseValidUser,
        email: 'john@example.com',
      },
    })

    const res = await POST(req)
    await expectErrorResponse(res, 409, 'User with this email already exists')
  })

  it('should not expose sensitive data in response', async () => {
    const newUser = createMockUser()
    mockPrismaUserCreate.mockResolvedValue(newUser)

    const req = createMockRequest('/api/auth/register', {
      method: 'POST',
      body: baseValidUser,
    })

    const res = await POST(req)
    const data = await expectSuccessResponse(res)

    expect(data.data).not.toHaveProperty('password')
    expect(data.data).not.toHaveProperty('resetToken')
    expect(data.data).not.toHaveProperty('resetTokenExpiry')
  })
})
