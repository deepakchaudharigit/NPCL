import { UserRole } from '@prisma/client';
import {
  createMockUser,
  createMockAdmin,
  createMockOperator,
} from '../utils/test-factories';

/**
 * Test users for seeding
 */
export const testUsers = {
  admin: createMockAdmin({
    id: 'admin-test-123',
    email: 'admin@test.com',
    name: 'Test Admin',
  }),
  operator: createMockOperator({
    id: 'operator-test-123',
    email: 'operator@test.com',
    name: 'Test Operator',
  }),
  viewer: createMockUser({
    id: 'viewer-test-123',
    email: 'viewer@test.com',
    name: 'Test Viewer',
    role: UserRole.VIEWER,
  }),
};

/**
 * Setup mock Prisma client with test users
 */
export function setupMockPrismaWithTestData() {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  };

  mockPrisma.user.findMany.mockResolvedValue(Object.values(testUsers));

  mockPrisma.user.findUnique.mockImplementation(({ where }) => {
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

  mockPrisma.auditLog.create.mockResolvedValue({
    id: 'audit-123',
    userId: 'user-123',
    action: 'test',
    resource: 'test',
    details: null,
    ipAddress: 'test',
    userAgent: 'test',
    createdAt: new Date(),
  });

  return mockPrisma;
}

/**
 * Setup mock getServerSession, withAdminAuth, withAuth for API tests
 */
export function setupAuthMocks() {
  const mockGetServerSession = jest.fn();
  const mockWithAdminAuth = jest.fn();
  const mockWithAuth = jest.fn();

  mockGetServerSession.mockResolvedValue({
    user: testUsers.admin,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

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

  return {
    mockGetServerSession,
    mockWithAdminAuth,
    mockWithAuth,
  };
}

/**
 * Setup session + user for specific role
 */
export function setupAuthForRole(role: UserRole) {
  const user =
    role === UserRole.ADMIN
      ? testUsers.admin
      : role === UserRole.OPERATOR
      ? testUsers.operator
      : testUsers.viewer;

  return {
    user,
    session: {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Setup standard auth-related error types and cases
 */
export function setupAuthErrors() {
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
    noSession: null,
    invalidUser: null,
    databaseError: new DatabaseError('Database connection failed'),
    authError: new AuthenticationError('Authentication failed'),
  };
}

/**
 * Reset all Jest mocks
 */
export function resetAllMocks() {
  jest.clearAllMocks();
}

/**
 * Bootstraps API test environment with mocked dependencies
 */
export function setupApiTestEnvironment() {
  const mockPrisma = setupMockPrismaWithTestData();
  const authMocks = setupAuthMocks();
  const authErrors = setupAuthErrors();

  return {
    mockPrisma,
    ...authMocks,
    ...authErrors,
    testUsers,
    resetAllMocks,
  };
}
