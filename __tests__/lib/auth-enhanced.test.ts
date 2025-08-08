// Mock dependencies first
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomBytes: jest.fn(),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(),
  })),
}));

// Now import the modules
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateResetToken,
  hashResetToken,
} from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;

describe("Auth utilities - Enhanced", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  describe("hashPassword", () => {
    it("should hash a password with bcrypt using correct salt rounds", async () => {
      const password = "testpassword123";
      const hashedPassword = "$2a$12$hashedpasswordresult";

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

    it("should handle empty password", async () => {
      const password = "";
      const hashedPassword = "$2a$12$emptyhash";

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith("", 12);
      expect(result).toBe(hashedPassword);
    });

    it("should handle very long passwords", async () => {
      const password = "a".repeat(1000);
      const hashedPassword = "$2a$12$longhash";

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "testpassword123";
      const hashedPassword = "$2a$12$hashedpassword";

      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "wrongpassword";
      const hashedPassword = "$2a$12$hashedpassword";

      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it("should handle bcrypt comparison errors", async () => {
      const password = "testpassword123";
      const hashedPassword = "$2a$12$hashedpassword";
      const error = new Error("Bcrypt comparison error");

      mockBcrypt.compare.mockRejectedValue(error as never);

      await expect(verifyPassword(password, hashedPassword)).rejects.toThrow(
        "Bcrypt comparison error",
      );
    });

    it("should handle empty password verification", async () => {
      const password = "";
      const hashedPassword = "$2a$12$hashedpassword";

      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await verifyPassword(password, hashedPassword);

      expect(result).toBe(false);
    });

    it("should handle malformed hash", async () => {
      const password = "testpassword123";
      const hashedPassword = "not-a-valid-hash";
      const error = new Error("Invalid hash format");

      mockBcrypt.compare.mockRejectedValue(error as never);

      await expect(verifyPassword(password, hashedPassword)).rejects.toThrow(
        "Invalid hash format",
      );
    });
  });

  describe("generateResetToken", () => {
    it("should generate a random token", () => {
      const mockToken = "random-hex-token";
      const mockBuffer = Buffer.from("random-bytes");

      mockCrypto.randomBytes.mockReturnValue(mockBuffer);
      mockBuffer.toString = jest.fn().mockReturnValue(mockToken);

      const result = generateResetToken();

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockBuffer.toString).toHaveBeenCalledWith("hex");
      expect(result).toBe(mockToken);
    });

    it("should generate different tokens on multiple calls", () => {
      const tokens = ["token1", "token2", "token3"];
      let callCount = 0;

      mockCrypto.randomBytes.mockImplementation(() => {
        const mockBuffer = Buffer.from(`random-bytes-${callCount}`);
        mockBuffer.toString = jest.fn().mockReturnValue(tokens[callCount]);
        callCount++;
        return mockBuffer;
      });

      const result1 = generateResetToken();
      const result2 = generateResetToken();
      const result3 = generateResetToken();

      expect(result1).toBe("token1");
      expect(result2).toBe("token2");
      expect(result3).toBe("token3");
      expect(mockCrypto.randomBytes).toHaveBeenCalledTimes(3);
    });
  });

  describe("hashResetToken", () => {
    it("should hash a reset token using SHA256", () => {
      const token = "reset-token-123";
      const hashedToken = "sha256-hashed-token";

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(hashedToken),
      };

      mockCrypto.createHash.mockReturnValue(mockHash as any);

      const result = hashResetToken(token);

      expect(mockCrypto.createHash).toHaveBeenCalledWith("sha256");
      expect(mockHash.update).toHaveBeenCalledWith(token);
      expect(mockHash.digest).toHaveBeenCalledWith("hex");
      expect(result).toBe(hashedToken);
    });

    it("should produce consistent hashes for the same token", () => {
      const token = "same-token";
      const hashedToken = "consistent-hash";

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(hashedToken),
      };

      mockCrypto.createHash.mockReturnValue(mockHash as any);

      const result1 = hashResetToken(token);
      const result2 = hashResetToken(token);

      expect(result1).toBe(hashedToken);
      expect(result2).toBe(hashedToken);
      expect(mockCrypto.createHash).toHaveBeenCalledTimes(2);
    });

    it("should handle empty token", () => {
      const token = "";
      const hashedToken = "empty-hash";

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(hashedToken),
      };

      mockCrypto.createHash.mockReturnValue(mockHash as any);

      const result = hashResetToken(token);

      expect(mockHash.update).toHaveBeenCalledWith("");
      expect(result).toBe(hashedToken);
    });
  });

  describe("Deprecated JWT functions", () => {
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

      it("should throw error regardless of user data", () => {
        const users = [
          { id: "1", email: "admin@test.com", role: "ADMIN" as const },
          { id: "2", email: "operator@test.com", role: "OPERATOR" as const },
          { id: "3", email: "viewer@test.com", role: "VIEWER" as const },
        ];

        users.forEach((user) => {
          expect(() => generateToken(user)).toThrow(
            "generateToken is deprecated. Use NextAuth.js session management instead.",
          );
        });
      });
    });

    describe("verifyToken (deprecated)", () => {
      it("should throw error indicating deprecation", () => {
        const token = "valid.jwt.token";

        expect(() => verifyToken(token)).toThrow(
          "verifyToken is deprecated. Use NextAuth.js session management instead.",
        );
      });

      it("should throw error for any token format", () => {
        const tokens = [
          "valid.jwt.token",
          "invalid-token",
          "",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        ];

        tokens.forEach((token) => {
          expect(() => verifyToken(token)).toThrow(
            "verifyToken is deprecated. Use NextAuth.js session management instead.",
          );
        });
      });
    });

    describe("extractTokenFromHeader (deprecated)", () => {
      it("should throw error indicating deprecation", () => {
        const authHeader = "Bearer valid.jwt.token";

        expect(() => extractTokenFromHeader(authHeader)).toThrow(
          "extractTokenFromHeader is deprecated. Use NextAuth.js session management instead.",
        );
      });

      it("should throw error for various header formats", () => {
        const headers = [
          "Bearer valid.jwt.token",
          "Basic dXNlcjpwYXNz",
          "Token abc123",
          null,
          "",
        ];

        headers.forEach((header) => {
          expect(() => extractTokenFromHeader(header)).toThrow(
            "extractTokenFromHeader is deprecated. Use NextAuth.js session management instead.",
          );
        });
      });
    });
  });

  describe("Security considerations", () => {
    it("should use secure salt rounds for password hashing", async () => {
      const password = "testpassword";
      mockBcrypt.hash.mockResolvedValue("$2a$12$hash" as never);

      await hashPassword(password);

      // Verify that salt rounds is 12 (secure)
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it("should generate cryptographically secure reset tokens", () => {
      const mockBuffer = Buffer.from("secure-random-bytes");
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);
      mockBuffer.toString = jest.fn().mockReturnValue("secure-hex-token");

      generateResetToken();

      // Verify using crypto.randomBytes for security
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
    });

    it("should use SHA256 for reset token hashing", () => {
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hash"),
      };
      mockCrypto.createHash.mockReturnValue(mockHash as any);

      hashResetToken("token");

      expect(mockCrypto.createHash).toHaveBeenCalledWith("sha256");
    });
  });

  describe("Error handling", () => {
    it("should propagate crypto errors in generateResetToken", () => {
      const error = new Error("Crypto error");
      mockCrypto.randomBytes.mockImplementation(() => {
        throw error;
      });

      expect(() => generateResetToken()).toThrow("Crypto error");
    });

    it("should propagate crypto errors in hashResetToken", () => {
      const error = new Error("Hash error");
      mockCrypto.createHash.mockImplementation(() => {
        throw error;
      });

      expect(() => hashResetToken("token")).toThrow("Hash error");
    });
  });
});
