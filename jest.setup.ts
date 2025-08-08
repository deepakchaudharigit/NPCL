import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Set up test environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-purposes-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Polyfill for Web APIs
Object.assign(global, {
  TextEncoder,
  TextDecoder,
})

// Mock Web APIs for Next.js server components
class MockRequest {
  constructor(input, init = {}) {
    this.url = input
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
  
  async text() {
    return this.body || ''
  }
}

class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  
  static json(data, init = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init.headers,
      },
    })
  }
  
  async json() {
    return JSON.parse(this.body)
  }
  
  async text() {
    return this.body
  }
}

class MockHeaders {
  constructor(init = {}) {
    this.map = new Map(Object.entries(init))
  }
  
  get(name) {
    return this.map.get(name.toLowerCase())
  }
  
  set(name, value) {
    this.map.set(name.toLowerCase(), value)
  }
  
  has(name) {
    return this.map.has(name.toLowerCase())
  }
  
  delete(name) {
    this.map.delete(name.toLowerCase())
  }
  
  entries() {
    return this.map.entries()
  }
}

// Set global Web API mocks
global.Request = MockRequest
global.Response = MockResponse
global.Headers = MockHeaders

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
  redirect: jest.fn(),
}))

// Mock Next.js server
jest.mock('next/server', () => ({
  NextRequest: MockRequest,
  NextResponse: MockResponse,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock jose package to avoid ESM issues
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'VIEWER',
    },
  }),
  createSecretKey: jest.fn(),
  EncryptJWT: jest.fn(),
  jwtDecrypt: jest.fn(),
}))

// Mock NextAuth to avoid ESM issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}))

// Mock Prisma to avoid server-side issues
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    powerUnit: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    powerReading: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    maintenanceRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    report: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  },
  serverPrisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    powerUnit: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    powerReading: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    maintenanceRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    report: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks()
})