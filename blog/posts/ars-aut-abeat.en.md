# Ars Aut Abeat: at which picture does art stop being art?

An interactive installation that measures the picture at which art stops being art for a person. Not by asking, but by reading their face. Built by **PLEB Art Consulting** in the Projekt 2 module of the Systems Engineering programme at TH Augsburg, and shown in two places:

- **16 July 2026**, the "Engineering meets Arts" vernissage at Vöhlinschloss Illertissen
- **19 September 2026**, the 27th Lange Kunstnacht in Landsberg am Lech, at the **TTZ Data Science und Autonome Systeme** of THA, under the evening's theme "automated art"

On the screen it is called **VALLIS · SIMVLACRI**, the valley of likeness. You stand in front of it, raise both hands, and watch a painting fall apart in ten steps. At the end there is a verdict in Latin: *ars aut abeat*, art, or let it go.

## Mori, 1970

Masahiro Mori described what happens as something grows more like us: affinity rises, and then, just short of full human likeness, it flips. Not into indifference, but into unease. That is the uncanny valley.

It gets discussed a lot and measured rarely. The installation turns that around: it takes something that is unmistakably art, a classical painting of the human figure, and lets an AI repaint it until it goes wrong. The question is not whether it eventually stops being art. The question is **when**, and whether that happens at the same point for everyone.

## What happens when you stand in front of it

| Phase | Duration | What happens |
|---|---|---|
| **Rest** | open | You see yourself in the mirror. Raising both hands for 1.5 s starts the session, and doubles as consent |
| **Baseline** | 19 s | The untouched original with title and description. The camera averages your face into a personal resting state: your face in front of real art |
| **Gallery** | 30 s | Ten AI pictures, one every three seconds, with a soft crossfade. Each picture collects its own measurements |
| **Verdict** | 25 s | The original, the last picture that was still art (**ARS**) and the breaking point (**ABEAT**) side by side, with your own reaction curve below |

No button, no touchscreen, no instructions anyone has to read. Anyone who reacts to no picture at all gets **ARS MANSIT**: for you, it stayed art. And the verdict says: *You drew this line, not the machine.*

The ten pictures are made in advance with Stable Diffusion img2img. Pictures 1 to 5 are each generated directly from the original with increasing strength. From picture 6 on, every output goes back into the model: true model collapse, where errors compound until the paint disintegrates while the composition still holds.

## How the measurement works

MediaPipe FaceLandmarker gives 52 blendshapes per camera frame, which are FACS action units, and seven emotions are built from those. What matters is *what* gets compared: not the absolute emotion mix, but **the deviation from your own resting state**. Someone who simply looks serious is not penalised for it.

![How the breaking point is measured](../blog/img/ars-aut-abeat-methode.en.png)

*Every emotion counts, but the classic uncanny signals, disgust and fear, count most. The picture with the largest weighted deviation is the breaking point. If no deviation exceeds 0.08, there is no breaking point.*

A gaze check keeps faces that happen to be in frame but looking elsewhere out of the count: head pose via `solvePnP`, and only someone turned less than 35 degrees sideways and 30 degrees up or down counts as engaged. No images and no faces are stored, only emotion values, the verdict and the breaking point.

## How it got there

The first version in April looked different. Six likenesses along Mori's axis, from a photograph through a wax figure to an animatronic, six seconds each, and a score built from the absolute emotion mix. It was built in Streamlit, and two things from that version cost me evenings:

**The iframe.** Set `position: fixed` on the parent of the WebRTC component and Streamlit's sizing protocol breaks, so the peer connection renegotiates on every rerun and MediaPipe re-initialises every cycle. The fix was to put `position: fixed` on the iframe itself.

**A race in someone else's library.** `streamlit-webrtc` checks a thread reference in `SessionShutdownObserver.stop()` and dereferences it six lines later. A concurrent call can null it out in between.

The 45 test viewings of that version already showed what was later confirmed: disgust, the signal the old scale rested on, averaged 0.022. The version that was exhibited is a different one: FastAPI and React instead of Streamlit, the browser sends camera frames to the Python backend over a WebSocket, and instead of an absolute score it is the breaking point against your own baseline that counts.

## What the data says

The database holds **185 complete visits**: 82 from Illertissen (ancient sculptures, busts and vessels) and 103 from Landsberg (paintings). Development test runs are excluded. That is enough to test a thesis:

> The point at which a picture stops being art for us is not at the start of the destruction but in its second half. And it sits at the same place for different people, venues and subjects.

![Which picture drew the strongest reaction](../blog/img/ars-aut-abeat-ergebnis.en.png)

| Claim | Result | 95 % confidence interval |
|---|---|---|
| Visitors with a measurable breaking point | 152 of 185 = **82 %** | 76 to 87 % |
| Breaking points on pictures 6 to 10 (random: 50 %) | 92 of 152 = **61 %** | 53 to 68 %, p = 0.012 |
| Difference in mean breaking point, Illertissen vs. Landsberg | **0.2 pictures** | −0.8 to +1.2, p = 0.77 |

In other words: the large majority reacts measurably, the break comes significantly more often late than early, and the pattern repeats at two independent venues with a different audience and different subjects. Each venue on its own sits at about 60 % late breaking points but is too small to be significant alone (p ≈ 0.08). Together the effect is significant. **Where art ends seems to depend more on how far the destruction has gone than on the picture or the viewer.**

As for verdicts, 70 % land in the valley (VALLIS), 12 % on the threshold (LIMEN) and 18 % on firm ground (FIRMA, *ars mansit*). There is no significant difference between the venues (χ² p = 0.23).

## Staying honest

**Drift over time is the main alternative explanation.** The longer ago the baseline was taken, the further any face drifts from it, whatever is on screen. Late pictures would then score higher automatically. The stored data cannot rule that out. A control run that shows the untouched original ten times would settle it.

**The peak at pictures 1 and 2.** 33 breaking points sit right at the start. The first cut from the original to a new picture probably causes surprise. So the measurement also picks up reactions to the change itself.

**"Angry" is probably concentration.** Anger averages 29 % and is the strongest emotion in 58 visits. People looking closely lower their brows, and the model reads that as anger. Disgust and fear, the classic uncanny signals, stay under 5 %.

**The thesis came after the data.** Splitting into two halves is the most obvious choice, but it was not fixed in advance. The next exhibition is meant to test it properly.

## In the paper

The Landsberger Tagblatt covered the Kunstnacht, with a photo in front of the installation. One line from it fits almost too well: *"Today we can have artworks produced by artificial intelligence where nobody notices that they are not real."* The data says: at some point people do notice, just later than you would think.

## The evening

Two metres from the installation stood Karla, our Unitree G1 in cosplay.

That handed me something I had not planned. Our installation needs a camera, seven weights and a threshold to make the effect visible. Karla needs none of it. She only has to stand up and take a few steps, and you see it directly in the faces in the room.

That is not an argument against measuring. It just says where the hard part is: not in triggering the effect, but in recording it so that it can still be recalculated afterwards.

## Why engineers make art

At the end of Projekt 2 I asked Constantin Wanninger what this project was actually about. He answered with a question: "What is a systems engineer to you?" I had no answer. Something with mechanical engineering, I thought. Then came the line that stuck:

> "I want you to become like Gyro Gearloose. Someone who can take any domain and build something out of it."

So it was never about art alone. For us it meant several unfamiliar domains at once: art history, generative AI, face analysis and, in the end, statistics. And the name says it: **PLEB** stands for Pascal Masny, Lukas Kraus, Erik Reusch and Baha Tombul. Four engineering students who could not tell you why one painting is worth millions. Which is exactly why the installation does not ask the experts where art ends, but whoever is standing in front of the camera.

## Stack

`Python` · `FastAPI` · `WebSocket` · `React` · `TypeScript` · `Vite` · `MediaPipe` (FaceLandmarker, PoseLandmarker) · `OpenCV` · `SQLAlchemy` · `SQLite` · `Stable Diffusion img2img`

Type is Cinzel and Cormorant Garamond, palette ink `#1C1410`, parchment `#F4E8D0`, gold `#C9A961`, burgundy `#6B2C2C`.

The code is open on [GitHub](https://github.com/PascalMasny/ArsAutAbeat).

Three PDFs to take away (in German):

- **[One-pager](../pdfs/ArsAutAbeat_OnePager.pdf)**, one page on how the installation works
- **[System description](../pdfs/ArsAutAbeat_System.pdf)**, flow, measurement, breaking point and technology in detail
- **[Evaluation](../pdfs/ArsAutAbeat_Auswertung.pdf)**, all 185 visits, the thesis, the tests and what argues against it
