const express = require('express');
const router = express.Router();
const actionReplayService = require('../services/actionReplay');

router.post('/start', (req, res) => {
  try {
    const { sessionId } = req.body;
    const id = actionReplayService.startRecording(sessionId);
    res.json({ sessionId: id, status: 'recording' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/record/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const action = req.body;
    
    if (!action.type) {
      return res.status(400).json({ error: 'Action type is required' });
    }
    
    const step = actionReplayService.recordStep(sessionId, action);
    res.json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/stop/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const recording = actionReplayService.stopRecording(sessionId);
    res.json(recording);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/recordings', (req, res) => {
  try {
    const recordings = actionReplayService.getAllRecordings();
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recordings/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const recording = actionReplayService.getRecording(sessionId);
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json(recording);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/replay/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const options = req.body;
    
    const playback = await actionReplayService.replay(sessionId, options);
    res.json(playback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/playback/:playbackId', (req, res) => {
  try {
    const { playbackId } = req.params;
    const playback = actionReplayService.getPlaybackHistory(playbackId);
    
    if (!playback) {
      return res.status(404).json({ error: 'Playback not found' });
    }
    
    res.json(playback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/recordings/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = actionReplayService.deleteRecording(sessionId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
