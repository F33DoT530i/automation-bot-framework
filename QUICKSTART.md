# Quick Start Guide

## Automation Bot Framework - Getting Started

⚠️ **IMPORTANT**: Read the [legal disclaimer](docs/legal/DISCLAIMER.md) before using this software.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/F33DoT530i/automation-bot-framework.git
   cd automation-bot-framework
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Read the legal disclaimer**
   ```bash
   cat ../docs/legal/DISCLAIMER.md
   ```

### Basic Usage

#### Option 1: Interactive Mode (Recommended)

```bash
npm start
```

This will:
1. Display the legal disclaimer
2. Require you to accept the terms
3. Start the interactive CLI

#### Option 2: View Help First

```bash
npm start -- --help
```

#### Option 3: View Disclaimer Only

```bash
npm start -- --disclaimer
```

### First Recording Session

1. **Start the application**
   ```bash
   npm start
   ```

2. **Accept the terms** when prompted

3. **Start recording**
   ```
   automation-bot> start-recording
   ```

4. **Log some actions** (while doing actual work)
   ```
   automation-bot> log-action mouse_click "Clicked on submit button"
   automation-bot> log-action key_press "Pressed Enter key"
   automation-bot> log-action navigation "Navigated to dashboard"
   ```

5. **Stop recording**
   ```
   automation-bot> stop-recording
   ```

6. **List your sessions**
   ```
   automation-bot> list-sessions
   ```

7. **Preview the session**
   ```
   automation-bot> preview session_XXXXXXXXXX
   ```

8. **Replay the session**
   ```
   automation-bot> replay session_XXXXXXXXXX
   ```

### Configuration

Create a `config.json` file in the backend directory to customize settings:

```json
{
  "recorder": {
    "outputDir": "./logs",
    "captureScreenshots": true,
    "screenshotInterval": 2000
  },
  "replay": {
    "previewMode": true,
    "speed": 1.0
  }
}
```

See [config.example.json](backend/config.example.json) for all available options.

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Legal Compliance Checklist

Before using this software, ensure:

- [ ] You have read and understood the [legal disclaimer](docs/legal/DISCLAIMER.md)
- [ ] You have reviewed the [usage guidelines](docs/legal/USAGE_GUIDELINES.md)
- [ ] You understand the laws applicable in your jurisdiction
- [ ] You have or will obtain proper consent before recording
- [ ] You will use this software only for lawful and ethical purposes
- [ ] You accept full responsibility for your use of this software

### Next Steps

1. Read the complete [API documentation](docs/API.md)
2. Review the [usage examples](docs/EXAMPLES.md)
3. Understand the [legal guidelines](docs/legal/USAGE_GUIDELINES.md)
4. Start with simple, personal recordings to learn the system

### Support

For questions or issues:
- Review the documentation in the `docs/` directory
- Check the examples in [EXAMPLES.md](docs/EXAMPLES.md)
- Visit the GitHub repository

### Remember

**You are solely responsible for lawful and ethical use of this software.**

The tool is neutral - it can be used for good or ill. Choose wisely and always comply with applicable laws and ethical standards.
