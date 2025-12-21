import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const monitoringAPI = {
  getHealth: () => axios.get(`${API_BASE_URL}/monitoring/health`),
  getMetrics: () => axios.get(`${API_BASE_URL}/monitoring/metrics`),
  recordAction: (success, executionTime) => 
    axios.post(`${API_BASE_URL}/monitoring/record-action`, { success, executionTime })
};

export const actionReplayAPI = {
  startRecording: (sessionId) => 
    axios.post(`${API_BASE_URL}/action-replay/start`, { sessionId }),
  recordStep: (sessionId, action) => 
    axios.post(`${API_BASE_URL}/action-replay/record/${sessionId}`, action),
  stopRecording: (sessionId) => 
    axios.post(`${API_BASE_URL}/action-replay/stop/${sessionId}`),
  getRecordings: () => 
    axios.get(`${API_BASE_URL}/action-replay/recordings`),
  getRecording: (sessionId) => 
    axios.get(`${API_BASE_URL}/action-replay/recordings/${sessionId}`),
  replay: (sessionId, options) => 
    axios.post(`${API_BASE_URL}/action-replay/replay/${sessionId}`, options),
  deleteRecording: (sessionId) => 
    axios.delete(`${API_BASE_URL}/action-replay/recordings/${sessionId}`)
};

export const aiAPI = {
  analyzePatterns: (actions) => 
    axios.post(`${API_BASE_URL}/ai/analyze`, { actions }),
  generateSuggestions: (recordingData) => 
    axios.post(`${API_BASE_URL}/ai/suggestions`, recordingData),
  predictNextAction: (currentSequence) => 
    axios.post(`${API_BASE_URL}/ai/predict`, { currentSequence }),
  optimizeWorkflow: (workflow) => 
    axios.post(`${API_BASE_URL}/ai/optimize`, workflow),
  getPatterns: () => 
    axios.get(`${API_BASE_URL}/ai/patterns`),
  getSuggestions: () => 
    axios.get(`${API_BASE_URL}/ai/suggestions`)
};
