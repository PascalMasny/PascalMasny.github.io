import io
import os
import sys
import time
import base64
from pathlib import Path

# Silence MediaPipe/TF glog spam before any vision import loads them.
os.environ.setdefault("GLOG_minloglevel", "3")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
os.environ.setdefault("GRPC_VERBOSITY", "ERROR")

sys.path.insert(0, str(Path(__file__).parent))

import streamlit as st
from streamlit_autorefresh import st_autorefresh

# Workaround for streamlit-webrtc race in SessionShutdownObserver.stop():
# the original checks `if self._polling_thread:` then dereferences
# self._polling_thread.is_alive() a few lines later. A concurrent stop() on
# another thread can set it to None in between, causing AttributeError and
# restarting the webrtc worker (which re-loads MediaPipe) on every rerun.
import threading as _threading
from streamlit_webrtc.shutdown import SessionShutdownObserver as _SSO
def _sso_stop_safe(self, timeout: float = 1.0) -> None:
    thread = self._polling_thread
    if thread is None:
        return
    self._polling_thread_stop_event.set()
    if _threading.current_thread() is not thread:
        thread.join(timeout=timeout)
    self._polling_thread = None
_SSO.stop = _sso_stop_safe

from streamlit_webrtc import webrtc_streamer, WebRtcMode

from ui.theme import inject_css
from core.state_machine import init_state, advance_state, PHASES
from data.db import init_db, get_session
from catalog.manager import get_catalog_manager
from vision.camera import GalleryVideoProcessor, CameraState
from config import (
    BASE_DIR,
    MORPHING_DURATION, RECAP_DURATION,
    MORPH_STAGE_STARTS, MORPH_STAGE_LABELS, MORPH_CROSSFADE,
    UNCANNY_20_DIR, UNCANNY_60_DIR, UNCANNY_80_DIR,
    EMOTION_LATIN,
)

# ─── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Vallis Simulacri",
    page_icon="⚜",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_css()
init_db()
init_state()
catalog = get_catalog_manager()


@st.cache_data(show_spinner=False)
def _artwork_data_uri(path_str: str) -> str:
    p = Path(path_str)
    if not p.exists():
        return ""
    ext = p.suffix.lstrip(".") or "jpg"
    return f"data:image/{ext};base64,{base64.b64encode(p.read_bytes()).decode()}"


def _morph_opacity(stage_idx: int, elapsed_t: float) -> float:
    """Calculate opacity for each morph stage based on elapsed time."""
    cf = MORPH_CROSSFADE
    starts = MORPH_STAGE_STARTS  # [0.0, 7.5, 15.0, 22.5]

    fade_out_start = starts[stage_idx + 1] - cf if stage_idx < 3 else 999.0
    fade_out_end   = starts[stage_idx + 1]       if stage_idx < 3 else 999.0
    fade_in_start  = starts[stage_idx] - cf      if stage_idx > 0 else -999.0
    fade_in_end    = starts[stage_idx]            if stage_idx > 0 else 0.0

    if stage_idx == 0:
        if elapsed_t < fade_out_start:   return 1.0
        if elapsed_t < fade_out_end:     return 1.0 - (elapsed_t - fade_out_start) / cf
        return 0.0
    if stage_idx == 3:
        if elapsed_t < fade_in_start:    return 0.0
        if elapsed_t < fade_in_end:      return (elapsed_t - fade_in_start) / cf
        return 1.0
    if elapsed_t < fade_in_start:        return 0.0
    if elapsed_t < fade_in_end:          return (elapsed_t - fade_in_start) / cf
    if elapsed_t < fade_out_start:       return 1.0
    if elapsed_t < fade_out_end:         return 1.0 - (elapsed_t - fade_out_start) / cf
    return 0.0


def _make_recap_graph(timestamps: list[float], samples: list[dict]) -> str:
    """Render emotion-over-time line graph. Returns base64 PNG."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    colors = {
        "happy":    "#E8C87A", "sad":      "#6B9E7A",
        "angry":    "#CC5555", "surprise": "#C9A961",
        "fear":     "#9B7FCC", "disgust":  "#C97A50",
        "neutral":  "#8B8B7E",
    }

    fig, ax = plt.subplots(figsize=(13, 5))

    if timestamps and samples:
        for emotion, color in colors.items():
            values = [s.get(emotion, 0) * 100 for s in samples]
            ax.plot(timestamps, values, color=color, linewidth=1.8,
                    label=EMOTION_LATIN.get(emotion, emotion), alpha=0.9)

    for t, lbl in zip([7.5, 15.0, 22.5], MORPH_STAGE_LABELS[1:]):
        ax.axvline(x=t, color="#5A3E1A", linestyle="--", linewidth=0.9, alpha=0.7)
        ax.text(t + 0.25, 94, lbl, color="#C9A961", fontsize=7.5, va="top",
                fontfamily="serif", style="italic")

    fig.patch.set_facecolor("#1C1410")
    ax.set_facecolor("#120E0A")
    ax.tick_params(colors="#8B6F2E", labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#3D2810")
    ax.set_xlabel("Seconds", color="#8B6F2E", fontsize=9)
    ax.set_ylabel("Intensity %", color="#8B6F2E", fontsize=9)
    ax.set_xlim(0, 30)
    ax.set_ylim(0, 100)
    ax.legend(loc="upper right", facecolor="#1C1410", edgecolor="#3D2810",
              labelcolor="#C9A961", fontsize=7, framealpha=0.85,
              ncol=2, handlelength=1.2)
    ax.grid(axis="y", color="#2A1E0A", linewidth=0.6, alpha=0.6)

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=140, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode()

# ─── IDLE header (above camera) ──────────────────────────────────────────────
phase = st.session_state.get("phase", "IDLE")

# ─── Developer zoom control ──────────────────────────────────────────────────
if "cam_zoom" not in st.session_state:
    st.session_state.cam_zoom = 1.0

query_params = st.query_params
if "dev" in query_params:
    with st.sidebar:
        st.markdown("### Dev Controls")
        st.session_state.cam_zoom = st.slider("Camera Zoom", 1.0, 3.0, st.session_state.cam_zoom, 0.1)

zoom = st.session_state.cam_zoom
zoom_css = f"""<style>
[data-testid="stCustomComponentV1"]:nth-of-type(1) iframe {{
    transform: scale({zoom}) !important;
    transform-origin: center center !important;
}}
</style>""" if zoom != 1.0 else ""
if zoom_css:
    st.markdown(zoom_css, unsafe_allow_html=True)

# ─── WebRTC camera — always renders, visible in IDLE, covered in other phases ─
# desired_playing_state=True ONLY on first render; passing it on every rerun causes
# the component to re-evaluate state and cycle connections.
_first_render = not st.session_state.get("_webrtc_started", False)
st.session_state._webrtc_started = True

ctx = webrtc_streamer(
    key="gallery-cam",
    mode=WebRtcMode.SENDRECV,
    desired_playing_state=True if _first_render else None,
    video_processor_factory=GalleryVideoProcessor,
    media_stream_constraints={
        "video": {
            "width": {"ideal": 1920},
            "height": {"ideal": 1080},
            "frameRate": {"ideal": 30},
            "facingMode": "user",
        },
        "audio": False,
    },
    async_processing=True,
    video_html_attrs={
        "style": {
            "width": "100%",
            "height": "100%",
            "objectFit": "cover",
        },
        "controls": False,
        "autoPlay": True,
        "muted": True,
    },
)

# ─── Auto-refresh ─────────────────────────────────────────────────────────────
# Aggressive reruns remount the webrtc iframe and kill the preview. Refresh only
# as fast as each phase needs:
#   IDLE          — 1.5s (just to pick up face/hands changes)
#   LOCKED/FADE   — 1s (transitions)
#   VIEWING       — 750ms (countdown + emotion bars)
#   VERDICT_*     — 2s (static screen)
_phase = st.session_state.get("phase", "IDLE")
_refresh_ms = {
    "IDLE":     1500,
    "LOCKED":   1000,
    "MORPHING":  500,   # fast enough to update emotion bars + opacity steps
    "RECAP":    5000,   # mostly static after first render
    "FADE":     1000,
}.get(_phase, 1500)
st_autorefresh(interval=_refresh_ms, key="gallery-refresh")

# ─── Read camera state ────────────────────────────────────────────────────────
camera_state = CameraState()
if ctx.video_processor:
    processor: GalleryVideoProcessor = ctx.video_processor
    camera_state = processor.get_state()
    processor.set_emotion_sampling(st.session_state.phase == "MORPHING")
    processor.set_pose_sampling(st.session_state.phase == "IDLE")

# ─── State machine ────────────────────────────────────────────────────────────
db = get_session()
try:
    advance_state(camera_state, catalog, db)
finally:
    db.close()

# Re-read phase (may have changed)
phase = st.session_state.phase

# ─── IDLE: text overlaid on full-screen video ───────────────────────────────
if phase == "IDLE":
    face = camera_state.face_present
    hands = camera_state.hands_raised
    if hands:
        status_icon = "✦"
        status_text = "CONSENT ACKNOWLEDGED — HOLD"
        status_color = "#E8C87A"
        hint = "Entering the valley…"
    elif face:
        status_icon = "◉"
        status_text = "VISITOR DETECTED"
        status_color = "#C9A961"
        hint = "Read the panel. Raise both hands to accept and begin."
    else:
        status_icon = "◎"
        status_text = "APPROACH · BE SEEN"
        status_color = "#8B6F2E"
        hint = "Stand before the glass and read the instructions."

    st.markdown(f"""
<div class="mirror-overlay">
  <!-- Top: title -->
  <div class="mirror-top">
    <div style="font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.5rem,5vw,4rem);
                letter-spacing:0.25em; color:#C9A961; text-shadow:0 3px 20px rgba(0,0,0,0.8);">
      VALLIS · SIMVLACRI
    </div>
    <div style="color:#C9A961; font-size:clamp(0.9rem,1.5vw,1.5rem);
                letter-spacing:0.3em; opacity:0.5; margin-top:0.5rem;">
      ❧ · · ❧
    </div>
  </div>

  <aside class="howitworks-panel"><div class="howitworks-title">THE EXPERIENCE</div><div class="howitworks-step" style="margin-bottom:0.6rem;line-height:1.6;">A classical artwork is presented to you — then fed into an AI. The AI output is fed back in again. And again. Each cycle pushes the image further into the uncanny valley: recognisable, yet deeply wrong.</div><div style="border-top:1px solid rgba(201,169,97,0.25);margin:0.6rem 0;"></div><div class="howitworks-step"><strong>I.</strong>A classical work appears before you</div><div class="howitworks-step"><strong>II.</strong>It slowly morphs through AI feedback loops</div><div class="howitworks-step"><strong>III.</strong>Your emotional response is recorded in real time</div><div class="howitworks-step"><strong>IV.</strong>A graph of your descent is revealed</div><div style="border-top:1px solid rgba(201,169,97,0.25);margin:0.6rem 0;"></div><div style="background:rgba(139,34,34,0.18);border:1px solid rgba(139,34,34,0.5);border-radius:4px;padding:0.5rem 0.7rem;"><div style="font-family:'Cinzel',serif;font-size:clamp(0.6rem,0.85vw,0.85rem);letter-spacing:0.15em;color:#CC6666;margin-bottom:0.25rem;">&#9888; CONTENT WARNING</div><div class="howitworks-step" style="color:#E0B0B0;margin:0;">Some images may appear disturbing due to uncanny distortion. Raise both hands to acknowledge and begin.</div></div></aside>

  <!-- Bottom: status + plaque -->
  <div class="mirror-bottom">
    <div style="font-family:'Cinzel',serif; font-weight:700;
                font-size:clamp(0.9rem,3vw,2rem);
                letter-spacing:0.22em; color:{status_color};
                text-shadow:0 3px 15px rgba(0,0,0,0.9);
                display:flex; align-items:center; justify-content:center; gap:0.8rem;">
      <span>{status_icon}</span>
      {status_text}
      <span>{status_icon}</span>
    </div>
    <div style="font-family:'Cormorant Garamond',serif; font-style:italic;
                color:#E0D0B0; font-size:clamp(0.95rem,2vw,1.5rem); margin-top:0.5rem;
                text-shadow:0 2px 12px rgba(0,0,0,0.9);">
      {hint}
    </div>
    <div style="color:#C9A961; font-size:clamp(0.85rem,1.2vw,1.2rem);
                letter-spacing:0.3em; opacity:0.5; margin:0.6rem 0 0.4rem;">
      ❧ · · ❧
    </div>
    <div style="font-family:'Pinyon Script',cursive; font-size:clamp(1.4rem,4vw,3rem);
                color:#C9A961; opacity:0.7; text-shadow:0 3px 15px rgba(0,0,0,0.8);">
      Vallis Simulacri
    </div>
    <div style="font-family:'Cormorant Garamond',serif; font-size:clamp(0.8rem,1.2vw,1.1rem);
                letter-spacing:0.15em; color:#8B6F2E; margin-top:0.2rem;
                text-shadow:0 2px 8px rgba(0,0,0,0.8);">
      THE VALLEY OF LIKENESS
    </div>
  </div>
</div>
""", unsafe_allow_html=True)

# ─── Non-IDLE: full-screen overlay on top of webrtc ──────────────────────────
elif phase == "LOCKED":
    artwork = st.session_state.current_artwork
    title = artwork["title"] if artwork else "..."
    st.markdown(f"""
<div class="gallery-overlay">
  <div style="font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.1rem,3vw,2.2rem);
              letter-spacing:0.3em; color:#C9A961;">VALLIS · SIMVLACRI</div>
  <div style="color:#C9A961; font-size:clamp(0.9rem,1.3vw,1.4rem); letter-spacing:0.3em; opacity:0.7; margin:1rem 0;">❧ · · ❧</div>
  <div style="border:3px solid #C9A961; border-radius:50%; padding:clamp(0.8rem,1.5vw,1.5rem) clamp(1.5rem,3vw,3rem);
              box-shadow:0 0 40px rgba(201,169,97,0.35);">
    <div style="font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1rem,3vw,2rem);
                letter-spacing:0.25em; color:#C9A961;">SPECTATOR IDENTIFIED</div>
  </div>
  <div style="color:#C9A961; font-size:clamp(0.9rem,1.3vw,1.4rem); letter-spacing:0.3em; opacity:0.7; margin:1rem 0;">❧ · · ❧</div>
  <div style="font-family:'Cormorant Garamond',serif; font-style:italic; color:#E0D0B0;
              font-size:clamp(1.1rem,1.8vw,1.8rem);">
    Prepare thyself to confront —
  </div>
  <div style="font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1.4rem,5vw,3.5rem);
              color:#E8C87A; margin-top:0.5rem; text-align:center; padding:0 1rem;">
    {title}
  </div>
</div>
""", unsafe_allow_html=True)

elif phase == "MORPHING":
    artwork = st.session_state.current_artwork
    elapsed_t = time.time() - st.session_state.phase_entered_at
    emotions  = camera_state.latest_emotions

    # ── Load all 4 image URIs ────────────────────────────────────────────────
    stem = Path(artwork["image_path"]).stem
    img_paths = [
        artwork["image_path"],
        artwork["image_path_20"],
        artwork["image_path_60"],
        artwork["image_path_80"],
    ]
    uris = [_artwork_data_uri(p) for p in img_paths]

    # ── Calculate per-stage opacity (Python → CSS inline) ────────────────────
    opacities = [_morph_opacity(i, elapsed_t) for i in range(4)]

    # Current visible label: stage with highest opacity
    current_stage = max(range(4), key=lambda i: opacities[i])
    stage_label = MORPH_STAGE_LABELS[current_stage]

    # Progress bar width
    progress_pct = min(100, int((elapsed_t / MORPHING_DURATION) * 100))

    # ── Build stacked image layers ───────────────────────────────────────────
    img_layers = ""
    for idx, (uri, op) in enumerate(zip(uris, opacities)):
        if uri:
            img_layers += (
                f'<img src="{uri}" style="position:absolute;top:0;left:0;'
                f'width:100%;height:100%;object-fit:contain;'
                f'opacity:{op:.3f};transition:opacity 0.6s ease-in-out;" />'
            )

    # ── Emotion bars ─────────────────────────────────────────────────────────
    bars = ""
    for eng, val in sorted(emotions.items(), key=lambda x: -x[1])[:5]:
        latin = EMOTION_LATIN.get(eng, eng.capitalize())
        pct = round(val * 100, 1)
        bars += f"""
<div style="margin:0.5rem 0;">
  <div style="display:flex;justify-content:space-between;font-family:'Cinzel',serif;
              font-size:clamp(0.8rem,1.1vw,1.1rem);letter-spacing:0.07em;color:#C9A961;margin-bottom:4px;">
    <span>{latin}</span><span>{pct}%</span>
  </div>
  <div style="height:clamp(6px,0.9vw,10px);background:rgba(201,169,97,0.15);border-radius:5px;overflow:hidden;">
    <div style="width:{pct}%;height:100%;background:linear-gradient(90deg,#8B6F2E,#E8C87A);border-radius:5px;transition:width 0.3s;"></div>
  </div>
</div>"""

    emotions_panel = f"""
<div style="display:flex;flex-direction:column;justify-content:center;height:100%;">
  <div style="font-family:'Cinzel',serif;font-size:clamp(0.9rem,1.2vw,1.2rem);
              letter-spacing:0.2em;color:#8B6F2E;text-align:center;margin-bottom:0.8rem;">
    ANIMA · TVSCITVR
  </div>
  {bars if bars else '<div style="font-family:\'Cormorant Garamond\',serif;font-style:italic;color:#8B6F2E;text-align:center;">Reading your emotions…</div>'}
</div>"""

    st.markdown(f"""
<div class="gallery-overlay">
  <!-- Title -->
  <div style="text-align:center;margin-bottom:0.6rem;width:100%;">
    <div style="font-family:'Cinzel',serif;font-weight:700;font-size:clamp(1.2rem,3.5vw,2.5rem);
                letter-spacing:0.12em;color:#C9A961;">{artwork['title']}</div>
  </div>

  <!-- Stage label -->
  <div style="font-family:'Cormorant Garamond',serif;font-style:italic;
              font-size:clamp(0.9rem,1.3vw,1.3rem);letter-spacing:0.3em;
              color:#8B6F2E;text-align:center;margin-bottom:0.5rem;">
    {stage_label}
  </div>

  <!-- Artwork + emotions side by side -->
  <div class="viewing-split">
    <div class="viewing-art">
      <!-- Image stack -->
      <div style="position:relative;width:100%;padding-top:75%;
                  border:4px solid #C9A961;
                  box-shadow:0 0 0 2px #8B6F2E,0 0 0 8px #1C1410,0 0 0 10px #C9A961,0 0 40px rgba(201,169,97,0.25);
                  background:#0a0806;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;">
          {img_layers if img_layers else '<div style="color:#8B6F2E;display:flex;align-items:center;justify-content:center;height:100%;">[ IMAGE AWAITED ]</div>'}
        </div>
      </div>
      <!-- Progress bar -->
      <div style="height:3px;background:rgba(201,169,97,0.12);border-radius:2px;margin-top:0.6rem;">
        <div style="width:{progress_pct}%;height:100%;background:linear-gradient(90deg,#8B6F2E,#C9A961);
                    border-radius:2px;transition:width 0.5s linear;"></div>
      </div>
      <!-- Stage ticks -->
      <div style="display:flex;justify-content:space-between;margin-top:0.3rem;
                  font-family:'Cinzel',serif;font-size:clamp(0.55rem,0.8vw,0.75rem);
                  letter-spacing:0.06em;color:#5A3E1A;">
        <span>ORIGINALE</span><span>LEVE</span><span>MEDIA</span><span>PROFVNDA</span>
      </div>
    </div>
    <div class="viewing-emotions">
      {emotions_panel}
    </div>
  </div>
</div>
""", unsafe_allow_html=True)

elif phase == "RECAP":
    artwork  = st.session_state.current_artwork
    session  = st.session_state.viewer_session
    verdict  = st.session_state.personal_verdict
    seal_colors = {"VALLIS": "#8B2222", "LIMEN": "#8B9E6B", "FIRMA": "#C9A961"}
    sc = seal_colors.get(verdict, "#C9A961")

    # Generate graph once per viewing session
    if "recap_graph" not in st.session_state:
        st.session_state.recap_graph = _make_recap_graph(
            session.emotion_timestamps,
            session.emotion_samples,
        )
    graph_b64 = st.session_state.recap_graph

    # ── 4-panel thumbnail strip ──────────────────────────────────────────────
    thumb_paths = [
        artwork["image_path"],
        artwork["image_path_20"],
        artwork["image_path_60"],
        artwork["image_path_80"],
    ]
    thumb_uris = [_artwork_data_uri(p) for p in thumb_paths]

    # Horizontal thumbnail strip (1 row of 4)
    thumb_cells = ""
    for lbl, uri in zip(MORPH_STAGE_LABELS, thumb_uris):
        img_tag = (
            f'<img src="{uri}" style="width:100%;height:14vh;object-fit:contain;display:block;" />'
            if uri else '<div style="height:14vh;background:#0a0806;"></div>'
        )
        thumb_cells += f"""
<div style="text-align:center;flex:1;min-width:0;">
  <div style="font-family:'Cinzel',serif;font-size:clamp(0.5rem,0.75vw,0.78rem);
              letter-spacing:0.12em;color:#8B6F2E;margin-bottom:0.3rem;">{lbl}</div>
  <div style="border:2px solid #3D2810;padding:3px;background:#0a0806;">{img_tag}</div>
</div>"""

    graph_tag = (
        f'<img src="data:image/png;base64,{graph_b64}" '
        f'style="width:100%;height:auto;border-radius:4px;border:1px solid #3D2810;display:block;" />'
        if graph_b64 else
        '<div style="color:#8B6F2E;font-style:italic;text-align:center;padding:2rem;">No emotion data recorded.</div>'
    )

    st.markdown(f"""
<div class="gallery-overlay" style="justify-content:flex-start;padding-top:1.5vh;">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:0.6rem;width:100%;flex-shrink:0;">
    <div style="font-family:'Cinzel',serif;font-weight:700;
                font-size:clamp(0.85rem,1.4vw,1.4rem);letter-spacing:0.3em;color:#8B6F2E;">
      ANIMA IN SPECULO
    </div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;
                font-size:clamp(0.95rem,1.3vw,1.3rem);color:#E0D0B0;">
      The Soul in the Mirror — your emotional descent
    </div>
  </div>

  <!-- Horizontal thumbnail strip -->
  <div style="display:flex;gap:0.5rem;width:100%;flex-shrink:0;margin-bottom:0.7rem;">
    {thumb_cells}
  </div>

  <!-- Large emotion graph -->
  <div style="width:100%;flex:1;min-height:0;">
    {graph_tag}
  </div>

  <!-- Seal -->
  <div style="display:flex;justify-content:center;margin-top:0.6rem;flex-shrink:0;">
    <div class="seal-medallion" style="border:4px solid {sc};
                background:radial-gradient(circle at 40% 35%,{sc}55,{sc}22);color:{sc};">
      {verdict}
    </div>
  </div>
</div>
""", unsafe_allow_html=True)

elif phase == "FADE":
    st.markdown("""
<div class="gallery-overlay">
  <div style="font-family:'Cinzel',serif; font-weight:700; font-size:clamp(2rem,4vw,3rem);
              letter-spacing:0.3em; color:#8B6F2E;">
    THE VALLEY AWAITS THE NEXT SOUL
  </div>
  <div style="color:#C9A961; font-size:4rem; margin-top:1rem; opacity:0.6;">⚜</div>
</div>
""", unsafe_allow_html=True)
