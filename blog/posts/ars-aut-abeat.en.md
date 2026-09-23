# Ars Aut Abeat: measuring the uncanny valley instead of talking about it

An interactive installation that measures how deep visitors fall into the uncanny valley. Shown on 19 September 2026 at the Lange Kunstnacht in Landsberg am Lech, as part of the **TTZ Data Science und Autonome Systeme** at THA, under the evening's theme "automated art".

On the screen it is called **VALLIS · SIMVLACRI**, the valley of likeness. You stand in front of it, raise both hands, look at a likeness for six seconds, and get a verdict in Latin.

## Mori, 1970

Masahiro Mori described what happens as something grows more like us: affinity rises, and then, just short of full human likeness, it flips. Not into indifference, but into revulsion. That is the uncanny valley.

It gets discussed a lot and measured rarely. The installation turns that around: six likenesses arranged along exactly that axis, from unremarkable to unsettling.

| Likeness | What it is |
|---|---|
| **Imago Vera** | photograph |
| **Icon Picta** | painted portrait |
| **Simulacrum Marmoreum** | marble bust |
| **Effigies Cerea** | wax figure |
| **Vultus Syntheticus** | AI-generated face |
| **Automaton** | animatronic |

The order is the hypothesis. Whether visitors' faces follow it is the question.

## What happens when you stand in front of it

A state machine with six phases, every duration tunable in `config.py`.

| Phase | Duration | What happens |
|---|---|---|
| **IDLE** | open | You see yourself in the mirror, full screen |
| **LOCKED** | 2.5 s | Both hands above the shoulders, held still for 1.5 s, then it locks in |
| **VIEWING** | 6 s | The likeness in a gilded frame, live emotion bars in Latin beside it |
| **VERDICT_PERSONAL** | 8 s | Your own breakdown, sealed in wax |
| **VERDICT_COLLECTIVE** | 8 s | *Vox Populi*: the verdict of every previous visitor, and how close you are to it |
| **FADE** | 3 s | "The valley awaits the next soul." |

No button, no touchscreen, no explanation anyone has to read. Raising your hands is the only gesture, and it still works for someone pushed to the front by the crowd.

## How the measurement works

No TensorFlow emotion models, no DeepFace. MediaPipe FaceLandmarker gives 52 blendshapes, which are FACS action units, and seven emotions are built from those. Each carries a weight saying how strongly it argues for a valley.

![The weights and the three verdict bands](../blog/img/ars-aut-abeat-methode.png)

*Disgust is the core signal and weighs most. Joy pulls just as hard the other way. Anger sits close to neutral, because in a face it looks a lot like concentration.*

The score is the weighted sum, normalised to 0 to 1. Three bands sit on top: below 0.40 **FIRMA**, stable ground. Up to 0.60 **LIMEN**, at the threshold. Above that **VALLIS**, in the valley.

A gaze check keeps faces that happen to be in frame but looking elsewhere out of the count: head pose via `solvePnP` on six landmarks, and only someone turned less than 35 degrees sideways and 30 degrees up or down counts as engaged.

## The part that was actually hard

Not the emotions. The concurrency.

The WebRTC `recv()` callback has to return in about 16 milliseconds or the video stutters. MediaPipe takes far longer. So `recv()` only drops the frame into a buffer and returns immediately, a daemon thread reads that buffer at 10 Hz and does the work, and the Streamlit main thread reads a snapshot every 750 to 1500 ms.

Two things that cost me evenings and are therefore written down:

**The iframe.** Set `position: fixed` on the parent of the WebRTC component and Streamlit's sizing protocol breaks, so the peer connection renegotiates on every rerun and MediaPipe re-initialises every cycle. The fix is to leave the parent alone and put `position: fixed` on the iframe itself.

**A race in someone else's library.** `streamlit-webrtc` checks a thread reference in `SessionShutdownObserver.stop()` and dereferences it six lines later. A concurrent call can null it out in between. `app.py` patches the method to copy the reference into a local first.

## What the pilot data says

And here it gets uncomfortable.

The database holds **45 viewings from three development days in April 2026**. Across all of them:

| Emotion | Mean |
|---|---|
| Neutral | 0.455 |
| Angry | 0.173 |
| Happy | 0.139 |
| Surprise | 0.133 |
| Sad | 0.031 |
| Fear | 0.024 |
| **Disgust** | **0.022** |

Overall score: **0.382**. So FIRMA, and only just below the threshold.

That is a result, but not the hoped-for one. **Disgust is the signal the whole measurement rests on, and it barely shows up.** A mean of 0.022 against a weight of 1.0 means the score is driven almost entirely by neutral and happy in practice, which are the two weights pulling down. Right now the scale measures who does *not* fall into the valley more reliably than who does.

Three explanations are in play and this data cannot separate them:

1. **The likenesses are too harmless.** The 45 viewings span three catalogue generations: the oldest are museum pieces with 30-second viewing windows, then famous paintings, and only at the end the actual likeness catalogue. A marble head does not provoke disgust, and that is a fact about the image selection, not about Mori.
2. **Disgust is hard to see in a face.** `noseSneer` and `mouthPucker` are small movements. At projection distance and hall lighting they disappear into the noise.
3. **People show nothing in front of a camera.** Anyone who knows they are being measured goes neutral. A neutral mean of 0.455 is partly that.

Number three is the one that bothers me most, because it is about the method itself rather than its parameters.

## Staying honest

**The Kunstnacht data is not in here yet.** What this post reports is the pilot. The measurements from the evening are on the exhibition machine and will follow. They are the genuinely interesting set, because that was the first time people stood in front of it who knew nothing about the project.

**The scale changed.** The verdicts were once ARS, ABEAT and DUBIUM, and are now VALLIS, LIMEN and FIRMA. The old records still carry the old labels. Anyone evaluating both generations together has to map them, or they are averaging across two different systems.

**45 viewings are not a sample.** They are a proof that the thing runs. Every number above is an order of magnitude, not a result.

## The evening

Two metres from the installation stood Karla, our Unitree G1.

That handed me something I had not planned. My installation needs a camera, seven weights and a threshold to make the effect visible. Karla needs none of it. She only has to stand up and take a few steps, and you see it directly in the faces in the room.

That is not an argument against measuring. It just says where the hard part is: not in triggering the effect, but in recording it so that it can still be recalculated afterwards.

## Stack

`Python 3.12+` · `Streamlit` · `streamlit-webrtc` · `MediaPipe` (FaceLandmarker, PoseLandmarker) · `OpenCV` · `SQLAlchemy` · `SQLite`

Type is Cinzel and Cormorant Garamond, palette ink `#1C1410`, parchment `#F4E8D0`, gold `#C9A961`, burgundy `#6B2C2C`. Every size goes through `clamp()`, because the same layout has to be readable on a phone and on a beamer.

The code is open on [GitHub](https://github.com/PascalMasny/ArsAutAbeat).

Three PDFs to take away (in German):

- **[One-pager](../pdfs/ArsAutAbeat_OnePager.pdf)**, one page, for a quick look
- **[System description](../pdfs/ArsAutAbeat_System.pdf)**, how it works: state machine, concurrency, scoring
- **[Pilot evaluation](../pdfs/ArsAutAbeat_Auswertung.pdf)**, every number from this post and what stands in their way
