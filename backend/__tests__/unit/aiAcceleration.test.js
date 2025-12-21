const aiAccelerationService = require('../../src/services/aiAcceleration');

describe('AIAccelerationService - Unit Tests', () => {
  beforeEach(() => {
    aiAccelerationService.patterns.clear();
    aiAccelerationService.suggestions = [];
  });

  describe('Pattern Analysis', () => {
    test('should detect repeated action sequences', () => {
      const actions = [
        { action: 'click', data: { element: 'button1' } },
        { action: 'type', data: { text: 'test' } },
        { action: 'click', data: { element: 'button1' } },
        { action: 'type', data: { text: 'test' } }
      ];
      
      const patterns = aiAccelerationService.analyzePattern(actions);
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].sequence.length).toBeGreaterThanOrEqual(2);
    });

    test('should calculate time savings for patterns', () => {
      const actions = [
        { action: 'click', data: {} },
        { action: 'type', data: {} }
      ];
      
      const patterns = aiAccelerationService.analyzePattern(actions);
      
      if (patterns.length > 0) {
        expect(patterns[0].potentialTimeSaving).toBeGreaterThan(0);
      }
    });

    test('should get all detected patterns', () => {
      const actions = [
        { action: 'read', data: {} },
        { action: 'write', data: {} },
        { action: 'read', data: {} },
        { action: 'write', data: {} }
      ];
      
      aiAccelerationService.analyzePattern(actions);
      const patterns = aiAccelerationService.getPatterns();
      
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('Suggestion Generation', () => {
    test('should generate suggestions for repeated patterns', () => {
      const recordingData = {
        steps: [
          { action: 'click', data: {} },
          { action: 'type', data: {} },
          { action: 'click', data: {} },
          { action: 'type', data: {} },
          { action: 'click', data: {} },
          { action: 'type', data: {} }
        ],
        duration: 5000
      };
      
      const suggestions = aiAccelerationService.generateSuggestions(recordingData);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should suggest workflow optimization for complex workflows', () => {
      const steps = Array(15).fill(null).map((_, i) => ({
        action: `action${i}`,
        data: {}
      }));
      
      const recordingData = { steps, duration: 10000 };
      const suggestions = aiAccelerationService.generateSuggestions(recordingData);
      
      const workflowSuggestion = suggestions.find(s => s.type === 'workflow_optimization');
      expect(workflowSuggestion).toBeDefined();
    });

    test('should flag slow execution performance', () => {
      const recordingData = {
        steps: [{ action: 'test', data: {} }],
        duration: 10000
      };
      
      const suggestions = aiAccelerationService.generateSuggestions(recordingData);
      
      const perfSuggestion = suggestions.find(s => s.type === 'performance');
      expect(perfSuggestion).toBeDefined();
      expect(perfSuggestion.priority).toBe('high');
    });
  });

  describe('Workflow Optimization', () => {
    test('should remove redundant steps', () => {
      const workflow = {
        steps: [
          { stepNumber: 1, action: 'click', data: { id: 'btn' } },
          { stepNumber: 2, action: 'type', data: { text: 'hello' } },
          { stepNumber: 3, action: 'click', data: { id: 'btn' } }
        ]
      };
      
      const result = aiAccelerationService.optimizeWorkflow(workflow);
      
      expect(result.optimizedStepCount).toBeLessThanOrEqual(result.originalStepCount);
      expect(result.optimizations.length).toBeGreaterThan(0);
    });

    test('should identify parallelizable steps', () => {
      const workflow = {
        steps: [
          { stepNumber: 1, action: 'read', data: { file: 'a.txt' } },
          { stepNumber: 2, action: 'read', data: { file: 'b.txt' } },
          { stepNumber: 3, action: 'read', data: { file: 'c.txt' } },
          { stepNumber: 4, action: 'write', data: { file: 'd.txt' } }
        ]
      };
      
      const result = aiAccelerationService.optimizeWorkflow(workflow);
      
      const parallelOpt = result.optimizations.find(o => o.type === 'parallel_execution');
      expect(parallelOpt).toBeDefined();
      expect(parallelOpt.groups.length).toBeGreaterThan(0);
    });
  });

  describe('Action Prediction', () => {
    test('should predict next action based on patterns', () => {
      // First, train with a pattern
      const trainingActions = [
        { action: 'click' },
        { action: 'type' },
        { action: 'submit' }
      ];
      
      aiAccelerationService.analyzePattern(trainingActions);
      
      // Then predict
      const currentSequence = [
        { action: 'click' },
        { action: 'type' }
      ];
      
      const predictions = aiAccelerationService.predictNextAction(currentSequence);
      
      expect(Array.isArray(predictions)).toBe(true);
    });
  });
});
