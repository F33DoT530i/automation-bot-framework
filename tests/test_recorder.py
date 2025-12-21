"""
Unit tests for the InteractionRecorder class.
"""

import pytest
import os
import json
import tempfile
import shutil
from datetime import datetime
from automation_bot.recording import InteractionRecorder


@pytest.fixture
def temp_dir():
    """Create a temporary directory for testing."""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    shutil.rmtree(temp_path)


@pytest.fixture
def recorder(temp_dir):
    """Create a recorder instance for testing."""
    return InteractionRecorder(output_dir=temp_dir)


def test_recorder_initialization(temp_dir):
    """Test recorder initialization."""
    recorder = InteractionRecorder(output_dir=temp_dir)
    assert recorder.output_dir == temp_dir
    assert recorder.session_id is not None
    assert recorder.start_time is None
    assert recorder.interactions == []


def test_start_session(recorder):
    """Test starting a recording session."""
    recorder.start_session()
    assert recorder.start_time is not None
    assert isinstance(recorder.start_time, datetime)
    assert recorder.interactions == []


def test_record_interaction(recorder):
    """Test recording an interaction."""
    recorder.start_session()
    
    interaction = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "mouse_click",
        "data": {"x": 100, "y": 200, "button": "left"}
    }
    
    recorder.record_interaction(interaction)
    assert len(recorder.interactions) == 1
    assert recorder.interactions[0] == interaction


def test_end_session(recorder, temp_dir):
    """Test ending a session and saving to file."""
    recorder.start_session()
    
    # Record some interactions
    for i in range(5):
        interaction = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_move",
            "data": {"x": i * 10, "y": i * 20}
        }
        recorder.record_interaction(interaction)
    
    filepath = recorder.end_session()
    
    # Check file was created
    assert os.path.exists(filepath)
    assert filepath.startswith(temp_dir)
    
    # Verify file contents
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    assert data["session_id"] == recorder.session_id
    assert "start_time" in data
    assert "end_time" in data
    assert "metadata" in data
    assert len(data["interactions"]) == 5


def test_load_recording(recorder, temp_dir):
    """Test loading a recording from file."""
    # Create and save a recording
    recorder.start_session()
    recorder.record_interaction({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "key_press",
        "data": {"key": "a"}
    })
    filepath = recorder.end_session()
    
    # Load it back
    loaded = recorder.load_recording(filepath)
    
    assert loaded["session_id"] == recorder.session_id
    assert len(loaded["interactions"]) == 1
    assert loaded["interactions"][0]["type"] == "key_press"


def test_get_statistics_empty(recorder):
    """Test statistics with no interactions."""
    stats = recorder.get_statistics()
    
    assert stats["total_interactions"] == 0
    assert stats["duration_seconds"] == 0


def test_get_statistics_with_data(recorder):
    """Test statistics with recorded interactions."""
    recorder.start_session()
    
    # Record different types of interactions
    interactions = [
        {"timestamp": datetime.utcnow().isoformat() + "Z", "type": "mouse_move", "data": {}},
        {"timestamp": datetime.utcnow().isoformat() + "Z", "type": "mouse_click", "data": {}},
        {"timestamp": datetime.utcnow().isoformat() + "Z", "type": "mouse_move", "data": {}},
        {"timestamp": datetime.utcnow().isoformat() + "Z", "type": "key_press", "data": {}},
    ]
    
    for interaction in interactions:
        recorder.record_interaction(interaction)
    
    stats = recorder.get_statistics()
    
    assert stats["total_interactions"] == 4
    assert stats["duration_seconds"] >= 0
    assert "interaction_types" in stats
    assert stats["interaction_types"]["mouse_move"] == 2
    assert stats["interaction_types"]["mouse_click"] == 1
    assert stats["interaction_types"]["key_press"] == 1


def test_list_recordings(temp_dir):
    """Test listing recordings in a directory."""
    # Create multiple recordings
    for i in range(3):
        recorder = InteractionRecorder(output_dir=temp_dir)
        recorder.start_session()
        recorder.record_interaction({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_click",
            "data": {}
        })
        recorder.end_session()
    
    # List recordings
    recorder = InteractionRecorder(output_dir=temp_dir)
    recordings = recorder.list_recordings()
    
    assert len(recordings) == 3
    assert all(r.endswith(".json") for r in recordings)
    assert all("recording_" in r for r in recordings)


def test_metadata_in_recording(recorder, temp_dir):
    """Test that metadata is correctly saved in recordings."""
    recorder.start_session()
    recorder.record_interaction({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "mouse_click",
        "data": {}
    })
    filepath = recorder.end_session()
    
    # Load and check metadata
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    metadata = data["metadata"]
    assert "screen_resolution" in metadata
    assert "width" in metadata["screen_resolution"]
    assert "height" in metadata["screen_resolution"]
    assert "os_info" in metadata
    assert "platform" in metadata["os_info"]
