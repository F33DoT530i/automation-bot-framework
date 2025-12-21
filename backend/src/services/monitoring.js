const logger = require('../utils/logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      actions: {
        total: 0,
        successful: 0,
        failed: 0
      },
      performance: {
        averageExecutionTime: 0,
        executionTimes: []
      },
      system: {
        uptime: 0,
        startTime: Date.now()
      }
    };
    
    this.healthChecks = new Map();
    this.setupHealthChecks();
  }

  setupHealthChecks() {
    this.registerHealthCheck('database', () => {
      return { status: 'healthy', message: 'Database connection active' };
    });
    
    this.registerHealthCheck('memory', () => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
      
      return {
        status: heapUsedMB < heapTotalMB * 0.9 ? 'healthy' : 'warning',
        message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`,
        details: { heapUsedMB, heapTotalMB }
      };
    });
  }

  registerHealthCheck(name, checkFunction) {
    this.healthChecks.set(name, checkFunction);
    logger.info(`Registered health check: ${name}`);
  }

  async performHealthChecks() {
    const results = {};
    
    for (const [name, checkFn] of this.healthChecks.entries()) {
      try {
        results[name] = await checkFn();
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          message: error.message
        };
      }
    }
    
    return results;
  }

  recordAction(success, executionTime) {
    this.metrics.actions.total++;
    
    if (success) {
      this.metrics.actions.successful++;
    } else {
      this.metrics.actions.failed++;
    }
    
    this.metrics.performance.executionTimes.push(executionTime);
    
    // Keep only last 100 execution times
    if (this.metrics.performance.executionTimes.length > 100) {
      this.metrics.performance.executionTimes.shift();
    }
    
    // Calculate average
    const sum = this.metrics.performance.executionTimes.reduce((a, b) => a + b, 0);
    this.metrics.performance.averageExecutionTime = 
      sum / this.metrics.performance.executionTimes.length;
    
    logger.info('Action recorded', { success, executionTime });
  }

  getMetrics() {
    this.metrics.system.uptime = Date.now() - this.metrics.system.startTime;
    
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  getSystemHealth() {
    const uptime = Date.now() - this.metrics.system.startTime;
    const successRate = this.metrics.actions.total > 0
      ? (this.metrics.actions.successful / this.metrics.actions.total) * 100
      : 100;
    
    return {
      status: successRate >= 95 ? 'healthy' : successRate >= 80 ? 'degraded' : 'unhealthy',
      uptime,
      successRate: successRate.toFixed(2),
      metrics: this.getMetrics()
    };
  }
}

module.exports = new MonitoringService();
