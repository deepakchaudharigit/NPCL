/**
 * Performance Monitoring Utilities for NPCL Dashboard
 * 
 * This module provides utilities for monitoring application performance,
 * tracking metrics, and identifying bottlenecks.
 */

import { prisma } from '@/lib/prisma';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface DatabaseMetrics {
  connectionCount: number;
  queryCount: number;
  avgQueryTime: number;
  slowQueries: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  requestCount: number;
  errorRate: number;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: APIMetrics[] = [];
  private startTime: number = Date.now();

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    });

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record API request metrics
   */
  recordAPIMetric(metric: APIMetrics): void {
    this.apiMetrics.push(metric);

    // Keep only last 1000 API metrics in memory
    if (this.apiMetrics.length > 1000) {
      this.apiMetrics = this.apiMetrics.slice(-1000);
    }
  }

  /**
   * Get current system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;

    return {
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100)
      },
      uptime: process.uptime(),
      requestCount: this.apiMetrics.length,
      errorRate: this.calculateErrorRate()
    };
  }

  /**
   * Get database performance metrics
   */
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Get recent API metrics for database queries
      const recentMetrics = this.apiMetrics.filter(
        m => m.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      );

      const queryTimes = recentMetrics.map(m => m.responseTime);
      const avgQueryTime = queryTimes.length > 0 
        ? queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length 
        : 0;

      const slowQueries = queryTimes.filter(time => time > 1000).length; // > 1 second

      return {
        connectionCount: 1, // Prisma manages connections
        queryCount: recentMetrics.length,
        avgQueryTime: Math.round(avgQueryTime),
        slowQueries
      };
    } catch (error) {
      console.error('Error getting database metrics:', error);
      return {
        connectionCount: 0,
        queryCount: 0,
        avgQueryTime: 0,
        slowQueries: 0
      };
    }
  }

  /**
   * Get API endpoint performance summary
   */
  getAPIPerformanceSummary(timeWindow: number = 5 * 60 * 1000): Record<string, any> {
    const cutoff = new Date(Date.now() - timeWindow);
    const recentMetrics = this.apiMetrics.filter(m => m.timestamp > cutoff);

    const endpointStats: Record<string, {
      count: number;
      avgResponseTime: number;
      errorCount: number;
      errorRate: number;
    }> = {};

    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      
      if (!endpointStats[key]) {
        endpointStats[key] = {
          count: 0,
          avgResponseTime: 0,
          errorCount: 0,
          errorRate: 0
        };
      }

      endpointStats[key].count++;
      endpointStats[key].avgResponseTime += metric.responseTime;
      
      if (metric.statusCode >= 400) {
        endpointStats[key].errorCount++;
      }
    });

    // Calculate averages and error rates
    Object.keys(endpointStats).forEach(key => {
      const stats = endpointStats[key];
      stats.avgResponseTime = Math.round(stats.avgResponseTime / stats.count);
      stats.errorRate = Math.round((stats.errorCount / stats.count) * 100);
    });

    return endpointStats;
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): Array<{
    type: 'warning' | 'critical';
    message: string;
    metric: string;
    value: number;
    threshold: number;
  }> {
    const alerts = [];
    const systemMetrics = this.getSystemMetrics();

    // Memory usage alerts
    if (systemMetrics.memoryUsage.percentage > 90) {
      alerts.push({
        type: 'critical' as const,
        message: 'High memory usage detected',
        metric: 'memory_usage',
        value: systemMetrics.memoryUsage.percentage,
        threshold: 90
      });
    } else if (systemMetrics.memoryUsage.percentage > 80) {
      alerts.push({
        type: 'warning' as const,
        message: 'Elevated memory usage',
        metric: 'memory_usage',
        value: systemMetrics.memoryUsage.percentage,
        threshold: 80
      });
    }

    // Error rate alerts
    if (systemMetrics.errorRate > 10) {
      alerts.push({
        type: 'critical' as const,
        message: 'High error rate detected',
        metric: 'error_rate',
        value: systemMetrics.errorRate,
        threshold: 10
      });
    } else if (systemMetrics.errorRate > 5) {
      alerts.push({
        type: 'warning' as const,
        message: 'Elevated error rate',
        metric: 'error_rate',
        value: systemMetrics.errorRate,
        threshold: 5
      });
    }

    return alerts;
  }

  /**
   * Calculate error rate from recent API metrics
   */
  private calculateErrorRate(): number {
    const recentMetrics = this.apiMetrics.filter(
      m => m.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    if (recentMetrics.length === 0) return 0;

    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    return Math.round((errorCount / recentMetrics.length) * 100);
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(): {
    system: SystemMetrics;
    api: Record<string, any>;
    alerts: Array<any>;
    timestamp: string;
  } {
    return {
      system: this.getSystemMetrics(),
      api: this.getAPIPerformanceSummary(),
      alerts: this.getPerformanceAlerts(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear old metrics to free memory
   */
  clearOldMetrics(olderThan: number = 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - olderThan);
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp > cutoff);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware function to track API performance
 */
export function createPerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data: any) {
      const responseTime = Date.now() - startTime;
      
      performanceMonitor.recordAPIMetric({
        endpoint: req.url || req.path || 'unknown',
        method: req.method || 'GET',
        responseTime,
        statusCode: res.statusCode || 200,
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection?.remoteAddress
      });

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Utility function to measure execution time
 */
export async function measureExecutionTime<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const executionTime = Date.now() - startTime;
    
    performanceMonitor.recordMetric(name, executionTime, 'ms', tags);
    
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    performanceMonitor.recordMetric(name, executionTime, 'ms', {
      ...tags,
      error: 'true'
    });
    
    throw error;
  }
}

/**
 * Database query performance wrapper
 */
export async function measureDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  return measureExecutionTime(`db_query_${queryName}`, query, {
    type: 'database'
  });
}

/**
 * Performance monitoring configuration
 */
export const performanceConfig = {
  // Enable/disable performance monitoring
  enabled: process.env.NODE_ENV !== 'test',
  
  // Metrics retention time (1 hour)
  metricsRetentionTime: 60 * 60 * 1000,
  
  // Alert thresholds
  thresholds: {
    memoryUsage: {
      warning: 80,
      critical: 90
    },
    errorRate: {
      warning: 5,
      critical: 10
    },
    responseTime: {
      warning: 1000,
      critical: 3000
    }
  }
};

// Cleanup old metrics every 10 minutes
if (performanceConfig.enabled) {
  setInterval(() => {
    performanceMonitor.clearOldMetrics(performanceConfig.metricsRetentionTime);
  }, 10 * 60 * 1000);
}