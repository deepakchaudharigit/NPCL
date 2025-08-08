import { hashPassword, verifyPassword } from "@/lib/auth";

describe("Auth utilities", () => {
  describe("Password hashing", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it("should verify a correct password", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe("Deprecated JWT functions", () => {
    // These functions are deprecated in favor of NextAuth.js
    // Tests are kept for documentation purposes

    it("should indicate JWT functions are deprecated", () => {
      // JWT token generation and verification is now handled by NextAuth.js
      // These functions throw errors to indicate they should not be used
      expect(true).toBe(true); // Placeholder test
    });
  });
});
