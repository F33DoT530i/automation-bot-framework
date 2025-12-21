# 🤖 Automation Bot Framework

A comprehensive automation framework featuring **monitoring**, **action-replay**, **AI-driven accelerations**, and **testing** capabilities.

## ✨ Features

### 📊 Monitoring
- **Real-time metrics tracking** - Monitor action success rates, execution times, and system health
- **Health checks** - Automated health monitoring for database, memory, and system components
- **Performance analytics** - Track average execution times and identify bottlenecks
- **System uptime tracking** - Monitor system availability and reliability

### ▶️ Action Replay
- **Session recording** - Record sequences of actions for replay
- **Step-by-step execution** - Record individual actions with metadata
- **Replay mechanism** - Replay recorded sessions with configurable speed
- **Session management** - Store, retrieve, and delete recording sessions
- **Playback history** - Track replay executions and results

### 🧠 AI-Driven Accelerations
- **Pattern detection** - Automatically identify repeated action sequences
- **Smart suggestions** - Get AI-powered recommendations for workflow optimization
- **Action prediction** - Predict next likely actions based on patterns
- **Workflow optimization** - Remove redundant steps and identify parallelizable operations
- **Time-saving estimates** - Calculate potential time savings from automation

### 🧪 Testing
- **Unit tests** - Comprehensive unit test coverage for all services
- **Integration tests** - End-to-end API testing
- **Frontend tests** - React component testing with Jest and React Testing Library
- **CI/CD integration** - Automated testing via GitHub Actions

## 🏗️ Architecture

```
automation-bot-framework/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── services/       # Core business logic
│   │   │   ├── monitoring.js      # Monitoring service
│   │   │   ├── actionReplay.js    # Action replay service
│   │   │   └── aiAcceleration.js  # AI acceleration service
│   │   ├── routes/         # API endpoints
│   │   ├── utils/          # Utilities and helpers
│   │   └── index.js        # Server entry point
│   └── __tests__/          # Test suites
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   └── App.jsx         # Main application
│   └── public/             # Static assets
└── .github/workflows/      # CI/CD pipelines

```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### Running the Demo

To see all features in action:

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. In a new terminal, run the demo:
   ```bash
   npm run demo
   ```

This will demonstrate monitoring, action replay, and AI-driven accelerations features.

## 📡 API Endpoints

### Monitoring API (`/api/monitoring`)

- `GET /health` - Get system health status and checks
- `GET /metrics` - Get current metrics (actions, performance, system)
- `POST /record-action` - Record an action execution

### Action Replay API (`/api/action-replay`)

- `POST /start` - Start a new recording session
- `POST /record/:sessionId` - Record a step in the session
- `POST /stop/:sessionId` - Stop recording
- `GET /recordings` - List all recordings
- `GET /recordings/:sessionId` - Get specific recording
- `POST /replay/:sessionId` - Replay a recorded session
- `DELETE /recordings/:sessionId` - Delete a recording

### AI API (`/api/ai`)

- `POST /analyze` - Analyze action patterns
- `POST /suggestions` - Generate optimization suggestions
- `POST /predict` - Predict next action
- `POST /optimize` - Optimize a workflow
- `GET /patterns` - Get detected patterns
- `GET /suggestions` - Get all suggestions

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration  # Run integration tests only
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 Usage Examples

### Recording and Replaying Actions

```javascript
// Start recording
const response = await fetch('http://localhost:3001/api/action-replay/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { sessionId } = await response.json();

// Record actions
await fetch(`http://localhost:3001/api/action-replay/record/${sessionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'click',
    data: { element: 'button#submit' }
  })
});

// Stop recording
await fetch(`http://localhost:3001/api/action-replay/stop/${sessionId}`, {
  method: 'POST'
});

// Replay the session
await fetch(`http://localhost:3001/api/action-replay/replay/${sessionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ speed: 1, skipErrors: false })
});
```

### Getting AI Suggestions

```javascript
const recordingData = {
  steps: [
    { action: 'click', data: { element: 'btn1' } },
    { action: 'type', data: { text: 'hello' } },
    // ... more steps
  ],
  duration: 5000
};

const response = await fetch('http://localhost:3001/api/ai/suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(recordingData)
});

const { suggestions } = await response.json();
console.log(suggestions);
```

### Monitoring System Health

```javascript
const response = await fetch('http://localhost:3001/api/monitoring/health');
const health = await response.json();
console.log(`System status: ${health.status}`);
console.log(`Success rate: ${health.system.successRate}%`);
```

## 🔧 Configuration

### Backend Configuration

Set environment variables:
- `PORT` - Server port (default: 3001)

### Frontend Configuration

Set environment variables:
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Add database persistence for recordings
- [ ] Implement WebSocket for real-time monitoring
- [ ] Add user authentication and authorization
- [ ] Expand AI capabilities with machine learning models
- [ ] Add more action types and integrations
- [ ] Create mobile app for monitoring
- [ ] Add export/import functionality for recordings
- [ ] Implement distributed execution support

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.