// Mock dependencies first
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/nextauth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Now import the modules
import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requireAdmin,
  requireOperatorOrAdmin,
} from "@middleware/authMiddleware";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<
  typeof prisma.user.findUnique
>;

describe("requireAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate user with valid session", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    // Mock NextAuth session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.VIEWER,
      },
    } as any);

    // Mock database user
    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "test@example.com",
      role: UserRole.ADMIN, // DB has updated role
      name: "Test User",
    } as any);

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.ADMIN); // Should use current DB role
    expect(response).toBeNull();
  });

  it("should return error for missing session", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    // Mock no session
    mockGetServerSession.mockResolvedValue(null);

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(401);
  });

  it("should return error for invalid session", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    // Mock session without user
    mockGetServerSession.mockResolvedValue({ user: null } as any);

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(401);
  });

  it("should return error when user not found in database", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    // Mock valid session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "nonexistent",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.VIEWER,
      },
    } as any);

    // Mock user not found in database
    mockPrismaUserFindUnique.mockResolvedValue(null);

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(401);
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to simulate requireRole functionality
  const requireRole = async (req: NextRequest, allowedRoles: UserRole[]) => {
    const { user, response } = await requireAuth(req);

    if (response) return { user: null, response };

    if (!user || !allowedRoles.includes(user.role)) {
      return {
        user: null,
        response: new Response(
          JSON.stringify({
            success: false,
            message: "Insufficient permissions",
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      };
    }

    return { user, response: null };
  };

  it("should allow access for correct role", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.ADMIN,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "test@example.com",
      role: UserRole.ADMIN,
      name: "Test User",
    } as any);

    const { user, response } = await requireRole(mockRequest, [UserRole.ADMIN]);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(response).toBeNull();
  });

  it("should allow access for multiple allowed roles", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.OPERATOR,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "test@example.com",
      role: UserRole.OPERATOR,
      name: "Test User",
    } as any);

    const { user, response } = await requireRole(mockRequest, [
      UserRole.ADMIN,
      UserRole.OPERATOR,
    ]);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.OPERATOR);
    expect(response).toBeNull();
  });

  it("should redirect when role is insufficient", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.VIEWER,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "test@example.com",
      role: UserRole.VIEWER,
      name: "Test User",
    } as any);

    const { user, response } = await requireRole(mockRequest, [UserRole.ADMIN]);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(403);
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow access for admin user", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: UserRole.ADMIN,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "admin123",
      email: "admin@example.com",
      role: UserRole.ADMIN,
      name: "Admin User",
    } as any);

    const { user, response } = await requireAdmin(mockRequest);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(response).toBeNull();
  });

  it("should deny access for non-admin user", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "user@example.com",
        name: "Regular User",
        role: UserRole.VIEWER,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "user@example.com",
      role: UserRole.VIEWER,
      name: "Regular User",
    } as any);

    const { user, response } = await requireAdmin(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(403);
  });
});

describe("requireAdminOrModerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow access for admin user", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: UserRole.ADMIN,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "admin123",
      email: "admin@example.com",
      role: UserRole.ADMIN,
      name: "Admin User",
    } as any);

    const { user, response } = await requireOperatorOrAdmin(mockRequest);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(response).toBeNull();
  });

  it("should allow access for operator user", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "operator123",
        email: "operator@example.com",
        name: "Operator User",
        role: UserRole.OPERATOR,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "operator123",
      email: "operator@example.com",
      role: UserRole.OPERATOR,
      name: "Operator User",
    } as any);

    const { user, response } = await requireOperatorOrAdmin(mockRequest);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.OPERATOR);
    expect(response).toBeNull();
  });

  it("should deny access for regular user", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "user@example.com",
        name: "Regular User",
        role: UserRole.VIEWER,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "user@example.com",
      role: UserRole.VIEWER,
      name: "Regular User",
    } as any);

    const { user, response } = await requireOperatorOrAdmin(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(403);
  });
});
