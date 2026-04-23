from config import GAZE_YAW_THRESHOLD_DEG, GAZE_PITCH_THRESHOLD_DEG
from .face_detector import FaceResult


def is_looking_at_camera(face: FaceResult) -> bool:
    return (
        abs(face.head_yaw) <= GAZE_YAW_THRESHOLD_DEG
        and abs(face.head_pitch) <= GAZE_PITCH_THRESHOLD_DEG
    )


def most_centered_face(faces: list[FaceResult], frame_w: int, frame_h: int) -> FaceResult | None:
    if not faces:
        return None
    cx, cy = frame_w / 2, frame_h / 2

    def dist(f: FaceResult) -> float:
        x, y, w, h = f.bbox
        fx, fy = x + w / 2, y + h / 2
        return ((fx - cx) ** 2 + (fy - cy) ** 2) ** 0.5

    return min(faces, key=dist)
