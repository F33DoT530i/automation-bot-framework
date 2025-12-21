#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('🤖 Automation Bot Framework - Feature Demo\n');
  console.log('=' .repeat(60));

  try {
    // Test root endpoint
    console.log('\n📍 Testing API availability...');
    const root = await axios.get('http://localhost:3001/');
    console.log(`✓ API Name: ${root.data.name}`);
    console.log(`✓ Features: ${root.data.features.join(', ')}`);

    // 1. Monitoring Feature
    console.log('\n📊 MONITORING FEATURE');
    console.log('=' .repeat(60));
    
    console.log('\n1. Recording some actions...');
    for (let i = 0; i < 5; i++) {
      await axios.post(`${API_URL}/monitoring/record-action`, {
        success: Math.random() > 0.2,
        executionTime: Math.floor(Math.random() * 200) + 50
      });
      console.log(`  ✓ Action ${i + 1} recorded`);
    }

    console.log('\n2. Checking system health...');
    const health = await axios.get(`${API_URL}/monitoring/health`);
    console.log(`  ✓ Status: ${health.data.status}`);
    console.log(`  ✓ Success Rate: ${health.data.system.successRate}%`);
    console.log(`  ✓ Uptime: ${Math.floor(health.data.system.uptime / 1000)}s`);

    console.log('\n3. Getting metrics...');
    const metrics = await axios.get(`${API_URL}/monitoring/metrics`);
    console.log(`  ✓ Total Actions: ${metrics.data.actions.total}`);
    console.log(`  ✓ Successful: ${metrics.data.actions.successful}`);
    console.log(`  ✓ Failed: ${metrics.data.actions.failed}`);
    console.log(`  ✓ Avg Execution Time: ${Math.round(metrics.data.performance.averageExecutionTime)}ms`);

    // 2. Action Replay Feature
    console.log('\n▶️  ACTION REPLAY FEATURE');
    console.log('=' .repeat(60));

    console.log('\n1. Starting a recording session...');
    const startRes = await axios.post(`${API_URL}/action-replay/start`);
    const sessionId = startRes.data.sessionId;
    console.log(`  ✓ Session ID: ${sessionId.substring(0, 8)}...`);

    console.log('\n2. Recording actions...');
    const actions = [
      { type: 'click', data: { element: 'button#login' } },
      { type: 'type', data: { field: 'username', text: 'demo' } },
      { type: 'type', data: { field: 'password', text: '****' } },
      { type: 'click', data: { element: 'button#submit' } },
      { type: 'navigate', data: { url: '/dashboard' } }
    ];

    for (const action of actions) {
      await axios.post(`${API_URL}/action-replay/record/${sessionId}`, action);
      console.log(`  ✓ Recorded: ${action.type} - ${JSON.stringify(action.data)}`);
    }

    console.log('\n3. Stopping recording...');
    const recording = await axios.post(`${API_URL}/action-replay/stop/${sessionId}`);
    console.log(`  ✓ Recording completed`);
    console.log(`  ✓ Total steps: ${recording.data.steps.length}`);
    console.log(`  ✓ Duration: ${recording.data.duration}ms`);

    console.log('\n4. Replaying the session...');
    const playback = await axios.post(`${API_URL}/action-replay/replay/${sessionId}`, {
      speed: 1,
      skipErrors: false
    });
    console.log(`  ✓ Replay completed`);
    console.log(`  ✓ Steps executed: ${playback.data.executedSteps.length}`);
    console.log(`  ✓ Status: ${playback.data.status}`);

    // 3. AI-Driven Accelerations
    console.log('\n🧠 AI-DRIVEN ACCELERATIONS');
    console.log('=' .repeat(60));

    console.log('\n1. Analyzing patterns...');
    const patternActions = [
      { action: 'click', data: {} },
      { action: 'type', data: {} },
      { action: 'submit', data: {} },
      { action: 'click', data: {} },
      { action: 'type', data: {} },
      { action: 'submit', data: {} }
    ];
    
    const patterns = await axios.post(`${API_URL}/ai/analyze`, { actions: patternActions });
    console.log(`  ✓ Patterns detected: ${patterns.data.patterns.length}`);
    
    if (patterns.data.patterns.length > 0) {
      patterns.data.patterns.forEach((p, i) => {
        console.log(`    ${i + 1}. Pattern: ${p.id}`);
        console.log(`       Occurrences: ${p.occurrences}`);
        console.log(`       Time Saving: ${p.potentialTimeSaving}ms`);
      });
    }

    console.log('\n2. Generating AI suggestions...');
    const suggestions = await axios.post(`${API_URL}/ai/suggestions`, recording.data);
    console.log(`  ✓ Suggestions generated: ${suggestions.data.suggestions.length}`);
    
    suggestions.data.suggestions.forEach((s, i) => {
      console.log(`\n    Suggestion ${i + 1}: ${s.title}`);
      console.log(`    Priority: ${s.priority}`);
      console.log(`    Description: ${s.description}`);
      console.log(`    Impact: ${s.impact}`);
    });

    console.log('\n3. Optimizing workflow...');
    const workflow = {
      steps: [
        { stepNumber: 1, action: 'read', data: { file: 'a.txt' } },
        { stepNumber: 2, action: 'read', data: { file: 'b.txt' } },
        { stepNumber: 3, action: 'read', data: { file: 'c.txt' } },
        { stepNumber: 4, action: 'write', data: { file: 'd.txt' } },
        { stepNumber: 5, action: 'read', data: { file: 'a.txt' } }  // duplicate
      ]
    };

    const optimized = await axios.post(`${API_URL}/ai/optimize`, workflow);
    console.log(`  ✓ Original steps: ${optimized.data.originalStepCount}`);
    console.log(`  ✓ Optimized steps: ${optimized.data.optimizedStepCount}`);
    console.log(`  ✓ Optimizations applied: ${optimized.data.optimizations.length}`);
    
    optimized.data.optimizations.forEach((opt, i) => {
      console.log(`    ${i + 1}. ${opt.type}: ${opt.reason}`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Demo completed successfully!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Error during demo:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if server is running
axios.get('http://localhost:3001/')
  .then(() => {
    demo();
  })
  .catch(() => {
    console.error('❌ Backend server is not running!');
    console.error('Please start the server first:');
    console.error('  cd backend && npm start');
    process.exit(1);
  });
