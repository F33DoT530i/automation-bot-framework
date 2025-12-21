import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

function AIAcceleration() {
  const [suggestions, setSuggestions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [suggestionsRes, patternsRes] = await Promise.all([
        aiAPI.getSuggestions(),
        aiAPI.getPatterns()
      ]);
      setSuggestions(suggestionsRes.data.suggestions || []);
      setPatterns(patternsRes.data.patterns || []);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    }
  };

  const analyzeSampleWorkflow = async () => {
    setLoading(true);
    try {
      const sampleActions = [
        { action: 'click', data: { element: 'button1' } },
        { action: 'type', data: { text: 'test' } },
        { action: 'click', data: { element: 'button1' } },
        { action: 'type', data: { text: 'test' } },
        { action: 'submit', data: {} }
      ];

      await aiAPI.analyzePatterns(sampleActions);
      
      const recordingData = {
        steps: sampleActions.map((action, i) => ({
          stepNumber: i + 1,
          action: action.action,
          data: action.data
        })),
        duration: 5000
      };

      await aiAPI.generateSuggestions(recordingData);
      await fetchData();
    } catch (error) {
      console.error('Error analyzing workflow:', error);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="ai-acceleration">
      <h2>AI-Driven Accelerations</h2>
      
      <div className="analysis-controls">
        <button 
          onClick={analyzeSampleWorkflow} 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Analyzing...' : 'Analyze Sample Workflow'}
        </button>
      </div>

      <div className="suggestions-section">
        <h3>AI Suggestions</h3>
        {suggestions.length === 0 ? (
          <p>No suggestions yet. Analyze a workflow to get AI-driven recommendations.</p>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-card">
                <div 
                  className="priority-badge" 
                  style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                >
                  {suggestion.priority?.toUpperCase()}
                </div>
                <h4>{suggestion.title}</h4>
                <p className="description">{suggestion.description}</p>
                <p className="impact"><strong>Impact:</strong> {suggestion.impact}</p>
                {suggestion.type && (
                  <span className="type-badge">{suggestion.type}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="patterns-section">
        <h3>Detected Patterns</h3>
        {patterns.length === 0 ? (
          <p>No patterns detected yet.</p>
        ) : (
          <div className="patterns-list">
            {patterns.map((pattern, index) => (
              <div key={index} className="pattern-card">
                <h4>Pattern {index + 1}</h4>
                <p><strong>Sequence:</strong> {pattern.id}</p>
                <p><strong>Occurrences:</strong> {pattern.occurrences}</p>
                <p><strong>Time Saving:</strong> {pattern.potentialTimeSaving}ms</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAcceleration;
