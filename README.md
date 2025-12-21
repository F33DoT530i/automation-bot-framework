# Automation Bot Framework

A comprehensive framework for AI-assisted automation with screen recording and process logging capabilities.

## ⚠️ LEGAL DISCLAIMER - READ BEFORE USE ⚠️

**IMPORTANT**: This software includes screen recording and process logging functionality. Use of these features is subject to strict legal and ethical requirements.

**BY USING THIS SOFTWARE, YOU AGREE TO:**
- Comply with ALL applicable laws and regulations
- Obtain proper consent before recording
- Take FULL RESPONSIBILITY for your use of this software
- Use this software ONLY for lawful and ethical purposes

**F33DoT530i and all contributors are NOT responsible for any misuse, illegal activity, or unethical use of this software.**

📄 **Read the complete legal disclaimer**: [docs/legal/DISCLAIMER.md](docs/legal/DISCLAIMER.md)  
📋 **Review usage guidelines**: [docs/legal/USAGE_GUIDELINES.md](docs/legal/USAGE_GUIDELINES.md)

**IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS SOFTWARE.**

---

## Features

### Core Functionality
- **Triggered Screen Recording**: Records screen actions only when explicitly triggered
- **Process Logging**: Logs foreground and background processes in structured JSON format
- **Action Replay**: Emulates and replays logged actions with high precision
- **Preview Mode**: Review actions before playback
- **Metadata Capture**: Comprehensive logging for accurate replication

### Legal & Ethical Safeguards
- Built-in legal disclaimers and warnings
- Usage guidelines and best practices
- CLI help menus with legal warnings
- Automatic disclaimer inclusion in logs

## Installation

```bash
cd backend
npm install
```

## Quick Start

```bash
# Start the automation framework
npm start

# View help and legal disclaimer
npm start -- --help
```

## Documentation

- [Legal Disclaimer](docs/legal/DISCLAIMER.md)
- [Usage Guidelines](docs/legal/USAGE_GUIDELINES.md)
- [API Documentation](docs/API.md)
- [Examples](docs/EXAMPLES.md)

## Project Structure

```
automation-bot-framework/
├── backend/           # Core automation engine
│   ├── src/
│   │   ├── recorder/  # Screen recording functionality
│   │   ├── replay/    # Action replay system
│   │   ├── config/    # Configuration management
│   │   └── utils/     # Utility functions
│   └── tests/         # Test suite
├── docs/              # Documentation
│   └── legal/         # Legal documents and guidelines
└── logs/              # Recorded actions and logs
```

## Legal and Ethical Use

This software is a tool that can be used for both beneficial and harmful purposes. The responsibility for lawful and ethical use rests entirely with you, the user.

### Acceptable Use
- Personal productivity tracking (self-recording)
- Authorized software testing
- Educational demonstrations (with consent)
- Authorized workplace monitoring (with proper disclosure)

### Prohibited Use
- Unauthorized surveillance
- Recording without consent
- Privacy violations
- Any illegal or unethical activity

**For complete guidelines, see [USAGE_GUIDELINES.md](docs/legal/USAGE_GUIDELINES.md)**

## License

This project is released into the public domain under the Unlicense. See [LICENSE](LICENSE) for details.

## Disclaimer Reminder

⚠️ **F33DoT530i and all project contributors provide this software "AS IS" and disclaim all liability for any misuse, illegal activity, or damages resulting from use of this software. Users assume all responsibility for compliance with applicable laws and ethical standards.** ⚠️