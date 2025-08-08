import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import {
  createMockPrisma,
  mockSession,
  createMockRequest,
  expectJsonResponse,
  expectSuccessResponse,
  expectErrorResponse,
  setupTestDatabase,
  withAuthHeaders,
  testFormValidation,
  mockRouter,
  mockUseSession,
  testApiRoute,
  measureExecutionTime,
  simulateDatabaseError,
  simulateNetworkError,
  cleanupTestData,
  waitFor,
  waitForCondition,
} from "./test-helpers.utils";

describe("Test Helpers", () => {
  test("should create mock Prisma client with user and auditLog methods", () => {
    const mockPrisma = createMockPrisma();

    expect(mockPrisma).toHaveProperty("user");
    expect(mockPrisma).toHaveProperty("auditLog");

    expect(typeof mockPrisma.user.findUnique).toBe("function");
    expect(typeof mockPrisma.user.create).toBe("function");
    expect(typeof mockPrisma.user.update).toBe("function");
    expect(typeof mockPrisma.user.delete).toBe("function");
    expect(typeof mockPrisma.user.findMany).toBe("function");
  });

  test("should create mock session with correct structure", () => {
    const user = {
      id: "test-id",
      email: "test@example.com",
      role: "VIEWER" as UserRole,
    };
    const session = mockSession(user);

    expect(session).toHaveProperty("user");
    expect(session).toHaveProperty("expires");
    expect(session.user).toEqual(user);
    expect(typeof session.expires).toBe("string");
  });

  test("should create mock request with correct properties", () => {
    const url = "http://localhost:3000/api/test";
    const options = {
      method: "POST",
      body: { test: "data" },
      headers: { "custom-header": "value" },
    };

    const request = createMockRequest(url, options);

    expect(request).toBeInstanceOf(NextRequest);
    expect(request.method).toBe("POST");
    expect(request.url).toContain("/api/test");
  });

  test("should setup test database with default user mocks", () => {
    const mockPrisma = setupTestDatabase();

    expect(mockPrisma).toBeDefined();
    expect(jest.isMockFunction(mockPrisma.user.create)).toBe(true);
    expect(jest.isMockFunction(mockPrisma.user.findUnique)).toBe(true);
  });

  test("should measure execution time correctly", async () => {
    const testFunction = async () => {
      await waitFor(10);
      return "test result";
    };

    const { result, executionTime } = await measureExecutionTime(testFunction);

    expect(result).toBe("test result");
    expect(executionTime).toBeGreaterThan(5);
    expect(executionTime).toBeLessThan(100);
  });

  test("waitFor should delay execution", async () => {
    const start = Date.now();
    await waitFor(50);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(45);
  });
});
