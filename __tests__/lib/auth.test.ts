// Mock dependencies first

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Now import the modules
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
} from "@/lib/auth";
import bcrypt from "bcryptjs";

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("Auth utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  describe("hashPassword", () => {
    it("should hash a password with bcrypt", async () => {
      const password = "testpassword123";
      const hashedPassword = "hashed_password_result";

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it("should handle bcrypt errors", async () => {
      const password = "testpassword123";
      const error = new Error("Bcrypt error");

      mockBcrypt.hash.mockRejectedValue(error as never);

      await expect(hashPassword(password)).rejects.toThrow("Bcrypt error");
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "testpassword123";
      const hashedPassword = "hashed_password";

      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "wrongpassword";
      const hashedPassword = "hashed_password";

      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it("should handle bcrypt comparison errors", async () => {
      const password = "testpassword123";
      const hashedPassword = "hashed_password";
      const error = new Error("Bcrypt comparison error");

      mockBcrypt.compare.mockRejectedValue(error as never);

      await expect(verifyPassword(password, hashedPassword)).rejects.toThrow(
        "Bcrypt comparison error",
      );
    });
  });

  describe("generateToken (deprecated)", () => {
    it("should throw error indicating deprecation", () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        role: "ADMIN" as const,
      };

      expect(() => generateToken(user)).toThrow(
        "generateToken is deprecated. Use NextAuth.js session management instead.",
      );
    });
  });

  describe("verifyToken (deprecated)", () => {
    it("should throw error indicating deprecation", () => {
      const token = "valid.jwt.token";

      expect(() => verifyToken(token)).toThrow(
        "verifyToken is deprecated. Use NextAuth.js session management instead.",
      );
    });
  });

  describe("extractTokenFromHeader (deprecated)", () => {
    it("should throw error indicating deprecation", () => {
      const authHeader = "Bearer valid.jwt.token";

      expect(() => extractTokenFromHeader(authHeader)).toThrow(
        "extractTokenFromHeader is deprecated. Use NextAuth.js session management instead.",
      );
    });
  });
});
