import {
  loginSchema,
  registerSchema,
  updateUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validations";
import { UserRole } from "@prisma/client";
import { testFormValidation } from "../utils/test-helpers.utils";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };

    const invalidCases = [
      {
        data: { email: "", password: "password123" },
        expectedErrors: ["Invalid email address"],
      },
      {
        data: { email: "invalid-email", password: "password123" },
        expectedErrors: ["Invalid email address"],
      },
      {
        data: { email: "test@example.com", password: "" },
        expectedErrors: ["Password must be at least 6 characters"],
      },
      {
        data: { email: "test@example.com", password: "12345" },
        expectedErrors: ["Password must be at least 6 characters"],
      },
    ];

    testFormValidation(loginSchema, validData, invalidCases);
  });

  describe("registerSchema", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: UserRole.VIEWER,
    };

    const invalidCases = [
      {
        data: { ...validData, name: "J" },
        expectedErrors: ["Name must be at least 2 characters"],
      },
      {
        data: { ...validData, email: "invalid-email" },
        expectedErrors: ["Invalid email address"],
      },
      {
        data: { ...validData, password: "12345" },
        expectedErrors: ["Password must be at least 6 characters"],
      },
    ];

    testFormValidation(registerSchema, validData, invalidCases);

    it("should allow registration without role (defaults to VIEWER)", () => {
      const dataWithoutRole = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(dataWithoutRole);
      expect(result.success).toBe(true);
    });
  });
});
