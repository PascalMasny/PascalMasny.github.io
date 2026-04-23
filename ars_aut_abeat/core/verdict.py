import json
from config import VERDICT_ARS_THRESHOLD, VERDICT_ABEAT_THRESHOLD, EMOTION_LATIN
from data.stats import artwork_summary, concordance, _score
from data.models import Viewing
from vision.emotion import dominant_emotion


def score_emotions(emotions: dict[str, float]) -> float:
    return _score(emotions)


def verdict_label(score: float) -> str:
    # VALLIS — fell into the uncanny valley (high disgust/fear)
    # LIMEN  — on the threshold (mixed / unsure)
    # FIRMA  — stable ground, unaffected by the likeness
    if score >= VERDICT_ARS_THRESHOLD:
        return "VALLIS"
    elif score >= VERDICT_ABEAT_THRESHOLD:
        return "LIMEN"
    return "FIRMA"


def personal_verdict_text(emotions: dict[str, float]) -> list[tuple[str, float]]:
    """Returns sorted list of (latin_name, pct) for display."""
    lines = []
    for eng, pct in sorted(emotions.items(), key=lambda x: -x[1]):
        latin = EMOTION_LATIN.get(eng, eng.capitalize())
        lines.append((latin, round(pct * 100, 1)))
    return lines


def save_viewing(session_obj, avg_emotions: dict, verdict: str, db_session, num_faces: int = 1):
    v = Viewing(
        artwork_id=session_obj.artwork_id,
        session_id=session_obj.session_id,
        duration_seconds=session_obj.duration(),
        emotion_json=json.dumps(avg_emotions),
        dominant_emotion=dominant_emotion(avg_emotions),
        verdict=verdict,
        num_faces_in_frame=num_faces,
    )
    db_session.add(v)
    db_session.commit()


def collective_summary(artwork_id: int, viewer_emotions: dict, db_session) -> dict:
    summary = artwork_summary(artwork_id, db_session)
    conc = concordance(viewer_emotions, summary.get("avg_emotions", {}))
    score = summary.get("score", 0.5)
    label = verdict_label(score)
    if summary["avg_emotions"]:
        dominant = max(summary["avg_emotions"], key=summary["avg_emotions"].get)
        dominant_latin = EMOTION_LATIN.get(dominant, dominant.capitalize())
    else:
        dominant = "neutral"
        dominant_latin = EMOTION_LATIN["neutral"]
    return {
        "count": summary["count"],
        "avg_emotions": summary["avg_emotions"],
        "score": score,
        "verdict": label,
        "concordance": conc,
        "dominant": dominant,
        "dominant_latin": dominant_latin,
        "verdict_counts": summary.get("verdict_counts", {}),
    }
