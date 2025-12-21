# Automation Bot Framework

An AI-powered automation assistant that learns from user interactions and can replay or predict user behavior patterns.

## Features

### 1. Monitor User Behavior
- Track user interactions including mouse movements, clicks, and keystrokes
- Record context information such as active applications and window titles
- Capture accurate timestamps and metadata

### 2. Record Interactions
- Save interaction data in structured JSON format
- Automatically anonymize sensitive data like passwords
- Include comprehensive metadata (screen resolution, OS info, device details)

### 3. Replay Interactions
- Playback recorded interactions with adjustable speed
- Support for selective interaction replay (filter by type)
- Preview interactions before playback

### 4. AI/ML Integration
- Train machine learning models to predict user behavior patterns
- Use supervised learning with scikit-learn
- Save and load trained models for reuse

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Install from source

```bash
git clone https://github.com/F33DoT530i/automation-bot-framework.git
cd automation-bot-framework
pip install -e .
```

### Install dependencies

```bash
pip install -r requirements.txt
```

## Quick Start

### Recording Interactions

Record user interactions for 60 seconds:

```bash
automation-bot record --duration 60
```

Record with custom output directory:

```bash
automation-bot record --duration 120 --output-dir ./my_recordings
```

### List Recordings

View all recorded sessions:

```bash
automation-bot list
```

### Playback Recordings

Playback a recorded session at normal speed:

```bash
automation-bot playback recorded_data/recording_<session-id>.json
```

Playback at 2x speed:

```bash
automation-bot playback recorded_data/recording_<session-id>.json --speed 2.0
```

Preview interactions before playback:

```bash
automation-bot playback recorded_data/recording_<session-id>.json --preview 10
```

### Train ML Model

Train a model on recorded data:

```bash
automation-bot train --data-dir recorded_data --model-name my_model
```

Show feature importance after training:

```bash
automation-bot train --show-features
```

### Predict Next Interaction

Use a trained model to predict the next interaction:

```bash
automation-bot predict recorded_data/recording_<session-id>.json --model-name my_model
```

## Python API Usage

### Recording Example

```python
from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
import time

# Initialize recorder and monitor
recorder = InteractionRecorder(output_dir="recorded_data")
monitor = InteractionMonitor(
    callback=recorder.record_interaction,
    anonymize_keys=True
)

# Start recording
recorder.start_session()
monitor.start()

# Record for 30 seconds
time.sleep(30)

# Stop and save
monitor.stop()
filepath = recorder.end_session()
print(f"Recording saved to: {filepath}")
```

### Playback Example

```python
from automation_bot.recording import InteractionRecorder
from automation_bot.playback import InteractionPlayer

# Load recording
recorder = InteractionRecorder()
recording = recorder.load_recording("recorded_data/recording_xyz.json")

# Create player and playback
player = InteractionPlayer(speed=1.0)
player.play(recording)
```

### ML Training Example

```python
from automation_bot.recording import InteractionRecorder
from automation_bot.ml import BehaviorPredictor

# Load recordings
recorder = InteractionRecorder(output_dir="recorded_data")
recordings = []
for filepath in recorder.list_recordings():
    recordings.append(recorder.load_recording(filepath))

# Train model
predictor = BehaviorPredictor(model_path="models")
metrics = predictor.train(recordings)
print(f"Test accuracy: {metrics['test_accuracy']:.2%}")

# Save model
predictor.save_model(name="my_model")
```

### Prediction Example

```python
from automation_bot.ml import BehaviorPredictor

# Load trained model
predictor = BehaviorPredictor(model_path="models")
predictor.load_model(name="my_model")

# Predict next interaction
recent_interactions = [...]  # Your recent interactions
prediction = predictor.predict_next_interaction(recent_interactions)
print(f"Next action: {prediction['type']} (confidence: {prediction['confidence']:.2%})")
```

## Data Schema

Interactions are stored in JSON format with the following structure:

```json
{
  "session_id": "unique-session-identifier",
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-01-01T00:01:00Z",
  "metadata": {
    "screen_resolution": {"width": 1920, "height": 1080},
    "os_info": {"platform": "Linux", "version": "5.0"},
    "device_name": "hostname",
    "user_id": "anonymized"
  },
  "interactions": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "type": "mouse_click",
      "data": {
        "x": 100,
        "y": 200,
        "button": "left"
      },
      "context": {
        "active_app": "browser",
        "window_title": "My Window"
      }
    }
  ]
}
```

## Architecture

```
automation-bot-framework/
├── src/automation_bot/
│   ├── monitoring/        # User interaction monitoring
│   ├── recording/         # Data recording and persistence
│   ├── playback/          # Interaction replay engine
│   ├── ml/                # Machine learning models
│   └── schema/            # JSON schema definitions
├── tests/                 # Unit and integration tests
├── docs/                  # Additional documentation
├── examples/              # Example scripts
└── recorded_data/         # Recorded interaction data
```

## Testing

Run all tests:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=automation_bot --cov-report=html
```

Run specific test file:

```bash
pytest tests/test_recorder.py
```

## Development

### Setting up development environment

```bash
# Clone repository
git clone https://github.com/F33DoT530i/automation-bot-framework.git
cd automation-bot-framework

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e .
pip install -r requirements.txt
```

### Running linters

```bash
# Format code with black
black src/ tests/

# Check code style with flake8
flake8 src/ tests/

# Type checking with mypy
mypy src/
```

## CI/CD

The project includes GitHub Actions workflows for:
- Frontend linting and testing
- Backend unit and integration tests
- Automated deployment

## Privacy and Security

- **Sensitive Data Anonymization**: Keyboard input in password fields and similar contexts is automatically anonymized
- **Local Storage**: All data is stored locally by default
- **No External Transmission**: The framework does not transmit data externally unless explicitly configured

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Permission Issues
On Linux/macOS, you may need to grant accessibility permissions for the application to monitor keyboard and mouse events.

### Import Errors
Make sure you've installed the package:
```bash
pip install -e .
```

### Model Training Errors
Ensure you have at least 3 recordings with sufficient interactions (10+ interactions per recording) for training.

## Roadmap

- [ ] Deep learning models (LSTM, Transformer)
- [ ] Web-based dashboard for visualization
- [ ] Multi-monitor support
- [ ] Cloud storage integration
- [ ] Real-time behavior prediction
- [ ] Custom automation scripting language

## Support

For issues, questions, or contributions, please open an issue on GitHub.