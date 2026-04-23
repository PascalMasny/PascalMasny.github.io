import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.verdict import score_emotions, verdict_label, personal_verdict_text


def test_score_disgust_high():
    # Disgust is the core uncanny signal — should score high
    emotions = {"disgust": 1.0, "happy": 0.0, "neutral": 0.0}
    score = score_emotions(emotions)
    assert score > 0.7, f"Expected high score for disgust, got {score}"


def test_score_happy_low():
    # Happy = far from the valley — should score low
    emotions = {"happy": 1.0, "disgust": 0.0, "neutral": 0.0}
    score = score_emotions(emotions)
    assert score < 0.3, f"Expected low score for happy, got {score}"


def test_verdict_vallis():
    # Strong disgust/fear → fell into the valley
    emotions = {"disgust": 0.7, "fear": 0.3}
    assert verdict_label(score_emotions(emotions)) == "VALLIS"


def test_verdict_firma():
    # Calm acceptance → stable ground, above the valley
    emotions = {"happy": 0.8, "neutral": 0.2}
    assert verdict_label(score_emotions(emotions)) == "FIRMA"


def test_personal_lines_sorted():
    emotions = {"happy": 0.5, "sad": 0.3, "neutral": 0.2}
    lines = personal_verdict_text(emotions)
    pcts = [p for _, p in lines]
    assert pcts == sorted(pcts, reverse=True)


if __name__ == "__main__":
    test_score_disgust_high()
    test_score_happy_low()
    test_verdict_vallis()
    test_verdict_firma()
    test_personal_lines_sorted()
    print("All tests passed.")
