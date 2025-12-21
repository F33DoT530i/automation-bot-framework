"""
Integration tests for the complete workflow.
"""

import pytest
import tempfile
import shutil
import time
from datetime import datetime
from automation_bot.monitoring import InteractionMonitor
from automation_bot.recording import InteractionRecorder
from automation_bot.playback import InteractionPlayer
from automation_bot.ml import BehaviorPredictor


@pytest.fixture
def temp_workspace():
    """Create a temporary workspace for integration testing."""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    shutil.rmtree(temp_path)


def test_record_and_playback_workflow(temp_workspace):
    """Test the complete record and playback workflow."""
    # Step 1: Record interactions
    recorder = InteractionRecorder(output_dir=temp_workspace)
    interactions_recorded = []
    
    def record_callback(interaction):
        interactions_recorded.append(interaction)
        recorder.record_interaction(interaction)
    
    monitor = InteractionMonitor(callback=record_callback, anonymize_keys=True)
    
    # Start recording
    recorder.start_session()
    monitor.start()
    
    # Simulate some interactions (in real use, these would come from actual user input)
    # For testing, we'll add them manually
    test_interactions = [
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_move",
            "data": {"x": 100, "y": 100},
            "context": {}
        },
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_click",
            "data": {"x": 100, "y": 100, "button": "left", "pressed": True},
            "context": {}
        }
    ]
    
    for interaction in test_interactions:
        recorder.record_interaction(interaction)
    
    # Stop recording
    monitor.stop()
    filepath = recorder.end_session()
    
    # Verify recording
    assert len(recorder.interactions) == 2
    
    # Step 2: Load and playback
    loaded = recorder.load_recording(filepath)
    assert loaded["session_id"] == recorder.session_id
    assert len(loaded["interactions"]) == 2
    
    # Create player
    player = InteractionPlayer(speed=10.0)  # Fast speed for testing
    
    # Preview interactions
    preview = player.preview_interactions(loaded, limit=5)
    assert len(preview) == 2


def test_full_ml_pipeline(temp_workspace):
    """Test the complete ML training and prediction pipeline."""
    # Step 1: Create multiple recordings
    recordings = []
    
    for session_num in range(3):
        recorder = InteractionRecorder(output_dir=temp_workspace)
        recorder.start_session()
        
        # Add interactions with patterns
        for i in range(10):
            recorder.record_interaction({
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "type": "mouse_move" if i % 2 == 0 else "mouse_click",
                "data": {"x": i * 10, "y": i * 20},
                "context": {"active_app": f"app_{session_num}"}
            })
        
        filepath = recorder.end_session()
        recordings.append(recorder.load_recording(filepath))
    
    # Step 2: Train model
    predictor = BehaviorPredictor(model_path=temp_workspace)
    
    # Multiply recordings to get enough training data
    training_data = recordings * 5
    metrics = predictor.train(training_data)
    
    assert predictor.is_trained
    assert metrics["train_accuracy"] >= 0
    
    # Step 3: Save model
    model_path = predictor.save_model(name="test_model")
    assert model_path is not None
    
    # Step 4: Load model and predict
    new_predictor = BehaviorPredictor(model_path=temp_workspace)
    new_predictor.load_model(name="test_model")
    
    test_interactions = recordings[0]["interactions"][:5]
    prediction = new_predictor.predict_next_interaction(test_interactions)
    
    assert "type" in prediction
    assert "confidence" in prediction
    assert prediction["type"] in ["mouse_move", "mouse_click", "key_press", "key_release", "mouse_scroll", "app_switch"]


def test_anonymization_workflow(temp_workspace):
    """Test that sensitive data is properly anonymized."""
    recorder = InteractionRecorder(output_dir=temp_workspace)
    
    # Record with anonymization
    recorder.start_session()
    
    # Add sensitive interaction
    recorder.record_interaction({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "key_press",
        "data": {
            "key": "***",  # Anonymized
            "is_sensitive": True
        },
        "context": {"window_title": "password field"}
    })
    
    filepath = recorder.end_session()
    loaded = recorder.load_recording(filepath)
    
    # Verify sensitive data is anonymized
    sensitive_interaction = loaded["interactions"][0]
    assert sensitive_interaction["data"]["key"] == "***"
    assert sensitive_interaction["data"]["is_sensitive"] is True


def test_selective_playback(temp_workspace):
    """Test selective playback of specific interaction types."""
    # Create a recording with mixed interactions
    recorder = InteractionRecorder(output_dir=temp_workspace)
    recorder.start_session()
    
    interaction_types = ["mouse_move", "mouse_click", "key_press", "mouse_move", "key_press"]
    for int_type in interaction_types:
        recorder.record_interaction({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": int_type,
            "data": {"x": 100, "y": 100} if "mouse" in int_type else {"key": "a"},
            "context": {}
        })
    
    filepath = recorder.end_session()
    recording = recorder.load_recording(filepath)
    
    # Test playback with filters
    player = InteractionPlayer(speed=10.0)
    
    # Verify recording has all types
    assert len(recording["interactions"]) == 5
