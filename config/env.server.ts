/**
 * Server-Side Environment Configuration
 * Manages sensitive environment variables and server configuration for NPCL Dashboard. Only accessible on server-side code.
 */

interface ServerEnvironmentConfig {
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';

  // Database
  DATABASE_URL: string;

  // NextAuth
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;

  // JWT
  JWT_EXPIRES_IN: string;

  // Email configuration
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_FROM?: string;

  // Security
  BCRYPT_SALT_ROUNDS: number;

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_ATTEMPTS: number;

  // Session configuration
  SESSION_MAX_AGE: number;
  SESSION_UPDATE_AGE: number;

  // File upload limits
  MAX_FILE_SIZE: number;

  // Alert thresholds
  LOW_EFFICIENCY_THRESHOLD: number;
  HIGH_TEMPERATURE_THRESHOLD: number;
  OFFLINE_TIMEOUT: number;
}

// Essential environment variables required for application startup
const requiredEnvVars: (keyof ServerEnvironmentConfig)[] = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

// Validate that all required environment variables are present
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please check your .env file and ensure all required variables are set.'
  );
}

// Server environment configuration object with validated values and defaults
export const serverEnv: ServerEnvironmentConfig = {
  // Node environment
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // NextAuth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,

  // JWT
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Email configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER,

  // Security
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5', 10),

  // Session configuration
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400', 10), // 24 hours
  SESSION_UPDATE_AGE: parseInt(process.env.SESSION_UPDATE_AGE || '3600', 10), // 1 hour

  // File upload limits
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB

  // Alert thresholds
  LOW_EFFICIENCY_THRESHOLD: parseInt(process.env.LOW_EFFICIENCY_THRESHOLD || '75', 10), // Below 75%
  HIGH_TEMPERATURE_THRESHOLD: parseInt(process.env.HIGH_TEMPERATURE_THRESHOLD || '500', 10), // Above 500°C
  OFFLINE_TIMEOUT: parseInt(process.env.OFFLINE_TIMEOUT || '300000', 10), // 5 minutes
} as const;

// Environment helper functions and utilities
export const isDevelopment = serverEnv.NODE_ENV === 'development';
export const isProduction = serverEnv.NODE_ENV === 'production';
export const isTest = serverEnv.NODE_ENV === 'test';

// Check if email service is properly configured
export const isEmailConfigured = (): boolean => {
  return !!(serverEnv.EMAIL_USER && serverEnv.EMAIL_PASS);
};

// Get application base URL based on environment
export const getBaseUrl = (): string => {
  return isProduction ? serverEnv.NEXTAUTH_URL : 'http://localhost:3000';
};

// Get API endpoint base URL
export const getApiUrl = (): string => {
  return `${getBaseUrl()}/api`;
};

export default serverEnv;