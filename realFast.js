// ============================================================
// REAL FAST MODE — Complete Engine
// ============================================================
// Self-contained module. Does NOT modify any existing code.
// All systems: Chaos, Instability, Alerts, Cognitive, Visual,
// Priority, Fatigue, Collision, Scaling, Scoring, Report.
// ============================================================

// ===== STATE =====
const RF = {
    active: false,
    attempt: 1,
    timeLeft: 90,
    timerInterval: null,
    startTime: 0,
    elapsedSec: 0,

    // Difficulty
    difficultyLevel: 1.0,
    scalingInterval: null,

    // Fatigue
    fatigueFactor: 0,
    inputDelay: 0,

    // Chaos
    chaosInterval: null,
    chaosProbability: 0.3,

    // Instability
    driftFactor: 0.3,
    jerkTimer: null,
    instabilitySpike: false,

    // Alerts
    alertTimeout: null,
    alertDeadline: null,
    alertCurrent: null,
    alertStartTime: 0,
    alertDecoy: false,
    alertStats: { correct: 0, wrong: 0, missed: 0, total: 0, reactionTimes: [] },

    // Cognitive
    cogTimeout: null,
    cogDeadline: null,
    cogActive: false,
    cogInterrupted: false,
    cogStats: { correct: 0, wrong: 0, total: 0 },

    // Visual Scanning
    visualInterval: null,
    visualCurrent: null,
    visualStats: { detected: 0, missed: 0, total: 0 },

    // Aircraft tracking (reuses existing tracker)
    aircraftStats: { stableTicks: 0, totalTicks: 0 },

    // Collision tracking for graphs
    collisionLog: [],

    // Priority modifiers
    priorityPenalty: 0,

    // Attempt results
    attempt1: null,
    attempt2: null
};

// ===== MAIN ENTRY =====
function runRealFast() {
    resetRFState();
    RF.active = true;
    RF.startTime = performance.now();

    // Start existing tracker for aircraft
    tracker.start();
    isRunning = true;

    // Start all Real systems
    startRFAlerts();
    startRFCognitive();
    startRFVisualScan();
    startChaosEngine();
    startInstability();
    startDifficultyScaling();
    startFatigueSystem();

    // Game loop
    rfGameLoop();

    // Timer
    RF.timerInterval = setInterval(() => {
        RF.timeLeft--;
        RF.elapsedSec = 90 - RF.timeLeft;
        timerDisplay.innerText = formatTime(RF.timeLeft);

        // Log collisions every 10 seconds for graph
        if (RF.elapsedSec % 10 === 0 && RF.elapsedSec > 0) {
            RF.collisionLog.push(tracker.totalTicks - tracker.scoreTicks);
        }

        if (RF.timeLeft <= 0) {
            endRFAttempt();
        }
    }, 1000);
}

function resetRFState() {
    RF.timeLeft = 90;
    RF.elapsedSec = 0;
    RF.difficultyLevel = 1.0;
    RF.fatigueFactor = 0;
    RF.inputDelay = 0;
    RF.chaosProbability = 0.3;
    RF.driftFactor = 0.3;
    RF.instabilitySpike = false;
    RF.priorityPenalty = 0;
    RF.collisionLog = [];

    RF.alertStats = { correct: 0, wrong: 0, missed: 0, total: 0, reactionTimes: [] };
    RF.cogStats = { correct: 0, wrong: 0, total: 0 };
    RF.visualStats = { detected: 0, missed: 0, total: 0 };
    RF.aircraftStats = { stableTicks: 0, totalTicks: 0 };

    RF.alertCurrent = null;
    RF.alertDecoy = false;
    RF.cogActive = false;
    RF.cogInterrupted = false;
    RF.visualCurrent = null;

    // Reset existing tracker
    tracker.scoreTicks = 0;
    tracker.totalTicks = 0;
    tracker.obstacles = [];
    tracker.particles = [];

    // Reset existing UI
    alerts.resetVisuals();
    document.getElementById('cog-display').innerText = "SYSTEM IDLE";
    document.getElementById('cog-options').classList.add('hidden');
}

// ===== GAME LOOP =====
function rfGameLoop() {
    if (!RF.active) return;

    // Aircraft instability injection
    applyInstability();

    // Track aircraft stability
    RF.aircraftStats.totalTicks++;
    let isColliding = false;
    for (let obs of tracker.obstacles) {
        if (
            tracker.aircraftX < obs.x + obs.width &&
            tracker.aircraftX + tracker.aircraftWidth > obs.x &&
            tracker.aircraftY - tracker.aircraftHeight/2 < obs.y + obs.height &&
            tracker.aircraftY + tracker.aircraftHeight/2 > obs.y
        ) { isColliding = true; break; }
    }
    if (!isColliding) RF.aircraftStats.stableTicks++;

    // Priority system: if aircraft control is bad, add penalty
    let aircraftPct = RF.aircraftStats.totalTicks === 0 ? 100 :
        (RF.aircraftStats.stableTicks / RF.aircraftStats.totalTicks) * 100;
    if (aircraftPct < 50) {
        RF.priorityPenalty = 0.15;
    } else if (aircraftPct < 70) {
        RF.priorityPenalty = 0.08;
    } else {
        RF.priorityPenalty = 0;
    }

    // Standard tracker update
    tracker.update();

    requestAnimationFrame(rfGameLoop);
}

// ============================================================
// 1. CHAOS ENGINE
// ============================================================
function startChaosEngine() {
    RF.chaosInterval = setInterval(() => {
        if (!RF.active) return;

        if (Math.random() < RF.chaosProbability) {
            triggerChaosEvent();
        }

        // Increase chaos probability over time
        RF.chaosProbability = Math.min(0.85, RF.chaosProbability + 0.005);
    }, 2000);
}

function triggerChaosEvent() {
    let events = ['alertCog', 'obstacleBurst', 'instabilitySpike', 'multiOverlap'];
    let pick = events[Math.floor(Math.random() * events.length)];

    // Visual flash
    document.getElementById('instrument-cluster').classList.add('chaos-flash');
    setTimeout(() => {
        document.getElementById('instrument-cluster').classList.remove('chaos-flash');
    }, 400);

    switch(pick) {
        case 'alertCog':
            // Force alert AND cognitive at same time
            triggerRFAlert();
            if (!RF.cogActive) triggerRFCogTask();
            break;
        case 'obstacleBurst':
            // Spawn rapid obstacles
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    if (!RF.active) return;
                    let h = 8;
                    let w = 40 + Math.random() * 30;
                    let y = tracker.minY + Math.random() * (tracker.maxY - tracker.minY);
                    tracker.obstacles.push({
                        x: tracker.canvas.width + i * 60,
                        y: y, width: w, height: h
                    });
                }, i * 200);
            }
            break;
        case 'instabilitySpike':
            RF.instabilitySpike = true;
            RF.driftFactor = 1.2;
            setTimeout(() => {
                RF.instabilitySpike = false;
                RF.driftFactor = 0.3 + RF.fatigueFactor * 0.2;
            }, 2000);
            break;
        case 'multiOverlap':
            // All at once
            triggerRFAlert();
            if (!RF.cogActive) triggerRFCogTask();
            spawnRFVisualTarget();
            break;
    }
}

// ============================================================
// 2. AIRCRAFT INSTABILITY
// ============================================================
function startInstability() {
    RF.jerkTimer = setInterval(() => {
        if (!RF.active) return;

        // Random instability spike every 3-5 sec
        RF.instabilitySpike = true;
        RF.driftFactor = 1.0 + Math.random() * 0.8;
        setTimeout(() => {
            RF.instabilitySpike = false;
            RF.driftFactor = 0.3 + RF.fatigueFactor * 0.2;
        }, 600 + Math.random() * 800);
    }, 3000 + Math.random() * 2000);
}

function applyInstability() {
    if (!RF.active) return;

    // Random drift
    tracker.aircraftY += (Math.random() - 0.5) * RF.driftFactor * 0.5;

    // Sudden jerk during spikes
    if (RF.instabilitySpike) {
        tracker.aircraftY += (Math.random() - 0.5) * 1.5;
    }

    // Delayed response (reduce effective movement)
    if (RF.inputDelay > 0) {
        // Counteract a fraction of user input
        if (tracker.keys.w || tracker.keys.ArrowUp) tracker.aircraftY += RF.inputDelay;
        if (tracker.keys.s || tracker.keys.ArrowDown) tracker.aircraftY -= RF.inputDelay;
    }

    // Clamp
    tracker.aircraftY = Math.max(tracker.minY, Math.min(tracker.maxY, tracker.aircraftY));
}

// ============================================================
// 3. REAL ALERT SYSTEM
// ============================================================
function startRFAlerts() {
    scheduleRFAlert();

    // Override existing button handlers for real mode
    document.getElementById('btn-aircraft').addEventListener('click', () => {
        if (RF.active) handleRFAlertResponse('AIRCRAFT');
    });
    document.getElementById('btn-waypoint').addEventListener('click', () => {
        if (RF.active) handleRFAlertResponse('WAYPOINT');
    });
}

function scheduleRFAlert() {
    if (!RF.active) return;
    alerts.resetVisuals();
    RF.alertCurrent = null;

    let delay = (500 + Math.random() * 1500) / RF.difficultyLevel;
    RF.alertTimeout = setTimeout(() => triggerRFAlert(), delay);
}

function triggerRFAlert() {
    if (!RF.active) return;
    clearTimeout(RF.alertTimeout);

    // 20% chance of decoy alert
    RF.alertDecoy = Math.random() < 0.2;

    if (RF.alertDecoy) {
        // Both light up — neither is correct
        document.getElementById('btn-aircraft').style.opacity = "1.0";
        document.getElementById('btn-waypoint').style.opacity = "1.0";
        document.getElementById('btn-aircraft').style.boxShadow = "0 0 20px #ffaa00";
        document.getElementById('btn-waypoint').style.boxShadow = "0 0 20px #ffaa00";
        RF.alertCurrent = 'DECOY';
    } else {
        RF.alertCurrent = Math.random() > 0.5 ? 'AIRCRAFT' : 'WAYPOINT';
        if (RF.alertCurrent === 'AIRCRAFT') {
            document.getElementById('btn-aircraft').style.opacity = "1.0";
            document.getElementById('btn-aircraft').style.boxShadow = "0 0 20px #00ff00";
        } else {
            document.getElementById('btn-waypoint').style.opacity = "1.0";
            document.getElementById('btn-waypoint').style.boxShadow = "0 0 20px #ff0000";
        }
    }

    RF.alertStartTime = performance.now();
    RF.alertStats.total++;

    // 800ms deadline — miss = penalty
    RF.alertDeadline = setTimeout(() => {
        if (RF.alertCurrent) {
            RF.alertStats.missed++;
            // Missed alert → increase difficulty
            RF.chaosProbability = Math.min(0.9, RF.chaosProbability + 0.03);
            scheduleRFAlert();
        }
    }, 800 / Math.max(0.5, 1 / RF.difficultyLevel));
}

function handleRFAlertResponse(type) {
    if (!RF.active || !RF.alertCurrent) return;
    clearTimeout(RF.alertDeadline);

    let rt = performance.now() - RF.alertStartTime;
    RF.alertStats.reactionTimes.push(rt);

    if (RF.alertCurrent === 'DECOY') {
        // Clicking on decoy = wrong
        RF.alertStats.wrong++;
    } else if (type === RF.alertCurrent) {
        RF.alertStats.correct++;
    } else {
        RF.alertStats.wrong++;
    }

    scheduleRFAlert();
}

// ============================================================
// 4. COGNITIVE OVERLOAD SYSTEM
// ============================================================
function startRFCognitive() {
    scheduleRFCogTask();
}

function scheduleRFCogTask() {
    if (!RF.active) return;
    let delay = 2000 + Math.random() * 3000;
    RF.cogTimeout = setTimeout(() => triggerRFCogTask(), delay);
}

function triggerRFCogTask() {
    if (!RF.active) return;
    RF.cogActive = true;
    RF.cogInterrupted = false;

    let display = document.getElementById('cog-display');
    let optionsContainer = document.getElementById('cog-options');
    let buttons = [
        document.getElementById('cog-opt-1'),
        document.getElementById('cog-opt-2'),
        document.getElementById('cog-opt-3')
    ];

    // Generate sequence (shorter display time = harder)
    let seq = [];
    for (let i = 0; i < 6; i++) seq.push(Math.floor(Math.random() * 10));
    let correctAnswer = seq.join('');

    display.innerHTML = `MEMORIZE:<br><span style="letter-spacing:5px; color:#0f0;">${correctAnswer}</span>`;
    optionsContainer.classList.add('hidden');

    // Memory time: 2000-3500ms (challenging but readable)
    let memoryTime = 2000 + Math.random() * 1500;

    // Chance of interruption
    let interruptTimer = null;
    if (Math.random() < 0.3 * RF.difficultyLevel) {
        interruptTimer = setTimeout(() => {
            if (!RF.active || !RF.cogActive) return;
            display.innerHTML = '<span style="color:#ff3366;">SYSTEM INTERRUPT</span>';
            RF.cogInterrupted = true;
            setTimeout(() => {
                if (!RF.active) return;
                display.innerHTML = `MEMORIZE:<br><span style="letter-spacing:5px; color:#0f0;">${correctAnswer}</span>`;
                RF.cogInterrupted = false;
            }, 400);
        }, memoryTime * 0.6);
    }

    RF.cogDeadline = setTimeout(() => {
        if (!RF.active) return;
        clearTimeout(interruptTimer);
        display.innerText = "ENTER SEQUENCE";

        let fakeA = ''; for (let i = 0; i < 6; i++) fakeA += Math.floor(Math.random() * 10);
        let fakeB = ''; for (let i = 0; i < 6; i++) fakeB += Math.floor(Math.random() * 10);

        let opts = [correctAnswer, fakeA, fakeB].sort(() => Math.random() - 0.5);
        optionsContainer.classList.remove('hidden');

        buttons.forEach((btn, idx) => {
            btn.innerText = opts[idx];
            btn.setAttribute('data-val', opts[idx]);
            btn.onclick = () => {
                if (!RF.active || !RF.cogActive) return;
                RF.cogStats.total++;
                if (opts[idx] === correctAnswer) {
                    RF.cogStats.correct++;
                    display.innerHTML = '<span style="color:#0f0;">CORRECT</span>';
                } else {
                    RF.cogStats.wrong++;
                    display.innerHTML = '<span style="color:#f00;">ERROR</span>';
                }
                optionsContainer.classList.add('hidden');
                RF.cogActive = false;
                scheduleRFCogTask();
            };
        });

        // Short answer window
        let answerWindow = 3000 / RF.difficultyLevel;
        setTimeout(() => {
            if (RF.cogActive) {
                RF.cogStats.total++;
                RF.cogStats.wrong++;
                display.innerHTML = '<span style="color:#f00;">TIMEOUT</span>';
                optionsContainer.classList.add('hidden');
                RF.cogActive = false;
                scheduleRFCogTask();
            }
        }, answerWindow);
    }, memoryTime);
}

// ============================================================
// 5. VISUAL SCANNING TASK
// ============================================================
function startRFVisualScan() {
    // Add indicator to DOM if not present
    if (!document.getElementById('visual-scan-indicator')) {
        let ind = document.createElement('div');
        ind.id = 'visual-scan-indicator';
        ind.innerText = 'VISUAL: Press SPACE for ★';
        document.body.appendChild(ind);
    }

    rfVisualLoop();

    // Listen for SPACE (separate from existing)
    window.addEventListener('keydown', rfVisualKeyHandler);
}

function rfVisualKeyHandler(e) {
    if (e.key === ' ' && RF.active && RF.visualCurrent) {
        if (RF.visualCurrent.isTarget && !RF.visualCurrent.detected) {
            RF.visualCurrent.detected = true;
            RF.visualStats.detected++;
            RF.visualCurrent.el.style.color = '#0f0';
        }
    }
}

function rfVisualLoop() {
    if (!RF.active) return;

    let delay = 1500 + Math.random() * 2000;
    RF.visualInterval = setTimeout(() => {
        spawnRFVisualTarget();
        rfVisualLoop();
    }, delay);
}

function spawnRFVisualTarget() {
    if (!RF.active) return;

    let el = document.createElement('div');
    el.className = "floating-obj dynamic";
    let isTarget = Math.random() > 0.5;
    el.innerText = isTarget ? '★' : ['●', '◆', '▲', '✦'][Math.floor(Math.random() * 4)];
    el.style.left = (10 + Math.random() * 70) + "%";
    el.style.top = (5 + Math.random() * 35) + "%";
    el.style.fontSize = "28px";
    el.style.color = isTarget ? '#ffcc00' : '#aaa';
    el.style.transition = 'opacity 0.3s';
    document.body.appendChild(el);

    let obj = { el, isTarget, detected: false };
    RF.visualCurrent = obj;

    if (isTarget) RF.visualStats.total++;

    // Visible < 1.5 sec
    let visibleTime = 800 + Math.random() * 700;
    setTimeout(() => {
        if (isTarget && !obj.detected) {
            RF.visualStats.missed++;
        }
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
    }, visibleTime);
}

// ============================================================
// 6. TASK PRIORITY SYSTEM (integrated in game loop above)
// ============================================================
// Priority logic runs in rfGameLoop() — cross-checks aircraft
// control and adjusts chaos/difficulty when alerts are missed.

// ============================================================
// 7. FATIGUE SYSTEM
// ============================================================
function startFatigueSystem() {
    setInterval(() => {
        if (!RF.active) return;
        RF.fatigueFactor = RF.elapsedSec * 0.01;
        RF.inputDelay = Math.min(0.8, RF.fatigueFactor * 0.4);
        RF.driftFactor = Math.max(RF.driftFactor, 0.3 + RF.fatigueFactor * 0.2);
    }, 1000);
}

// ============================================================
// 8. MULTI-TASK COLLISION EVENTS (handled by Chaos Engine)
// ============================================================
// The chaosEngine 'multiOverlap' and 'alertCog' events
// force simultaneous alert + cognitive + visual spawns.

// ============================================================
// 9. DIFFICULTY SCALING
// ============================================================
function startDifficultyScaling() {
    RF.scalingInterval = setInterval(() => {
        if (!RF.active) return;

        // Every 20 seconds
        RF.difficultyLevel += 0.15;
        RF.chaosProbability = Math.min(0.9, RF.chaosProbability + 0.05);
        tracker.obstacleSpeed = Math.min(4.0, tracker.obstacleSpeed + 0.2);
        tracker.spawnRate = Math.max(35, tracker.spawnRate - 5);
    }, 20000);
}

// ============================================================
// 10. SCORING & ATTEMPT END
// ============================================================
function endRFAttempt() {
    stopRFSystems();

    let results = {
        aircraft: RF.aircraftStats.totalTicks === 0 ? 0 :
            ((RF.aircraftStats.stableTicks / RF.aircraftStats.totalTicks) * 100).toFixed(2),
        alertAccuracy: RF.alertStats.total === 0 ? 0 :
            ((RF.alertStats.correct / RF.alertStats.total) * 100).toFixed(2),
        alertAvgRT: RF.alertStats.reactionTimes.length === 0 ? 0 :
            (RF.alertStats.reactionTimes.reduce((a,b) => a+b, 0) / RF.alertStats.reactionTimes.length).toFixed(0),
        cogAccuracy: RF.cogStats.total === 0 ? 0 :
            ((RF.cogStats.correct / RF.cogStats.total) * 100).toFixed(2),
        visualDetection: RF.visualStats.total === 0 ? 0 :
            ((RF.visualStats.detected / RF.visualStats.total) * 100).toFixed(2),
        collisions: tracker.totalTicks - tracker.scoreTicks,
        collisionLog: [...RF.collisionLog],
        alertStats: { ...RF.alertStats },
        cogStats: { ...RF.cogStats },
        visualStats: { ...RF.visualStats }
    };

    if (RF.attempt === 1) {
        RF.attempt1 = results;
        alert("ATTEMPT 1 COMPLETE. Prepare for Attempt 2.");
        RF.attempt = 2;
        resetRFState();
        RF.difficultyLevel = 1.0;
        timerDisplay.innerText = formatTime(90);
        startBtn.disabled = false;
        startBtn.innerHTML = "START ATTEMPT 2";
    } else {
        RF.attempt2 = results;
        showRealFastReport();
    }
}

function stopRFSystems() {
    RF.active = false;
    isRunning = false;
    clearInterval(RF.timerInterval);
    clearInterval(RF.chaosInterval);
    clearInterval(RF.scalingInterval);
    clearTimeout(RF.alertTimeout);
    clearTimeout(RF.alertDeadline);
    clearTimeout(RF.cogTimeout);
    clearTimeout(RF.cogDeadline);
    clearTimeout(RF.visualInterval);
    clearTimeout(RF.jerkTimer);
    tracker.stop();
    alerts.resetVisuals();
    window.removeEventListener('keydown', rfVisualKeyHandler);

    // Clean up dynamic visual elements
    document.querySelectorAll('.floating-obj.dynamic').forEach(el => el.remove());
}

// ============================================================
// PROFESSIONAL REPORT (PDF-style)
// ============================================================
function showRealFastReport() {
    document.getElementById('simulation-world').classList.add('hidden');
    document.getElementById('main-controls-box').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');

    let a1 = RF.attempt1;
    let a2 = RF.attempt2;

    let p1 = parseFloat(a1.aircraft); let p2 = parseFloat(a2.aircraft);
    let al1 = parseFloat(a1.alertAccuracy); let al2 = parseFloat(a2.alertAccuracy);
    let c1 = parseFloat(a1.cogAccuracy); let c2 = parseFloat(a2.cogAccuracy);
    let v1 = parseFloat(a1.visualDetection); let v2 = parseFloat(a2.visualDetection);

    // Weighted final score
    let score1 = p1*0.4 + al1*0.25 + c1*0.2 + v1*0.15;
    let score2 = p2*0.4 + al2*0.25 + c2*0.2 + v2*0.15;
    let finalScore = ((score1 + score2) / 2).toFixed(1);

    let band = getRFBand(finalScore);
    let physSten = calculateSten(p1, p2);
    let cogSten = calculateSten(c1, c2);
    let sitSten = calculateSten((al1+v1)/2, (al2+v2)/2);
    let learnScore = ((physSten + cogSten + sitSten) / 3).toFixed(1);

    let candidateId = 'FA-' + (Math.floor(Math.random() * 9000) + 1000);
    let dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let analysis = generateAnalysisText(band, finalScore, learnScore, p2, al2, c2, v2);

    let container = document.getElementById('report-container');
    container.innerHTML = `
        <div style="font-family:'Inter',sans-serif; padding:20px; color:#333;">
            <!-- HEADER -->
            <div style="border-bottom:3px solid #1b365d; padding-bottom:12px; margin-bottom:25px;">
                <h1 style="color:#1b365d; margin:0; font-size:28px;">FAST-ADAPT PERFORMANCE REPORT</h1>
                <p style="color:#1b365d; font-size:13px; margin:4px 0 0;">Advanced High-Overload Screening Assessment</p>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#666; margin-top:8px;">
                    <span>Candidate ID: ${candidateId}</span>
                    <span>Date: ${dateStr}</span>
                    <span>FAST-ADAPT Assessment System v2.0</span>
                </div>
            </div>

            <!-- INTRODUCTION -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">1. Introduction</h2>
                <p style="font-size:13px; line-height:1.6; color:#555;">
                    This report summarises the candidate's performance on the FAST-ADAPT (Flight Aptitude Screening Test - Advanced) 
                    conducted under high-overload simulation conditions. The assessment measures multi-tasking ability, 
                    cognitive processing speed, situational awareness, and physical coordination under escalating stress 
                    and cognitive overload.
                </p>
            </div>

            <!-- OVERALL PERFORMANCE -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">2. Overall Performance</h2>
                <div style="background:${band.color}18; border:2px solid ${band.color}; padding:18px; border-radius:8px; margin-top:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <p style="margin:0; font-weight:900; font-size:20px; color:${band.color};">LEVEL: ${band.label.toUpperCase()}</p>
                            <p style="margin:6px 0 0; font-size:14px;">Overall aptitude score: <strong>${finalScore}/100</strong></p>
                        </div>
                        <div style="width:80px; height:80px; border-radius:50%; border:4px solid ${band.color}; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; color:${band.color};">${finalScore}</div>
                    </div>
                    <!-- Color band bar -->
                    <div style="margin-top:12px; height:12px; background:linear-gradient(to right, #c0392b 0%, #e74c3c 20%, #e67e22 40%, #f1c40f 60%, #2ecc71 80%, #27ae60 100%); border-radius:6px; position:relative;">
                        <div style="position:absolute; top:-4px; left:${Math.min(95,Math.max(5,finalScore))}%; width:4px; height:20px; background:#1b365d; border-radius:2px;"></div>
                    </div>
                </div>
            </div>

            <!-- SKILL BREAKDOWN -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">3. Skill Breakdown</h2>
                <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:13px;">
                    <thead>
                        <tr style="background:#1b365d; color:#fff;">
                            <th style="padding:10px; text-align:left;">Skill Area</th>
                            <th style="padding:10px; text-align:center;">Attempt 1</th>
                            <th style="padding:10px; text-align:center;">Attempt 2</th>
                            <th style="padding:10px; text-align:center;">Overall</th>
                            <th style="padding:10px; text-align:center;">Sten</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px; font-weight:bold;">Physical Skill (Aircraft)</td>
                            <td style="padding:10px; text-align:center;">${p1}%</td>
                            <td style="padding:10px; text-align:center;">${p2}%</td>
                            <td style="padding:10px; text-align:center; font-weight:bold;">${((p1+p2)/2).toFixed(1)}%</td>
                            <td style="padding:10px; text-align:center; font-weight:bold; color:${physSten>=6?'#2ecc71':'#e74c3c'};">${physSten}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #eee; background:#f9fafb;">
                            <td style="padding:10px; font-weight:bold;">Cognitive Skill</td>
                            <td style="padding:10px; text-align:center;">${c1}%</td>
                            <td style="padding:10px; text-align:center;">${c2}%</td>
                            <td style="padding:10px; text-align:center; font-weight:bold;">${((c1+c2)/2).toFixed(1)}%</td>
                            <td style="padding:10px; text-align:center; font-weight:bold; color:${cogSten>=6?'#2ecc71':'#e74c3c'};">${cogSten}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px; font-weight:bold;">Situational Awareness</td>
                            <td style="padding:10px; text-align:center;">${((al1+v1)/2).toFixed(1)}%</td>
                            <td style="padding:10px; text-align:center;">${((al2+v2)/2).toFixed(1)}%</td>
                            <td style="padding:10px; text-align:center; font-weight:bold;">${(((al1+v1+al2+v2)/4)).toFixed(1)}%</td>
                            <td style="padding:10px; text-align:center; font-weight:bold; color:${sitSten>=6?'#2ecc71':'#e74c3c'};">${sitSten}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- DETAILED METRICS -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">4. Detailed Metrics</h2>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px;">
                    <div style="background:#f9fafb; padding:12px; border-radius:6px; border-left:4px solid #1b365d;">
                        <div style="font-size:11px; color:#888; text-transform:uppercase;">Avg Reaction Time</div>
                        <div style="font-size:22px; font-weight:800;">${a2.alertAvgRT}ms</div>
                    </div>
                    <div style="background:#f9fafb; padding:12px; border-radius:6px; border-left:4px solid #e74c3c;">
                        <div style="font-size:11px; color:#888; text-transform:uppercase;">Alerts Missed</div>
                        <div style="font-size:22px; font-weight:800;">${a2.alertStats.missed} <span style="font-size:11px; color:#888;">(Att-1: ${a1.alertStats.missed})</span></div>
                    </div>
                    <div style="background:#f9fafb; padding:12px; border-radius:6px; border-left:4px solid #2ecc71;">
                        <div style="font-size:11px; color:#888; text-transform:uppercase;">Visual Detection</div>
                        <div style="font-size:22px; font-weight:800;">${v2}%</div>
                    </div>
                    <div style="background:#f9fafb; padding:12px; border-radius:6px; border-left:4px solid #f1c40f;">
                        <div style="font-size:11px; color:#888; text-transform:uppercase;">Collisions (Att-2)</div>
                        <div style="font-size:22px; font-weight:800;">${a2.collisions}</div>
                    </div>
                </div>
            </div>

            <!-- CHARTS -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">5. Performance Graphs</h2>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:10px;">
                    <div class="report-chart-container">
                        <div style="font-size:12px; font-weight:bold; color:#1b365d; margin-bottom:8px;">Cognitive & Situational Scores</div>
                        <canvas id="rf-bar-chart" width="350" height="200"></canvas>
                    </div>
                    <div class="report-chart-container">
                        <div style="font-size:12px; font-weight:bold; color:#1b365d; margin-bottom:8px;">Collision Trend (Physical)</div>
                        <canvas id="rf-line-chart" width="350" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- LEARNING METRIC -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">6. Learning Metric</h2>
                <div style="display:flex; align-items:center; gap:20px; margin-top:10px;">
                    <div style="width:70px; height:70px; border-radius:50%; border:4px solid ${learnScore>=5?'#2ecc71':'#e74c3c'}; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:900; color:${learnScore>=5?'#2ecc71':'#e74c3c'};">${learnScore}</div>
                    <div style="font-size:13px; line-height:1.6; color:#555;">
                        A score of <strong>5</strong> indicates no learning — consistent performance throughout. 
                        Below 5 shows degradation; above 5 highlights improvement between attempts. 
                        Your score: <strong>${learnScore}/10</strong>.
                    </div>
                </div>
            </div>

            <!-- TEXT ANALYSIS -->
            <div style="margin-bottom:25px;">
                <h2 style="font-size:16px; color:#1b365d; border-bottom:1px solid #ddd; padding-bottom:5px;">7. Analysis</h2>
                <p style="font-size:13px; line-height:1.7; color:#444;">${analysis}</p>
            </div>

            <!-- FOOTER -->
            <div style="margin-top:30px; font-size:10px; color:#999; border-top:1px solid #eee; padding-top:10px; text-align:center;">
                Copyright © FAST-ADAPT | Generated by Flight Aptitude Screening Assessment v2.0
            </div>
        </div>
    `;

    // Draw charts after DOM is ready
    setTimeout(() => {
        drawRFBarChart(c1, c2, (al1+v1)/2, (al2+v2)/2);
        drawRFLineChart(a1.collisionLog, a2.collisionLog);
    }, 100);
}

function getRFBand(score) {
    if (score >= 90) return { label: 'High', color: '#2ecc71' };
    if (score >= 75) return { label: 'Above Average', color: '#27ae60' };
    if (score >= 60) return { label: 'Average', color: '#f1c40f' };
    if (score >= 40) return { label: 'Below Average', color: '#e67e22' };
    return { label: 'Low', color: '#e74c3c' };
}

function generateAnalysisText(band, score, learn, phys, alert, cog, vis) {
    let level = band.label.toLowerCase();
    let text = `The candidate demonstrates a${level==='above average'?'n':''} ${level} level of overall performance, `;
    text += `achieving a composite score of ${score}/100 under Real FAST Mode conditions. `;

    if (phys >= 75) text += `Physical aircraft control was strong at ${phys}%, indicating solid hand-eye coordination under duress. `;
    else if (phys >= 50) text += `Physical coordination showed room for improvement at ${phys}%. `;
    else text += `Aircraft stability was a significant challenge at ${phys}%, suggesting difficulty managing physical tasks under cognitive load. `;

    if (cog >= 70) text += `Cognitive task performance was commendable at ${cog}%, demonstrating effective working memory. `;
    else text += `Cognitive accuracy at ${cog}% suggests the candidate found memory tasks challenging under time pressure. `;

    if (alert >= 70) text += `Alert response accuracy of ${alert}% shows strong situational awareness. `;
    else text += `Alert accuracy of ${alert}% indicates that rapid response under overlapping task demands was difficult. `;

    if (vis >= 60) text += `Visual scanning detection at ${vis}% was adequate. `;
    else text += `Visual scanning detection at ${vis}% fell below expected levels, possibly due to task saturation. `;

    if (parseFloat(learn) >= 6) text += `Importantly, the candidate showed learning between attempts (${learn}/10), indicating adaptability and resilience.`;
    else if (parseFloat(learn) >= 4.5) text += `Performance remained relatively consistent between attempts (${learn}/10), showing stable but limited adaptation.`;
    else text += `A decline between attempts (${learn}/10) may indicate fatigue effects or difficulty adapting to escalating demands.`;

    return text;
}

// ===== CHART DRAWING =====
function drawRFBarChart(c1, c2, s1, s2) {
    let canvas = document.getElementById('rf-bar-chart');
    if (!canvas) return;
    let ctx = canvas.getContext('2d');
    let w = canvas.width, h = canvas.height;

    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);

    let labels = ['Cog Att-1', 'Cog Att-2', 'Sit Att-1', 'Sit Att-2'];
    let values = [c1, c2, s1, s2];
    let colors = ['#3498db', '#2980b9', '#e67e22', '#d35400'];

    let barW = 50, gap = 25, startX = 50;
    let maxH = h - 50;

    // Y axis
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, h-30); ctx.lineTo(w-10, h-30); ctx.stroke();

    // Grid lines + labels
    ctx.fillStyle = '#999'; ctx.font = '10px Inter';
    for (let v = 0; v <= 100; v += 25) {
        let y = (h-30) - (v/100) * (maxH - 30);
        ctx.fillText(v + '%', 5, y + 4);
        ctx.strokeStyle = '#eee'; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w-10, y); ctx.stroke();
    }

    values.forEach((val, i) => {
        let x = startX + i * (barW + gap);
        let barH = (val / 100) * (maxH - 30);
        let y = (h - 30) - barH;

        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, barW, barH);

        // Value on top
        ctx.fillStyle = '#333'; ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(parseFloat(val).toFixed(0) + '%', x + barW/2, y - 5);

        // Label below
        ctx.fillStyle = '#666'; ctx.font = '10px Inter';
        ctx.fillText(labels[i], x + barW/2, h - 15);
    });
    ctx.textAlign = 'start';
}

function drawRFLineChart(log1, log2) {
    let canvas = document.getElementById('rf-line-chart');
    if (!canvas) return;
    let ctx = canvas.getContext('2d');
    let w = canvas.width, h = canvas.height;

    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);

    // Ensure we have data points
    if (log1.length === 0) log1 = [0];
    if (log2.length === 0) log2 = [0];

    let maxPoints = Math.max(log1.length, log2.length);
    let allVals = [...log1, ...log2];
    let maxVal = Math.max(...allVals, 10);

    // Axes
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, h-30); ctx.lineTo(w-10, h-30); ctx.stroke();

    // Y labels
    ctx.fillStyle = '#999'; ctx.font = '10px Inter';
    for (let v = 0; v <= maxVal; v += Math.ceil(maxVal/4)) {
        let y = (h-30) - (v/maxVal) * (h-50);
        ctx.fillText(v, 5, y + 4);
    }

    // Draw lines
    function drawLine(data, color) {
        if (data.length < 1) return;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((val, i) => {
            let x = 50 + (i / Math.max(1, maxPoints - 1)) * (w - 70);
            let y = (h-30) - (val/maxVal) * (h-50);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dots
        ctx.fillStyle = color;
        data.forEach((val, i) => {
            let x = 50 + (i / Math.max(1, maxPoints - 1)) * (w - 70);
            let y = (h-30) - (val/maxVal) * (h-50);
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
        });
    }

    drawLine(log1, '#3498db');
    drawLine(log2, '#e74c3c');

    // Legend
    ctx.font = '10px Inter';
    ctx.fillStyle = '#3498db'; ctx.fillRect(w-100, 15, 10, 10);
    ctx.fillStyle = '#333'; ctx.fillText('Attempt 1', w-85, 24);
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(w-100, 30, 10, 10);
    ctx.fillStyle = '#333'; ctx.fillText('Attempt 2', w-85, 39);

    // X label
    ctx.fillStyle = '#666'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Time Intervals (10s)', w/2, h - 5);
    ctx.textAlign = 'start';
}
