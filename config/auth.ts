/**
 * Authentication Configuration
 * Central configuration for authentication settings, password requirements, and security parameters for NPCL Dashboard.
 */

import { env } from './env'

export const authConfig = {
  jwt: {
    secret: env.NEXTAUTH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  
  bcrypt: {
    saltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  
  session: {
    maxAge: env.SESSION_MAX_AGE,
    updateAge: env.SESSION_UPDATE_AGE,
  },
  
  // Password requirements
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxAttempts: env.RATE_LIMIT_MAX_ATTEMPTS,
  },
}