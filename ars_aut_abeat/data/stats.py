import json
from .models import Viewing
from config import VERDICT_WEIGHTS


def artwork_summary(artwork_id: int, session) -> dict:
    viewings = session.query(Viewing).filter_by(artwork_id=artwork_id).all()
    if not viewings:
        return {"count": 0, "avg_emotions": {}, "score": 0.5, "verdict_counts": {}}

    all_emotions = []
    verdict_counts = {"VALLIS": 0, "LIMEN": 0, "FIRMA": 0}
    for v in viewings:
        if v.emotion_json:
            all_emotions.append(json.loads(v.emotion_json))
        if v.verdict in verdict_counts:
            verdict_counts[v.verdict] += 1

    avg_emotions = {}
    if all_emotions:
        keys = all_emotions[0].keys()
        for k in keys:
            avg_emotions[k] = sum(e.get(k, 0) for e in all_emotions) / len(all_emotions)

    score = _score(avg_emotions)
    return {
        "count": len(viewings),
        "avg_emotions": avg_emotions,
        "score": score,
        "verdict_counts": verdict_counts,
    }


def concordance(viewer_emotions: dict, artwork_avg_emotions: dict) -> float:
    """0.0 = complete disagreement, 1.0 = perfect agreement."""
    if not artwork_avg_emotions:
        return 0.5
    keys = set(viewer_emotions) & set(artwork_avg_emotions)
    if not keys:
        return 0.5
    diff = sum(abs(viewer_emotions.get(k, 0) - artwork_avg_emotions.get(k, 0)) for k in keys)
    max_diff = len(keys) * 1.0
    return 1.0 - (diff / max_diff)


def _score(emotions: dict) -> float:
    if not emotions:
        return 0.5
    raw = sum(emotions.get(k, 0) * w for k, w in VERDICT_WEIGHTS.items())
    # normalize from [-1, 1] to [0, 1]
    return max(0.0, min(1.0, (raw + 1.0) / 2.0))
