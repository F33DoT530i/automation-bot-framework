# Backend - Automation Bot Framework

## Dependencies

### Current Implementation
The current implementation uses **only Node.js built-in modules**:
- `fs` - File system operations
- `path` - Path manipulation
- `os` - Operating system information
- `readline` - Interactive CLI

This keeps the core lightweight and portable without external dependencies.

### Optional Dependencies for Production

For full production functionality, consider installing these optional dependencies:

#### Screen Capture
- **screenshot-desktop** - Cross-platform screenshot capture
  ```bash
  npm install screenshot-desktop
  ```

#### Mouse/Keyboard Control
- **robotjs** - Native Node.js desktop automation
  ```bash
  npm install robotjs
  ```
  Note: Requires native compilation and platform-specific build tools

#### Process Monitoring
- **ps-list** - Get running processes
  ```bash
  npm install ps-list
  ```

### Development Dependencies
- **jest** - Testing framework
- **eslint** - Code linting

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## Testing

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration management
│   ├── recorder/     # Screen recording functionality
│   ├── replay/       # Action replay system
│   ├── utils/        # Utilities (disclaimer, etc.)
│   └── index.js      # Main entry point
├── tests/
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
└── logs/             # Recording output (created at runtime)
```

## Legal Notice

⚠️ **This software includes screen recording and process logging capabilities. Users must comply with all applicable laws and obtain proper consent. See [../docs/legal/DISCLAIMER.md](../docs/legal/DISCLAIMER.md) for complete terms.**
