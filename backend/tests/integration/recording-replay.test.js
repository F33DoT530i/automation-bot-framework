/**
 * Integration Tests for Recording and Replay
 */

const ScreenRecorder = require('../../src/recorder/recorder');
const ActionReplayer = require('../../src/replay/replayer');
const fs = require('fs');
const path = require('path');

describe('Recording and Replay Integration', () => {
  let recorder;
  let replayer;
  let mockConfig;
  let mockDisclaimer;
  let testOutputDir;

  beforeAll(() => {
    testOutputDir = path.join(__dirname, '../../logs/test');
    
    // Clean up test directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    mockConfig = {
      get: jest.fn((key) => {
        const config = {
          'recorder.outputDir': testOutputDir,
          'recorder.captureScreenshots': false,  // Disable for testing
          'recorder.captureProcesses': false,     // Disable for testing
          'recorder.screenshotInterval': 1000,
          'recorder.processInterval': 500,
          'replay.previewMode': false,
          'replay.speed': 10.0,  // Fast replay for testing
          'replay.pauseOnError': false
        };
        return config[key];
      })
    };

    mockDisclaimer = {
      getDisclaimerForLog: jest.fn(() => ({
        disclaimer: 'Test disclaimer',
        legal_notice: 'User is responsible for lawful use',
        warning: 'Test warning'
      }))
    };

    recorder = new ScreenRecorder(mockConfig, mockDisclaimer);
    replayer = new ActionReplayer(mockConfig, mockDisclaimer);
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  test('should record and replay a complete session', async () => {
    // Start recording
    const sessionId = await recorder.startRecording();
    expect(sessionId).toBeTruthy();

    // Log some actions
    recorder.logAction('mouse_click', { x: 100, y: 200, button: 'left' });
    recorder.logAction('key_press', { key: 'Enter' });
    recorder.logAction('mouse_move', { x: 150, y: 250 });

    // Small delay to simulate activity
    await new Promise(resolve => setTimeout(resolve, 100));

    // Stop recording
    const stoppedSessionId = await recorder.stopRecording();
    expect(stoppedSessionId).toBe(sessionId);

    // Verify session file exists
    const sessionPath = path.join(testOutputDir, sessionId, 'session.json');
    expect(fs.existsSync(sessionPath)).toBe(true);

    // Load and verify session data
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    expect(sessionData.sessionId).toBe(sessionId);
    expect(sessionData.actions.length).toBe(3);
    expect(sessionData.legal).toBeTruthy();
    expect(sessionData.legal.disclaimer).toBe('Test disclaimer');

    // Preview the session
    const previewData = await replayer.previewSession(sessionId);
    expect(previewData.sessionId).toBe(sessionId);

    // Replay the session
    await replayer.replaySession(sessionId, { preview: false });

    // Verify replay completed
    expect(replayer.isReplaying).toBe(false);
  }, 10000); // Increase timeout for this test

  test('should handle multiple recording sessions', async () => {
    // Record first session
    const sessionId1 = await recorder.startRecording();
    recorder.logAction('action1', { data: 'test1' });
    await recorder.stopRecording();

    // Create new recorder instance for second session
    const recorder2 = new ScreenRecorder(mockConfig, mockDisclaimer);
    
    // Record second session
    const sessionId2 = await recorder2.startRecording();
    recorder2.logAction('action2', { data: 'test2' });
    await recorder2.stopRecording();

    // Verify both sessions exist
    expect(sessionId1).not.toBe(sessionId2);
    
    const session1Path = path.join(testOutputDir, sessionId1, 'session.json');
    const session2Path = path.join(testOutputDir, sessionId2, 'session.json');
    
    expect(fs.existsSync(session1Path)).toBe(true);
    expect(fs.existsSync(session2Path)).toBe(true);

    // Load both sessions
    const session1Data = await replayer.loadSession(sessionId1);
    const session2Data = await replayer.loadSession(sessionId2);

    expect(session1Data.actions[0].type).toBe('action1');
    expect(session2Data.actions[0].type).toBe('action2');
  });
});
