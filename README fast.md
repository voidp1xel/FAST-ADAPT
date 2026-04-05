<div align="center">
  <h1 style="color: #2b7ce9; display: inline-block;">✈️ FAST-ADAPT</h1>
  <h3 style="color: #ff5722;">Advanced Pilot Screening Assessment</h3>
  <p><em>A high-fidelity cognitive load simulation designed to test multi-tasking, reaction time, and decision-making under pressure.</em></p>
</div>

---

<h2 style="color: #4CAF50;">🎯 Project Overview</h2>
FAST-ADAPT is a comprehensive, browser-based simulation modeled after real-world aviation entrance assessments. It challenges candidates to manage a primary flight task, monitor simulated communication alerts, solve cognitive puzzles, and maintain peripheral visual scanning—all simultaneously.


<h2 style="color: #9C27B0;">🧬 Codebase Architecture & Technical Details</h2>
The project is built entirely from scratch using **Vanilla HTML5, CSS3, and JavaScript**, ensuring maximum performance via direct Canvas API rendering and zero dependency overhead. The codebase is broken down into modular systems:

*   <strong style="color:#e91e63">`index.html` & `style.css`</strong>: Creates a highly responsive, modern <strong>Glassmorphism UI</strong>. It segments the screen into distinct cognitive zones (Flight Panel, Alert Panel, Data Panel) using CSS Grid/Flexbox and dynamic stress-testing typography.
*   <strong style="color:#e91e63">`main.js`</strong>: The backbone of the application. It handles game state (menus, active attempts), orchestrates the main 60 FPS `requestAnimationFrame` loop, and bridges data between the various subsystems.
*   <strong style="color:#e91e63">`tracker.js`</strong>: Powers the Primary Flight Task using HTML5 `<canvas>`. It utilizes a sophisticated entity system to handle aircraft physics, generate scrolling waypoints, spawn randomized obstacles, and calculate strict AABB (Axis-Aligned Bounding Box) collision detection.
*   <strong style="color:#e91e63">`alerts.js`</strong>: Manages the asynchronous subsystem of visual/interaction alerts. It handles randomized spawning logic, tracks user response latency in milliseconds, and distinguishes between correct and incorrect acknowledgments.
*   <strong style="color:#e91e63">`cognitive.js`</strong>: A dynamic puzzle generation engine covering sequence memory, mirror patterns, and spatial compass headings. It dynamically renders DOM elements and immediately verifies user inputs under strict time constraints.
*   <strong style="color:#e91e63">`visualTask.js`</strong>: Implements peripheral vision checks by briefly flashing specific symbols (e.g., ★) across the viewport. It operates completely independently of the main thread tasks to force context switching.
*   <strong style="color:#e91e63">`realFast.js`</strong>: The <strong>Chaos Engine</strong> for Advanced Mode and the robust Reporting System. 
    *   **Chaos Engine**: Injects non-deterministic fatigue physics (sudden drift, input lag, latency), overlaps tasks viciously, and throws decoy/false-alarms to induce task saturation.
    *   **Reporting**: Automatically aggregates state data across attempts to dynamically generate a massive set of Canvas-drawn bar schemas, line graphs (collision trends), and AI-driven textual assessments of pilot viability.


<h2 style="color: #2196F3;">🚀 How to Launch</h2>
1.  Ensure all modular scripts are in the root directory:
    *   `index.html`, `style.css`, `main.js`, `tracker.js`, `alerts.js`, `cognitive.js`, `visualTask.js`, `realFast.js`
2.  Open `index.html` in any modern web browser.
3.  Select your assessment mode from the main menu dashboard.


<h2 style="color: #FFC107;">🕹️ Game Modes & Controls</h2>

### 🟢 1. Normal Mode (Baseline Test)
A balanced test of coordination and cognitive processing. Perfect for establishing candidate baselines over 2 attempts (90s each). 

### 🔴 2. Advanced Mode (High Stress Setup)
A brutal, high-fidelity simulation designed to push candidates to total task saturation through erratic overlapping events.

<br/>

| Task System | Action | Objective |
| :--- | :--- | :--- |
| **Flight Tracker** | `ARROW KEYS` (or `W`/`S`) | Keep the aircraft safely navigating the scrolling corridor. |
| **Alert System** | `MOUSE CLICK` | Acknowledge authentic Aircraft/Waypoint alerts. Ignore Decoys! |
| **Cognitive Panel** | `MOUSE CLICK` | Solve sequences, mirrors, and compass headings quickly. |
| **Visual Scanning** | `SPACE BAR` | Press **only** when a STARE (★) symbol is flashed in the background. |


<h2 style="color: #00BCD4;">📊 Professional Reporting</h2>
The assessment scales using professional aviation metrics, providing a detailed **Performance Report** at the end of the session:
*   **Weighted Scoring:** Flight Tracker (40%), Alerts (25%), Cognitive Ability (20%), Visual Scanning (15%).
*   **STEN Scoring:** A 1-10 statistical scale comparing Attempt 1 against Attempt 2 to measure the candidate's learning curve.

---

<h2 style="color: #FF0000; text-transform: uppercase;">⚠️ Explicit Copyright & Licensing Notice</h2>
<p style="border-left: 4px solid #f44336; padding-left: 15px; background: #ffebee; color: #b71c1c; padding: 10px; border-radius: 4px;">
<strong>COPYRIGHT © 2026 Aniket Goel. ALL RIGHTS RESERVED.</strong><br/><br/>
This software, source code, design, and all associated files are strictly proprietary. <strong>This is my personal code and CANNOT be used, copied, distributed, modified, reproduced, or published in any way, shape, or form without my explicit, written permission.</strong> <br/><br/>
<em>(This supersedes, revokes, and replaces any prior educational, open-source, or default licenses that may have been previously listed or implied.)</em>
</p>
