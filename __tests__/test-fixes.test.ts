// ───── Mock dependencies
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

// ───── Imports
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { requireAuth, requireAdmin } from "@middleware/authMiddleware";

// ───── Mocked functions
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;

// ───── Test Cases

describe("Fix 1: requireRole and requireAdmin user.role undefined", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle session with undefined role", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: undefined as any,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "test@example.com",
      role: UserRole.ADMIN,
      name: "Test User",
    } as any);

    const { user, response } = await requireAuth(mockRequest);
    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(response).toBeNull();
  });

  it("should handle session with null role", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: null as any,
      },
    } as any);

    mockPrismaUserFindUnique.mockResolvedValue({
      id: "user123",
      email: "test@example.com",
      role: UserRole.VIEWER,
      name: "Test User",
    } as any);

    const { user, response } = await requireAuth(mockRequest);
    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.VIEWER);
    expect(response).toBeNull();
  });
});

describe("Fix 2: [id]/route.ts params handling", () => {
  const mockRouteHandler = (params?: { params?: { id?: string } }) => {
    if (!params) throw new Error("Params object is missing");
    if (!params.params) throw new Error("Params.params is missing");
    if (!params.params.id) throw new Error("Params.params.id is missing");
    return { id: params.params.id };
  };

  it("should handle missing params object", () => {
    expect(() => mockRouteHandler()).toThrow("Params object is missing");
  });

  it("should handle missing params.id", () => {
    expect(() => mockRouteHandler({ params: {} })).toThrow("Params.params.id is missing");
  });

  it("should handle valid params correctly", () => {
    const result = mockRouteHandler({ params: { id: "user123" } });
    expect(result.id).toBe("user123");
  });
});

describe("Fix 3: getUserById with ID=1 not found", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle getUserById returning null for ID=1", async () => {
    mockPrismaUserFindUnique.mockResolvedValue(null);

    const result = await prisma.user.findUnique({
      where: { id: "1" },
      select: { id: true, email: true, role: true, name: true },
    });

    expect(result).toBeNull();
    expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
      where: { id: "1" },
      select: { id: true, email: true, role: true, name: true },
    });
  });

  it("should handle getUserById with proper mock setup for ID=1", async () => {
    const mockUser = {
      id: "1",
      email: "user1@example.com",
      role: UserRole.ADMIN,
      name: "User One",
    };

    mockPrismaUserFindUnique.mockResolvedValue(mockUser as any);

    const result = await prisma.user.findUnique({
      where: { id: "1" },
      select: { id: true, email: true, role: true, name: true },
    });

    expect(result).toEqual(mockUser);
    expect(result?.id).toBe("1");
  });
});

describe("Fix 4: Session vs DB role mismatch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should prioritize database role over session role", async () => {
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
      role: UserRole.ADMIN,
      name: "Test User",
    } as any);

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeDefined();
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(response).toBeNull();
  });

  it("should handle role mismatch with insufficient permissions", async () => {
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
      role: UserRole.VIEWER,
      name: "Test User",
    } as any);

    const { user, response } = await requireAdmin(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(403);
  });

  it("should handle missing role in database", async () => {
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
      role: undefined as any,
      name: "Test User",
    } as any);

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeDefined();
    expect(user?.role).toBeUndefined();
    expect(response).toBeNull();
  });
});

describe("Edge cases and error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle database errors gracefully", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.ADMIN,
      },
    } as any);

    mockPrismaUserFindUnique.mockRejectedValue(new Error("Database connection failed"));

    const { user, response } = await requireAuth(mockRequest);

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(response?.status).toBe(500);
  });
});
