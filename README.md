# FAST-ADAPT | Advanced Pilot Screening Assessment
## Focused Attention & Situational Test (Advanced)

FAST-ADAPT is a high-fidelity cognitive load simulation designed to test multi-tasking, reaction time, and decision-making under pressure, modeled after real-world aviation entrance assessments.

---

## 🚀 How to Launch
1. Ensure all project files are in the same directory:
   - `index.html`, `style.css`
   - `main.js`, `tracker.js`, `alerts.js`, `cognitive.js`, `visualTask.js`, `realFast.js`
2. Open `index.html` in any modern web browser.
3. Select your desired mode from the main menu:
   - **START NORMAL MODE**: The standard baseline assessment.
   - **START ADVANCED MODE**: The advanced, high-overload realistic simulation.

---

## 🎮 Game Modes

### 1. Normal Mode
A balanced test of coordination and cognitive processing. Ideal for initial training and establishing a baseline.
*   **Duration:** 2 attempts (90 seconds each).
*   **Tasks:** Steering, Basic Alerts, and Pattern Matching.

### 2. Advanced Mode (High Stress) 🚨
A brutal, high-fidelity simulation of task saturation. Designed to push candidates to their cognitive limits.
*   **Chaos Engine:** Random overlapping events, bursts of obstacles, and system instability spikes.
*   **Aircraft Instability:** Realistic physics with random drift, sudden jerks, and delayed control response (simulating fatigue).
*   **Real Alerts:** Includes fake "decoy" alerts, overlapping notifications, and a strict 800ms response window.
*   **Cognitive Overload:** Memory tasks appear for only 500-1000ms and can be interrupted by system "flashes."
*   **Visual Scanning:** A 4th task — identify specific symbols (★) in the sky while managing the cockpit.
*   **Fatigue System:** Difficulty, input delay, and aircraft drift increase steadily over the course of the session.

---

## 🕹️ Cockpit Controls

### Primary Flight Task (Left Panel)
*   **Controls:** Use **ARROW KEYS (Up/Down)** or **'W'/'S'** keys.
*   **Objective:** Navigate the aircraft through the flight corridor, avoiding obstacles.

### Alert System (Center Panel)
*   **Controls:** Mouse Click on the **AIRCRAFT** or **WAYPOINT** buttons.
*   **Advanced Mode Note:** Watch out for orange "Decoy" alerts — do NOT click them.

### Data Analysis (Right Panel)
*   **Controls:** Mouse Click on the options provided.
*   **Tasks:** Sequence Memory, Mirror Patterns, and Compass Headings.

### Visual Scanning (Background)
*   **Controls:** Press **SPACE BAR**.
*   **Objective:** Press Space only when a **STARE (★)** symbol appears in the sky.

---

## 📊 Professional Reporting
Upon completing two attempts, the system generates a **FAST-ADAPT PERFORMANCE REPORT** styled after professional aviation screening documents:

*   **Overall Performance Level:** High, Above Average, Average, Below Average, or Low.
*   **Weighted Scoring:** 
    - Aircraft Stability (40%)
    - Alerts (25%)
    - Cognitive Skill (20%)
    - Visual Scanning (15%)
*   **Learning Metric (Sten):** A 1-10 scale calculating your improvement between Attempt 1 and Attempt 2.
*   **Performance Graphs:** Real-time canvas-drawn Bar Charts (accuracy) and Line Charts (collision trends).
*   **Text Analysis:** Automated AI-driven performance breakdown.

---

## 🛠️ Technical Details
*   **Core:** Vanilla JavaScript (No external libraries/frameworks).
*   **Graphics:** HTML5 Canvas for real-time physics and report charts.
*   **Styling:** Modern CSS with glassmorphism and high-visibility stress-testing fonts.

---
*Copyright © FAST-ADAPT | Pilot Screening Assessment v2.0*
