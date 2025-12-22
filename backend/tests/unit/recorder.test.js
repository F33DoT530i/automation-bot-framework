/**
 * Unit Tests for Screen Recorder
 */

const ScreenRecorder = require('../../src/recorder/recorder');

describe('ScreenRecorder', () => {
  let recorder;
  let mockConfig;
  let mockDisclaimer;

  beforeEach(() => {
    mockConfig = {
      get: jest.fn((key) => {
        const config = {
          'recorder.outputDir': '/tmp/test-logs',
          'recorder.captureScreenshots': true,
          'recorder.captureProcesses': true,
          'recorder.screenshotInterval': 1000,
          'recorder.processInterval': 500
        };
        return config[key];
      })
    };

    mockDisclaimer = {
      getDisclaimerForLog: jest.fn(() => ({
        disclaimer: 'Test disclaimer',
        legal_notice: 'Test legal notice'
      }))
    };

    recorder = new ScreenRecorder(mockConfig, mockDisclaimer);
  });

  afterEach(() => {
    if (recorder.isRecording) {
      recorder.intervalIds.forEach(id => clearInterval(id));
      recorder.isRecording = false;
    }
  });

  test('should initialize with correct state', () => {
    expect(recorder.isRecording).toBe(false);
    expect(recorder.sessionId).toBeNull();
    expect(recorder.sessionData).toBeNull();
  });

  test('should start recording and create session', async () => {
    const sessionId = await recorder.startRecording();
    
    expect(recorder.isRecording).toBe(true);
    expect(recorder.sessionId).toBeTruthy();
    expect(sessionId).toMatch(/^session_\d+$/);
    expect(recorder.sessionData).toBeTruthy();
    expect(recorder.sessionData.sessionId).toBe(sessionId);
  });

  test('should throw error if recording already in progress', async () => {
    await recorder.startRecording();
    
    await expect(recorder.startRecording()).rejects.toThrow('Recording already in progress');
  });

  test('should stop recording and return session ID', async () => {
    const startSessionId = await recorder.startRecording();
    
    // Mock fs to avoid actual file operations
    const fs = require('fs');
    jest.spyOn(fs, 'writeFileSync').mockImplementation();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'mkdirSync').mockImplementation();
    
    const stopSessionId = await recorder.stopRecording();
    
    expect(recorder.isRecording).toBe(false);
    expect(stopSessionId).toBe(startSessionId);
  });

  test('should throw error if no recording in progress', async () => {
    await expect(recorder.stopRecording()).rejects.toThrow('No recording in progress');
  });

  test('should log actions during recording', async () => {
    await recorder.startRecording();
    
    recorder.logAction('mouse_click', { x: 100, y: 200 });
    recorder.logAction('key_press', { key: 'Enter' });
    
    expect(recorder.sessionData.actions.length).toBe(2);
    expect(recorder.sessionData.actions[0].type).toBe('mouse_click');
    expect(recorder.sessionData.actions[1].type).toBe('key_press');
  });

  test('should not log actions when not recording', () => {
    recorder.logAction('mouse_click', { x: 100, y: 200 });
    
    expect(recorder.sessionData).toBeNull();
  });

  test('should return correct status', async () => {
    let status = recorder.getStatus();
    expect(status.isRecording).toBe(false);
    
    await recorder.startRecording();
    recorder.logAction('test', {});
    
    status = recorder.getStatus();
    expect(status.isRecording).toBe(true);
    expect(status.sessionId).toBeTruthy();
    expect(status.actionCount).toBe(1);
  });
});
