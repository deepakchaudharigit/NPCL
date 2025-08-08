import { env, isDevelopment } from './env'

export const databaseConfig = {
  url: env.DATABASE_URL,
  
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  
  // Migration settings
  migrations: {
    directory: './prisma/migrations',
    tableName: '_prisma_migrations',
  },
  
  // Logging
  logging: isDevelopment,
}