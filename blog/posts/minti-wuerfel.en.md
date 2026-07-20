# MINTi Cube: when your user is two years old

Studienprojekt 1 at THA, winter semester 2025/26, built by four of us as team **4CoreDynamics**. The brief: build a piece of playground equipment for a STEM playground. Target group: children aged two to six.

What came out is a cube with six sides, each one its own experiment. But the interesting part was never the electronics.

## Two lines in the spec that decided everything else

The first: *intuitive to use without explanation*. No onboarding, no tooltip, no error message, no README. The user cannot read. If a side needs explaining, it has failed, and you find out immediately, because the child just walks away.

The second: *safe even when used wrong*. In software, misuse is the edge case you handle last. With two-year-olds it is the normal case. The cube does not get operated, it gets thrown, spun, chewed on and dropped.

Those two lines forced more design decisions than any technical detail that came after.

## Six sides, six principles

| Side | What children work out |
|---|---|
| **Theremin** | distance becomes pitch, without touching anything |
| **Colour mixer** | additive and subtractive mixing, side by side |
| **Gearbox** | ratio, direction of rotation, force transmission |
| **Maze** | gravity, balance, fine motor control |
| **Solar** | light becomes power becomes light |
| **STEM fairy tales** | two audio stories at the push of a button |

![Theremin side](../blog/img/minti-theremin.png)

*Theremin: the small black board in the middle is the distance sensor. The symbols around it explain the interaction without a single word. Hold your hand in front, move it up and down, the tone changes. The knob at the bottom sets the volume.*

![Colour mixer side](../blog/img/minti-farbmischer.png)

*Colour mixer: three rotating colour discs on top for subtractive mixing, three potentiometers below for additive RGB light. Both principles deliberately sit on the same side, because the difference only registers when you can compare them.*

![Gearbox side](../blog/img/minti-getriebe.png)

*Cycloidal drive: the orange eccentric in the middle drives the ring gear. Purely mechanical, no power. You can stop it with your finger, and that is exactly where the learning happens.*

![Maze side](../blog/img/minti-labyrinth.png)

*Ball maze: the three gears around the edge move walls on the inside, so the difficulty can be matched to the child.*

![Solar side](../blog/img/minti-solar.png)

*The solar panel sits on top of the cube and charges the battery. You do not want a mains cable on a toy built for two-year-olds.*

![Fairy tale side](../blog/img/minti-maerchen.png)

*STEM fairy tales: two buttons, two stories. The only side where there is something to look at rather than something to work out.*

The gearbox and the maze are purely mechanical, fully 3D printed, without a single line of code. That was the point, not a compromise: a cycloidal drive explains gear ratio better than any animation.

## Why a cube

A cube has six independent faces, and that was the architecture. Each side snaps into the frame on its own, without tools, in any position. If one side breaks, the other five keep working. Modularity, just in plastic instead of interfaces.

![The cube from another angle](../blog/img/minti-cubus2.png)

*Colour mixer, gearbox and solar panel in one view. The blue frame is the only part every side has in common.*

![Snap and pivot points on a module edge](../blog/img/minti-modul.png)

*The cylindrical snap points along the edge of each module. They click into the frame's receivers and form a positive fit, which is why any module goes in any position.*

![Section through the frame](../blog/img/minti-rahmen1.png)

*Section view of the snap geometry. It deflects in a controlled way as the module is pushed in, then springs back. Tool-free to assemble, but not something a child pulls out again on a whim.*

The frame is printed in hard TPU (Shore D80) with four steel rods running through it. The TPU flexes as a module is pushed in and springs back to hold it; the rods make sure the thing still behaves like a cube and not like a rubber box. The modules themselves are PETG at 50 % gyroid infill, chosen mainly because PETG deforms elastically before it breaks. For this audience, a part that gives way is worth more than a part that is stiff.

## The electronics

An ESP32-C6 drives the four active sides. A few details that actually matter in operation:

- **Theremin:** a VL53L0X measures distance, and 50 mm to 5000 mm maps *exponentially* onto 120 Hz to 2000 Hz. Linear sounds wrong, because pitch is perceived logarithmically. Only with the exponential curve does the hand movement feel like music instead of like a sensor reading.
- **Colour mixer:** three potentiometers driving 20 NeoPixels. Nothing reacts until a reading changes by more than 100 (out of 4095), otherwise the side flickers away to itself while idle, because the ADC is noisy.
- **Auto power-off:** everything shuts down after ten seconds without input. A learning cube that glows on the shelf at night has invented its own battery problem.

Being honest about it: if the distance sensor is missing at boot, the firmware sits in an infinite loop and nothing starts at all. That is not a feature, that is an open construction site.

## The test

First the lab part: a five-year-old operated every module without explanation. In the stress test the cube was dropped ten times from two metres, with no damage to structure or mechanics.

The real test came afterwards: 80 kindergarten children, in four waves. The cube held up. The kids loved it.

That day taught us at least as much as the build did, mostly because none of us had spent much time around small children before. Whether they walked away smarter, no idea. Entertained, definitely.

No software project I have ever built was tested like that.

## What it costs

Materials, per the BOM: **€75.73**. Add eight hours of labour at minimum wage and a 100 % margin, and the calculated unit price lands at **€373.86**. The costing was part of the submission, and it taught me more than expected: the ESP32 costs €3, everything else is plastic, time and safety.

## Takeaway

The real learning was not about the microcontroller. It was that the hardest requirements came from the user, not from the technology: someone who cannot read your docs and will drop your product. Building for that person changes how you design.

Code, CAD and print files are public on [GitHub](https://github.com/PascalMasny/minti-wuerfel). The full project documentation is available to read below.
