/**
 * Unit Tests for Action Replayer
 */

const ActionReplayer = require('../../src/replay/replayer');
const fs = require('fs');

jest.mock('fs');

describe('ActionReplayer', () => {
  let replayer;
  let mockConfig;
  let mockDisclaimer;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfig = {
      get: jest.fn((key) => {
        const config = {
          'recorder.outputDir': '/tmp/test-logs',
          'replay.previewMode': true,
          'replay.speed': 1.0,
          'replay.pauseOnError': true
        };
        return config[key];
      })
    };

    mockDisclaimer = {
      getDisclaimerForLog: jest.fn(() => ({
        disclaimer: 'Test disclaimer'
      }))
    };

    replayer = new ActionReplayer(mockConfig, mockDisclaimer);
  });

  test('should initialize with correct state', () => {
    expect(replayer.isReplaying).toBe(false);
    expect(replayer.currentSession).toBeNull();
    expect(replayer.paused).toBe(false);
  });

  test('should load session from file', async () => {
    const mockSession = {
      sessionId: 'test_session',
      startTime: '2025-12-21T14:00:00.000Z',
      endTime: '2025-12-21T14:05:00.000Z',
      actions: [],
      legal: { disclaimer: 'Test' }
    };

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockSession));

    const session = await replayer.loadSession('test_session');

    expect(session.sessionId).toBe('test_session');
    expect(replayer.currentSession).toBe(session);
  });

  test('should throw error if session not found', async () => {
    fs.existsSync.mockReturnValue(false);

    await expect(replayer.loadSession('nonexistent')).rejects.toThrow('Session not found');
  });

  test('should calculate duration correctly', () => {
    const session = {
      startTime: '2025-12-21T14:00:00.000Z',
      endTime: '2025-12-21T14:05:30.000Z'
    };

    const duration = replayer.calculateDuration(session);
    expect(duration).toBe('5m 30s');
  });

  test('should return N/A for duration if no end time', () => {
    const session = {
      startTime: '2025-12-21T14:00:00.000Z',
      endTime: null
    };

    const duration = replayer.calculateDuration(session);
    expect(duration).toBe('N/A');
  });

  test('should pause and resume replay', () => {
    replayer.isReplaying = true;
    
    replayer.pause();
    expect(replayer.paused).toBe(true);
    
    replayer.resume();
    expect(replayer.paused).toBe(false);
  });

  test('should stop replay', () => {
    replayer.isReplaying = true;
    replayer.paused = true;
    
    replayer.stop();
    
    expect(replayer.isReplaying).toBe(false);
    expect(replayer.paused).toBe(false);
  });

  test('should return correct status', () => {
    let status = replayer.getStatus();
    expect(status.isReplaying).toBe(false);
    expect(status.isPaused).toBe(false);
    
    replayer.isReplaying = true;
    replayer.paused = true;
    replayer.currentSession = { sessionId: 'test' };
    
    status = replayer.getStatus();
    expect(status.isReplaying).toBe(true);
    expect(status.isPaused).toBe(true);
    expect(status.sessionId).toBe('test');
  });

  test('should warn about missing legal disclaimer', async () => {
    const mockSession = {
      sessionId: 'test_session',
      actions: []
      // No legal field
    };

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockSession));

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    await replayer.loadSession('test_session');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not contain legal disclaimer')
    );

    consoleSpy.mockRestore();
  });
});
