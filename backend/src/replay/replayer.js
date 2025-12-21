/**
 * Action Replay Module
 * 
 * LEGAL NOTICE: This module replays recorded actions. Users MUST ensure
 * they have proper authorization to replay actions on the target system.
 * See docs/legal/DISCLAIMER.md for complete terms.
 */

const fs = require('fs');
const path = require('path');

class ActionReplayer {
  constructor(config, disclaimer) {
    this.config = config;
    this.disclaimer = disclaimer;
    this.isReplaying = false;
    this.currentSession = null;
    this.paused = false;
  }

  async loadSession(sessionId) {
    const outputDir = this.config.get('recorder.outputDir');
    const sessionDir = path.join(outputDir, sessionId);
    const sessionFilePath = path.join(sessionDir, 'session.json');

    if (!fs.existsSync(sessionFilePath)) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
    
    // Verify legal disclaimer
    if (!sessionData.legal) {
      console.warn('⚠️  Warning: Session does not contain legal disclaimer information');
    }

    this.currentSession = sessionData;
    return sessionData;
  }

  async previewSession(sessionId) {
    const session = await this.loadSession(sessionId);

    console.log('\n📋 Session Preview\n');
    console.log('═'.repeat(60));
    console.log(`Session ID: ${session.sessionId}`);
    console.log(`Start Time: ${session.startTime}`);
    console.log(`End Time: ${session.endTime}`);
    console.log(`Duration: ${this.calculateDuration(session)}`);
    console.log('\nMetadata:');
    console.log(`  OS: ${session.metadata.os} ${session.metadata.osVersion}`);
    console.log(`  User: ${session.metadata.user}@${session.metadata.hostname}`);
    console.log('\nRecorded Data:');
    console.log(`  📸 Screenshots: ${session.screenshots.length}`);
    console.log(`  🔄 Process Snapshots: ${session.processes.length}`);
    console.log(`  ⚡ Actions: ${session.actions.length}`);
    
    if (session.actions.length > 0) {
      console.log('\nAction Summary:');
      const actionTypes = {};
      session.actions.forEach(action => {
        actionTypes[action.type] = (actionTypes[action.type] || 0) + 1;
      });
      Object.entries(actionTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }

    console.log('\nLegal Notice:');
    console.log(`  ${session.legal?.legal_notice || 'N/A'}`);
    console.log('═'.repeat(60));
    console.log();

    return session;
  }

  calculateDuration(session) {
    if (!session.endTime) return 'N/A';
    
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async replaySession(sessionId, options = {}) {
    if (this.isReplaying) {
      throw new Error('Replay already in progress');
    }

    const session = await this.loadSession(sessionId);

    // Show preview if enabled
    if (this.config.get('replay.previewMode') || options.preview) {
      await this.previewSession(sessionId);
      
      if (options.preview) {
        return; // Preview only mode
      }
    }

    this.isReplaying = true;
    this.paused = false;

    console.log(`\n▶️  Starting replay of session: ${sessionId}\n`);

    try {
      await this.executeReplay(session, options);
      console.log('\n✅ Replay completed successfully\n');
    } catch (error) {
      console.error('\n❌ Replay failed:', error.message, '\n');
      throw error;
    } finally {
      this.isReplaying = false;
      this.currentSession = null;
    }
  }

  async executeReplay(session, options) {
    const speed = options.speed || this.config.get('replay.speed') || 1.0;
    const pauseOnError = this.config.get('replay.pauseOnError');

    console.log(`Speed: ${speed}x`);
    console.log(`Actions to replay: ${session.actions.length}\n`);

    for (let i = 0; i < session.actions.length; i++) {
      if (this.paused) {
        console.log('⏸️  Replay paused');
        await this.waitForResume();
      }

      const action = session.actions[i];
      console.log(`[${i + 1}/${session.actions.length}] ${action.type} at ${action.timestamp}`);

      try {
        await this.executeAction(action, speed);
      } catch (error) {
        console.error(`  ❌ Error executing action: ${error.message}`);
        
        if (pauseOnError) {
          console.log('  Pausing due to error...');
          this.paused = true;
          await this.waitForResume();
        }
      }

      // Calculate delay until next action
      if (i < session.actions.length - 1) {
        const currentTime = new Date(action.timestamp);
        const nextTime = new Date(session.actions[i + 1].timestamp);
        const delayMs = (nextTime - currentTime) / speed;
        
        if (delayMs > 0) {
          await this.sleep(delayMs);
        }
      }
    }
  }

  async executeAction(action, speed) {
    // This is a simplified version. Real implementation would use
    // robotjs or similar libraries to execute actual actions
    
    switch (action.type) {
      case 'mouse_click':
        console.log(`  🖱️  Mouse click at (${action.details.x}, ${action.details.y})`);
        break;
      case 'key_press':
        console.log(`  ⌨️  Key press: ${action.details.key}`);
        break;
      case 'mouse_move':
        console.log(`  ↔️  Mouse move to (${action.details.x}, ${action.details.y})`);
        break;
      default:
        console.log(`  ℹ️  Custom action: ${action.type}`);
    }

    // Simulate action execution time
    await this.sleep(10);
  }

  pause() {
    if (this.isReplaying) {
      this.paused = true;
      console.log('\n⏸️  Replay paused by user\n');
    }
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      console.log('\n▶️  Replay resumed\n');
    }
  }

  stop() {
    if (this.isReplaying) {
      this.isReplaying = false;
      this.paused = false;
      console.log('\n⏹️  Replay stopped by user\n');
    }
  }

  async waitForResume() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.paused || !this.isReplaying) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isReplaying: this.isReplaying,
      isPaused: this.paused,
      sessionId: this.currentSession?.sessionId || null
    };
  }
}

module.exports = ActionReplayer;
