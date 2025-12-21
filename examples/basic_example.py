"""
Simple example demonstrating the basic workflow.
"""

from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
from automation_bot.playback import InteractionPlayer
import time


def record_example():
    """Example: Record user interactions for 10 seconds."""
    print("=== Recording Example ===")
    print("Recording for 10 seconds...")
    
    recorder = InteractionRecorder(output_dir="recorded_data")
    monitor = InteractionMonitor(
        callback=recorder.record_interaction,
        anonymize_keys=True
    )
    
    recorder.start_session()
    monitor.start()
    
    time.sleep(10)
    
    monitor.stop()
    filepath = recorder.end_session()
    
    stats = recorder.get_statistics()
    print(f"Recording saved to: {filepath}")
    print(f"Total interactions: {stats['total_interactions']}")
    print(f"Duration: {stats['duration_seconds']:.2f} seconds\n")
    
    return filepath


def playback_example(filepath):
    """Example: Playback recorded interactions."""
    print("=== Playback Example ===")
    
    recorder = InteractionRecorder()
    recording = recorder.load_recording(filepath)
    
    player = InteractionPlayer(speed=2.0)
    
    print(f"Loaded recording with {len(recording['interactions'])} interactions")
    print("Playing back at 2x speed...")
    
    # Preview first 5 interactions
    preview = player.preview_interactions(recording, limit=5)
    for item in preview:
        print(f"  {item['summary']}")
    
    # Note: Uncomment to actually play back
    # player.play(recording)
    print("Playback complete\n")


def main():
    """Run the examples."""
    print("Automation Bot Framework - Basic Example\n")
    
    # Record interactions
    filepath = record_example()
    
    # Playback interactions
    playback_example(filepath)
    
    print("Example complete!")


if __name__ == "__main__":
    main()
