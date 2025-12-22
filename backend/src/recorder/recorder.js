/**
 * Screen Recorder Module
 * 
 * LEGAL NOTICE: This module enables screen recording. Users MUST comply with
 * all applicable laws, obtain proper consent, and use ethically.
 * See docs/legal/DISCLAIMER.md for complete terms.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ScreenRecorder {
  constructor(config, disclaimer) {
    this.config = config;
    this.disclaimer = disclaimer;
    this.isRecording = false;
    this.sessionId = null;
    this.sessionData = null;
    this.intervalIds = [];
  }

  async startRecording() {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    this.sessionId = `session_${Date.now()}`;
    this.isRecording = true;

    this.sessionData = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      metadata: {
        os: os.platform(),
        osVersion: os.release(),
        hostname: os.hostname(),
        user: process.env.USER || process.env.USERNAME || 'unknown',
        nodeVersion: process.version
      },
      legal: this.disclaimer.getDisclaimerForLog(),
      screenshots: [],
      processes: [],
      actions: []
    };

    // Create output directory
    const outputDir = this.config.get('recorder.outputDir');
    const sessionDir = path.join(outputDir, this.sessionId);
    
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    console.log(`\n🎬 Recording started: ${this.sessionId}`);
    console.log(`📁 Output directory: ${sessionDir}\n`);

    // Start capturing screenshots if enabled
    if (this.config.get('recorder.captureScreenshots')) {
      this.startScreenshotCapture(sessionDir);
    }

    // Start capturing processes if enabled
    if (this.config.get('recorder.captureProcesses')) {
      this.startProcessCapture();
    }

    return this.sessionId;
  }

  startScreenshotCapture(sessionDir) {
    const interval = this.config.get('recorder.screenshotInterval');
    
    // Note: Actual screenshot capture would require platform-specific implementation
    // or libraries like screenshot-desktop. This is a simplified version.
    const intervalId = setInterval(() => {
      if (!this.isRecording) return;

      const screenshot = {
        timestamp: new Date().toISOString(),
        index: this.sessionData.screenshots.length,
        path: path.join(sessionDir, `screenshot_${this.sessionData.screenshots.length}.png`),
        captured: false // Would be true when actual capture succeeds
      };

      this.sessionData.screenshots.push(screenshot);
      
      // Log progress periodically
      if (this.sessionData.screenshots.length % 10 === 0) {
        console.log(`📸 Captured ${this.sessionData.screenshots.length} screenshots`);
      }
    }, interval);

    this.intervalIds.push(intervalId);
  }

  startProcessCapture() {
    const interval = this.config.get('recorder.processInterval');
    
    const intervalId = setInterval(() => {
      if (!this.isRecording) return;

      const processSnapshot = {
        timestamp: new Date().toISOString(),
        processes: this.captureProcessList()
      };

      this.sessionData.processes.push(processSnapshot);
    }, interval);

    this.intervalIds.push(intervalId);
  }

  captureProcessList() {
    // Simplified process capture
    // Real implementation would use node-process-list or similar
    try {
      return {
        count: 0,
        foreground: [],
        background: [],
        note: 'Process capture requires platform-specific implementation'
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  logAction(actionType, details) {
    if (!this.isRecording) {
      return;
    }

    const action = {
      timestamp: new Date().toISOString(),
      type: actionType,
      details: details,
      index: this.sessionData.actions.length
    };

    this.sessionData.actions.push(action);
  }

  async stopRecording() {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    this.isRecording = false;

    // Clear all intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];

    this.sessionData.endTime = new Date().toISOString();

    // Save session data
    const outputDir = this.config.get('recorder.outputDir');
    const sessionDir = path.join(outputDir, this.sessionId);
    const sessionFilePath = path.join(sessionDir, 'session.json');

    fs.writeFileSync(
      sessionFilePath,
      JSON.stringify(this.sessionData, null, 2),
      'utf8'
    );

    console.log(`\n🛑 Recording stopped: ${this.sessionId}`);
    console.log(`💾 Session data saved: ${sessionFilePath}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Screenshots: ${this.sessionData.screenshots.length}`);
    console.log(`   - Process snapshots: ${this.sessionData.processes.length}`);
    console.log(`   - Actions logged: ${this.sessionData.actions.length}\n`);

    const sessionId = this.sessionId;
    this.sessionId = null;
    this.sessionData = null;

    return sessionId;
  }

  getStatus() {
    return {
      isRecording: this.isRecording,
      sessionId: this.sessionId,
      screenshotCount: this.sessionData?.screenshots.length || 0,
      processSnapshotCount: this.sessionData?.processes.length || 0,
      actionCount: this.sessionData?.actions.length || 0
    };
  }
}

module.exports = ScreenRecorder;
