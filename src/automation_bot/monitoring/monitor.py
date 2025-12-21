"""
User interaction monitoring module.
Tracks mouse movements, clicks, keyboard input, and application context.
"""

import platform
import time
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from pynput import mouse, keyboard
import psutil


class InteractionMonitor:
    """Monitors and records user interactions."""

    def __init__(self, callback: Optional[Callable] = None, anonymize_keys: bool = True):
        """
        Initialize the interaction monitor.

        Args:
            callback: Optional callback function to handle each interaction
            anonymize_keys: Whether to anonymize sensitive keyboard input
        """
        self.callback = callback
        self.anonymize_keys = anonymize_keys
        self.is_monitoring = False
        self._mouse_listener = None
        self._keyboard_listener = None
        self._current_modifiers = set()

    def start(self):
        """Start monitoring user interactions."""
        if self.is_monitoring:
            return

        self.is_monitoring = True
        self._mouse_listener = mouse.Listener(
            on_move=self._on_mouse_move,
            on_click=self._on_mouse_click,
            on_scroll=self._on_mouse_scroll
        )
        self._keyboard_listener = keyboard.Listener(
            on_press=self._on_key_press,
            on_release=self._on_key_release
        )

        self._mouse_listener.start()
        self._keyboard_listener.start()

    def stop(self):
        """Stop monitoring user interactions."""
        if not self.is_monitoring:
            return

        self.is_monitoring = False
        if self._mouse_listener:
            self._mouse_listener.stop()
        if self._keyboard_listener:
            self._keyboard_listener.stop()

    def _get_context(self) -> Dict[str, Any]:
        """Get current application context."""
        try:
            # Get active window information
            active_app = self._get_active_window()
            return {
                "active_app": active_app.get("name", ""),
                "window_title": active_app.get("title", ""),
                "screen_region": ""
            }
        except Exception:
            return {
                "active_app": "",
                "window_title": "",
                "screen_region": ""
            }

    def _get_active_window(self) -> Dict[str, str]:
        """Get information about the active window."""
        try:
            if platform.system() == "Windows":
                import win32gui
                hwnd = win32gui.GetForegroundWindow()
                return {
                    "name": win32gui.GetClassName(hwnd),
                    "title": win32gui.GetWindowText(hwnd)
                }
            elif platform.system() == "Darwin":  # macOS
                from AppKit import NSWorkspace
                active_app = NSWorkspace.sharedWorkspace().activeApplication()
                return {
                    "name": active_app.get("NSApplicationName", ""),
                    "title": ""
                }
            else:  # Linux
                # Simplified - requires additional dependencies for full functionality
                return {"name": "unknown", "title": ""}
        except Exception:
            return {"name": "unknown", "title": ""}

    def _on_mouse_move(self, x: int, y: int):
        """Handle mouse movement events."""
        if not self.is_monitoring:
            return

        interaction = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_move",
            "data": {
                "x": x,
                "y": y
            },
            "context": self._get_context()
        }

        if self.callback:
            self.callback(interaction)

    def _on_mouse_click(self, x: int, y: int, button, pressed: bool):
        """Handle mouse click events."""
        if not self.is_monitoring:
            return

        button_name = button.name if hasattr(button, 'name') else str(button)
        
        interaction = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_click",
            "data": {
                "x": x,
                "y": y,
                "button": button_name,
                "pressed": pressed
            },
            "context": self._get_context()
        }

        if self.callback:
            self.callback(interaction)

    def _on_mouse_scroll(self, x: int, y: int, dx: int, dy: int):
        """Handle mouse scroll events."""
        if not self.is_monitoring:
            return

        interaction = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "mouse_scroll",
            "data": {
                "x": x,
                "y": y,
                "scroll_dx": dx,
                "scroll_dy": dy
            },
            "context": self._get_context()
        }

        if self.callback:
            self.callback(interaction)

    def _on_key_press(self, key):
        """Handle key press events."""
        if not self.is_monitoring:
            return

        key_str = self._get_key_string(key)
        
        # Track modifiers
        if key_str in ['shift', 'ctrl', 'alt', 'cmd']:
            self._current_modifiers.add(key_str)

        # Check if this is sensitive input (password field, etc.)
        is_sensitive = self._is_sensitive_context()

        interaction = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "key_press",
            "data": {
                "key": "***" if (is_sensitive and self.anonymize_keys) else key_str,
                "modifiers": list(self._current_modifiers),
                "is_sensitive": is_sensitive
            },
            "context": self._get_context()
        }

        if self.callback:
            self.callback(interaction)

    def _on_key_release(self, key):
        """Handle key release events."""
        if not self.is_monitoring:
            return

        key_str = self._get_key_string(key)
        
        # Remove modifiers
        if key_str in self._current_modifiers:
            self._current_modifiers.remove(key_str)

        interaction = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "key_release",
            "data": {
                "key": key_str,
                "modifiers": list(self._current_modifiers)
            },
            "context": self._get_context()
        }

        if self.callback:
            self.callback(interaction)

    def _get_key_string(self, key) -> str:
        """Convert key object to string representation."""
        try:
            if hasattr(key, 'char') and key.char is not None:
                return key.char
            elif hasattr(key, 'name'):
                return key.name
            else:
                return str(key)
        except AttributeError:
            return str(key)

    def _is_sensitive_context(self) -> bool:
        """Check if current context involves sensitive data input."""
        # Simple heuristic - can be improved with ML
        context = self._get_context()
        window_title = context.get("window_title", "").lower()
        
        sensitive_keywords = ["password", "credential", "login", "signin", "auth"]
        return any(keyword in window_title for keyword in sensitive_keywords)
