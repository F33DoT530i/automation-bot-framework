# API Documentation

## Core Modules

### automation_bot.monitoring

#### InteractionMonitor

Monitor and record user interactions in real-time.

**Constructor Parameters:**
- `callback` (Optional[Callable]): Function called for each interaction
- `anonymize_keys` (bool): Whether to anonymize sensitive keyboard input (default: True)

**Methods:**

##### start()
Start monitoring user interactions.

```python
monitor = InteractionMonitor(callback=my_callback)
monitor.start()
```

##### stop()
Stop monitoring user interactions.

```python
monitor.stop()
```

**Interaction Types:**
- `mouse_move`: Mouse cursor movement
- `mouse_click`: Mouse button click/release
- `mouse_scroll`: Mouse wheel scroll
- `key_press`: Keyboard key press
- `key_release`: Keyboard key release
- `app_switch`: Application window switch

---

### automation_bot.recording

#### InteractionRecorder

Record and persist user interactions to JSON files.

**Constructor Parameters:**
- `output_dir` (str): Directory to store recordings (default: "recorded_data")
- `session_id` (Optional[str]): Session identifier (auto-generated if not provided)

**Methods:**

##### start_session()
Start a new recording session.

```python
recorder = InteractionRecorder()
recorder.start_session()
```

##### record_interaction(interaction: Dict[str, Any])
Record a single interaction.

**Parameters:**
- `interaction`: Dictionary containing interaction data

```python
recorder.record_interaction({
    "timestamp": "2024-01-01T00:00:00Z",
    "type": "mouse_click",
    "data": {"x": 100, "y": 200, "button": "left"}
})
```

##### end_session() -> str
End the recording session and save to file.

**Returns:** Path to the saved recording file

```python
filepath = recorder.end_session()
```

##### load_recording(filepath: str) -> Dict[str, Any]
Load a recorded session from file.

**Parameters:**
- `filepath`: Path to the recording file

**Returns:** Recording data dictionary

##### get_statistics() -> Dict[str, Any]
Get statistics about the current recording session.

**Returns:** Dictionary with session statistics

##### list_recordings() -> List[str]
List all recording files in the output directory.

**Returns:** List of recording file paths

---

### automation_bot.playback

#### InteractionPlayer

Replay recorded user interactions.

**Constructor Parameters:**
- `speed` (float): Playback speed multiplier (default: 1.0)

**Methods:**

##### play(recording: Dict[str, Any], start_index: int = 0, end_index: Optional[int] = None, interaction_types: Optional[List[str]] = None)
Play back a recorded session.

**Parameters:**
- `recording`: Recording data dictionary
- `start_index`: Index to start playback from (default: 0)
- `end_index`: Index to end playback at (default: end of recording)
- `interaction_types`: List of interaction types to play (default: all types)

```python
player = InteractionPlayer(speed=2.0)
player.play(recording, interaction_types=["mouse_click", "key_press"])
```

##### stop()
Stop the current playback.

##### set_speed(speed: float)
Set playback speed.

**Parameters:**
- `speed`: Speed multiplier (0.1 minimum)

##### preview_interactions(recording: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]
Preview interactions from a recording.

**Parameters:**
- `recording`: Recording data dictionary
- `limit`: Maximum number of interactions to preview

**Returns:** List of interaction summaries

---

### automation_bot.ml

#### BehaviorPredictor

Machine learning model for predicting user behavior patterns.

**Constructor Parameters:**
- `model_path` (str): Directory to save/load trained models (default: "models")

**Methods:**

##### train(recordings: List[Dict[str, Any]], test_size: float = 0.2) -> Dict[str, float]
Train the behavior prediction model.

**Parameters:**
- `recordings`: List of recording dictionaries
- `test_size`: Fraction of data to use for testing (default: 0.2)

**Returns:** Dictionary containing training metrics

```python
predictor = BehaviorPredictor()
metrics = predictor.train(recordings)
print(f"Accuracy: {metrics['test_accuracy']}")
```

##### predict_next_interaction(recent_interactions: List[Dict[str, Any]]) -> Dict[str, Any]
Predict the next likely interaction type.

**Parameters:**
- `recent_interactions`: List of recent interactions

**Returns:** Prediction dictionary with type and confidence

```python
prediction = predictor.predict_next_interaction(recent_interactions)
print(f"Next: {prediction['type']} ({prediction['confidence']:.2%})")
```

##### save_model(name: str = "behavior_model") -> str
Save the trained model to disk.

**Parameters:**
- `name`: Name for the model file

**Returns:** Path to saved model file

##### load_model(name: str = "behavior_model")
Load a trained model from disk.

**Parameters:**
- `name`: Name of the model file

##### get_feature_importance() -> Dict[str, float]
Get feature importance scores.

**Returns:** Dictionary mapping feature names to importance scores

##### extract_features(interactions: List[Dict[str, Any]]) -> np.ndarray
Extract features from interactions for ML training.

**Parameters:**
- `interactions`: List of interaction dictionaries

**Returns:** Feature matrix as numpy array

---

## CLI Commands

### record
Record user interactions for a specified duration.

```bash
automation-bot record [OPTIONS]
```

**Options:**
- `-d, --duration`: Recording duration in seconds (default: 60)
- `-o, --output-dir`: Output directory for recordings (default: recorded_data)
- `--no-anonymize`: Disable anonymization of sensitive data

### playback
Playback recorded interactions.

```bash
automation-bot playback FILE [OPTIONS]
```

**Arguments:**
- `FILE`: Path to recording file

**Options:**
- `-s, --speed`: Playback speed multiplier (default: 1.0)
- `-p, --preview N`: Preview first N interactions before playback

### list
List recorded sessions.

```bash
automation-bot list [OPTIONS]
```

**Options:**
- `-o, --output-dir`: Directory containing recordings (default: recorded_data)

### train
Train ML model on recordings.

```bash
automation-bot train [OPTIONS]
```

**Options:**
- `-d, --data-dir`: Directory containing recordings (default: recorded_data)
- `-m, --model-dir`: Directory to save models (default: models)
- `-n, --model-name`: Name for the trained model (default: behavior_model)
- `--min-recordings`: Minimum number of recordings required (default: 3)
- `--show-features`: Show feature importance after training

### predict
Predict next interaction using a trained model.

```bash
automation-bot predict FILE [OPTIONS]
```

**Arguments:**
- `FILE`: Path to recording file

**Options:**
- `-m, --model-dir`: Directory containing models (default: models)
- `-n, --model-name`: Name of the trained model (default: behavior_model)
- `-c, --context-size`: Number of recent interactions to use (default: 5)

---

## Data Structures

### Interaction Dictionary

```python
{
    "timestamp": str,  # ISO 8601 timestamp
    "type": str,       # Interaction type
    "data": dict,      # Type-specific data
    "context": dict    # Application context
}
```

### Recording Dictionary

```python
{
    "session_id": str,
    "start_time": str,
    "end_time": str,
    "metadata": {
        "screen_resolution": {"width": int, "height": int},
        "os_info": {"platform": str, "version": str},
        "device_name": str,
        "user_id": str
    },
    "interactions": List[Dict]
}
```

### Prediction Dictionary

```python
{
    "type": str,        # Predicted interaction type
    "confidence": float # Confidence score (0.0 to 1.0)
}
```
