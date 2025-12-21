import React, { useState, useEffect } from 'react';
import { actionReplayAPI } from '../services/api';

function ActionReplay() {
  const [recordings, setRecordings] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await actionReplayAPI.getRecordings();
      setRecordings(response.data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  const startRecording = async () => {
    try {
      const response = await actionReplayAPI.startRecording();
      setCurrentSession(response.data.sessionId);
      setIsRecording(true);
      console.log('Started recording:', response.data.sessionId);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await actionReplayAPI.stopRecording(currentSession);
      setIsRecording(false);
      setCurrentSession(null);
      fetchRecordings();
      console.log('Stopped recording');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const recordAction = async (actionType) => {
    if (!currentSession) return;
    
    try {
      await actionReplayAPI.recordStep(currentSession, {
        type: actionType,
        data: { timestamp: Date.now() }
      });
      console.log('Recorded action:', actionType);
    } catch (error) {
      console.error('Error recording action:', error);
    }
  };

  const replaySession = async (sessionId) => {
    try {
      const response = await actionReplayAPI.replay(sessionId, { speed: 1 });
      console.log('Replay completed:', response.data);
      alert('Replay completed successfully!');
    } catch (error) {
      console.error('Error replaying session:', error);
      alert('Replay failed: ' + error.message);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await actionReplayAPI.deleteRecording(sessionId);
      fetchRecordings();
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  return (
    <div className="action-replay">
      <h2>Action Replay</h2>
      
      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="btn-primary">
            Start Recording
          </button>
        ) : (
          <>
            <button onClick={stopRecording} className="btn-danger">
              Stop Recording
            </button>
            <div className="action-buttons">
              <button onClick={() => recordAction('click')}>Record Click</button>
              <button onClick={() => recordAction('type')}>Record Type</button>
              <button onClick={() => recordAction('navigate')}>Record Navigate</button>
            </div>
          </>
        )}
      </div>

      <div className="recordings-list">
        <h3>Recorded Sessions</h3>
        {recordings.length === 0 ? (
          <p>No recordings yet. Start recording to create your first session.</p>
        ) : (
          <ul>
            {recordings.map((recording) => (
              <li key={recording.id} className="recording-item">
                <div className="recording-info">
                  <strong>Session: {recording.id.substring(0, 8)}...</strong>
                  <span>Steps: {recording.steps.length}</span>
                  <span>Status: {recording.status}</span>
                  {recording.duration && (
                    <span>Duration: {recording.duration}ms</span>
                  )}
                </div>
                <div className="recording-actions">
                  <button 
                    onClick={() => replaySession(recording.id)}
                    disabled={recording.status !== 'completed'}
                  >
                    Replay
                  </button>
                  <button 
                    onClick={() => deleteSession(recording.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ActionReplay;
