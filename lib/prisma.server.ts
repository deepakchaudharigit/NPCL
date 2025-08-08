import { PrismaClient } from '@prisma/client'

// This file should only be imported on the server side
if (typeof window !== 'undefined') {
  throw new Error('prisma.server.ts should only be imported on the server side')
}

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

// Global Prisma instance to prevent multiple connections in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration
const createPrismaClient = () => {
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

// Initialize Prisma client
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// In development, store the client globally to prevent multiple instances
if (!isProduction) {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
