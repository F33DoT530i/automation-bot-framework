const actionReplayService = require('../../src/services/actionReplay');

describe('ActionReplayService - Unit Tests', () => {
  let sessionId;

  beforeEach(() => {
    // Clear recordings before each test
    actionReplayService.recordings.clear();
    actionReplayService.playbackHistory.clear();
  });

  describe('Recording', () => {
    test('should start a recording session', () => {
      sessionId = actionReplayService.startRecording();
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      
      const recording = actionReplayService.getRecording(sessionId);
      expect(recording.status).toBe('recording');
      expect(recording.steps).toEqual([]);
    });

    test('should record steps in a session', () => {
      sessionId = actionReplayService.startRecording();
      
      const action = {
        type: 'click',
        data: { element: 'button#submit' }
      };
      
      const step = actionReplayService.recordStep(sessionId, action);
      
      expect(step.stepNumber).toBe(1);
      expect(step.action).toBe('click');
      expect(step.data).toEqual(action.data);
    });

    test('should record multiple steps sequentially', () => {
      sessionId = actionReplayService.startRecording();
      
      actionReplayService.recordStep(sessionId, { type: 'click', data: {} });
      actionReplayService.recordStep(sessionId, { type: 'type', data: {} });
      actionReplayService.recordStep(sessionId, { type: 'submit', data: {} });
      
      const recording = actionReplayService.getRecording(sessionId);
      expect(recording.steps.length).toBe(3);
      expect(recording.steps[0].stepNumber).toBe(1);
      expect(recording.steps[2].stepNumber).toBe(3);
    });

    test('should throw error when recording to non-existent session', () => {
      expect(() => {
        actionReplayService.recordStep('invalid-session', { type: 'click', data: {} });
      }).toThrow();
    });

    test('should stop recording and mark as completed', () => {
      sessionId = actionReplayService.startRecording();
      actionReplayService.recordStep(sessionId, { type: 'click', data: {} });
      
      const recording = actionReplayService.stopRecording(sessionId);
      
      expect(recording.status).toBe('completed');
      expect(recording.duration).toBeGreaterThan(0);
      expect(recording.endTime).toBeDefined();
    });
  });

  describe('Replay', () => {
    beforeEach(async () => {
      sessionId = actionReplayService.startRecording();
      actionReplayService.recordStep(sessionId, { type: 'click', data: { element: 'button' } });
      actionReplayService.recordStep(sessionId, { type: 'type', data: { text: 'test' } });
      actionReplayService.stopRecording(sessionId);
    });

    test('should replay a recorded session', async () => {
      const playback = await actionReplayService.replay(sessionId);
      
      expect(playback.status).toBe('completed');
      expect(playback.executedSteps.length).toBe(2);
      expect(playback.recordingId).toBe(sessionId);
    });

    test('should respect speed option during replay', async () => {
      const playback = await actionReplayService.replay(sessionId, { speed: 2 });
      
      expect(playback.options.speed).toBe(2);
      expect(playback.status).toBe('completed');
    });

    test('should throw error when replaying non-existent session', async () => {
      await expect(
        actionReplayService.replay('invalid-session')
      ).rejects.toThrow();
    });
  });

  describe('Management', () => {
    test('should get all recordings', () => {
      const id1 = actionReplayService.startRecording();
      const id2 = actionReplayService.startRecording();
      
      const recordings = actionReplayService.getAllRecordings();
      
      expect(recordings.length).toBe(2);
      expect(recordings.find(r => r.id === id1)).toBeDefined();
      expect(recordings.find(r => r.id === id2)).toBeDefined();
    });

    test('should delete a recording', () => {
      sessionId = actionReplayService.startRecording();
      
      const deleted = actionReplayService.deleteRecording(sessionId);
      expect(deleted).toBe(true);
      
      const recording = actionReplayService.getRecording(sessionId);
      expect(recording).toBeUndefined();
    });

    test('should return false when deleting non-existent recording', () => {
      const deleted = actionReplayService.deleteRecording('invalid-id');
      expect(deleted).toBe(false);
    });
  });
});
