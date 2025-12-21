"""
Unit tests for the BehaviorPredictor class.
"""

import pytest
import tempfile
import shutil
import os
from automation_bot.ml import BehaviorPredictor


@pytest.fixture
def temp_model_dir():
    """Create a temporary directory for model storage."""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    shutil.rmtree(temp_path)


@pytest.fixture
def predictor(temp_model_dir):
    """Create a predictor instance for testing."""
    return BehaviorPredictor(model_path=temp_model_dir)


@pytest.fixture
def sample_recordings():
    """Create sample recordings for testing."""
    return [
        {
            "session_id": "session1",
            "interactions": [
                {
                    "timestamp": "2024-01-01T00:00:00Z",
                    "type": "mouse_move",
                    "data": {"x": 100, "y": 100},
                    "context": {"active_app": "browser"}
                },
                {
                    "timestamp": "2024-01-01T00:00:01Z",
                    "type": "mouse_click",
                    "data": {"x": 100, "y": 100},
                    "context": {"active_app": "browser"}
                },
                {
                    "timestamp": "2024-01-01T00:00:02Z",
                    "type": "key_press",
                    "data": {"key": "a"},
                    "context": {"active_app": "browser"}
                }
            ]
        },
        {
            "session_id": "session2",
            "interactions": [
                {
                    "timestamp": "2024-01-01T00:00:00Z",
                    "type": "mouse_move",
                    "data": {"x": 200, "y": 200},
                    "context": {"active_app": "editor"}
                },
                {
                    "timestamp": "2024-01-01T00:00:01Z",
                    "type": "key_press",
                    "data": {"key": "b"},
                    "context": {"active_app": "editor"}
                },
                {
                    "timestamp": "2024-01-01T00:00:02Z",
                    "type": "mouse_click",
                    "data": {"x": 200, "y": 200},
                    "context": {"active_app": "editor"}
                }
            ]
        }
    ]


def test_predictor_initialization(temp_model_dir):
    """Test predictor initialization."""
    predictor = BehaviorPredictor(model_path=temp_model_dir)
    assert predictor.model_path == temp_model_dir
    assert not predictor.is_trained
    assert os.path.exists(temp_model_dir)


def test_extract_features(predictor):
    """Test feature extraction from interactions."""
    interactions = [
        {
            "type": "mouse_move",
            "data": {"x": 100, "y": 200},
            "context": {"active_app": "test"}
        },
        {
            "type": "mouse_click",
            "data": {"x": 150, "y": 250},
            "context": {"active_app": "test"}
        }
    ]
    
    features = predictor.extract_features(interactions)
    
    assert features.shape[0] == 2  # Two interactions
    assert features.shape[1] == 5  # Five features per interaction


def test_prepare_training_data(predictor, sample_recordings):
    """Test preparing training data from recordings."""
    X, y = predictor.prepare_training_data(sample_recordings)
    
    # Should have features for all but the last interaction in each recording
    assert len(X) > 0
    assert len(y) > 0
    assert len(X) == len(y)


def test_train_model(predictor, sample_recordings):
    """Test training the model."""
    # Add more recordings to have enough data
    extended_recordings = sample_recordings * 5
    
    metrics = predictor.train(extended_recordings)
    
    assert predictor.is_trained
    assert "train_accuracy" in metrics
    assert "test_accuracy" in metrics
    assert "training_samples" in metrics
    assert "test_samples" in metrics
    assert 0 <= metrics["train_accuracy"] <= 1
    assert 0 <= metrics["test_accuracy"] <= 1


def test_train_with_insufficient_data(predictor):
    """Test training with insufficient data."""
    with pytest.raises(ValueError):
        predictor.train([])


def test_predict_without_training(predictor):
    """Test prediction without training raises error."""
    interactions = [
        {
            "type": "mouse_move",
            "data": {"x": 100, "y": 200},
            "context": {"active_app": "test"}
        }
    ]
    
    with pytest.raises(ValueError):
        predictor.predict_next_interaction(interactions)


def test_predict_with_training(predictor, sample_recordings):
    """Test prediction after training."""
    # Train the model
    extended_recordings = sample_recordings * 5
    predictor.train(extended_recordings)
    
    # Make a prediction
    test_interactions = sample_recordings[0]["interactions"][:2]
    prediction = predictor.predict_next_interaction(test_interactions)
    
    assert "type" in prediction
    assert "confidence" in prediction
    assert 0 <= prediction["confidence"] <= 1


def test_save_and_load_model(predictor, sample_recordings, temp_model_dir):
    """Test saving and loading a trained model."""
    # Train and save
    extended_recordings = sample_recordings * 5
    predictor.train(extended_recordings)
    model_path = predictor.save_model(name="test_model")
    
    assert os.path.exists(model_path)
    
    # Load in a new instance
    new_predictor = BehaviorPredictor(model_path=temp_model_dir)
    new_predictor.load_model(name="test_model")
    
    assert new_predictor.is_trained


def test_save_untrained_model(predictor):
    """Test saving an untrained model raises error."""
    with pytest.raises(ValueError):
        predictor.save_model()


def test_load_nonexistent_model(predictor):
    """Test loading a nonexistent model raises error."""
    with pytest.raises(FileNotFoundError):
        predictor.load_model(name="nonexistent")


def test_get_feature_importance(predictor, sample_recordings):
    """Test getting feature importance."""
    # Train the model first
    extended_recordings = sample_recordings * 5
    predictor.train(extended_recordings)
    
    importance = predictor.get_feature_importance()
    
    assert isinstance(importance, dict)
    assert len(importance) > 0
    assert all(isinstance(v, float) for v in importance.values())


def test_get_feature_importance_untrained(predictor):
    """Test getting feature importance without training raises error."""
    with pytest.raises(ValueError):
        predictor.get_feature_importance()
