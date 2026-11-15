<div align="center">

# ✈️ FAST-ADAPT — Pilot Cognitive Load & Multi-Tasking Simulator

**A high-fidelity aviation psychomotor and cognitive load screening simulator modeled on real-world airline cadet entrance assessments (FAST / COMPASS / Pilapt).**

![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas_2D_60FPS-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism_UI-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero-44cc11?style=for-the-badge)

</div>

---

## 🎯 Project Overview

**FAST-ADAPT** is a zero-dependency, browser-based aviation screening simulator designed to evaluate a candidate's **psychomotor coordination, divided attention, working memory, and decision-making under acute task saturation**. Modeled after commercial airline and military pilot aptitude assessments, candidates must simultaneously control a primary flight path, filter authentic vs. decoy cockpit alerts, solve rapid spatial/cognitive problems, and respond to peripheral visual stimuli.

---

## 🏗️ System Architecture & Modular Subsystems

The simulator is engineered from scratch using **Vanilla HTML5, CSS3, and ES6+ JavaScript** with direct **HTML5 Canvas 2D** rendering to guarantee deterministic 60 FPS frame pacing and sub-millisecond input latency.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    main.js (60 FPS Master Coordinator)                  │
│             State Machine • Attempt Timer • Telemetry Aggregator        │
└──────┬──────────────────┬──────────────────┬──────────────────┬─────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌────────────────┐  ┌─────────────────┐
│  tracker.js  │  │  alerts.js   │  │  cognitive.js  │  │  visualTask.js  │
│ Primary Task │  │ Cockpit Comm │  │ Spatial/Memory │  │ Peripheral Scan │
│ • 2D Physics │  │ • Latency ms │  │ • Compass Math │  │ • Random Flash  │
│ • AABB Coll. │  │ • Decoy Trap │  │ • Mirror Logic │  │ • Spacebar IRQ  │
└──────┬───────┘  └──────┬───────┘  └────────┬───────┘  └────────┬────────┘
       └──────────────────┴─────────┬────────┴───────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │          realFast.js          │
                    │  Chaos Engine & STEN Report   │
                    │  • Non-deterministic drift    │
                    │  • Input lag & decoy storms   │
                    │  • Canvas Telemetry Charts    │
                    └───────────────────────────────┘
```

### Module Deep-Dive

| Module | Responsibility | Technical Highlights |
| :--- | :--- | :--- |
| **`main.js`** | Core Engine & State Loop | Orchestrates the 60 FPS `requestAnimationFrame` loop, manages multi-attempt transitions (Attempt 1 baseline vs. Attempt 2 adaptation), and aggregates telemetry across all four concurrent task streams. |
| **`tracker.js`** | Primary Flight Task (40% Weight) | Renders the scrolling flight corridor on HTML5 `<canvas>`, applies aircraft velocity/drift kinematics, spawns dynamic obstacles and waypoints, and evaluates real-time **Axis-Aligned Bounding Box (AABB)** collision detection. |
| **`alerts.js`** | Asynchronous Comms & Alerting (25% Weight) | Spawns timed cockpit alerts requiring cross-verification against current aircraft state. Tracks response latency in milliseconds and penalizes false-positive acknowledgments on decoy alerts. |
| **`cognitive.js`** | Spatial & Working Memory Engine (20% Weight) | Procedurally generates rapid-fire numerical sequences, mirrored pattern matrices, and relative compass heading problems under strict countdown timers. |
| **`visualTask.js`** | Peripheral Vigilance Check (15% Weight) | Flashes transient peripheral target symbols (`★`) vs. distractors across the viewport background, measuring reaction accuracy via keyboard interrupt (`Space`). |
| **`realFast.js`** | Chaos Engine & Analytics Suite | Injects non-deterministic turbulence drift, synthetic control latency, and overlapping decoy storms in **Advanced Mode**, then renders post-flight Canvas bar/line telemetry charts and **STEN (Standard Ten)** psychometric scores. |
| **`index.html` & `style.css`** | Multi-Zone Cockpit HUD | Segments the viewport into ergonomic cognitive zones (Flight Display, Comms Alert Matrix, Cognitive FMS Panel) using CSS Grid and glassmorphic surfaces. |

---

## 🕹️ Assessment Modes & Controls

### 1. Normal Mode (Baseline Screening)
Establishes psychomotor and cognitive baselines across **2 sequential 90-second attempts**, measuring both raw multi-tasking capacity and the candidate's inter-attempt learning rate.

### 2. Advanced Mode (`realFast` Chaos Engine)
Simulates severe cockpit task saturation by injecting sudden crosswind drift, variable control lag, high-frequency overlapping tasks, and deceptive alert traps.

### Cockpit Controls

| Subsystem | Input Control | Operational Objective |
| :--- | :--- | :--- |
| **Flight Tracker** | `↑` / `↓` Arrow Keys (or `W` / `S`) | Maintain aircraft alignment inside the moving flight corridor and avoid obstacles. |
| **Alert Matrix** | `Left Click` | Acknowledge authentic aircraft/waypoint alerts; ignore false decoy alerts. |
| **Cognitive FMS** | `Left Click` | Solve sequence memory, mirror geometry, and compass heading tasks before timeout. |
| **Peripheral Scan** | `Spacebar` | Trigger **only** when the target star (`★`) flashes in peripheral vision. |

---

## 📊 Psychometric Scoring & STEN Analytics

At the conclusion of an assessment, **FAST-ADAPT** computes a composite weighted performance profile:

$$\text{Composite Score} = 0.40 \cdot S_{\text{Tracker}} + 0.25 \cdot S_{\text{Alerts}} + 0.20 \cdot S_{\text{Cognitive}} + 0.15 \cdot S_{\text{Visual}}$$

- **STEN (Standard Ten) Scale (1–10):** Normalizes raw subsystem performance and compares **Attempt 1 vs. Attempt 2** to quantify adaptability and stress resilience under cognitive load.
- **Canvas Telemetry Visualization:** Draws collision trend graphs, reaction-time histograms, and automated flight-psychologist diagnostic summaries directly onto HTML5 Canvas.

---

## 🚀 Getting Started

Because FAST-ADAPT is engineered with zero external runtime dependencies, it runs directly in any modern browser:

```bash
# 1. Clone the repository
git clone https://github.com/voidp1xel/FAST-ADAPT.git
cd FAST

# 2. Open directly in a browser or serve locally
open index.html
# OR using Python's built-in HTTP server:
python3 -m http.server 8000
```

---

## ⚠️ Copyright & Licensing Notice

**COPYRIGHT © 2026 Aniket Goel. ALL RIGHTS RESERVED.**

This software, source code, design, and all associated files are strictly proprietary and cannot be used, copied, distributed, modified, reproduced, or published in any way without explicit prior written permission from the author.
