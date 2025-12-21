"""
Command-line interface for the automation bot framework.
"""

import argparse
import sys
import time
from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
from automation_bot.playback import InteractionPlayer
from automation_bot.ml import BehaviorPredictor


def record_command(args):
    """Record user interactions."""
    print(f"Starting recording session for {args.duration} seconds...")
    print("Press Ctrl+C to stop early.")
    
    recorder = InteractionRecorder(output_dir=args.output_dir)
    monitor = InteractionMonitor(
        callback=recorder.record_interaction,
        anonymize_keys=not args.no_anonymize
    )
    
    recorder.start_session()
    monitor.start()
    
    try:
        time.sleep(args.duration)
    except KeyboardInterrupt:
        print("\nStopping recording...")
    
    monitor.stop()
    filepath = recorder.end_session()
    
    stats = recorder.get_statistics()
    print(f"\nRecording saved to: {filepath}")
    print(f"Total interactions: {stats['total_interactions']}")
    print(f"Duration: {stats['duration_seconds']:.2f} seconds")
    print(f"Interaction types: {stats['interaction_types']}")


def playback_command(args):
    """Playback recorded interactions."""
    print(f"Loading recording from: {args.file}")
    
    recorder = InteractionRecorder()
    recording = recorder.load_recording(args.file)
    
    player = InteractionPlayer(speed=args.speed)
    
    # Preview interactions if requested
    if args.preview:
        print("\nPreview of interactions:")
        preview = player.preview_interactions(recording, limit=args.preview)
        for item in preview:
            print(f"  [{item['index']}] {item['timestamp']} - {item['summary']}")
        
        response = input("\nContinue with playback? (y/n): ")
        if response.lower() != 'y':
            return
    
    print(f"\nStarting playback at {args.speed}x speed...")
    print("Press Ctrl+C to stop.")
    
    try:
        player.play(recording)
        print("\nPlayback completed.")
    except KeyboardInterrupt:
        player.stop()
        print("\nPlayback stopped.")


def list_command(args):
    """List recorded sessions."""
    recorder = InteractionRecorder(output_dir=args.output_dir)
    recordings = recorder.list_recordings()
    
    if not recordings:
        print(f"No recordings found in {args.output_dir}")
        return
    
    print(f"Found {len(recordings)} recording(s):\n")
    for filepath in recordings:
        try:
            recording = recorder.load_recording(filepath)
            print(f"  {filepath}")
            print(f"    Session ID: {recording['session_id']}")
            print(f"    Duration: {recording['start_time']} to {recording['end_time']}")
            print(f"    Interactions: {len(recording['interactions'])}")
            print()
        except Exception as e:
            print(f"  {filepath} - Error loading: {e}\n")


def train_command(args):
    """Train ML model on recorded data."""
    print("Loading recordings for training...")
    
    recorder = InteractionRecorder(output_dir=args.data_dir)
    recordings = recorder.list_recordings()
    
    if len(recordings) < args.min_recordings:
        print(f"Error: Need at least {args.min_recordings} recordings for training.")
        print(f"Found: {len(recordings)}")
        return
    
    # Load all recordings
    data = []
    for filepath in recordings:
        try:
            recording = recorder.load_recording(filepath)
            data.append(recording)
        except Exception as e:
            print(f"Warning: Could not load {filepath}: {e}")
    
    print(f"Training on {len(data)} recording(s)...")
    
    predictor = BehaviorPredictor(model_path=args.model_dir)
    
    try:
        metrics = predictor.train(data)
        
        print("\nTraining completed!")
        print(f"  Training accuracy: {metrics['train_accuracy']:.2%}")
        print(f"  Test accuracy: {metrics['test_accuracy']:.2%}")
        print(f"  Training samples: {metrics['training_samples']}")
        print(f"  Test samples: {metrics['test_samples']}")
        
        # Save model
        model_path = predictor.save_model(name=args.model_name)
        print(f"\nModel saved to: {model_path}")
        
        # Show feature importance
        if args.show_features:
            print("\nFeature importance:")
            for feature, importance in predictor.get_feature_importance().items():
                print(f"  {feature}: {importance:.4f}")
    
    except Exception as e:
        print(f"Error during training: {e}")
        sys.exit(1)


def predict_command(args):
    """Use trained model to predict next interaction."""
    print(f"Loading model: {args.model_name}")
    
    predictor = BehaviorPredictor(model_path=args.model_dir)
    
    try:
        predictor.load_model(name=args.model_name)
    except FileNotFoundError:
        print(f"Error: Model '{args.model_name}' not found in {args.model_dir}")
        sys.exit(1)
    
    print(f"Loading recording: {args.file}")
    recorder = InteractionRecorder()
    recording = recorder.load_recording(args.file)
    
    interactions = recording.get("interactions", [])
    
    if len(interactions) < 1:
        print("Error: Not enough interactions in recording")
        return
    
    # Use last N interactions for prediction
    context_size = min(args.context_size, len(interactions))
    recent = interactions[-context_size:]
    
    prediction = predictor.predict_next_interaction(recent)
    
    print(f"\nPrediction based on last {context_size} interaction(s):")
    print(f"  Next interaction type: {prediction['type']}")
    print(f"  Confidence: {prediction['confidence']:.2%}")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="AI-powered automation assistant for recording and replaying interactions"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Record command
    record_parser = subparsers.add_parser("record", help="Record user interactions")
    record_parser.add_argument(
        "-d", "--duration",
        type=int,
        default=60,
        help="Recording duration in seconds (default: 60)"
    )
    record_parser.add_argument(
        "-o", "--output-dir",
        default="recorded_data",
        help="Output directory for recordings (default: recorded_data)"
    )
    record_parser.add_argument(
        "--no-anonymize",
        action="store_true",
        help="Disable anonymization of sensitive data"
    )
    
    # Playback command
    playback_parser = subparsers.add_parser("playback", help="Playback recorded interactions")
    playback_parser.add_argument("file", help="Path to recording file")
    playback_parser.add_argument(
        "-s", "--speed",
        type=float,
        default=1.0,
        help="Playback speed multiplier (default: 1.0)"
    )
    playback_parser.add_argument(
        "-p", "--preview",
        type=int,
        metavar="N",
        help="Preview first N interactions before playback"
    )
    
    # List command
    list_parser = subparsers.add_parser("list", help="List recorded sessions")
    list_parser.add_argument(
        "-o", "--output-dir",
        default="recorded_data",
        help="Directory containing recordings (default: recorded_data)"
    )
    
    # Train command
    train_parser = subparsers.add_parser("train", help="Train ML model on recordings")
    train_parser.add_argument(
        "-d", "--data-dir",
        default="recorded_data",
        help="Directory containing recordings (default: recorded_data)"
    )
    train_parser.add_argument(
        "-m", "--model-dir",
        default="models",
        help="Directory to save models (default: models)"
    )
    train_parser.add_argument(
        "-n", "--model-name",
        default="behavior_model",
        help="Name for the trained model (default: behavior_model)"
    )
    train_parser.add_argument(
        "--min-recordings",
        type=int,
        default=3,
        help="Minimum number of recordings required (default: 3)"
    )
    train_parser.add_argument(
        "--show-features",
        action="store_true",
        help="Show feature importance after training"
    )
    
    # Predict command
    predict_parser = subparsers.add_parser("predict", help="Predict next interaction")
    predict_parser.add_argument("file", help="Path to recording file")
    predict_parser.add_argument(
        "-m", "--model-dir",
        default="models",
        help="Directory containing models (default: models)"
    )
    predict_parser.add_argument(
        "-n", "--model-name",
        default="behavior_model",
        help="Name of the trained model (default: behavior_model)"
    )
    predict_parser.add_argument(
        "-c", "--context-size",
        type=int,
        default=5,
        help="Number of recent interactions to use for prediction (default: 5)"
    )
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Route to appropriate command handler
    if args.command == "record":
        record_command(args)
    elif args.command == "playback":
        playback_command(args)
    elif args.command == "list":
        list_command(args)
    elif args.command == "train":
        train_command(args)
    elif args.command == "predict":
        predict_command(args)


if __name__ == "__main__":
    main()
