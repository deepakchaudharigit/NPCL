// Mock dependencies first
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/nextauth", () => ({
  authOptions: {},
}));

// Now import the modules
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

// Import the actual GET function
import { GET } from "@/app/api/auth/test-session/route";

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe("/api/auth/test-session", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return session data when authenticated", async () => {
    const mockSession = {
      user: {
        id: "user123",
        name: "Test User",
        email: "test@example.com",
        role: UserRole.ADMIN,
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    mockGetServerSession.mockResolvedValue(mockSession);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/test-session",
      {
        method: "GET",
        headers: {
          "user-agent": "test-agent",
          "x-forwarded-for": "127.0.0.1",
        },
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(true);
    expect(data.session.user.email).toBe("test@example.com");
    expect(data.session.user.role).toBe(UserRole.ADMIN);
    expect(data.debug.userAgent).toBe("test-agent");
    expect(data.debug.ip).toBe("127.0.0.1");
  });

  it("should return 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/test-session",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.authenticated).toBe(false);
    expect(data.session).toBe(null);
    expect(data.message).toContain("No active session found");
  });

  it("should handle errors gracefully", async () => {
    mockGetServerSession.mockRejectedValue(new Error("Session error"));

    const request = new NextRequest(
      "http://localhost:3000/api/auth/test-session",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Internal server error");
  });

  it("should extract IP from x-real-ip header when x-forwarded-for is not available", async () => {
    const mockSession = {
      user: {
        id: "user123",
        name: "Test User",
        email: "test@example.com",
        role: UserRole.ADMIN,
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    mockGetServerSession.mockResolvedValue(mockSession);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/test-session",
      {
        method: "GET",
        headers: {
          "x-real-ip": "192.168.1.1",
        },
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.debug.ip).toBe("192.168.1.1");
  });

  it("should use unknown IP when no IP headers are present", async () => {
    const mockSession = {
      user: {
        id: "user123",
        name: "Test User",
        email: "test@example.com",
        role: UserRole.ADMIN,
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    mockGetServerSession.mockResolvedValue(mockSession);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/test-session",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.debug.ip).toBe("unknown");
  });
});
