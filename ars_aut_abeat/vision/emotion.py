"""
Emotion detection via MediaPipe FaceLandmarker blendshapes.

Blendshape → emotion mapping based on FACS action units:
  happy    ← mouthSmile, cheekSquint
  sad      ← mouthFrown, browInnerUp (inner brow raise = grief)
  angry    ← browDownLeft/Right, noseSneer
  surprise ← eyeWideLeft/Right, jawOpen, browOuterUp
  fear     ← eyeWideLeft/Right + browInnerUp (combined)
  disgust  ← noseSneerLeft/Right, mouthPucker
  neutral  ← residual after all others
"""

import tempfile
from pathlib import Path

_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
_MODEL_CACHE = Path(tempfile.gettempdir()) / "face_landmarker.task"

# Blendshape name → emotion weights
# Values are multipliers; we accumulate weighted sums then normalise
_BLENDSHAPE_MAP: dict[str, dict[str, float]] = {
    "mouthSmileLeft":       {"happy": 1.0},
    "mouthSmileRight":      {"happy": 1.0},
    "cheekSquintLeft":      {"happy": 0.5},
    "cheekSquintRight":     {"happy": 0.5},
    "mouthFrownLeft":       {"sad": 1.0},
    "mouthFrownRight":      {"sad": 1.0},
    "browInnerUp":          {"sad": 0.6, "fear": 0.4},
    "browDownLeft":         {"angry": 1.0},
    "browDownRight":        {"angry": 1.0},
    "noseSneerLeft":        {"angry": 0.4, "disgust": 0.8},
    "noseSneerRight":       {"angry": 0.4, "disgust": 0.8},
    "eyeWideLeft":          {"surprise": 0.7, "fear": 0.5},
    "eyeWideRight":         {"surprise": 0.7, "fear": 0.5},
    "jawOpen":              {"surprise": 0.6},
    "browOuterUpLeft":      {"surprise": 0.5},
    "browOuterUpRight":     {"surprise": 0.5},
    "mouthPucker":          {"disgust": 0.5},
    "mouthRollLower":       {"disgust": 0.3},
}

EMOTION_KEYS = ["happy", "sad", "angry", "surprise", "fear", "disgust", "neutral"]


def _blendshapes_to_emotions(blendshapes: list) -> dict[str, float]:
    scores = {k: 0.0 for k in EMOTION_KEYS}

    for bs in blendshapes:
        name = bs.category_name
        val = bs.score
        if name in _BLENDSHAPE_MAP:
            for emotion, weight in _BLENDSHAPE_MAP[name].items():
                scores[emotion] += val * weight

    # 1.5 baseline so neutral can still dominate quiet faces
    non_neutral = sum(v for k, v in scores.items() if k != "neutral")
    scores["neutral"] = max(0.0, 1.5 - non_neutral)

    total = sum(scores.values()) or 1.0
    return {k: v / total for k, v in scores.items()}


def average_samples(samples: list[dict[str, float]]) -> dict[str, float]:
    if not samples:
        return {}
    return {k: sum(s.get(k, 0) for s in samples) / len(samples) for k in EMOTION_KEYS}


def dominant_emotion(emotions: dict[str, float]) -> str:
    if not emotions:
        return "neutral"
    return max(emotions, key=emotions.get)
