import time
import streamlit as st
from config import (
    LOCK_STABILITY_DURATION,
    LOCKED_TRANSITION_DURATION,
    MORPHING_DURATION,
    RECAP_DURATION,
    FADE_DURATION,
)

PHASES = ["IDLE", "LOCKED", "MORPHING", "RECAP", "FADE"]

PHASE_DURATIONS = {
    "LOCKED":   LOCKED_TRANSITION_DURATION,
    "MORPHING": MORPHING_DURATION,
    "RECAP":    RECAP_DURATION,
    "FADE":     FADE_DURATION,
}


def init_state():
    defaults = {
        "phase":           "IDLE",
        "phase_entered_at": time.time(),
        "viewer_session":  None,
        "avg_emotions":    {},
        "personal_verdict": "",
        "current_artwork": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def elapsed() -> float:
    return time.time() - st.session_state.phase_entered_at


def enter_phase(phase: str):
    st.session_state.phase = phase
    st.session_state.phase_entered_at = time.time()


def advance_state(camera_state, catalog_manager, db_session):
    """Called on every rerun. Reads camera state + timing, transitions phases."""
    phase = st.session_state.phase
    t = elapsed()

    if phase == "IDLE":
        _handle_idle(camera_state, catalog_manager)

    elif phase == "LOCKED":
        if t >= PHASE_DURATIONS["LOCKED"]:
            enter_phase("MORPHING")
            # Reset started_at so duration_seconds reflects MORPHING time only
            st.session_state.viewer_session.started_at = time.time()

    elif phase == "MORPHING":
        s = st.session_state.viewer_session
        if camera_state.latest_emotions:
            s.add_sample(camera_state.latest_emotions, elapsed=t)
        if t >= PHASE_DURATIONS["MORPHING"]:
            _finalize_viewing(db_session, camera_state)
            enter_phase("RECAP")

    elif phase == "RECAP":
        if t >= PHASE_DURATIONS["RECAP"]:
            enter_phase("FADE")

    elif phase == "FADE":
        if t >= PHASE_DURATIONS["FADE"]:
            _reset()
            enter_phase("IDLE")


def _handle_idle(camera_state, catalog_manager):
    from core.session import ViewerSession

    if not camera_state.hands_raised or camera_state.hands_raised_since is None:
        return

    held_for = time.time() - camera_state.hands_raised_since
    if held_for >= LOCK_STABILITY_DURATION:
        artwork = catalog_manager.pick_next()
        if artwork is None:
            return
        session = ViewerSession(artwork_id=artwork["id"], artwork_slug=artwork["slug"])
        st.session_state.viewer_session = session
        st.session_state.current_artwork = artwork
        enter_phase("LOCKED")


def _finalize_viewing(db_session, camera_state):
    from vision.emotion import average_samples
    from core.verdict import score_emotions, verdict_label, personal_verdict_text, save_viewing, collective_summary

    s = st.session_state.viewer_session
    avg = average_samples(s.emotion_samples)
    score = score_emotions(avg)
    label = verdict_label(score)

    st.session_state.avg_emotions = avg
    st.session_state.personal_verdict = label
    st.session_state.personal_lines = personal_verdict_text(avg)

    save_viewing(s, avg, label, db_session, num_faces=max(1, camera_state.num_faces))

    coll = collective_summary(s.artwork_id, avg, db_session)
    st.session_state.collective_data = coll


def _reset():
    st.session_state.viewer_session  = None
    st.session_state.avg_emotions    = {}
    st.session_state.personal_verdict = ""
    st.session_state.current_artwork = None
    st.session_state.pop("recap_graph", None)
