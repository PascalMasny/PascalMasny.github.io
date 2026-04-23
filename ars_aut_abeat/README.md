# Vallis Simulacri

**"The Valley of Likeness."** An interactive gallery installation that measures how deeply visitors fall into the uncanny valley when confronted with likenesses — photographs, painted portraits, wax figures, AI-generated faces, animatronics. Their involuntary emotional response is read from their face in real time and rendered as a Latin verdict.

Designed for projection on a large beamer display. Visitors see themselves full-screen in a baroque mirror (webcam), raise both hands to enter the valley, then receive a personal and collective verdict sealed in wax.

---

## Concept

[Mori, 1970](https://en.wikipedia.org/wiki/Uncanny_valley): as a likeness of a human becomes more realistic, human emotional response flips from affinity to revulsion just before reaching full human likeness — the uncanny valley. This installation presents six likenesses arranged across that spectrum and quantifies each visitor's descent using facial emotion detection.

**VALLIS** — you fell into the valley (disgust / fear dominated)  
**LIMEN** — you stood at the threshold (mixed response)  
**FIRMA** — stable ground, the likeness did not fool your instincts (acceptance / calm)

---

## Architecture

```
app.py                  ← Streamlit entrypoint, all UI rendering
config.py               ← Timings, thresholds, paths, constants
├── ui/
│   └── theme.py        ← All CSS: mirror overlay, gilded frames, responsive layout
├── vision/
│   ├── camera.py       ← Threaded video processor (WebRTC recv + analysis daemon)
│   ├── emotion.py      ← Blendshape → emotion mapping
│   ├── face_detector.py← FaceResult dataclass
│   └── gaze.py         ← Head pose → "looking at camera" check
├── core/
│   ├── state_machine.py← FSM: IDLE → LOCKED → VIEWING → VERDICT → FADE
│   ├── session.py      ← ViewerSession dataclass (per-visitor state)
│   └── verdict.py      ← Score emotions, determine VALLIS / LIMEN / FIRMA
├── data/
│   ├── db.py           ← SQLite init + artwork seeding from JSON
│   ├── models.py       ← SQLAlchemy: Artwork, Viewing
│   └── stats.py        ← Aggregate queries, concordance score
├── catalog/
│   ├── manager.py      ← Picks least-viewed artwork for balanced data
│   ├── artworks.json   ← Catalog definition (edit to add/change likenesses)
│   └── artworks/       ← Image files (drop .jpg here matching catalog slugs)
└── tests/
    ├── test_verdict.py ← Verdict scoring / label tests
    └── test_gaze.py    ← Gaze detection tests
```

---

## State Machine

```
IDLE → LOCKED → VIEWING → VERDICT_PERSONAL → VERDICT_COLLECTIVE → FADE → IDLE
```

| Phase | Duration | Trigger to next |
|-------|----------|-----------------|
| **IDLE** | Indefinite | Both hands raised above shoulders for 1.5 s |
| **LOCKED** | 2.5 s | Timer — "Prepare thyself to confront—" |
| **VIEWING** | 6 s | Timer — emotions sampled at 10 Hz |
| **VERDICT_PERSONAL** | 8 s | Timer — personal emotion breakdown + seal |
| **VERDICT_COLLECTIVE** | 8 s | Timer — aggregate of all prior visitors |
| **FADE** | 3 s | Timer → reset to IDLE |

All durations are tunable in `config.py`.

---

## Interaction Flow

1. **IDLE** — Full-screen camera mirror. "VALLIS · SIMVLACRI" at top. "HOW IT WORKS" panel on the right. Visitor sees themselves.
2. **Trigger** — Visitor raises both hands above shoulders. Status: "HANDS RAISED — HOLD". After 1.5 s stable, locks in.
3. **LOCKED** — "SPECTATOR IDENTIFIED" medallion. Likeness title revealed. 2.5 s.
4. **VIEWING** — Two-column layout: likeness in gilded frame (left), live emotion bars in Latin (right). Roman numeral countdown.
5. **VERDICT_PERSONAL** — Parchment scroll: emotion breakdown. Wax seal: **VALLIS** (burgundy) / **LIMEN** (sage) / **FIRMA** (gold).
6. **VERDICT_COLLECTIVE** — "Vox Populi" — aggregate verdict of all prior visitors. Concordance with the crowd.
7. **FADE** — "The valley awaits the next soul."

---

## Vision Pipeline

### Threading Model

The WebRTC `recv()` callback must return in under ~16 ms or the video feed stutters. All MediaPipe work runs on a separate daemon thread.

```
WebRTC recv()          →  Stash latest frame into buffer  →  Return frame immediately (< 1 ms)
                                    ↓
Analysis daemon        →  Read latest frame at ~10 Hz
                       →  FaceLandmarker — detect faces, compute blendshapes
                       →  PoseLandmarker — detect hands raised
                       →  Head pose (solvePnP) — confirm visitor is looking at camera
                       →  Write results to CameraState (threading.Lock)
                                    ↓
Streamlit main thread  →  Read CameraState snapshot every 750–1500 ms
```

Each `GalleryVideoProcessor` instance owns its own MediaPipe landmarker objects (not shared across threads). The processor lives as long as the WebRTC session is alive — one initialization per browser session.

### Emotion Detection

Uses MediaPipe FaceLandmarker blendshapes (52 FACS action units). No TensorFlow, no DeepFace.

| Emotion | Primary blendshapes | Uncanny weight |
|---------|---------------------|---------------|
| Disgust | noseSneer, mouthPucker | **+1.0** (core signal) |
| Fear | eyeWide + browInnerUp | **+0.9** |
| Surprise | eyeWide, jawOpen, browOuterUp | +0.4 |
| Sad | mouthFrown, browInnerUp | +0.2 |
| Angry | browDown, noseSneer | −0.1 |
| Neutral | Residual (1.5 baseline) | −0.4 |
| Happy | mouthSmile, cheekSquint | **−1.0** (far from valley) |

### Head Pose (Gaze Detection)

Uses OpenCV `solvePnP` with a 3D canonical face model and 6 MediaPipe face landmarks. Checks that yaw ≤ 35° and pitch ≤ 30° before counting a face as "engaged".

### Hands-Raised Detection

MediaPipe PoseLandmarker (lite model, ~3 MB). Checks both wrists (landmarks 15, 16) are above both shoulders (landmarks 11, 12) in image y-coordinates.

---

## Verdict Scoring

```
score = Σ(emotion_probability × weight) over all emotions
score normalized to [0, 1]: (raw + 1.0) / 2.0
```

| Score | Verdict | Meaning |
|-------|---------|---------|
| ≥ 0.60 | **VALLIS** | Fell into the uncanny valley |
| 0.40–0.60 | **LIMEN** | At the threshold |
| < 0.40 | **FIRMA** | Stable ground — likeness did not unsettle |

The collective verdict is the weighted average score across all viewings of that likeness.

Concordance (0–1) measures how closely a visitor's emotion profile matches the crowd's average using per-emotion absolute deviation.

---

## Installation

```bash
# Python 3.12+ required (tested on 3.14, Apple Silicon M4)
pip install -r requirements.txt
```

### macOS SSL fix (run once if model download fails on first launch)

```bash
/Applications/Python\ 3.14/Install\ Certificates.command
```

### Known macOS issue — duplicate libavdevice

`opencv-python-headless` and `PyAV` both bundle a copy of `libavdevice`. macOS logs two objc class-duplicate warnings at startup. These are **cosmetic** — neither copy is used for AVFoundation device I/O in this app. Safe to ignore.

---

## Running

```bash
streamlit run app.py
```

Opens at `http://localhost:8501`. The camera starts automatically — no click required.

### Developer Mode

Add `?dev=1` to the URL:

```
http://localhost:8501/?dev=1
```

Reveals a sidebar with a **Camera Zoom** slider (1× – 3×) for framing adjustments.

---

## Configuration (`config.py`)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `LOCK_STABILITY_DURATION` | 1.5 s | How long hands must stay raised to trigger |
| `LOCKED_TRANSITION_DURATION` | 2.5 s | "Identified" screen duration |
| `VIEWING_DURATION` | 6.0 s | Viewing + emotion sampling window |
| `VERDICT_PERSONAL_DURATION` | 8.0 s | Personal verdict display |
| `VERDICT_COLLECTIVE_DURATION` | 8.0 s | Collective verdict display |
| `FADE_DURATION` | 3.0 s | Fade before returning to IDLE |
| `GAZE_YAW_THRESHOLD_DEG` | 35.0 | Max head yaw to count as looking |
| `GAZE_PITCH_THRESHOLD_DEG` | 30.0 | Max head pitch to count as looking |
| `MIN_FACE_AREA_FRACTION` | 0.01 | Minimum face bbox (1% of frame) |
| `EMOTION_SAMPLE_RATE_HZ` | 10 | Analysis thread target rate |
| `VERDICT_VALLIS_THRESHOLD` | 0.60 | Score above = VALLIS |
| `VERDICT_FIRMA_THRESHOLD` | 0.40 | Score below = FIRMA |

---

## Catalog

### Current likenesses (spectrum from familiar → uncanny)

| Slug | Title | Type | Image file |
|------|-------|------|------------|
| `imago_vera` | Imago Vera | Photograph | `imago_vera.jpg` |
| `icon_picta` | Icon Picta | Painted Portrait | `icon_picta.jpg` |
| `simulacrum_marmoreum` | Simulacrum Marmoreum | Marble Bust | `simulacrum_marmoreum.jpg` |
| `effigies_cerea` | Effigies Cerea | Wax Figure | `effigies_cerea.jpg` |
| `vultus_syntheticus` | Vultus Syntheticus | AI Portrait | `vultus_syntheticus.jpg` |
| `automaton` | Automaton | Animatronic | `automaton.jpg` |

### Adding a likeness

1. Place image in `catalog/artworks/` as `<slug>.jpg`
2. Add entry to `catalog/artworks.json`:

```json
{
  "slug": "my-likeness",
  "title": "My Latin Title",
  "artist": "—",
  "year": "Description of type",
  "image_path": "catalog/artworks/my-likeness.jpg",
  "description": "One evocative sentence."
}
```

3. Delete `data/gallery.db` and restart — auto-seeds into DB.

> **Note:** always delete `data/gallery.db` when changing the catalog to avoid stale artwork_id references.

---

## Database

SQLite at `data/gallery.db`. Auto-created on first run.

**artworks** — id, slug, title, artist, year, image\_path, description  
**viewings** — id, artwork\_id, session\_id, timestamp, duration\_seconds, emotion\_json, dominant\_emotion, verdict (VALLIS/LIMEN/FIRMA), num\_faces\_in\_frame

---

## Design Aesthetic

**Fonts:** Cinzel (titles / labels), Cormorant Garamond (body), Pinyon Script (decorative flourishes) — all loaded from Google Fonts  
**Palette:** Ink black `#1C1410`, parchment `#F4E8D0`, gold `#C9A961`, burgundy `#6B2C2C`  
**UI metaphors:** Gilded frames, wax seals, parchment scrolls, filigree dividers  
**Layout:** Full-screen camera via `position: fixed` on the WebRTC iframe. Overlay text layers above at `z-index: 10+`. Responsive at all screen sizes — HOW IT WORKS panel moves inline on portrait/narrow screens.  
**All text sized for projection** — `clamp()` scaling from ~1rem (phone) to 4rem (beamer)

---

## Tests

```bash
python3 tests/test_verdict.py   # emotion scoring + VALLIS/LIMEN/FIRMA labels
python3 tests/test_gaze.py      # head pose thresholds
```

---

## Technical Notes

### WebRTC stability
The WebRTC iframe must stay in the normal Streamlit layout flow — setting `position: fixed` on its **parent container** breaks Streamlit's component sizing protocol and causes peer renegotiation on every rerun (re-initializing MediaPipe each cycle). The fix: leave the parent alone and set `position: fixed` on the **iframe itself**, which escapes to fill the viewport without disturbing the parent's layout participation.

### SessionShutdownObserver race fix
`streamlit-webrtc 0.64.x` has a race in `SessionShutdownObserver.stop()`: the thread reference is checked at line 65 then dereferenced at line 71, but a concurrent `stop()` call on another thread can null it out between the two. `app.py` monkey-patches `stop()` to snapshot the reference into a local variable first, eliminating the race.

### Auto-refresh cadence
The app uses `streamlit-autorefresh` to drive state machine updates. Refresh rate is phase-dependent: 1.5 s in IDLE, 750 ms in VIEWING (countdown). Faster refresh rates remount the iframe and restart the video processor — keep ≥ 750 ms.
