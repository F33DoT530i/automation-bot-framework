# Usage Examples

## Basic Recording and Playback

### Example 1: Simple Recording Session

```python
from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
import time

def main():
    # Create recorder
    recorder = InteractionRecorder(output_dir="my_recordings")
    
    # Create monitor with callback
    monitor = InteractionMonitor(
        callback=recorder.record_interaction,
        anonymize_keys=True  # Anonymize sensitive input
    )
    
    # Start recording
    print("Starting recording for 30 seconds...")
    recorder.start_session()
    monitor.start()
    
    # Record for 30 seconds
    try:
        time.sleep(30)
    except KeyboardInterrupt:
        print("Recording interrupted by user")
    
    # Stop and save
    monitor.stop()
    filepath = recorder.end_session()
    
    # Show statistics
    stats = recorder.get_statistics()
    print(f"\nRecording saved to: {filepath}")
    print(f"Total interactions: {stats['total_interactions']}")
    print(f"Duration: {stats['duration_seconds']:.2f} seconds")
    print(f"Interaction breakdown: {stats['interaction_types']}")

if __name__ == "__main__":
    main()
```

### Example 2: Playback with Preview

```python
from automation_bot.recording import InteractionRecorder
from automation_bot.playback import InteractionPlayer

def main():
    # Load recording
    recorder = InteractionRecorder()
    recording = recorder.load_recording("recorded_data/recording_xyz.json")
    
    # Create player
    player = InteractionPlayer(speed=1.5)  # 1.5x speed
    
    # Preview first 10 interactions
    print("Preview of interactions:")
    preview = player.preview_interactions(recording, limit=10)
    for item in preview:
        print(f"  {item['index']}: {item['summary']}")
    
    # Confirm playback
    response = input("\nProceed with playback? (y/n): ")
    if response.lower() == 'y':
        print("Starting playback...")
        player.play(recording)
        print("Playback completed")
    else:
        print("Playback cancelled")

if __name__ == "__main__":
    main()
```

## Advanced Recording

### Example 3: Custom Interaction Handler

```python
from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
import time

class CustomRecorder:
    def __init__(self):
        self.recorder = InteractionRecorder()
        self.click_count = 0
        self.key_count = 0
    
    def handle_interaction(self, interaction):
        # Record to file
        self.recorder.record_interaction(interaction)
        
        # Custom handling
        int_type = interaction.get("type")
        if int_type == "mouse_click":
            self.click_count += 1
            print(f"Clicks: {self.click_count}", end="\r")
        elif int_type in ["key_press", "key_release"]:
            self.key_count += 1
            print(f"Keys: {self.key_count}", end="\r")
    
    def record(self, duration=60):
        monitor = InteractionMonitor(
            callback=self.handle_interaction,
            anonymize_keys=True
        )
        
        self.recorder.start_session()
        monitor.start()
        
        print(f"Recording for {duration} seconds...")
        time.sleep(duration)
        
        monitor.stop()
        filepath = self.recorder.end_session()
        
        print(f"\n\nRecording complete!")
        print(f"Total clicks: {self.click_count}")
        print(f"Total keys: {self.key_count}")
        print(f"Saved to: {filepath}")
        
        return filepath

if __name__ == "__main__":
    custom = CustomRecorder()
    custom.record(duration=30)
```

## Machine Learning

### Example 4: Train and Evaluate Model

```python
from automation_bot.recording import InteractionRecorder
from automation_bot.ml import BehaviorPredictor

def main():
    # Load all recordings
    recorder = InteractionRecorder(output_dir="recorded_data")
    recording_files = recorder.list_recordings()
    
    print(f"Found {len(recording_files)} recordings")
    
    if len(recording_files) < 3:
        print("Need at least 3 recordings for training")
        return
    
    # Load recording data
    recordings = []
    for filepath in recording_files:
        try:
            recording = recorder.load_recording(filepath)
            recordings.append(recording)
            print(f"Loaded: {filepath}")
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
    
    # Train model
    print(f"\nTraining model on {len(recordings)} recordings...")
    predictor = BehaviorPredictor(model_path="models")
    
    metrics = predictor.train(recordings, test_size=0.2)
    
    print("\nTraining Results:")
    print(f"  Training Accuracy: {metrics['train_accuracy']:.2%}")
    print(f"  Test Accuracy: {metrics['test_accuracy']:.2%}")
    print(f"  Training Samples: {metrics['training_samples']}")
    print(f"  Test Samples: {metrics['test_samples']}")
    
    # Show feature importance
    print("\nFeature Importance:")
    importance = predictor.get_feature_importance()
    for feature, score in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feature}: {score:.4f}")
    
    # Save model
    model_path = predictor.save_model(name="my_behavior_model")
    print(f"\nModel saved to: {model_path}")

if __name__ == "__main__":
    main()
```

### Example 5: Real-time Prediction

```python
from automation_bot.monitoring import InteractionMonitor
from automation_bot.ml import BehaviorPredictor
import time

class PredictiveMonitor:
    def __init__(self, model_name="behavior_model"):
        self.predictor = BehaviorPredictor()
        self.predictor.load_model(name=model_name)
        self.recent_interactions = []
        self.context_size = 5
    
    def handle_interaction(self, interaction):
        # Add to recent interactions
        self.recent_interactions.append(interaction)
        
        # Keep only last N interactions
        if len(self.recent_interactions) > self.context_size:
            self.recent_interactions.pop(0)
        
        # Make prediction if we have enough context
        if len(self.recent_interactions) >= 3:
            try:
                prediction = self.predictor.predict_next_interaction(
                    self.recent_interactions
                )
                print(f"Predicted next: {prediction['type']} "
                      f"(confidence: {prediction['confidence']:.2%})")
            except Exception as e:
                print(f"Prediction error: {e}")
    
    def monitor(self, duration=60):
        monitor = InteractionMonitor(
            callback=self.handle_interaction,
            anonymize_keys=True
        )
        
        print(f"Monitoring with predictions for {duration} seconds...")
        monitor.start()
        
        time.sleep(duration)
        
        monitor.stop()
        print("Monitoring stopped")

if __name__ == "__main__":
    predictive = PredictiveMonitor(model_name="my_behavior_model")
    predictive.monitor(duration=30)
```

## Selective Playback

### Example 6: Filter and Replay Specific Actions

```python
from automation_bot.recording import InteractionRecorder
from automation_bot.playback import InteractionPlayer

def main():
    # Load recording
    recorder = InteractionRecorder()
    recording = recorder.load_recording("recorded_data/recording_xyz.json")
    
    print(f"Total interactions: {len(recording['interactions'])}")
    
    # Count interaction types
    type_counts = {}
    for interaction in recording['interactions']:
        int_type = interaction['type']
        type_counts[int_type] = type_counts.get(int_type, 0) + 1
    
    print("\nInteraction types:")
    for int_type, count in type_counts.items():
        print(f"  {int_type}: {count}")
    
    # Playback only mouse clicks
    print("\n--- Replaying only mouse clicks ---")
    player = InteractionPlayer(speed=2.0)
    player.play(recording, interaction_types=["mouse_click"])
    
    print("\n--- Replaying only keyboard actions ---")
    player.play(recording, interaction_types=["key_press", "key_release"])
    
    print("\nPlayback complete")

if __name__ == "__main__":
    main()
```

## Batch Processing

### Example 7: Batch Analysis of Recordings

```python
from automation_bot.recording import InteractionRecorder
import json

def analyze_recordings(data_dir="recorded_data"):
    recorder = InteractionRecorder(output_dir=data_dir)
    files = recorder.list_recordings()
    
    print(f"Analyzing {len(files)} recordings...\n")
    
    total_stats = {
        "total_sessions": len(files),
        "total_interactions": 0,
        "total_duration": 0,
        "interaction_types": {},
        "apps_used": set()
    }
    
    for filepath in files:
        try:
            recording = recorder.load_recording(filepath)
            
            # Session info
            session_id = recording["session_id"]
            interactions = recording["interactions"]
            
            print(f"Session: {session_id}")
            print(f"  Interactions: {len(interactions)}")
            
            # Update totals
            total_stats["total_interactions"] += len(interactions)
            
            # Analyze interactions
            for interaction in interactions:
                int_type = interaction["type"]
                total_stats["interaction_types"][int_type] = \
                    total_stats["interaction_types"].get(int_type, 0) + 1
                
                # Track apps
                context = interaction.get("context", {})
                app = context.get("active_app")
                if app:
                    total_stats["apps_used"].add(app)
            
            print()
        except Exception as e:
            print(f"Error analyzing {filepath}: {e}\n")
    
    # Print summary
    print("=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Total Sessions: {total_stats['total_sessions']}")
    print(f"Total Interactions: {total_stats['total_interactions']}")
    print(f"Average per Session: {total_stats['total_interactions'] / max(1, total_stats['total_sessions']):.1f}")
    print(f"\nInteraction Types:")
    for int_type, count in sorted(total_stats["interaction_types"].items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_stats["total_interactions"]) * 100
        print(f"  {int_type}: {count} ({percentage:.1f}%)")
    print(f"\nApplications Used: {len(total_stats['apps_used'])}")

if __name__ == "__main__":
    analyze_recordings()
```

## Error Handling

### Example 8: Robust Recording with Error Handling

```python
from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
import time
import signal
import sys

class RobustRecorder:
    def __init__(self):
        self.recorder = None
        self.monitor = None
        self.is_recording = False
    
    def signal_handler(self, sig, frame):
        print("\n\nInterrupted! Saving recording...")
        self.stop()
        sys.exit(0)
    
    def start(self, duration=60):
        try:
            # Setup signal handler
            signal.signal(signal.SIGINT, self.signal_handler)
            
            # Initialize
            self.recorder = InteractionRecorder(output_dir="recorded_data")
            self.monitor = InteractionMonitor(
                callback=self.recorder.record_interaction,
                anonymize_keys=True
            )
            
            # Start recording
            print(f"Starting recording for {duration} seconds...")
            print("Press Ctrl+C to stop early")
            
            self.recorder.start_session()
            self.monitor.start()
            self.is_recording = True
            
            # Wait for duration
            time.sleep(duration)
            
            # Normal stop
            self.stop()
            
        except Exception as e:
            print(f"Error during recording: {e}")
            if self.is_recording:
                self.stop()
            raise
    
    def stop(self):
        if self.is_recording:
            self.monitor.stop()
            filepath = self.recorder.end_session()
            self.is_recording = False
            
            # Show stats
            stats = self.recorder.get_statistics()
            print(f"\nRecording saved: {filepath}")
            print(f"Interactions recorded: {stats['total_interactions']}")
            print(f"Duration: {stats['duration_seconds']:.2f} seconds")

if __name__ == "__main__":
    recorder = RobustRecorder()
    recorder.start(duration=60)
```
