const monitoringService = require('../../src/services/monitoring');

describe('MonitoringService - Unit Tests', () => {
  beforeEach(() => {
    // Reset metrics before each test
    monitoringService.metrics = {
      actions: { total: 0, successful: 0, failed: 0 },
      performance: { averageExecutionTime: 0, executionTimes: [] },
      system: { uptime: 0, startTime: Date.now() }
    };
  });

  describe('recordAction', () => {
    test('should record successful action', () => {
      monitoringService.recordAction(true, 100);
      
      const metrics = monitoringService.getMetrics();
      expect(metrics.actions.total).toBe(1);
      expect(metrics.actions.successful).toBe(1);
      expect(metrics.actions.failed).toBe(0);
    });

    test('should record failed action', () => {
      monitoringService.recordAction(false, 200);
      
      const metrics = monitoringService.getMetrics();
      expect(metrics.actions.total).toBe(1);
      expect(metrics.actions.successful).toBe(0);
      expect(metrics.actions.failed).toBe(1);
    });

    test('should calculate average execution time', () => {
      monitoringService.recordAction(true, 100);
      monitoringService.recordAction(true, 200);
      monitoringService.recordAction(true, 300);
      
      const metrics = monitoringService.getMetrics();
      expect(metrics.performance.averageExecutionTime).toBe(200);
    });

    test('should limit execution times array to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        monitoringService.recordAction(true, 100);
      }
      
      const metrics = monitoringService.getMetrics();
      expect(metrics.performance.executionTimes.length).toBe(100);
    });
  });

  describe('performHealthChecks', () => {
    test('should return health check results', async () => {
      const results = await monitoringService.performHealthChecks();
      
      expect(results).toHaveProperty('database');
      expect(results).toHaveProperty('memory');
      expect(results.database.status).toBe('healthy');
    });
  });

  describe('getSystemHealth', () => {
    test('should return healthy status with 100% success rate', () => {
      monitoringService.recordAction(true, 100);
      monitoringService.recordAction(true, 100);
      
      const health = monitoringService.getSystemHealth();
      expect(health.status).toBe('healthy');
      expect(health.successRate).toBe('100.00');
    });

    test('should return degraded status with 90% success rate', () => {
      for (let i = 0; i < 9; i++) {
        monitoringService.recordAction(true, 100);
      }
      monitoringService.recordAction(false, 100);
      
      const health = monitoringService.getSystemHealth();
      expect(health.status).toBe('degraded');
      expect(health.successRate).toBe('90.00');
    });

    test('should return unhealthy status with 70% success rate', () => {
      for (let i = 0; i < 7; i++) {
        monitoringService.recordAction(true, 100);
      }
      for (let i = 0; i < 3; i++) {
        monitoringService.recordAction(false, 100);
      }
      
      const health = monitoringService.getSystemHealth();
      expect(health.status).toBe('unhealthy');
      expect(health.successRate).toBe('70.00');
    });
  });

  describe('getMetrics', () => {
    test('should return complete metrics object', () => {
      monitoringService.recordAction(true, 100);
      
      const metrics = monitoringService.getMetrics();
      expect(metrics).toHaveProperty('actions');
      expect(metrics).toHaveProperty('performance');
      expect(metrics).toHaveProperty('system');
      expect(metrics).toHaveProperty('timestamp');
    });
  });
});
