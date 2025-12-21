# API Documentation

## Base URL
`http://localhost:3001/api`

## Monitoring API

### GET /monitoring/health
Get system health status and health checks.

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection active"
    },
    "memory": {
      "status": "healthy",
      "message": "Heap: 50MB / 100MB",
      "details": {
        "heapUsedMB": 50,
        "heapTotalMB": 100
      }
    }
  },
  "system": {
    "status": "healthy",
    "uptime": 120000,
    "successRate": "95.00",
    "metrics": { ... }
  }
}
```

### GET /monitoring/metrics
Get current system metrics.

**Response:**
```json
{
  "actions": {
    "total": 100,
    "successful": 95,
    "failed": 5
  },
  "performance": {
    "averageExecutionTime": 150,
    "executionTimes": [100, 200, 150]
  },
  "system": {
    "uptime": 120000,
    "startTime": 1640000000000
  },
  "timestamp": "2025-12-21T14:00:00.000Z"
}
```

### POST /monitoring/record-action
Record an action execution.

**Request Body:**
```json
{
  "success": true,
  "executionTime": 150
}
```

**Response:**
```json
{
  "message": "Action recorded successfully"
}
```

## Action Replay API

### POST /action-replay/start
Start a new recording session.

**Request Body (optional):**
```json
{
  "sessionId": "custom-session-id"
}
```

**Response:**
```json
{
  "sessionId": "uuid-v4-generated-id",
  "status": "recording"
}
```

### POST /action-replay/record/:sessionId
Record a step in the session.

**Request Body:**
```json
{
  "type": "click",
  "data": {
    "element": "button#submit"
  },
  "metadata": {
    "optional": "metadata"
  }
}
```

**Response:**
```json
{
  "stepNumber": 1,
  "timestamp": 1640000000000,
  "action": "click",
  "data": {
    "element": "button#submit"
  },
  "metadata": {}
}
```

### POST /action-replay/stop/:sessionId
Stop recording a session.

**Response:**
```json
{
  "id": "session-id",
  "steps": [...],
  "startTime": 1640000000000,
  "endTime": 1640000010000,
  "duration": 10000,
  "status": "completed"
}
```

### GET /action-replay/recordings
Get all recordings.

**Response:**
```json
[
  {
    "id": "session-id-1",
    "steps": [...],
    "status": "completed",
    "duration": 5000
  },
  ...
]
```

### GET /action-replay/recordings/:sessionId
Get a specific recording.

**Response:**
```json
{
  "id": "session-id",
  "steps": [...],
  "startTime": 1640000000000,
  "status": "completed"
}
```

### POST /action-replay/replay/:sessionId
Replay a recorded session.

**Request Body (optional):**
```json
{
  "speed": 1,
  "skipErrors": false
}
```

**Response:**
```json
{
  "id": "playback-id",
  "recordingId": "session-id",
  "startTime": 1640000000000,
  "endTime": 1640000010000,
  "duration": 10000,
  "status": "completed",
  "executedSteps": [...],
  "options": {
    "speed": 1,
    "skipErrors": false
  }
}
```

### DELETE /action-replay/recordings/:sessionId
Delete a recording.

**Response:**
```json
{
  "message": "Recording deleted successfully"
}
```

## AI API

### POST /ai/analyze
Analyze action patterns.

**Request Body:**
```json
{
  "actions": [
    { "action": "click", "data": { ... } },
    { "action": "type", "data": { ... } }
  ]
}
```

**Response:**
```json
{
  "patterns": [
    {
      "id": "click->type",
      "sequence": [...],
      "occurrences": 3,
      "potentialTimeSaving": 2900
    }
  ]
}
```

### POST /ai/suggestions
Generate optimization suggestions.

**Request Body:**
```json
{
  "steps": [...],
  "duration": 5000
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "type": "pattern_automation",
      "priority": "high",
      "title": "Repeated Action Pattern Detected",
      "description": "The sequence appears 3 times...",
      "impact": "Potential time saving: 2900ms per occurrence"
    }
  ]
}
```

### POST /ai/predict
Predict next action.

**Request Body:**
```json
{
  "currentSequence": [
    { "action": "click" },
    { "action": "type" }
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "action": { "action": "submit" },
      "confidence": 0.85,
      "reason": "Matches pattern: click->type->submit"
    }
  ]
}
```

### POST /ai/optimize
Optimize a workflow.

**Request Body:**
```json
{
  "steps": [
    { "stepNumber": 1, "action": "click", "data": {} },
    { "stepNumber": 2, "action": "type", "data": {} }
  ]
}
```

**Response:**
```json
{
  "originalStepCount": 5,
  "optimizedStepCount": 3,
  "optimizations": [
    {
      "type": "redundancy_removed",
      "step": 4,
      "reason": "Duplicate action detected"
    }
  ],
  "optimizedWorkflow": { ... }
}
```

### GET /ai/patterns
Get all detected patterns.

**Response:**
```json
{
  "patterns": [...]
}
```

### GET /ai/suggestions
Get all suggestions.

**Response:**
```json
{
  "suggestions": [...]
}
```
