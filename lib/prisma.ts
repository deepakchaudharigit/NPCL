import { PrismaClient } from '@prisma/client'

// Declare the prisma variable with proper typing
declare global {
  // eslint-disable-next-line no-var
  var __globalPrisma__: PrismaClient | undefined
}

// Create a conditional export based on environment
let prisma: PrismaClient

// Only initialize Prisma on the server side
if (typeof window === 'undefined') {
  // Server-side initialization
  const getServerEnv = () => {
    try {
      const { isProduction } = require('@/config/env.server')
      return { isProduction }
    } catch (error) {
      return {
        isProduction: process.env.NODE_ENV === 'production'
      }
    }
  }

  const { isProduction } = getServerEnv()

  // Create Prisma client with proper configuration
  const createPrismaClient = (): PrismaClient => {
    return new PrismaClient({
      log: isProduction 
        ? ['error'] 
        : ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }

  // Initialize Prisma client with global instance prevention
  if (isProduction) {
    // Production: Create new instance
    prisma = createPrismaClient()
  } else {
    // Development: Use global instance to prevent multiple connections
    if (!globalThis.__globalPrisma__) {
      globalThis.__globalPrisma__ = createPrismaClient()
    }
    prisma = globalThis.__globalPrisma__
  }

  // Graceful shutdown handling
  if (typeof process !== 'undefined') {
    const handleShutdown = async () => {
      try {
        await prisma.$disconnect()
        console.log('Prisma client disconnected successfully')
      } catch (error) {
        console.error('Error disconnecting Prisma client:', error)
      }
    }

    process.on('beforeExit', handleShutdown)
    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  }
} else {
  // Client-side: Create a mock/placeholder that throws meaningful errors
  prisma = new Proxy({} as PrismaClient, {
    get(target, prop: string | symbol) {
      throw new Error(
        `❌ Attempting to access Prisma.${String(prop)} on the client side.\n` +
        `🔧 Prisma operations should only be used in:\n` +
        `   • API routes (app/api/*/route.ts)\n` +
        `   • Server components\n` +
        `   • Middleware\n` +
        `   • Server actions\n\n` +
        `💡 If you need data in a client component, fetch it from an API route or pass it down from a server component.`
      )
    }
  })
}

// Export the main prisma instance
export { prisma }

// Export a server-only version with additional type safety
export const serverPrisma = (() => {
  if (typeof window !== 'undefined') {
    throw new Error(
      '🚫 serverPrisma can only be used on the server side.\n' +
      '💡 Use regular prisma export in server contexts or create an API route for client data fetching.'
    )
  }
  return prisma
})()

// Helper function to safely use Prisma in server contexts
export const usePrisma = () => {
  if (typeof window !== 'undefined') {
    throw new Error(
      '🚫 usePrisma() can only be called on the server side.\n' +
      '💡 Use this function in API routes, server components, or server actions only.'
    )
  }
  return prisma
}

// Type export for better TypeScript support
export type PrismaClientType = typeof prisma

// Development helper to check Prisma connection
export const checkPrismaConnection = async (): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    console.warn('checkPrismaConnection() should only be called on the server side')
    return false
  }

  try {
    await prisma.$connect()
    console.log('✅ Prisma database connection successful')
    return true
  } catch (error) {
    console.error('❌ Prisma database connection failed:', error)
    return false
  }
}
