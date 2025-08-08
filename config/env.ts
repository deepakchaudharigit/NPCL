/**
 * Environment Configuration (Legacy)
 * 
 * ⚠️ DEPRECATED: This file is deprecated and should not be used directly.
 * 
 * Use instead:
 * - For server-side code: import from '@/config/env.server'
 * - For client-side code: import from '@/config/env.client'
 * 
 * This file is kept for backward compatibility but will be removed in a future version.
 */

// Re-export server environment for backward compatibility
// Only use this in server-side code
export { 
  serverEnv as env,
  isDevelopment,
  isProduction,
  isTest,
  isEmailConfigured,
  getBaseUrl,
  getApiUrl
} from './env.server'

// Re-export client environment
export { 
  clientEnv,
  getClientApiUrl,
  isRegistrationEnabled,
  isEmailNotificationsEnabled
} from './env.client'

// Default export for backward compatibility
export { default } from './env.server'