"""
Recording module for storing interaction data.
Handles JSON-based persistence with metadata tracking.
"""

import json
import os
import platform
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pyautogui


class InteractionRecorder:
    """Records and stores user interactions to JSON files."""

    def __init__(self, output_dir: str = "recorded_data", session_id: Optional[str] = None):
        """
        Initialize the interaction recorder.

        Args:
            output_dir: Directory to store recorded interaction files
            session_id: Optional session identifier (generated if not provided)
        """
        self.output_dir = output_dir
        self.session_id = session_id or str(uuid.uuid4())
        self.start_time = None
        self.interactions = []
        self._ensure_output_dir()

    def _ensure_output_dir(self):
        """Ensure output directory exists."""
        os.makedirs(self.output_dir, exist_ok=True)

    def start_session(self):
        """Start a new recording session."""
        self.start_time = datetime.now(timezone.utc)
        self.interactions = []

    def record_interaction(self, interaction: Dict[str, Any]):
        """
        Record a single interaction.

        Args:
            interaction: Interaction data dictionary
        """
        self.interactions.append(interaction)

    def end_session(self) -> str:
        """
        End the recording session and save to file.

        Returns:
            Path to the saved recording file
        """
        end_time = datetime.now(timezone.utc)
        
        # Get system metadata
        screen_size = pyautogui.size()
        metadata = {
            "screen_resolution": {
                "width": screen_size.width,
                "height": screen_size.height
            },
            "os_info": {
                "platform": platform.system(),
                "version": platform.version()
            },
            "device_name": platform.node(),
            "user_id": "anonymized"
        }

        # Create recording document
        recording = {
            "session_id": self.session_id,
            "start_time": self.start_time.isoformat() + "Z",
            "end_time": end_time.isoformat() + "Z",
            "metadata": metadata,
            "interactions": self.interactions
        }

        # Save to file
        filename = f"recording_{self.session_id}_{self.start_time.strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(recording, f, indent=2)

        return filepath

    def load_recording(self, filepath: str) -> Dict[str, Any]:
        """
        Load a recorded session from file.

        Args:
            filepath: Path to the recording file

        Returns:
            Recording data dictionary
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the current recording session.

        Returns:
            Dictionary containing session statistics
        """
        if not self.interactions:
            return {
                "total_interactions": 0,
                "duration_seconds": 0
            }

        # Count interaction types
        type_counts = {}
        for interaction in self.interactions:
            int_type = interaction.get("type", "unknown")
            type_counts[int_type] = type_counts.get(int_type, 0) + 1

        # Calculate duration
        duration = 0
        if self.start_time:
            duration = (datetime.now(timezone.utc) - self.start_time).total_seconds()

        return {
            "total_interactions": len(self.interactions),
            "duration_seconds": duration,
            "interaction_types": type_counts
        }

    def list_recordings(self) -> List[str]:
        """
        List all recording files in the output directory.

        Returns:
            List of recording file paths
        """
        if not os.path.exists(self.output_dir):
            return []

        files = [
            os.path.join(self.output_dir, f)
            for f in os.listdir(self.output_dir)
            if f.startswith("recording_") and f.endswith(".json")
        ]
        return sorted(files, reverse=True)  # Most recent first
