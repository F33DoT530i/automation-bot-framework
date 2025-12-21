const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class ActionReplayService {
  constructor() {
    this.recordings = new Map();
    this.playbackHistory = new Map();
  }

  startRecording(sessionId = null) {
    const id = sessionId || uuidv4();
    
    this.recordings.set(id, {
      id,
      steps: [],
      startTime: Date.now(),
      status: 'recording'
    });
    
    logger.info(`Started recording session: ${id}`);
    return id;
  }

  recordStep(sessionId, action) {
    const recording = this.recordings.get(sessionId);
    
    if (!recording || recording.status !== 'recording') {
      throw new Error(`No active recording for session: ${sessionId}`);
    }
    
    const step = {
      stepNumber: recording.steps.length + 1,
      timestamp: Date.now(),
      action: action.type,
      data: action.data,
      metadata: action.metadata || {}
    };
    
    recording.steps.push(step);
    logger.info(`Recorded step ${step.stepNumber} for session ${sessionId}`, { action: action.type });
    
    return step;
  }

  stopRecording(sessionId) {
    const recording = this.recordings.get(sessionId);
    
    if (!recording) {
      throw new Error(`Recording not found: ${sessionId}`);
    }
    
    recording.status = 'completed';
    recording.endTime = Date.now();
    recording.duration = recording.endTime - recording.startTime;
    
    logger.info(`Stopped recording session: ${sessionId}`, { 
      steps: recording.steps.length,
      duration: recording.duration 
    });
    
    return recording;
  }

  getRecording(sessionId) {
    return this.recordings.get(sessionId);
  }

  getAllRecordings() {
    return Array.from(this.recordings.values());
  }

  async replay(sessionId, options = {}) {
    const recording = this.recordings.get(sessionId);
    
    if (!recording) {
      throw new Error(`Recording not found: ${sessionId}`);
    }
    
    const playbackId = uuidv4();
    const playback = {
      id: playbackId,
      recordingId: sessionId,
      startTime: Date.now(),
      status: 'playing',
      executedSteps: [],
      options: {
        speed: options.speed || 1,
        skipErrors: options.skipErrors || false
      }
    };
    
    this.playbackHistory.set(playbackId, playback);
    
    logger.info(`Starting replay of session ${sessionId} (playback: ${playbackId})`);
    
    try {
      for (const step of recording.steps) {
        const executionStart = Date.now();
        
        // Simulate action execution
        const result = await this.executeStep(step, options);
        
        playback.executedSteps.push({
          ...step,
          result,
          executionTime: Date.now() - executionStart
        });
        
        // Respect speed setting (delay between steps)
        if (options.speed < 1) {
          await this.delay(1000 / options.speed);
        }
      }
      
      playback.status = 'completed';
      playback.endTime = Date.now();
      playback.duration = playback.endTime - playback.startTime;
      
      logger.info(`Completed replay of session ${sessionId}`, {
        playbackId,
        duration: playback.duration
      });
      
      return playback;
    } catch (error) {
      playback.status = 'failed';
      playback.error = error.message;
      logger.error(`Replay failed for session ${sessionId}`, { error: error.message });
      throw error;
    }
  }

  async executeStep(step, options) {
    // Simulate step execution
    logger.debug(`Executing step ${step.stepNumber}: ${step.action}`);
    
    // In a real implementation, this would execute the actual action
    // For now, we'll simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (!success && !options.skipErrors) {
      throw new Error(`Step ${step.stepNumber} failed during replay`);
    }
    
    return {
      success,
      output: `Executed ${step.action}`,
      timestamp: Date.now()
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getPlaybackHistory(playbackId = null) {
    if (playbackId) {
      return this.playbackHistory.get(playbackId);
    }
    return Array.from(this.playbackHistory.values());
  }

  deleteRecording(sessionId) {
    const deleted = this.recordings.delete(sessionId);
    
    if (deleted) {
      logger.info(`Deleted recording: ${sessionId}`);
    }
    
    return deleted;
  }
}

module.exports = new ActionReplayService();
