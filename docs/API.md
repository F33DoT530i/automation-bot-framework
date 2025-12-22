# API Documentation

## Automation Bot Framework API

### Overview

The Automation Bot Framework provides APIs for screen recording, process logging, and action replay functionality.

⚠️ **LEGAL NOTICE**: All APIs must be used in compliance with applicable laws. See [DISCLAIMER.md](legal/DISCLAIMER.md)

## Configuration API

### Config Module

```javascript
const config = require('./config/config');

// Get configuration value
const outputDir = config.get('recorder.outputDir');

// Set configuration value
config.set('recorder.enabled', true);

// Save configuration to file
config.save();
```

### Configuration Options

```json
{
  "recorder": {
    "enabled": false,
    "outputDir": "./logs",
    "format": "json",
    "captureScreenshots": true,
    "captureProcesses": true,
    "screenshotInterval": 1000,
    "processInterval": 500
  },
  "replay": {
    "enabled": false,
    "previewMode": true,
    "speed": 1.0,
    "pauseOnError": true
  },
  "legal": {
    "requireAcknowledgment": true,
    "showDisclaimerOnStart": true,
    "logDisclaimerAcceptance": true
  }
}
```

## Recording API

### ScreenRecorder Class

```javascript
const ScreenRecorder = require('./recorder/recorder');
const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');

const recorder = new ScreenRecorder(config, disclaimer);
```

#### Methods

##### startRecording()
Starts a new recording session.

```javascript
const sessionId = await recorder.startRecording();
console.log(`Recording started: ${sessionId}`);
```

**Returns**: `Promise<string>` - Session ID

##### stopRecording()
Stops the current recording session.

```javascript
const sessionId = await recorder.stopRecording();
console.log(`Recording stopped: ${sessionId}`);
```

**Returns**: `Promise<string>` - Session ID

##### logAction(actionType, details)
Logs a custom action during recording.

```javascript
recorder.logAction('mouse_click', { x: 100, y: 200, button: 'left' });
recorder.logAction('key_press', { key: 'Enter' });
recorder.logAction('custom', { description: 'User logged in' });
```

**Parameters**:
- `actionType` (string): Type of action
- `details` (object): Action details

##### getStatus()
Returns current recording status.

```javascript
const status = recorder.getStatus();
// {
//   isRecording: true,
//   sessionId: "session_1234567890",
//   screenshotCount: 45,
//   processSnapshotCount: 90,
//   actionCount: 12
// }
```

**Returns**: `object` - Status information

## Replay API

### ActionReplayer Class

```javascript
const ActionReplayer = require('./replay/replayer');
const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');

const replayer = new ActionReplayer(config, disclaimer);
```

#### Methods

##### loadSession(sessionId)
Loads a recorded session.

```javascript
const session = await replayer.loadSession('session_1234567890');
```

**Parameters**:
- `sessionId` (string): Session ID to load

**Returns**: `Promise<object>` - Session data

##### previewSession(sessionId)
Previews a session without replaying.

```javascript
await replayer.previewSession('session_1234567890');
```

**Parameters**:
- `sessionId` (string): Session ID to preview

**Returns**: `Promise<object>` - Session data

##### replaySession(sessionId, options)
Replays a recorded session.

```javascript
await replayer.replaySession('session_1234567890', {
  speed: 1.5,      // 1.5x speed
  preview: false   // Skip preview
});
```

**Parameters**:
- `sessionId` (string): Session ID to replay
- `options` (object): Replay options
  - `speed` (number): Playback speed multiplier (default: 1.0)
  - `preview` (boolean): Show preview only (default: false)

**Returns**: `Promise<void>`

##### pause()
Pauses current replay.

```javascript
replayer.pause();
```

##### resume()
Resumes paused replay.

```javascript
replayer.resume();
```

##### stop()
Stops current replay.

```javascript
replayer.stop();
```

##### getStatus()
Returns current replay status.

```javascript
const status = replayer.getStatus();
// {
//   isReplaying: true,
//   isPaused: false,
//   sessionId: "session_1234567890"
// }
```

**Returns**: `object` - Status information

## Legal Disclaimer API

### Disclaimer Module

```javascript
const disclaimer = require('./utils/disclaimer');
```

#### Methods

##### display()
Displays the legal disclaimer.

```javascript
await disclaimer.display();
```

##### requireAcknowledgment()
Requires user to accept terms.

```javascript
const accepted = await disclaimer.requireAcknowledgment();
if (!accepted) {
  process.exit(0);
}
```

**Returns**: `Promise<boolean>` - True if accepted

##### getDisclaimerForLog()
Gets disclaimer text for inclusion in logs.

```javascript
const disclaimerData = disclaimer.getDisclaimerForLog();
```

**Returns**: `object` - Disclaimer metadata

## Session Data Format

### Session JSON Structure

```json
{
  "sessionId": "session_1234567890",
  "startTime": "2025-12-21T14:00:00.000Z",
  "endTime": "2025-12-21T14:15:30.000Z",
  "metadata": {
    "os": "linux",
    "osVersion": "5.15.0",
    "hostname": "mycomputer",
    "user": "username",
    "nodeVersion": "v16.0.0"
  },
  "legal": {
    "disclaimer": "This recording was made using automation-bot-framework.",
    "legal_notice": "User is solely responsible for lawful and ethical use.",
    "warning": "Unauthorized recording may result in legal consequences."
  },
  "screenshots": [
    {
      "timestamp": "2025-12-21T14:00:01.000Z",
      "index": 0,
      "path": "./logs/session_1234567890/screenshot_0.png"
    }
  ],
  "processes": [
    {
      "timestamp": "2025-12-21T14:00:00.500Z",
      "processes": {
        "count": 150,
        "foreground": [],
        "background": []
      }
    }
  ],
  "actions": [
    {
      "timestamp": "2025-12-21T14:00:05.000Z",
      "type": "mouse_click",
      "details": {
        "x": 100,
        "y": 200,
        "button": "left"
      },
      "index": 0
    }
  ]
}
```

## Error Handling

All API methods may throw errors. Always use try-catch blocks:

```javascript
try {
  await recorder.startRecording();
} catch (error) {
  console.error('Error:', error.message);
}
```

## Legal Compliance

⚠️ **REMINDER**: All API usage must comply with:
- Applicable laws and regulations
- Privacy requirements (GDPR, CCPA, etc.)
- Consent requirements
- Ethical standards

See [DISCLAIMER.md](legal/DISCLAIMER.md) and [USAGE_GUIDELINES.md](legal/USAGE_GUIDELINES.md) for complete information.
