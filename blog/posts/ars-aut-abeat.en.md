# Ars Aut Abeat: the Uncanny Valley you can feel

For our semester project at THA (Systems Engineering, summer 2026), our team **PLEB Consulting** built an interactive art installation: **Ars Aut Abeat**.

## The idea

Generative AI floods the web with images that people dismiss as "AI slop." That raises a question: what happens when an AI keeps using its own output as the template? This feedback effect is exactly what tips classical art, step by step, into the uncanny. Out of that idea came an installation that makes the **Uncanny Valley** both tangible and measurable.

## How it works

A visitor steps in front of an antique-looking picture frame and raises both hands as a start gesture. A classical painting begins to change: over about 30 seconds, an AI feedback loop distorts the work further and further. At the same time, a camera reads seven of the visitor's basic emotions in real time and records how they evolve.

At the end, the original sits next to the distorted final state, together with a chart of the measured emotions and a short verdict. The visitor becomes part of the artwork: the uncanny pull lives in the image, but the real proof is in their reaction.

## The tech

- **Backend:** FastAPI, real-time emotion analysis, ten measurements per second over WebSocket
- **Frontend:** browser, camera, and projection onto a 200-inch video wall in the university's castle hall
- **Privacy:** no video stored, analysis runs locally, only anonymous numbers are kept
- **Operation:** under 100 euro budget, cross-platform on macOS and Linux

You can read the full project documentation right below.
