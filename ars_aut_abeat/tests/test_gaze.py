import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from vision.face_detector import FaceResult
from vision.gaze import is_looking_at_camera


def _face(yaw, pitch):
    return FaceResult(bbox=(0, 0, 100, 100), landmarks=None, head_yaw=yaw, head_pitch=pitch)


def test_looking_straight():
    assert is_looking_at_camera(_face(0, 0)) is True


def test_looking_slightly_off():
    assert is_looking_at_camera(_face(15, 10)) is True


def test_looking_too_far():
    assert is_looking_at_camera(_face(40, 0)) is False


def test_pitch_too_far():
    assert is_looking_at_camera(_face(0, 35)) is False


if __name__ == "__main__":
    test_looking_straight()
    test_looking_slightly_off()
    test_looking_too_far()
    test_pitch_too_far()
    print("All tests passed.")
