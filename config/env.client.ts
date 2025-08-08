/**
 * Client-Side Environment Configuration
 * Contains non-sensitive environment variables that can be safely accessed on the client
 * These variables must be prefixed with NEXT_PUBLIC_ to be available in the browser
 */

interface ClientEnvironmentConfig {
  // API configuration
  API_URL: string;

  // Feature flags
  ENABLE_REGISTRATION: boolean;
  ENABLE_EMAIL_NOTIFICATIONS: boolean;

  // Dashboard refresh intervals (in milliseconds)
  DASHBOARD_REFRESH_INTERVAL: number;
  POWER_READINGS_REFRESH_INTERVAL: number;
  ALERTS_REFRESH_INTERVAL: number;

  // Alert thresholds (for client-side display)
  LOW_EFFICIENCY_THRESHOLD: number;
  HIGH_TEMPERATURE_THRESHOLD: number;
  OFFLINE_TIMEOUT: number;
}

/**
 * Client-Side Environment Configuration
 * Safe to use in client components and browser code
 */
export const clientEnv: ClientEnvironmentConfig = {
  // API configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 
           (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api'),

  // Feature flags
  ENABLE_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== 'false',
  ENABLE_EMAIL_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS !== 'false',

  // Dashboard refresh intervals (in milliseconds)
  DASHBOARD_REFRESH_INTERVAL: parseInt(process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL || '30000', 10), // 30 seconds
  POWER_READINGS_REFRESH_INTERVAL: parseInt(process.env.NEXT_PUBLIC_POWER_READINGS_REFRESH_INTERVAL || '10000', 10), // 10 seconds
  ALERTS_REFRESH_INTERVAL: parseInt(process.env.NEXT_PUBLIC_ALERTS_REFRESH_INTERVAL || '60000', 10), // 1 minute

  // Alert thresholds (for client-side display)
  LOW_EFFICIENCY_THRESHOLD: parseInt(process.env.NEXT_PUBLIC_LOW_EFFICIENCY_THRESHOLD || '75', 10), // Below 75%
  HIGH_TEMPERATURE_THRESHOLD: parseInt(process.env.NEXT_PUBLIC_HIGH_TEMPERATURE_THRESHOLD || '500', 10), // Above 500°C
  OFFLINE_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_OFFLINE_TIMEOUT || '300000', 10), // 5 minutes
} as const;

// Helper functions for client-side use
export const getClientApiUrl = (): string => {
  return clientEnv.API_URL;
};

export const isRegistrationEnabled = (): boolean => {
  return clientEnv.ENABLE_REGISTRATION;
};

export const isEmailNotificationsEnabled = (): boolean => {
  return clientEnv.ENABLE_EMAIL_NOTIFICATIONS;
};

export default clientEnv;