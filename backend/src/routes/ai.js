const express = require('express');
const router = express.Router();
const aiAccelerationService = require('../services/aiAcceleration');

router.post('/analyze', (req, res) => {
  try {
    const { actions } = req.body;
    
    if (!Array.isArray(actions)) {
      return res.status(400).json({ error: 'Actions array is required' });
    }
    
    const patterns = aiAccelerationService.analyzePattern(actions);
    res.json({ patterns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/suggestions', (req, res) => {
  try {
    const recordingData = req.body;
    
    if (!recordingData) {
      return res.status(400).json({ error: 'Recording data is required' });
    }
    
    const suggestions = aiAccelerationService.generateSuggestions(recordingData);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/predict', (req, res) => {
  try {
    const { currentSequence } = req.body;
    
    if (!Array.isArray(currentSequence)) {
      return res.status(400).json({ error: 'Current sequence array is required' });
    }
    
    const predictions = aiAccelerationService.predictNextAction(currentSequence);
    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/optimize', (req, res) => {
  try {
    const workflow = req.body;
    
    if (!workflow.steps || !Array.isArray(workflow.steps)) {
      return res.status(400).json({ error: 'Workflow with steps array is required' });
    }
    
    const result = aiAccelerationService.optimizeWorkflow(workflow);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/patterns', (req, res) => {
  try {
    const patterns = aiAccelerationService.getPatterns();
    res.json({ patterns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suggestions', (req, res) => {
  try {
    const suggestions = aiAccelerationService.getSuggestions();
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
