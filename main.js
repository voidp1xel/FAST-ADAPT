const tracker = new TrackerTask();
const alerts = new AlertTask();
const cog = new CognitiveTask();
const visual = new VisualTask();

let isRunning = false;
let currentAttempt = 1;
let timeLeft = 90; // 90 seconds per attempt
let timerInterval;

const timerDisplay = document.getElementById('timer-box'); 
const startBtn = document.getElementById('start-btn');
const endScreen = document.getElementById('end-screen');
const reportContainer = document.getElementById('report-container');

let attempt1Results = null;
let attempt2Results = null;

function formatTime(seconds) {
    let m = Math.floor(seconds / 60).toString().padStart(2, '0');
    let s = (seconds % 60).toString().padStart(2, '0');
    return `Time: ${m}:${s}`;
}

function gameLoop() {
    if (!isRunning) return;
    tracker.update();
    requestAnimationFrame(gameLoop);
}

function stopSimulation() {
    isRunning = false;
    clearInterval(timerInterval);
    tracker.stop();
    alerts.stop();
    cog.stop();
    visual.stop();
}

function endAttempt() {
    stopSimulation();

    const results = {
        physical: tracker.getAccuracy(),
        situational: alerts.getMetrics(),
        cognitive: cog.getMetrics(),
        collisions: tracker.totalTicks - tracker.scoreTicks,
        visualMissed: visual.stats.missed
    };

    if (currentAttempt === 1) {
        attempt1Results = results;
        alert("ATTEMPT 1 COMPLETE. Prepare for Attempt 2.");
        prepareNextAttempt();
    } else {
        attempt2Results = results;
        showFinalReport();
    }
}

function prepareNextAttempt() {
    currentAttempt = 2;
    timeLeft = 90;
    timerDisplay.innerText = formatTime(timeLeft);
    startBtn.disabled = false;
    startBtn.innerHTML = "START ATTEMPT 2";
    
    // Reset tasks
    tracker.scoreTicks = 0;
    tracker.totalTicks = 0;
    tracker.obstacles = [];
    tracker.particles = [];
    
    alerts.stats = { correct: 0, total: 0, reactionTimes: [] };
    
    cog.stats = { correct: 0, total: 0 };
    document.getElementById('cog-display').innerText = "SYSTEM IDLE";
    
    visual.stats = { seen: 0, missed: 0 };
}

function getColorBand(score) {
    if (score >= 90) return { label: 'High', color: '#2ecc71' };
    if (score >= 75) return { label: 'Above Average', color: '#f1c40f' };
    if (score >= 60) return { label: 'Average', color: '#e67e22' };
    if (score >= 40) return { label: 'Below Average', color: '#e74c3c' };
    return { label: 'Low', color: '#c0392b' };
}

function calculateSten(v1, v2) {
    let diff = v2 - v1;
    if (v1 == 0) return 5;
    let percentChange = (diff / v1) * 10; 
    let sten = Math.max(1, Math.min(10, Math.round(5 + percentChange)));
    if (v1 >= 95 && v2 >= 95) return 10;
    return sten;
}

function showFinalReport() {
    document.getElementById('simulation-world').classList.add('hidden');
    document.getElementById('main-controls-box').classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    const p1 = parseFloat(attempt1Results.physical);
    const p2 = parseFloat(attempt2Results.physical);
    const c1 = parseFloat(attempt1Results.cognitive.accuracy);
    const c2 = parseFloat(attempt2Results.cognitive.accuracy);
    const s1 = parseFloat(attempt1Results.situational.accuracy);
    const s2 = parseFloat(attempt2Results.situational.accuracy);
    const v1 = attempt1Results.visualMissed;
    const v2 = attempt2Results.visualMissed;

    const overall1 = (p1*0.4 + c1*0.3 + s1*0.3);
    const overall2 = (p2*0.4 + c2*0.3 + s2*0.3);
    const finalScore = ((overall1 + overall2) / 2).toFixed(1);
    const band = getColorBand(finalScore);

    const physicalSten = calculateSten(p1, p2);
    const cognitiveSten = calculateSten(c1, c2);
    const situationalSten = calculateSten(s1, s2);

    reportContainer.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333;">
            <div style="border-bottom: 2px solid #1b365d; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="color: #1b365d; margin:0;">FAST-ADAPT PERFORMANCE REPORT</h1>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                    <span>ID: FA-${Math.floor(Math.random()*9000)+1000}</span>
                    <span>Date: ${new Date().toLocaleDateString()}</span>
                    <span>FAST-ADAPT Assessment System</span>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 18px; color: #1b365d; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Overall Performance</h2>
                <div style="background: ${band.color}22; border: 2px solid ${band.color}; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <p style="margin:0; font-weight: bold; color: ${band.color};">LEVEL: ${band.label.toUpperCase()}</p>
                    <p style="margin: 8px 0 0; font-size: 13px;">Overall aptitude score: <strong>${finalScore}/100</strong>.</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #1b365d;">
                    <h3 style="font-size: 14px; margin-bottom: 5px; color: #1b365d;">Physical Skill</h3>
                    <div style="font-size: 20px; font-weight: 800;">${p2}% <span style="font-size: 11px; color:#888;">(Sten: ${physicalSten})</span></div>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #2ecc71;">
                    <h3 style="font-size: 14px; margin-bottom: 5px; color: #1b365d;">Cognitive Skill</h3>
                    <div style="font-size: 20px; font-weight: 800;">${c2}% <span style="font-size: 11px; color:#888;">(Sten: ${cognitiveSten})</span></div>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #f1c40f;">
                    <h3 style="font-size: 14px; margin-bottom: 5px; color: #1b365d;">Situational Awareness</h3>
                    <div style="font-size: 20px; font-weight: 800;">${s2}% <span style="font-size: 11px; color:#888;">(Sten: ${situationalSten})</span></div>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #c0392b;">
                    <h3 style="font-size: 14px; margin-bottom: 5px; color: #1b365d;">Penalties (Collisions / Visual Misses)</h3>
                    <div style="font-size: 20px; font-weight: 800;">${attempt2Results.collisions} / ${v2} <span style="font-size: 11px; color:#888;">(Att-1: ${attempt1Results.collisions} / ${v1})</span></div>
                </div>
            </div>

            <div style="margin-top: 30px; font-size: 12px; color: #777; line-height: 1.5;">
                <p><strong>Learning:</strong> A score of 5 indicates no learning, however, you would have shown a consistent performance throughout the assessment. A score below 5 shows a degradation in your learning, whereas a score above 5 highlights an improvement in your learning.</p>
            </div>

            <div style="margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
                Copyright © FAST-ADAPT | Generated by Flight Aptitude Screening Assessment v2.0
            </div>
        </div>
    `;
}

startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    startBtn.innerHTML = "TEST IN PROGRESS";
    
    if (typeof realFastMode !== 'undefined' && realFastMode) {
        runRealFast();
        return;
    }

    isRunning = true;
    tracker.start();
    alerts.start();
    cog.start();
    visual.start();
    
    gameLoop();

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = formatTime(timeLeft);
        
        if (timeLeft <= 0) {
            endAttempt();
        }
    }, 1000);
});

// ===== MODE SELECTION =====
let realFastMode = false;
const startNormalBtn = document.getElementById('start-normal-btn');
const startRealBtn = document.getElementById('start-real-btn');
const modeSelect = document.getElementById('mode-select');

if (startNormalBtn) {
    startNormalBtn.addEventListener('click', () => {
        realFastMode = false;
        modeSelect.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.innerHTML = "INITIATE TEST";
    });
}

if (startRealBtn) {
    startRealBtn.addEventListener('click', () => {
        realFastMode = true;
        document.body.classList.add('real-mode-active');
        modeSelect.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.innerHTML = "INITIATE ADVANCED MODE";
    });
}

// Initial draw
tracker.draw();