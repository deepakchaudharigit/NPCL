import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";

// ────────────────
// Mock Prisma client (user + auditLog only)
// ────────────────
export const createMockPrisma = () => ({
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
});

// ────────────────
// Session Helpers
// ────────────────
export const mockSession = (user: {
  id: string;
  email: string;
  role: UserRole;
}): Session => ({
  user,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

// ────────────────
// Request Helper
// ────────────────
export const createMockRequest = (
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest => {
  const { method = "GET", headers = {}, body, searchParams = {} } = options;

  const urlObj = new URL(url, "http://localhost:3000");
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const request = new NextRequest(urlObj.toString(), {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return request;
};

// ────────────────
// Response Helpers
// ────────────────
export const expectJsonResponse = async (
  response: NextResponse,
  expectedStatus: number
) => {
  expect(response.status).toBe(expectedStatus);
  const data = await response.json();
  return data;
};

export const expectSuccessResponse = async (
  response: NextResponse,
  expectedData?: any
) => {
  const data = await expectJsonResponse(response, 200);
  expect(data.success).toBe(true);
  if (expectedData) {
    expect(data.data).toEqual(expectedData);
  }
  return data;
};

export const expectErrorResponse = async (
  response: NextResponse,
  expectedStatus: number,
  expectedMessage?: string
) => {
  const data = await expectJsonResponse(response, expectedStatus);
  expect(data.success).toBe(false);
  if (expectedMessage) {
    expect(data.message).toContain(expectedMessage);
  }
  return data;
};

// ────────────────
// Database Test Setup
// ────────────────
export const setupTestDatabase = () => {
  const mockPrisma = createMockPrisma();

  mockPrisma.user.create.mockResolvedValue({});
  mockPrisma.user.findUnique.mockResolvedValue(null);

  return mockPrisma;
};

// ────────────────
// Auth Header Helper
// ────────────────
export const withAuthHeaders = (
  headers: Record<string, string>,
  user: { id: string; email: string; role: UserRole }
) => ({
  ...headers,
  "x-user-id": user.id,
  "x-user-email": user.email,
  "x-user-role": user.role,
});

// ────────────────
// Zod Validation Tester
// ────────────────
export const testFormValidation = (
  schema: any,
  validData: any,
  invalidCases: Array<{ data: any; expectedErrors: string[] }>
) => {
  describe("Form validation", () => {
    it("should validate correct data", () => {
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    invalidCases.forEach(({ data, expectedErrors }, index) => {
      it(`should reject invalid data case ${index + 1}`, () => {
        const result = schema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map(
            (issue) => issue.message
          );
          expectedErrors.forEach((expectedError) => {
            expect(errorMessages).toContain(expectedError);
          });
        }
      });
    });
  });
};

// ────────────────
// Router Mocks
// ────────────────
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

export const mockUseSession = (
  session: Session | null,
  status: "loading" | "authenticated" | "unauthenticated" = "authenticated"
) => ({
  data: session,
  status,
  update: jest.fn(),
});

// ────────────────
// API Utility
// ────────────────
export const testApiRoute = async (
  handler: (req: NextRequest) => Promise<NextResponse>,
  request: NextRequest
) => {
  const response = await handler(request);
  return response;
};

// ────────────────
// Performance
// ────────────────
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    executionTime: end - start,
  };
};

// ────────────────
// Error Simulation
// ────────────────
export const simulateDatabaseError = (
  mockPrisma: any,
  operation: string,
  error: Error
) => {
  const [model, method] = operation.split(".");
  mockPrisma[model][method].mockRejectedValue(error);
};

export const simulateNetworkError = () => {
  const error = new Error("Network error");
  (error as any).code = "NETWORK_ERROR";
  return error;
};

// ────────────────
// Cleanup
// ────────────────
export const cleanupTestData = (mockPrisma: any) => {
  Object.keys(mockPrisma).forEach((model) => {
    if (typeof mockPrisma[model] === "object") {
      Object.keys(mockPrisma[model]).forEach((method) => {
        if (jest.isMockFunction(mockPrisma[model][method])) {
          mockPrisma[model][method].mockClear();
        }
      });
    }
  });
};

// ────────────────
// Async Wait Helpers
// ────────────────
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000
) => {
  const start = Date.now();
  while (!condition() && Date.now() - start < timeout) {
    await waitFor(10);
  }
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};
