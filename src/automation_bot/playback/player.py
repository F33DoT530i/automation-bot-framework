"""
Playback engine for replaying recorded interactions.
Supports speed control and selective playback.
"""

import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import pyautogui
from pynput.keyboard import Key, Controller as KeyboardController
from pynput.mouse import Button, Controller as MouseController


class InteractionPlayer:
    """Plays back recorded user interactions."""

    def __init__(self, speed: float = 1.0):
        """
        Initialize the interaction player.

        Args:
            speed: Playback speed multiplier (1.0 = normal speed, 2.0 = 2x speed)
        """
        self.speed = speed
        self.mouse = MouseController()
        self.keyboard = KeyboardController()
        self.is_playing = False
        self._should_stop = False

    def play(self, recording: Dict[str, Any], 
             start_index: int = 0, 
             end_index: Optional[int] = None,
             interaction_types: Optional[List[str]] = None):
        """
        Play back a recorded session.

        Args:
            recording: Recording data dictionary
            start_index: Index to start playback from
            end_index: Index to end playback at (None = end of recording)
            interaction_types: List of interaction types to play (None = all types)
        """
        interactions = recording.get("interactions", [])
        
        if end_index is None:
            end_index = len(interactions)

        # Filter interactions if types specified
        if interaction_types:
            interactions = [
                i for i in interactions 
                if i.get("type") in interaction_types
            ]

        self.is_playing = True
        self._should_stop = False

        # Play selected interactions
        prev_timestamp = None
        for i, interaction in enumerate(interactions[start_index:end_index]):
            if self._should_stop:
                break

            # Calculate delay based on timestamps
            if prev_timestamp:
                current_time = datetime.fromisoformat(interaction["timestamp"].replace("Z", "+00:00"))
                prev_time = datetime.fromisoformat(prev_timestamp.replace("Z", "+00:00"))
                delay = (current_time - prev_time).total_seconds()
                
                # Adjust for playback speed
                delay = delay / self.speed
                
                if delay > 0:
                    time.sleep(delay)

            # Execute the interaction
            self._execute_interaction(interaction)
            prev_timestamp = interaction["timestamp"]

        self.is_playing = False

    def stop(self):
        """Stop the current playback."""
        self._should_stop = True

    def set_speed(self, speed: float):
        """
        Set playback speed.

        Args:
            speed: Speed multiplier (e.g., 0.5 = half speed, 2.0 = double speed)
        """
        self.speed = max(0.1, speed)  # Minimum 0.1x speed

    def _execute_interaction(self, interaction: Dict[str, Any]):
        """
        Execute a single interaction.

        Args:
            interaction: Interaction data dictionary
        """
        interaction_type = interaction.get("type")
        data = interaction.get("data", {})

        try:
            if interaction_type == "mouse_move":
                self._execute_mouse_move(data)
            elif interaction_type == "mouse_click":
                self._execute_mouse_click(data)
            elif interaction_type == "mouse_scroll":
                self._execute_mouse_scroll(data)
            elif interaction_type == "key_press":
                self._execute_key_press(data)
            elif interaction_type == "key_release":
                self._execute_key_release(data)
        except Exception as e:
            # Log error but continue playback
            print(f"Error executing {interaction_type}: {e}")

    def _execute_mouse_move(self, data: Dict[str, Any]):
        """Execute mouse movement."""
        x = data.get("x")
        y = data.get("y")
        if x is not None and y is not None:
            pyautogui.moveTo(x, y, duration=0.1 / self.speed)

    def _execute_mouse_click(self, data: Dict[str, Any]):
        """Execute mouse click."""
        x = data.get("x")
        y = data.get("y")
        button = data.get("button", "left")
        pressed = data.get("pressed", True)

        if x is not None and y is not None:
            pyautogui.moveTo(x, y, duration=0.05 / self.speed)
            
            if pressed:
                button_map = {
                    "left": Button.left,
                    "right": Button.right,
                    "middle": Button.middle
                }
                mouse_button = button_map.get(button, Button.left)
                self.mouse.press(mouse_button)
            else:
                button_map = {
                    "left": Button.left,
                    "right": Button.right,
                    "middle": Button.middle
                }
                mouse_button = button_map.get(button, Button.left)
                self.mouse.release(mouse_button)

    def _execute_mouse_scroll(self, data: Dict[str, Any]):
        """Execute mouse scroll."""
        x = data.get("x")
        y = data.get("y")
        scroll_dy = data.get("scroll_dy", 0)

        if x is not None and y is not None:
            pyautogui.moveTo(x, y, duration=0.05 / self.speed)
            # Scroll (vertical only for simplicity)
            if scroll_dy != 0:
                pyautogui.scroll(int(scroll_dy))

    def _execute_key_press(self, data: Dict[str, Any]):
        """Execute key press."""
        key = data.get("key")
        is_sensitive = data.get("is_sensitive", False)
        
        # Skip sensitive data playback
        if is_sensitive or key == "***":
            return

        if key:
            try:
                # Try to press the key
                if len(key) == 1:
                    self.keyboard.press(key)
                else:
                    # Handle special keys
                    special_key = self._get_special_key(key)
                    if special_key:
                        self.keyboard.press(special_key)
            except Exception as e:
                print(f"Could not press key '{key}': {e}")

    def _execute_key_release(self, data: Dict[str, Any]):
        """Execute key release."""
        key = data.get("key")
        
        if key:
            try:
                if len(key) == 1:
                    self.keyboard.release(key)
                else:
                    special_key = self._get_special_key(key)
                    if special_key:
                        self.keyboard.release(special_key)
            except Exception:
                pass  # Ignore release errors

    def _get_special_key(self, key_name: str):
        """Map key name to pynput Key object."""
        key_map = {
            "shift": Key.shift,
            "ctrl": Key.ctrl,
            "alt": Key.alt,
            "cmd": Key.cmd,
            "enter": Key.enter,
            "space": Key.space,
            "tab": Key.tab,
            "backspace": Key.backspace,
            "delete": Key.delete,
            "esc": Key.esc,
            "up": Key.up,
            "down": Key.down,
            "left": Key.left,
            "right": Key.right,
        }
        return key_map.get(key_name.lower())

    def preview_interactions(self, recording: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
        """
        Preview interactions from a recording.

        Args:
            recording: Recording data dictionary
            limit: Maximum number of interactions to preview

        Returns:
            List of interaction summaries
        """
        interactions = recording.get("interactions", [])
        preview = []

        for i, interaction in enumerate(interactions[:limit]):
            preview.append({
                "index": i,
                "timestamp": interaction.get("timestamp"),
                "type": interaction.get("type"),
                "summary": self._summarize_interaction(interaction)
            })

        return preview

    def _summarize_interaction(self, interaction: Dict[str, Any]) -> str:
        """Create a human-readable summary of an interaction."""
        int_type = interaction.get("type")
        data = interaction.get("data", {})

        if int_type == "mouse_move":
            return f"Move to ({data.get('x')}, {data.get('y')})"
        elif int_type == "mouse_click":
            return f"Click {data.get('button')} at ({data.get('x')}, {data.get('y')})"
        elif int_type == "mouse_scroll":
            return f"Scroll by {data.get('scroll_dy', 0)}"
        elif int_type in ["key_press", "key_release"]:
            return f"{int_type.replace('_', ' ').title()}: {data.get('key')}"
        else:
            return f"{int_type}"
