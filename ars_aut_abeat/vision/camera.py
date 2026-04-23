"""
Video processor for the gallery camera.

Architecture: the WebRTC recv() callback must return FAST (< 16ms) or the
video feed stutters. All heavy work (MediaPipe landmark detection, head pose,
blendshapes → emotions) runs in a separate daemon thread that picks up the
latest frame and writes results to a thread-safe CameraState.

The recv() callback does two things:
  1. Stash the latest frame for the analysis thread.
  2. Return the frame immediately (no processing delay).
"""

import av
import copy
import cv2
import threading
import time
import urllib.request
import numpy as np
from dataclasses import dataclass, field
from pathlib import Path
from streamlit_webrtc import VideoProcessorBase

from vision.face_detector import FaceResult
from vision.gaze import is_looking_at_camera, most_centered_face
from config import MIN_FACE_AREA_FRACTION, EMOTION_SAMPLE_RATE_HZ

# 3D canonical face model points for head pose (solvePnP)
_MODEL_POINTS = np.array([
    [0.0,    0.0,    0.0],
    [0.0,  -330.0,  -65.0],
    [-225.0, 170.0, -135.0],
    [225.0,  170.0, -135.0],
    [-150.0,-150.0, -125.0],
    [150.0, -150.0, -125.0],
], dtype=np.float64)

_LANDMARK_INDICES = [4, 152, 263, 33, 287, 57]

_POSE_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"


def _download(url: str, dest: Path) -> bool:
    try:
        urllib.request.urlretrieve(url, str(dest))
        return True
    except Exception:
        return False


def _head_pose(landmarks, w: int, h: int) -> tuple[float, float, float]:
    try:
        image_points = np.array(
            [[landmarks[i].x * w, landmarks[i].y * h] for i in _LANDMARK_INDICES],
            dtype=np.float64,
        )
        focal = w
        cam = np.array([[focal, 0, w / 2], [0, focal, h / 2], [0, 0, 1]], dtype=np.float64)
        ok, rvec, _ = cv2.solvePnP(_MODEL_POINTS, image_points, cam, np.zeros((4, 1)),
                                    flags=cv2.SOLVEPNP_ITERATIVE)
        if not ok:
            return 0.0, 0.0, 0.0
        rmat, _ = cv2.Rodrigues(rvec)
        angles, *_ = cv2.RQDecomp3x3(rmat)
        return float(angles[1]), float(angles[0]), float(angles[2])
    except Exception:
        return 0.0, 0.0, 0.0


@dataclass
class CameraState:
    face_present: bool = False
    face_centered: bool = False
    hands_raised: bool = False
    hands_raised_since: float | None = None
    stable_since: float | None = None
    latest_emotions: dict[str, float] = field(default_factory=dict)
    frame_w: int = 640
    frame_h: int = 480
    num_faces: int = 0


class GalleryVideoProcessor(VideoProcessorBase):

    def __init__(self):
        self._state_lock = threading.Lock()
        self._state = CameraState()

        # Latest frame buffer — written by recv(), read by analysis thread
        self._frame_lock = threading.Lock()
        self._latest_rgb: np.ndarray | None = None
        self._latest_shape: tuple[int, int] = (480, 640)

        self._do_emotion = False
        self._do_pose = True  # default on until phase tells us otherwise
        self._running = True

        # Start analysis daemon thread with its OWN landmarker instance
        self._analysis_thread = threading.Thread(target=self._analysis_loop, daemon=True)
        self._analysis_thread.start()

    # --- public API (called from Streamlit main thread) ---

    def get_state(self) -> CameraState:
        with self._state_lock:
            return copy.copy(self._state)

    def set_emotion_sampling(self, active: bool):
        self._do_emotion = active

    def set_pose_sampling(self, active: bool):
        self._do_pose = active

    # --- WebRTC callback — must be FAST ---

    def recv(self, frame: av.VideoFrame) -> av.VideoFrame:
        img = frame.to_ndarray(format="bgr24")
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w = img.shape[:2]

        with self._frame_lock:
            self._latest_rgb = img_rgb
            self._latest_shape = (h, w)

        return av.VideoFrame.from_ndarray(img, format="bgr24")

    def on_ended(self):
        self._running = False

    # --- Analysis thread — runs at ~5-10 Hz in background ---

    def _analysis_loop(self):
        """Runs in a separate thread. Creates its own MediaPipe landmarkers."""
        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision
        from vision.emotion import _blendshapes_to_emotions, _MODEL_CACHE, _MODEL_URL

        if not _MODEL_CACHE.exists() and not _download(_MODEL_URL, _MODEL_CACHE):
            return

        _POSE_CACHE = _MODEL_CACHE.parent / "pose_landmarker_lite.task"
        if not _POSE_CACHE.exists():
            _download(_POSE_URL, _POSE_CACHE)  # best-effort; face still works without pose

        base_opts = mp_python.BaseOptions(model_asset_path=str(_MODEL_CACHE))
        opts = mp_vision.FaceLandmarkerOptions(
            base_options=base_opts,
            output_face_blendshapes=True,
            num_faces=4,
            min_face_detection_confidence=0.4,
            min_face_presence_confidence=0.4,
            min_tracking_confidence=0.4,
        )
        landmarker = mp_vision.FaceLandmarker.create_from_options(opts)

        pose_landmarker = None
        if _POSE_CACHE.exists():
            try:
                pose_opts = mp_vision.PoseLandmarkerOptions(
                    base_options=mp_python.BaseOptions(model_asset_path=str(_POSE_CACHE)),
                    num_poses=1,
                    min_pose_detection_confidence=0.4,
                    min_tracking_confidence=0.4,
                )
                pose_landmarker = mp_vision.PoseLandmarker.create_from_options(pose_opts)
            except Exception:
                pose_landmarker = None

        target_interval = 1.0 / EMOTION_SAMPLE_RATE_HZ

        while self._running:
            loop_start = time.time()

            with self._frame_lock:
                rgb = self._latest_rgb
                shape = self._latest_shape

            if rgb is None:
                time.sleep(0.05)
                continue

            h, w = shape

            try:
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                result = landmarker.detect(mp_image)
            except Exception:
                time.sleep(0.1)
                continue

            faces: list[FaceResult] = []
            emotions = {}

            if result.face_landmarks:
                for i, lm_list in enumerate(result.face_landmarks):
                    xs = [lm.x * w for lm in lm_list]
                    ys = [lm.y * h for lm in lm_list]
                    x1, x2 = int(min(xs)), int(max(xs))
                    y1, y2 = int(min(ys)), int(max(ys))
                    bw, bh = x2 - x1, y2 - y1
                    area_fraction = (bw * bh) / (w * h)
                    if area_fraction < MIN_FACE_AREA_FRACTION:
                        continue
                    yaw, pitch, roll = _head_pose(lm_list, w, h)
                    faces.append(FaceResult(
                        bbox=(x1, y1, bw, bh),
                        landmarks=lm_list,
                        head_yaw=yaw,
                        head_pitch=pitch,
                        head_roll=roll,
                        area_fraction=area_fraction,
                    ))

                if self._do_emotion and result.face_blendshapes:
                    emotions = _blendshapes_to_emotions(result.face_blendshapes[0])

            target = most_centered_face(faces, w, h)
            looking = target is not None and is_looking_at_camera(target)

            hands_up = False
            if self._do_pose and pose_landmarker is not None:
                try:
                    pose_result = pose_landmarker.detect(mp_image)
                    if pose_result.pose_landmarks:
                        pose = pose_result.pose_landmarks[0]
                        # Landmarks: 11=left_shoulder, 12=right_shoulder,
                        #            15=left_wrist, 16=right_wrist
                        # y increases downward → wrist above shoulder means y smaller
                        hands_up = (
                            pose[15].y < pose[11].y
                            and pose[16].y < pose[12].y
                        )
                except Exception:
                    pass

            now = time.time()
            with self._state_lock:
                prev_looking = self._state.face_centered
                prev_hands = self._state.hands_raised
                self._state.face_present = target is not None
                self._state.face_centered = looking
                self._state.hands_raised = hands_up
                self._state.frame_w = w
                self._state.frame_h = h
                self._state.num_faces = len(faces)
                if emotions:
                    self._state.latest_emotions = emotions
                if looking and not prev_looking:
                    self._state.stable_since = now
                elif not looking:
                    self._state.stable_since = None
                if hands_up and not prev_hands:
                    self._state.hands_raised_since = now
                elif not hands_up:
                    self._state.hands_raised_since = None

            elapsed = time.time() - loop_start
            sleep_for = max(0.01, target_interval - elapsed)
            time.sleep(sleep_for)

        landmarker.close()
        if pose_landmarker:
            pose_landmarker.close()
