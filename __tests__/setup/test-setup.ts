/**
 * Comprehensive test setup utilities
 * This file provides a centralized setup for all test scenarios
 */

import { UserRole } from '@prisma/client';
import { setupApiTestEnvironment, testUsers } from './test-database';

/**
 * Setup test environment with proper mocking
 * This should be called at the beginning of each test file
 */
export function setupTestEnvironment() {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.NEXTAUTH_SECRET = 'test-secret-key';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';

  // Setup API test environment
  const apiEnv = setupApiTestEnvironment();

  return apiEnv;
}

/**
 * Mock NextAuth with proper session handling
 */
export function mockNextAuth() {
  const mockGetServerSession = jest.fn();

  // Default to admin session
  mockGetServerSession.mockResolvedValue({
    user: testUsers.admin,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  return { mockGetServerSession };
}

/**
 * Mock Prisma with comprehensive database operations
 */
export function mockPrisma() {
  const mockPrismaUserFindUnique = jest.fn();
  const mockPrismaUserFindMany = jest.fn();
  const mockPrismaUserCreate = jest.fn();
  const mockPrismaUserUpdate = jest.fn();
  const mockPrismaUserDelete = jest.fn();
  const mockPrismaAuditLogCreate = jest.fn();

  // Set up default successful responses
  mockPrismaUserFindMany.mockResolvedValue(Object.values(testUsers));
  mockPrismaUserFindUnique.mockImplementation(({ where }) => {
    if (where.email) {
      return Promise.resolve(
        Object.values(testUsers).find(user => user.email === where.email) || null
      );
    }
    if (where.id) {
      return Promise.resolve(
        Object.values(testUsers).find(user => user.id === where.id) || null
      );
    }
    return Promise.resolve(null);
  });

  mockPrismaAuditLogCreate.mockResolvedValue({
    id: 'audit-123',
    userId: 'user-123',
    action: 'test',
    resource: 'test',
    details: null,
    ipAddress: 'test',
    userAgent: 'test',
    createdAt: new Date(),
  });

  return {
    mockPrismaUserFindUnique,
    mockPrismaUserFindMany,
    mockPrismaUserCreate,
    mockPrismaUserUpdate,
    mockPrismaUserDelete,
    mockPrismaAuditLogCreate,
  };
}

/**
 * Mock authentication utilities
 */
export function mockAuthUtils() {
  const mockWithAdminAuth = jest.fn();
  const mockWithAuth = jest.fn();
  const mockHashPassword = jest.fn();
  const mockVerifyPassword = jest.fn();
  const mockLogAuditEvent = jest.fn();

  // Default successful implementations
  mockWithAdminAuth.mockImplementation((handler: any) => {
    return async (req: any) => {
      return handler(req, { user: testUsers.admin });
    };
  });

  mockWithAuth.mockImplementation((handler: any) => {
    return async (req: any) => {
      return handler(req, { user: testUsers.admin });
    };
  });

  mockHashPassword.mockResolvedValue('$2a$12$hashedpassword');
  mockVerifyPassword.mockResolvedValue(true);
  mockLogAuditEvent.mockResolvedValue(undefined);

  return {
    mockWithAdminAuth,
    mockWithAuth,
    mockHashPassword,
    mockVerifyPassword,
    mockLogAuditEvent,
  };
}

/**
 * Setup authentication error scenarios
 */
export function setupAuthErrorScenarios() {
  class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
  }

  class DatabaseError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'DatabaseError';
    }
  }

  return {
    AuthenticationError,
    DatabaseError,
    createAuthError: (message: string) => new AuthenticationError(message),
    createDbError: (message: string) => new DatabaseError(message),
  };
}

/**
 * Setup role-based authentication scenarios
 */
export function setupRoleBasedAuth() {
  const scenarios = {
    admin: {
      user: testUsers.admin,
      session: {
        user: testUsers.admin,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    operator: {
      user: testUsers.operator,
      session: {
        user: testUsers.operator,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    viewer: {
      user: testUsers.viewer,
      session: {
        user: testUsers.viewer,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    unauthenticated: {
      user: null,
      session: null,
    },
  };

  return scenarios;
}

/**
 * Create mock request with proper headers and body
 */
export function createTestRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    searchParams?: Record<string, string>;
  } = {}
) {
  const { method = 'GET', headers = {}, body, searchParams = {} } = options;

  const urlObj = new URL(url, 'http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(urlObj.toString(), requestInit);
}

/**
 * Expect response helpers
 */
export async function expectJsonResponse(response: Response, expectedStatus: number) {
  expect(response.status).toBe(expectedStatus);
  const data = await response.json();
  return data;
}

export async function expectSuccessResponse(response: Response, expectedData?: any) {
  const data = await expectJsonResponse(response, 200);
  expect(data.success).toBe(true);
  if (expectedData) {
    expect(data.data).toEqual(expectedData);
  }
  return data;
}

export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
) {
  const data = await expectJsonResponse(response, expectedStatus);
  expect(data.success).toBe(false);
  if (expectedMessage) {
    expect(data.message || data.error).toContain(expectedMessage);
  }
  return data;
}

/**
 * Test data normalization helpers
 */
export function normalizeDate(date: any): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date;
}

export function normalizeTestData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(normalizeTestData);
  }

  if (data && typeof data === 'object') {
    const normalized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.includes('At') || key.includes('Date')) {
        normalized[key] = normalizeDate(value);
      } else {
        normalized[key] = normalizeTestData(value);
      }
    }
    return normalized;
  }

  return data;
}

/**
 * Complete test setup for API routes
 */
export function setupApiRouteTest() {
  const testEnv = setupTestEnvironment();
  const authMocks = mockAuthUtils();
  const prismaMocks = mockPrisma();
  const authErrors = setupAuthErrorScenarios();
  const roleAuth = setupRoleBasedAuth();

  return {
    ...testEnv,
    ...authMocks,
    ...prismaMocks,
    ...authErrors,
    roleAuth,
    createTestRequest,
    expectJsonResponse,
    expectSuccessResponse,
    expectErrorResponse,
    normalizeTestData,
    testUsers,
  };
}