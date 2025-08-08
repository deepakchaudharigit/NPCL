import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Check API Endpoint
 * Provides comprehensive system health monitoring including database connectivity and memory usage for NPCL Dashboard.
 */

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk?: {
      available: number;
      total: number;
      percentage: number;
    };
  };
}

async function checkDatabase(): Promise<{ status: 'up' | 'down'; responseTime?: number; error?: string }> {
  try {
    const startTime = Date.now();
    
    // Test database connectivity with simple query
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'up',
      responseTime
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal + memUsage.external;
  const usedMemory = memUsage.heapUsed;
  
  return {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / totalMemory) * 100)
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    
    // Perform database connectivity check
    const databaseCheck = await checkDatabase();
    
    // Get current memory usage statistics
    const memoryUsage = getMemoryUsage();
    
    // Determine overall system health status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (databaseCheck.status === 'down') {
      overallStatus = 'unhealthy';
    } else if (memoryUsage.percentage > 90) {
      overallStatus = 'degraded';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: databaseCheck,
        memory: memoryUsage
      }
    };
    
    // Set HTTP status code based on health status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    // Handle health check failures
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: 'down',
          error: 'Health check failed'
        },
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        }
      }
    };
    
    return NextResponse.json(errorStatus, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Lightweight health check for basic monitoring
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick database connectivity test
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}