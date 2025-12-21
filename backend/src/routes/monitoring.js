const express = require('express');
const router = express.Router();
const monitoringService = require('../services/monitoring');

router.get('/health', async (req, res) => {
  try {
    const health = await monitoringService.performHealthChecks();
    const systemHealth = monitoringService.getSystemHealth();
    
    res.json({
      status: systemHealth.status,
      checks: health,
      system: systemHealth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/metrics', (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/record-action', (req, res) => {
  try {
    const { success, executionTime } = req.body;
    
    if (typeof success !== 'boolean' || typeof executionTime !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid input: success (boolean) and executionTime (number) are required' 
      });
    }
    
    monitoringService.recordAction(success, executionTime);
    res.json({ message: 'Action recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
