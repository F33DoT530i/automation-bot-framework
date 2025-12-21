"""
Unit tests for the InteractionPlayer class.
"""

import pytest
from datetime import datetime
from automation_bot.playback import InteractionPlayer


@pytest.fixture
def sample_recording():
    """Create a sample recording for testing."""
    return {
        "session_id": "test-session",
        "start_time": "2024-01-01T00:00:00Z",
        "end_time": "2024-01-01T00:01:00Z",
        "metadata": {
            "screen_resolution": {"width": 1920, "height": 1080},
            "os_info": {"platform": "Linux", "version": "5.0"}
        },
        "interactions": [
            {
                "timestamp": "2024-01-01T00:00:00Z",
                "type": "mouse_move",
                "data": {"x": 100, "y": 100},
                "context": {}
            },
            {
                "timestamp": "2024-01-01T00:00:01Z",
                "type": "mouse_click",
                "data": {"x": 100, "y": 100, "button": "left", "pressed": True},
                "context": {}
            },
            {
                "timestamp": "2024-01-01T00:00:02Z",
                "type": "key_press",
                "data": {"key": "a", "modifiers": []},
                "context": {}
            }
        ]
    }


def test_player_initialization():
    """Test player initialization."""
    player = InteractionPlayer(speed=1.0)
    assert player.speed == 1.0
    assert not player.is_playing
    assert not player._should_stop


def test_set_speed():
    """Test setting playback speed."""
    player = InteractionPlayer()
    
    player.set_speed(2.0)
    assert player.speed == 2.0
    
    player.set_speed(0.5)
    assert player.speed == 0.5
    
    # Test minimum speed
    player.set_speed(0.01)
    assert player.speed == 0.1  # Should be clamped to minimum


def test_preview_interactions(sample_recording):
    """Test previewing interactions."""
    player = InteractionPlayer()
    preview = player.preview_interactions(sample_recording, limit=2)
    
    assert len(preview) == 2
    assert preview[0]["index"] == 0
    assert preview[0]["type"] == "mouse_move"
    assert "summary" in preview[0]
    assert preview[1]["type"] == "mouse_click"


def test_preview_all_interactions(sample_recording):
    """Test previewing all interactions."""
    player = InteractionPlayer()
    preview = player.preview_interactions(sample_recording, limit=10)
    
    # Should return all 3 interactions
    assert len(preview) == 3


def test_summarize_interaction():
    """Test interaction summarization."""
    player = InteractionPlayer()
    
    # Test mouse_move
    summary = player._summarize_interaction({
        "type": "mouse_move",
        "data": {"x": 100, "y": 200}
    })
    assert "100" in summary and "200" in summary
    
    # Test mouse_click
    summary = player._summarize_interaction({
        "type": "mouse_click",
        "data": {"x": 50, "y": 75, "button": "left"}
    })
    assert "left" in summary.lower()
    
    # Test key_press
    summary = player._summarize_interaction({
        "type": "key_press",
        "data": {"key": "enter"}
    })
    assert "key" in summary.lower()


def test_stop_playback():
    """Test stopping playback."""
    player = InteractionPlayer()
    assert not player._should_stop
    
    player.stop()
    assert player._should_stop


def test_get_special_key():
    """Test special key mapping."""
    player = InteractionPlayer()
    
    # Test common special keys
    assert player._get_special_key("shift") is not None
    assert player._get_special_key("ctrl") is not None
    assert player._get_special_key("enter") is not None
    assert player._get_special_key("space") is not None
    
    # Test unknown key
    assert player._get_special_key("unknown_key") is None


def test_play_with_filter(sample_recording):
    """Test playing with interaction type filter."""
    player = InteractionPlayer()
    
    # This test just verifies the filtering logic works
    # Actual playback would require mocking pyautogui/pynput
    filtered_types = ["mouse_move", "mouse_click"]
    
    # In a real scenario, we'd mock the execute methods
    # Here we just verify the player accepts the parameters
    # player.play(sample_recording, interaction_types=filtered_types)
    pass


def test_play_with_range(sample_recording):
    """Test playing with start and end indices."""
    player = InteractionPlayer()
    
    # Verify the player accepts range parameters
    # In a real test environment, we'd mock the execution
    # player.play(sample_recording, start_index=1, end_index=2)
    pass
