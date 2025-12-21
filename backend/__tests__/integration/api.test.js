const request = require('supertest');
const app = require('../../src/index');

describe('API Integration Tests', () => {
  let sessionId;

  describe('Monitoring API', () => {
    test('GET /api/monitoring/health should return health status', async () => {
      const response = await request(app)
        .get('/api/monitoring/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('system');
    });

    test('GET /api/monitoring/metrics should return metrics', async () => {
      const response = await request(app)
        .get('/api/monitoring/metrics')
        .expect(200);
      
      expect(response.body).toHaveProperty('actions');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('system');
    });

    test('POST /api/monitoring/record-action should record action', async () => {
      const response = await request(app)
        .post('/api/monitoring/record-action')
        .send({ success: true, executionTime: 100 })
        .expect(200);
      
      expect(response.body.message).toBe('Action recorded successfully');
    });
  });

  describe('Action Replay API', () => {
    test('POST /api/action-replay/start should start recording', async () => {
      const response = await request(app)
        .post('/api/action-replay/start')
        .send({})
        .expect(200);
      
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.status).toBe('recording');
      
      sessionId = response.body.sessionId;
    });

    test('POST /api/action-replay/record/:sessionId should record step', async () => {
      // Start a session first
      const startResponse = await request(app)
        .post('/api/action-replay/start')
        .send({});
      
      sessionId = startResponse.body.sessionId;
      
      const response = await request(app)
        .post(`/api/action-replay/record/${sessionId}`)
        .send({ type: 'click', data: { element: 'button' } })
        .expect(200);
      
      expect(response.body.stepNumber).toBe(1);
      expect(response.body.action).toBe('click');
    });

    test('POST /api/action-replay/stop/:sessionId should stop recording', async () => {
      // Start and record
      const startResponse = await request(app)
        .post('/api/action-replay/start')
        .send({});
      
      sessionId = startResponse.body.sessionId;
      
      await request(app)
        .post(`/api/action-replay/record/${sessionId}`)
        .send({ type: 'click', data: {} });
      
      const response = await request(app)
        .post(`/api/action-replay/stop/${sessionId}`)
        .send({})
        .expect(200);
      
      expect(response.body.status).toBe('completed');
      expect(response.body.steps.length).toBe(1);
    });

    test('GET /api/action-replay/recordings should list all recordings', async () => {
      const response = await request(app)
        .get('/api/action-replay/recordings')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('AI API', () => {
    test('POST /api/ai/analyze should analyze patterns', async () => {
      const actions = [
        { action: 'click', data: {} },
        { action: 'type', data: {} }
      ];
      
      const response = await request(app)
        .post('/api/ai/analyze')
        .send({ actions })
        .expect(200);
      
      expect(response.body).toHaveProperty('patterns');
      expect(Array.isArray(response.body.patterns)).toBe(true);
    });

    test('POST /api/ai/suggestions should generate suggestions', async () => {
      const recordingData = {
        steps: [
          { action: 'click', data: {} },
          { action: 'type', data: {} }
        ],
        duration: 1000
      };
      
      const response = await request(app)
        .post('/api/ai/suggestions')
        .send(recordingData)
        .expect(200);
      
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
    });

    test('POST /api/ai/optimize should optimize workflow', async () => {
      const workflow = {
        steps: [
          { stepNumber: 1, action: 'click', data: {} },
          { stepNumber: 2, action: 'type', data: {} },
          { stepNumber: 3, action: 'click', data: {} }
        ]
      };
      
      const response = await request(app)
        .post('/api/ai/optimize')
        .send(workflow)
        .expect(200);
      
      expect(response.body).toHaveProperty('originalStepCount');
      expect(response.body).toHaveProperty('optimizedStepCount');
      expect(response.body).toHaveProperty('optimizations');
    });

    test('GET /api/ai/patterns should get all patterns', async () => {
      const response = await request(app)
        .get('/api/ai/patterns')
        .expect(200);
      
      expect(response.body).toHaveProperty('patterns');
      expect(Array.isArray(response.body.patterns)).toBe(true);
    });
  });

  describe('Root endpoint', () => {
    test('GET / should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body.name).toBe('Automation Bot Framework API');
      expect(response.body.features).toContain('Monitoring');
      expect(response.body.features).toContain('Action Replay');
      expect(response.body.features).toContain('AI-driven Accelerations');
    });
  });
});
