from pathlib import Path

BASE_DIR = Path(__file__).parent

# Timing (seconds)
LOCK_STABILITY_DURATION   = 1.5
LOCKED_TRANSITION_DURATION = 2.5
MORPHING_DURATION         = 30.0
RECAP_DURATION            = 15.0
FADE_DURATION             = 3.0
SCREENSAVER_IDLE_TIMEOUT  = 60.0

# Morphing: paths to uncanny image sets
_UNCANNY_ROOT  = BASE_DIR.parent / "uncanny_maker"
UNCANNY_OG_DIR = _UNCANNY_ROOT / "catalog"
UNCANNY_20_DIR = _UNCANNY_ROOT / "catalog_uncanny" / "20"
UNCANNY_60_DIR = _UNCANNY_ROOT / "catalog_uncanny" / "60"
UNCANNY_80_DIR = _UNCANNY_ROOT / "catalog_uncanny" / "80"

# Stage start times (seconds from phase start) and display labels
MORPH_STAGE_STARTS = [0.0, 7.5, 15.0, 22.5]
MORPH_STAGE_LABELS = ["ORIGINALE", "LEVE", "MEDIA", "PROFVNDA"]
MORPH_CROSSFADE    = 2.0  # seconds each crossfade lasts

# Vision
EMOTION_SAMPLE_RATE_HZ    = 10
GAZE_YAW_THRESHOLD_DEG    = 35.0
GAZE_PITCH_THRESHOLD_DEG  = 30.0
MIN_FACE_AREA_FRACTION    = 0.01

# Verdict scoring — measures how deeply the viewer fell into the uncanny valley.
VERDICT_WEIGHTS = {
    "disgust":  1.0,
    "fear":     0.9,
    "surprise": 0.4,
    "sad":      0.2,
    "angry":   -0.1,
    "neutral": -0.4,
    "happy":   -1.0,
}
VERDICT_VALLIS_THRESHOLD = 0.60
VERDICT_FIRMA_THRESHOLD  = 0.40

# Back-compat aliases
VERDICT_ARS_THRESHOLD   = VERDICT_VALLIS_THRESHOLD
VERDICT_ABEAT_THRESHOLD = VERDICT_FIRMA_THRESHOLD

# Paths
DB_PATH      = BASE_DIR / "data" / "gallery.db"
CATALOG_PATH = BASE_DIR / "catalog" / "artworks.json"  # kept for back-compat
ARTWORKS_DIR = BASE_DIR / "catalog" / "artworks"
STATIC_DIR   = BASE_DIR / "ui" / "static"

# Latin emotion names
EMOTION_LATIN = {
    "happy":    "Hilaritas",
    "sad":      "Tristitia",
    "angry":    "Ira",
    "surprise": "Mirum",
    "fear":     "Timor",
    "disgust":  "Fastidium",
    "neutral":  "Aequanimitas",
}
