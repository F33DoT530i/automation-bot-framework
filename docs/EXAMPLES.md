# Usage Examples

## Automation Bot Framework - Examples

⚠️ **LEGAL NOTICE**: All examples must be used in compliance with applicable laws. See [legal/DISCLAIMER.md](legal/DISCLAIMER.md)

## Table of Contents

1. [Interactive Mode](#interactive-mode)
2. [Recording a Session](#recording-a-session)
3. [Replaying a Session](#replaying-a-session)
4. [Programmatic Usage](#programmatic-usage)
5. [Advanced Scenarios](#advanced-scenarios)

## Interactive Mode

### Starting the Application

```bash
cd backend
npm install
npm start
```

### Basic Commands

```
automation-bot> help
automation-bot> start-recording
automation-bot> log-action mouse_click "Clicked submit button"
automation-bot> stop-recording
automation-bot> list-sessions
automation-bot> preview session_1234567890
automation-bot> replay session_1234567890
automation-bot> exit
```

## Recording a Session

### Example 1: Simple Recording

```
automation-bot> start-recording

🎬 Recording started: session_1703174400000
📁 Output directory: /path/to/logs/session_1703174400000

automation-bot> log-action mouse_click "Clicked login button"
✓ Action logged

automation-bot> log-action key_press "Entered username"
✓ Action logged

automation-bot> stop-recording

🛑 Recording stopped: session_1703174400000
💾 Session data saved: /path/to/logs/session_1703174400000/session.json
📊 Statistics:
   - Screenshots: 15
   - Process snapshots: 30
   - Actions logged: 2
```

### Example 2: Recording with Custom Actions

```javascript
// In your application code
const ScreenRecorder = require('./recorder/recorder');
const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');

async function recordUserWorkflow() {
  const recorder = new ScreenRecorder(config, disclaimer);
  
  // Start recording
  const sessionId = await recorder.startRecording();
  console.log(`Recording: ${sessionId}`);
  
  // Log actions as they occur
  recorder.logAction('page_load', { 
    url: 'https://example.com',
    loadTime: 1500 
  });
  
  recorder.logAction('mouse_click', { 
    x: 250, 
    y: 100, 
    element: 'submit-button' 
  });
  
  recorder.logAction('form_submit', { 
    form: 'login-form',
    fields: ['username', 'password']
  });
  
  // Stop recording
  await recorder.stopRecording();
}
```

## Replaying a Session

### Example 3: Preview and Replay

```
automation-bot> list-sessions

📋 Recorded Sessions:

  🎬 session_1703174400000
     Started: 2025-12-21T14:00:00.000Z
     Ended: 2025-12-21T14:15:30.000Z
     Actions: 12, Screenshots: 150

automation-bot> preview session_1703174400000

📋 Session Preview

════════════════════════════════════════════════════════════
Session ID: session_1703174400000
Start Time: 2025-12-21T14:00:00.000Z
End Time: 2025-12-21T14:15:30.000Z
Duration: 15m 30s

Metadata:
  OS: linux 5.15.0
  User: username@mycomputer

Recorded Data:
  📸 Screenshots: 150
  🔄 Process Snapshots: 300
  ⚡ Actions: 12

Action Summary:
  - mouse_click: 5
  - key_press: 4
  - page_load: 2
  - form_submit: 1
════════════════════════════════════════════════════════════

automation-bot> replay session_1703174400000

▶️  Starting replay of session: session_1703174400000

Speed: 1x
Actions to replay: 12

[1/12] mouse_click at 2025-12-21T14:00:05.000Z
  🖱️  Mouse click at (250, 100)
[2/12] key_press at 2025-12-21T14:00:07.000Z
  ⌨️  Key press: Enter
...
[12/12] form_submit at 2025-12-21T14:15:25.000Z
  ℹ️  Custom action: form_submit

✅ Replay completed successfully
```

### Example 4: Programmatic Replay

```javascript
const ActionReplayer = require('./replay/replayer');
const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');

async function replayWithCustomSpeed() {
  const replayer = new ActionReplayer(config, disclaimer);
  
  // Preview first
  await replayer.previewSession('session_1703174400000');
  
  // Replay at 2x speed
  await replayer.replaySession('session_1703174400000', {
    speed: 2.0,
    preview: false
  });
  
  console.log('Replay completed!');
}
```

## Programmatic Usage

### Example 5: Complete Workflow

```javascript
const AutomationFramework = require('./index');
const config = require('./config/config');

async function automatedTest() {
  // Disable interactive prompts for automated scenarios
  config.set('legal.requireAcknowledgment', false);
  config.set('legal.showDisclaimerOnStart', false);
  
  const framework = new AutomationFramework();
  await framework.initialize();
  
  // Start recording
  await framework.recorder.startRecording();
  
  // Simulate user actions
  console.log('Performing automated actions...');
  
  framework.recorder.logAction('navigate', { 
    to: '/dashboard' 
  });
  
  await sleep(1000);
  
  framework.recorder.logAction('click', { 
    element: '#new-item-button' 
  });
  
  await sleep(500);
  
  framework.recorder.logAction('input', { 
    field: 'item-name',
    value: 'Test Item'
  });
  
  await sleep(500);
  
  framework.recorder.logAction('submit', { 
    form: 'new-item-form' 
  });
  
  // Stop recording
  const sessionId = await framework.recorder.stopRecording();
  
  console.log(`Test recorded: ${sessionId}`);
  
  // Replay the test
  await framework.replayer.replaySession(sessionId, {
    speed: 1.5
  });
  
  console.log('Test completed!');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Advanced Scenarios

### Example 6: Error Handling During Replay

```javascript
const ActionReplayer = require('./replay/replayer');
const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');

async function replayWithErrorHandling() {
  // Enable pause on error
  config.set('replay.pauseOnError', true);
  
  const replayer = new ActionReplayer(config, disclaimer);
  
  try {
    await replayer.replaySession('session_1703174400000');
  } catch (error) {
    console.error('Replay failed:', error.message);
    
    // Get status to see where it failed
    const status = replayer.getStatus();
    console.log('Status:', status);
  }
}
```

### Example 7: Custom Configuration

```javascript
const config = require('./config/config');

// Customize recording settings
config.set('recorder.screenshotInterval', 2000); // Screenshot every 2 seconds
config.set('recorder.processInterval', 1000);    // Process snapshot every 1 second
config.set('recorder.outputDir', '/custom/logs'); // Custom output directory

// Customize replay settings
config.set('replay.speed', 0.5);                 // Half speed replay
config.set('replay.previewMode', true);          // Always show preview
config.set('replay.pauseOnError', false);        // Continue on errors

// Save configuration
config.save();

console.log('Configuration saved to config.json');
```

### Example 8: Integration with Testing Framework

```javascript
const ScreenRecorder = require('./recorder/recorder');
const ActionReplayer = require('./replay/replayer');
const config = require('./config/config');
const disclaimer = require('./utils/disclaimer');

// Disable interactive prompts for CI/CD
config.set('legal.requireAcknowledgment', false);
config.set('legal.showDisclaimerOnStart', false);

describe('User Workflow Tests', () => {
  let recorder;
  let replayer;
  
  beforeAll(() => {
    recorder = new ScreenRecorder(config, disclaimer);
    replayer = new ActionReplayer(config, disclaimer);
  });
  
  test('Record and replay user login', async () => {
    // Record the workflow
    const sessionId = await recorder.startRecording();
    
    recorder.logAction('navigate', { url: '/login' });
    recorder.logAction('input', { field: 'username', value: 'testuser' });
    recorder.logAction('input', { field: 'password', value: 'testpass' });
    recorder.logAction('click', { element: '#login-button' });
    recorder.logAction('verify', { element: '#dashboard', visible: true });
    
    await recorder.stopRecording();
    
    // Replay to verify
    await replayer.replaySession(sessionId, { speed: 2.0 });
    
    expect(true).toBe(true); // Add actual assertions
  });
});
```

## Legal Compliance Examples

### Example 9: Ensuring Legal Compliance

```javascript
const disclaimer = require('./utils/disclaimer');
const config = require('./config/config');

async function legallyCompliantRecording() {
  // Always require acknowledgment in production
  config.set('legal.requireAcknowledgment', true);
  config.set('legal.showDisclaimerOnStart', true);
  config.set('legal.logDisclaimerAcceptance', true);
  
  // Display and require acceptance
  const accepted = await disclaimer.requireAcknowledgment();
  
  if (!accepted) {
    console.log('User declined terms. Exiting.');
    process.exit(0);
  }
  
  // Log acceptance for audit trail
  disclaimer.logAcceptance();
  
  // Proceed with recording
  console.log('Terms accepted. Proceeding with authorized recording.');
  
  // Include disclaimer in session data
  const disclaimerData = disclaimer.getDisclaimerForLog();
  console.log('Disclaimer data for logs:', disclaimerData);
}
```

## Best Practices

1. **Always Show Disclaimer**: In production environments, always require user acknowledgment
2. **Log Acceptance**: Keep audit trails of disclaimer acceptance
3. **Secure Storage**: Store recordings in secure locations with appropriate access controls
4. **Minimal Recording**: Only record what is necessary for your use case
5. **Clean Up**: Delete old recordings when no longer needed
6. **Error Handling**: Always use try-catch blocks for recording and replay operations
7. **Preview Before Replay**: Use preview mode to understand what will be replayed

## Notes

- These examples assume proper consent has been obtained
- All recordings should include legal disclaimer metadata
- Users are responsible for compliance with applicable laws
- See [USAGE_GUIDELINES.md](legal/USAGE_GUIDELINES.md) for ethical guidelines

---

⚠️ **REMINDER**: You are solely responsible for lawful and ethical use of this software.
