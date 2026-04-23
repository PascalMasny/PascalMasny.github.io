"""
Thin wrapper kept for import compatibility.
Actual detection now happens inside camera.py via the Tasks-API FaceLandmarker.
"""
from dataclasses import dataclass


@dataclass
class FaceResult:
    bbox: tuple           # (x, y, w, h) in pixels
    landmarks: object     # raw mediapipe landmark list (or None)
    head_yaw: float = 0.0
    head_pitch: float = 0.0
    head_roll: float = 0.0
    area_fraction: float = 0.0
