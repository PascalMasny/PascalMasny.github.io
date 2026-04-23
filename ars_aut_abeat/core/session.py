import uuid
import time
from dataclasses import dataclass, field


@dataclass
class ViewerSession:
    session_id:         str              = field(default_factory=lambda: str(uuid.uuid4()))
    artwork_id:         int | None       = None
    artwork_slug:       str              = ""
    emotion_samples:    list[dict[str, float]] = field(default_factory=list)
    emotion_timestamps: list[float]      = field(default_factory=list)  # seconds from MORPHING start
    started_at:         float            = field(default_factory=time.time)

    def add_sample(self, emotions: dict[str, float], elapsed: float = 0.0):
        if emotions:
            self.emotion_samples.append(emotions)
            self.emotion_timestamps.append(elapsed)

    def duration(self) -> float:
        return time.time() - self.started_at
