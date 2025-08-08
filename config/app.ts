import { env, isDevelopment, isProduction, getBaseUrl, getApiUrl } from './env'

export const appConfig = {
  name: 'NPCL Dashboard',
  description: 'Power Management Dashboard for NPCL',
  version: '1.0.0',
  
  // Environment
  env: env.NODE_ENV,
  isDevelopment,
  isProduction,
  
  // URLs
  baseUrl: getBaseUrl(),
  apiUrl: getApiUrl(),
  
  // Features
  features: {
    registration: env.ENABLE_REGISTRATION,
    emailNotifications: env.ENABLE_EMAIL_NOTIFICATIONS,
    auditLogging: true,
    maintenanceScheduling: true,
    reportGeneration: true,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // File uploads
  uploads: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  
  // Dashboard refresh intervals (in milliseconds)
  refreshIntervals: {
    dashboard: env.DASHBOARD_REFRESH_INTERVAL,
    powerReadings: env.POWER_READINGS_REFRESH_INTERVAL,
    alerts: env.ALERTS_REFRESH_INTERVAL,
  },
  
  // Alert thresholds
  alerts: {
    lowEfficiency: env.LOW_EFFICIENCY_THRESHOLD,
    highTemperature: env.HIGH_TEMPERATURE_THRESHOLD,
    offlineTimeout: env.OFFLINE_TIMEOUT,
  },
}