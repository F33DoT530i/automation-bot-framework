#!/usr/bin/env node

/**
 * Automation Bot Framework - Main Entry Point
 * 
 * LEGAL NOTICE: This software includes screen recording and process logging.
 * Users MUST comply with all applicable laws and use ethically.
 * See docs/legal/DISCLAIMER.md for complete terms.
 * 
 * F33DoT530i and contributors are NOT responsible for misuse.
 */

const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');
const ScreenRecorder = require('./recorder/recorder');
const ActionReplayer = require('./replay/replayer');
const readline = require('readline');

class AutomationFramework {
  constructor() {
    this.recorder = new ScreenRecorder(config, disclaimer);
    this.replayer = new ActionReplayer(config, disclaimer);
    this.rl = null;
  }

  async initialize() {
    // Show disclaimer and require acceptance
    await disclaimer.checkAndRequireAcceptance(config);
  }

  showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║               Automation Bot Framework - Command Reference                 ║
╚════════════════════════════════════════════════════════════════════════════╝

⚠️  LEGAL WARNING: Screen recording and process logging are subject to laws
    and ethical requirements. See docs/legal/DISCLAIMER.md for complete terms.

RECORDING COMMANDS:
  start-recording      Start a new recording session
  stop-recording       Stop the current recording session
  recording-status     Show current recording status
  log-action          Log a custom action during recording

REPLAY COMMANDS:
  list-sessions       List all recorded sessions
  preview <id>        Preview a session without replaying
  replay <id>         Replay a recorded session
  replay-status       Show current replay status

CONTROL COMMANDS:
  pause               Pause current replay
  resume              Resume paused replay
  stop                Stop current replay

GENERAL COMMANDS:
  help                Show this help message
  disclaimer          Display legal disclaimer
  config              Show current configuration
  exit                Exit the application

EXAMPLES:
  $ npm start
  > start-recording
  > log-action click button
  > stop-recording
  > list-sessions
  > preview session_1234567890
  > replay session_1234567890

LEGAL REMINDER:
  ⚠️  You are solely responsible for lawful and ethical use
  ⚠️  Obtain proper consent before recording
  ⚠️  Comply with all applicable laws and regulations

For complete documentation, see: docs/
For legal information, see: docs/legal/DISCLAIMER.md
`);
  }

  async listSessions() {
    const fs = require('fs');
    const path = require('path');
    const outputDir = config.get('recorder.outputDir');

    if (!fs.existsSync(outputDir)) {
      console.log('\n📁 No sessions found (output directory does not exist)\n');
      return;
    }

    const sessions = fs.readdirSync(outputDir)
      .filter(name => name.startsWith('session_'))
      .map(name => {
        const sessionPath = path.join(outputDir, name, 'session.json');
        if (fs.existsSync(sessionPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            return {
              id: name,
              startTime: data.startTime,
              endTime: data.endTime,
              actions: data.actions.length,
              screenshots: data.screenshots.length
            };
          } catch (e) {
            return null;
          }
        }
        return null;
      })
      .filter(s => s !== null);

    if (sessions.length === 0) {
      console.log('\n📁 No sessions found\n');
      return;
    }

    console.log('\n📋 Recorded Sessions:\n');
    sessions.forEach(session => {
      console.log(`  🎬 ${session.id}`);
      console.log(`     Started: ${session.startTime}`);
      console.log(`     Ended: ${session.endTime || 'N/A'}`);
      console.log(`     Actions: ${session.actions}, Screenshots: ${session.screenshots}`);
      console.log();
    });
  }

  async handleCommand(command) {
    const [cmd, ...args] = command.trim().split(/\s+/);

    try {
      switch (cmd.toLowerCase()) {
        case 'start-recording':
          await this.recorder.startRecording();
          break;

        case 'stop-recording':
          await this.recorder.stopRecording();
          break;

        case 'recording-status':
          console.log('\n📊 Recording Status:', this.recorder.getStatus(), '\n');
          break;

        case 'log-action':
          if (args.length < 2) {
            console.log('Usage: log-action <type> <details...>');
            break;
          }
          this.recorder.logAction(args[0], { description: args.slice(1).join(' ') });
          console.log('✓ Action logged');
          break;

        case 'list-sessions':
          await this.listSessions();
          break;

        case 'preview':
          if (args.length === 0) {
            console.log('Usage: preview <session-id>');
            break;
          }
          await this.replayer.previewSession(args[0]);
          break;

        case 'replay':
          if (args.length === 0) {
            console.log('Usage: replay <session-id>');
            break;
          }
          await this.replayer.replaySession(args[0]);
          break;

        case 'replay-status':
          console.log('\n📊 Replay Status:', this.replayer.getStatus(), '\n');
          break;

        case 'pause':
          this.replayer.pause();
          break;

        case 'resume':
          this.replayer.resume();
          break;

        case 'stop':
          this.replayer.stop();
          break;

        case 'help':
          this.showHelp();
          break;

        case 'disclaimer':
          await disclaimer.display();
          break;

        case 'config':
          console.log('\n⚙️  Current Configuration:\n');
          console.log(JSON.stringify(config.config, null, 2));
          console.log();
          break;

        case 'exit':
        case 'quit':
          console.log('\n👋 Goodbye!\n');
          process.exit(0);
          break;

        default:
          if (cmd) {
            console.log(`Unknown command: ${cmd}`);
            console.log('Type "help" for available commands\n');
          }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }
  }

  async startInteractiveMode() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'automation-bot> '
    });

    console.log('\n🤖 Automation Bot Framework - Interactive Mode');
    console.log('Type "help" for available commands\n');

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      await this.handleCommand(line);
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye!\n');
      process.exit(0);
    });
  }

  async run() {
    const args = process.argv.slice(2);

    // Handle command-line arguments
    if (args.includes('--help') || args.includes('-h')) {
      this.showHelp();
      return;
    }

    if (args.includes('--disclaimer')) {
      await disclaimer.display();
      return;
    }

    // Initialize with disclaimer
    await this.initialize();

    // Start interactive mode
    await this.startInteractiveMode();
  }
}

// Main execution
if (require.main === module) {
  const framework = new AutomationFramework();
  framework.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = AutomationFramework;
