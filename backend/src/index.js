const express = require('express');
const monitoringRoutes = require('./routes/monitoring');
const actionReplayRoutes = require('./routes/actionReplay');
const aiRoutes = require('./routes/ai');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Automation Bot Framework API',
    version: '1.0.0',
    features: [
      'Monitoring',
      'Action Replay',
      'AI-driven Accelerations',
      'Testing'
    ],
    endpoints: {
      monitoring: '/api/monitoring',
      actionReplay: '/api/action-replay',
      ai: '/api/ai'
    }
  });
});

app.use('/api/monitoring', monitoringRoutes);
app.use('/api/action-replay', actionReplayRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Automation Bot Framework API listening on port ${PORT}`);
  logger.info('Features: Monitoring, Action Replay, AI-driven Accelerations, Testing');
});

module.exports = app;
