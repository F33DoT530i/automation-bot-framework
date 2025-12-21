const logger = require('../utils/logger');

class AIAccelerationService {
  constructor() {
    this.patterns = new Map();
    this.suggestions = [];
    this.learningData = [];
  }

  analyzePattern(actions) {
    logger.info('Analyzing action patterns for optimization opportunities');
    
    // Simple pattern detection: find repeated sequences
    const sequences = this.findRepeatedSequences(actions);
    
    sequences.forEach(seq => {
      const patternId = this.generatePatternId(seq);
      
      if (!this.patterns.has(patternId)) {
        this.patterns.set(patternId, {
          id: patternId,
          sequence: seq,
          occurrences: 1,
          potentialTimeSaving: this.calculateTimeSaving(seq)
        });
      } else {
        const pattern = this.patterns.get(patternId);
        pattern.occurrences++;
      }
    });
    
    return Array.from(this.patterns.values());
  }

  findRepeatedSequences(actions, minLength = 2) {
    const sequences = [];
    
    for (let i = 0; i < actions.length - minLength + 1; i++) {
      for (let length = minLength; length <= Math.min(5, actions.length - i); length++) {
        const sequence = actions.slice(i, i + length);
        const sequenceKey = sequence.map(a => a.action).join('->');
        
        // Look for same sequence later in the array
        for (let j = i + length; j < actions.length - length + 1; j++) {
          const compareSeq = actions.slice(j, j + length);
          const compareKey = compareSeq.map(a => a.action).join('->');
          
          if (sequenceKey === compareKey) {
            sequences.push(sequence);
            break;
          }
        }
      }
    }
    
    return sequences;
  }

  generatePatternId(sequence) {
    return sequence.map(s => s.action).join('->');
  }

  calculateTimeSaving(sequence) {
    // Estimate time saving if this pattern is automated
    const baseTime = sequence.length * 1000; // Assume 1 second per action
    const automatedTime = 100; // Automated execution would be faster
    return baseTime - automatedTime;
  }

  generateSuggestions(recordingData) {
    logger.info('Generating AI-driven suggestions for automation improvement');
    
    const suggestions = [];
    
    // Analyze patterns
    const patterns = this.analyzePattern(recordingData.steps || []);
    
    if (patterns.length > 0) {
      patterns.forEach(pattern => {
        if (pattern.occurrences >= 2) {
          suggestions.push({
            type: 'pattern_automation',
            priority: pattern.occurrences >= 3 ? 'high' : 'medium',
            title: 'Repeated Action Pattern Detected',
            description: `The sequence "${pattern.id}" appears ${pattern.occurrences} times. Consider creating a macro.`,
            impact: `Potential time saving: ${pattern.potentialTimeSaving}ms per occurrence`,
            pattern: pattern
          });
        }
      });
    }
    
    // Check for inefficient sequences
    if (recordingData.steps && recordingData.steps.length > 10) {
      suggestions.push({
        type: 'workflow_optimization',
        priority: 'medium',
        title: 'Complex Workflow Detected',
        description: 'This workflow has many steps. Consider breaking it into smaller, reusable components.',
        impact: 'Improved maintainability and reusability'
      });
    }
    
    // Analyze timing
    if (recordingData.duration) {
      const avgStepTime = recordingData.duration / (recordingData.steps?.length || 1);
      
      if (avgStepTime > 5000) {
        suggestions.push({
          type: 'performance',
          priority: 'high',
          title: 'Slow Action Execution',
          description: `Average step time is ${avgStepTime}ms. Consider optimizing slow operations.`,
          impact: 'Faster automation execution'
        });
      }
    }
    
    // Store suggestions
    this.suggestions = suggestions;
    
    return suggestions;
  }

  predictNextAction(currentSequence) {
    logger.info('Predicting next likely action based on patterns');
    
    // Simple prediction based on learned patterns
    const lastActions = currentSequence.slice(-3).map(a => a.action).join('->');
    
    const predictions = [];
    
    for (const [patternId, pattern] of this.patterns.entries()) {
      if (patternId.startsWith(lastActions)) {
        const nextAction = pattern.sequence[currentSequence.length];
        if (nextAction) {
          predictions.push({
            action: nextAction,
            confidence: pattern.occurrences / 10, // Simple confidence score
            reason: `Matches pattern: ${patternId}`
          });
        }
      }
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  optimizeWorkflow(workflow) {
    logger.info('Optimizing workflow using AI analysis');
    
    const optimizations = [];
    
    // Remove redundant steps
    const seen = new Set();
    const optimizedSteps = workflow.steps.filter(step => {
      const key = JSON.stringify({ action: step.action, data: step.data });
      if (seen.has(key)) {
        optimizations.push({
          type: 'redundancy_removed',
          step: step.stepNumber,
          reason: 'Duplicate action detected'
        });
        return false;
      }
      seen.add(key);
      return true;
    });
    
    // Suggest parallel execution
    const parallelizable = this.findParallelizableSteps(optimizedSteps);
    if (parallelizable.length > 0) {
      optimizations.push({
        type: 'parallel_execution',
        groups: parallelizable,
        reason: 'These steps can be executed in parallel'
      });
    }
    
    return {
      originalStepCount: workflow.steps.length,
      optimizedStepCount: optimizedSteps.length,
      optimizations,
      optimizedWorkflow: {
        ...workflow,
        steps: optimizedSteps
      }
    };
  }

  findParallelizableSteps(steps) {
    // Simple heuristic: consecutive read operations can be parallelized
    const groups = [];
    let currentGroup = [];
    
    steps.forEach(step => {
      if (step.action && step.action.toLowerCase().includes('read')) {
        currentGroup.push(step.stepNumber);
      } else {
        if (currentGroup.length > 1) {
          groups.push(currentGroup);
        }
        currentGroup = [];
      }
    });
    
    if (currentGroup.length > 1) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  getSuggestions() {
    return this.suggestions;
  }

  getPatterns() {
    return Array.from(this.patterns.values());
  }
}

module.exports = new AIAccelerationService();
