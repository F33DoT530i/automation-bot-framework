"""
Machine Learning module for behavior prediction.
Implements supervised learning to predict user patterns.
"""

import os
import json
import pickle
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split


class BehaviorPredictor:
    """ML model for predicting user behavior patterns."""

    def __init__(self, model_path: str = "models"):
        """
        Initialize the behavior predictor.

        Args:
            model_path: Directory to save/load trained models
        """
        self.model_path = model_path
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self._ensure_model_dir()

    def _ensure_model_dir(self):
        """Ensure model directory exists."""
        os.makedirs(self.model_path, exist_ok=True)

    def extract_features(self, interactions: List[Dict[str, Any]]) -> np.ndarray:
        """
        Extract features from interactions for ML training.

        Args:
            interactions: List of interaction dictionaries

        Returns:
            Feature matrix as numpy array
        """
        from datetime import datetime
        
        features = []
        # Build app encoder for consistent encoding
        all_apps = [inter.get("context", {}).get("active_app", "") for inter in interactions]
        unique_apps = list(set(all_apps))
        app_to_idx = {app: idx for idx, app in enumerate(unique_apps)}

        for i, interaction in enumerate(interactions):
            feature_vector = []
            
            # Interaction type encoding
            int_type = interaction.get("type", "unknown")
            type_encoding = {
                "mouse_move": 0,
                "mouse_click": 1,
                "mouse_scroll": 2,
                "key_press": 3,
                "key_release": 4,
                "app_switch": 5
            }
            feature_vector.append(type_encoding.get(int_type, -1))

            # Position features (for mouse interactions)
            data = interaction.get("data", {})
            feature_vector.append(data.get("x", 0))
            feature_vector.append(data.get("y", 0))

            # Time-based features - calculate actual time delta
            if i > 0:
                try:
                    current_time = datetime.fromisoformat(interaction.get("timestamp", "").replace("Z", "+00:00"))
                    prev_time = datetime.fromisoformat(interactions[i-1].get("timestamp", "").replace("Z", "+00:00"))
                    time_delta = (current_time - prev_time).total_seconds()
                    feature_vector.append(time_delta)
                except (ValueError, AttributeError):
                    feature_vector.append(0)
            else:
                feature_vector.append(0)

            # Context features - use proper categorical encoding
            context = interaction.get("context", {})
            app_name = context.get("active_app", "")
            feature_vector.append(app_to_idx.get(app_name, -1))

            features.append(feature_vector)

        return np.array(features)

    def prepare_training_data(self, recordings: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from multiple recordings.

        Args:
            recordings: List of recording dictionaries

        Returns:
            Tuple of (features, labels)
        """
        all_features = []
        all_labels = []

        for recording in recordings:
            interactions = recording.get("interactions", [])
            
            # Extract features for all but last interaction
            if len(interactions) < 2:
                continue

            features = self.extract_features(interactions[:-1])
            
            # Labels are the next interaction type
            labels = [
                interaction.get("type", "unknown")
                for interaction in interactions[1:]
            ]

            all_features.extend(features)
            all_labels.extend(labels)

        X = np.array(all_features)
        y = self.label_encoder.fit_transform(all_labels)

        return X, y

    def train(self, recordings: List[Dict[str, Any]], test_size: float = 0.2) -> Dict[str, float]:
        """
        Train the behavior prediction model.

        Args:
            recordings: List of recording dictionaries
            test_size: Fraction of data to use for testing

        Returns:
            Dictionary containing training metrics
        """
        # Prepare training data
        X, y = self.prepare_training_data(recordings)

        if len(X) == 0:
            raise ValueError("No training data available")

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )

        # Train model
        self.classifier.fit(X_train, y_train)
        self.is_trained = True

        # Evaluate
        train_score = self.classifier.score(X_train, y_train)
        test_score = self.classifier.score(X_test, y_test)

        return {
            "train_accuracy": train_score,
            "test_accuracy": test_score,
            "training_samples": len(X_train),
            "test_samples": len(X_test)
        }

    def predict_next_interaction(self, recent_interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict the next likely interaction type.

        Args:
            recent_interactions: List of recent interactions

        Returns:
            Prediction dictionary with type and confidence
        """
        if not self.is_trained:
            raise ValueError("Model is not trained yet")

        if not recent_interactions:
            return {"type": "unknown", "confidence": 0.0}

        # Extract features from last interaction
        features = self.extract_features([recent_interactions[-1]])
        
        # Predict
        prediction = self.classifier.predict(features)
        probabilities = self.classifier.predict_proba(features)

        # Decode prediction
        predicted_type = self.label_encoder.inverse_transform(prediction)[0]
        confidence = np.max(probabilities)

        return {
            "type": predicted_type,
            "confidence": float(confidence)
        }

    def save_model(self, name: str = "behavior_model"):
        """
        Save the trained model to disk.

        Args:
            name: Name for the model file
        """
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")

        model_data = {
            "classifier": self.classifier,
            "label_encoder": self.label_encoder
        }

        filepath = os.path.join(self.model_path, f"{name}.pkl")
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

        return filepath

    def load_model(self, name: str = "behavior_model"):
        """
        Load a trained model from disk.

        Args:
            name: Name of the model file
        """
        filepath = os.path.join(self.model_path, f"{name}.pkl")
        
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")

        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        self.classifier = model_data["classifier"]
        self.label_encoder = model_data["label_encoder"]
        self.is_trained = True

    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance scores.

        Returns:
            Dictionary mapping feature names to importance scores
        """
        if not self.is_trained:
            raise ValueError("Model is not trained yet")

        feature_names = [
            "interaction_type",
            "position_x",
            "position_y",
            "time_delta",
            "active_app"
        ]

        importance_scores = self.classifier.feature_importances_

        return {
            name: float(score)
            for name, score in zip(feature_names, importance_scores)
        }
