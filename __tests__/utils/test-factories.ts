import {
  User,
  UserRole,
} from "@prisma/client";
import { testFormValidation } from "../utils/test-helpers.utils";

// ────────────────
// User Factories
// ────────────────

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  password: "$2a$12$hashedpassword",
  role: UserRole.VIEWER,
  emailVerified: null,
  image: null,
  resetToken: null,
  resetTokenExpiry: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockAdmin = (overrides: Partial<User> = {}): User =>
  createMockUser({
    id: "admin-123",
    name: "Admin User",
    email: "admin@example.com",
    role: UserRole.ADMIN,
    ...overrides,
  });

export const createMockOperator = (overrides: Partial<User> = {}): User =>
  createMockUser({
    id: "operator-123",
    name: "Operator User",
    email: "operator@example.com",
    role: UserRole.OPERATOR,
    ...overrides,
  });

export const createMockUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: [UserRole.VIEWER, UserRole.OPERATOR, UserRole.ADMIN][index % 3],
    }),
  );

// ────────────────
// Auth & Session Factories
// ────────────────

export const createMockSession = (user: Partial<User> = {}) => ({
  user: {
    id: user.id || "user-123",
    name: user.name || "Test User",
    email: user.email || "test@example.com",
    role: user.role || UserRole.VIEWER,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

export const createMockToken = (user: Partial<User> = {}) => ({
  id: user.id || "user-123",
  name: user.name || "Test User",
  email: user.email || "test@example.com",
  role: user.role || UserRole.VIEWER,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
});

// ────────────────
// Form Factories
// ────────────────

export const createMockLoginData = () => ({
  email: "test@example.com",
  password: "password123",
});

export const createMockRegisterData = () => ({
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  confirmPassword: "password123",
  role: UserRole.VIEWER,
});

// ────────────────
// API Response
// ────────────────

export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  message: success ? "Operation successful" : "Operation failed",
  data: success ? data : undefined,
  error: success ? undefined : "Test error",
});

// ────────────────
// Jest Test Coverage
// ────────────────

describe("Test Factories", () => {
  test("should create mock user with default values", () => {
    const user = createMockUser();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("role");
    expect(user.role).toBe(UserRole.VIEWER);
  });

  test("should create mock admin user", () => {
    const admin = createMockAdmin();
    expect(admin.role).toBe(UserRole.ADMIN);
    expect(admin.email).toBe("admin@example.com");
  });

  test("should create multiple mock users", () => {
    const users = createMockUsers(3);
    expect(users).toHaveLength(3);
    expect(users[0].id).toBe("user-1");
    expect(users[1].id).toBe("user-2");
    expect(users[2].id).toBe("user-3");
  });
});
