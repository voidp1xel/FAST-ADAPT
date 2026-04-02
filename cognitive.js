class CognitiveTask {
    constructor() {
        this.display = document.getElementById('cog-display');
        this.optionsContainer = document.getElementById('cog-options');
        this.buttons = [
            document.getElementById('cog-opt-1'),
            document.getElementById('cog-opt-2'),
            document.getElementById('cog-opt-3')
        ];
        this.isActive = false;
        this.currentMode = 'SEQUENCE'; // SEQUENCE, MIRROR, COMPASS
        this.currentValue = "";
        this.stats = { correct: 0, total: 0 };
        this.timeoutId = null;

        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const val = button.getAttribute('data-val') || button.innerText;
                this.handleResponse(val);
            });
        });
    }

    start() {
        this.isActive = true;
        this.nextTask();
    }

    stop() {
        this.isActive = false;
        clearTimeout(this.timeoutId);
    }

    nextTask() {
        if (!this.isActive) return;
        this.optionsContainer.classList.add('hidden');
        
        // Cycle through modes
        const modes = ['SEQUENCE', 'MIRROR', 'COMPASS'];
        this.currentMode = modes[Math.floor(Math.random() * modes.length)];

        if (this.currentMode === 'SEQUENCE') {
            this.setupSequenceTask();
        } else if (this.currentMode === 'MIRROR') {
            this.setupMirrorTask();
        } else {
            this.setupCompassTask();
        }
    }

    // --- SEQUENCE TASK ---
    setupSequenceTask() {
        let seq = [];
        for(let i=0; i<6; i++) seq.push(Math.floor(Math.random() * 10));
        this.currentValue = seq.join('');
        this.display.innerHTML = `MEMORIZE:<br><span style="letter-spacing: 5px;">${this.currentValue}</span>`;

        this.timeoutId = setTimeout(() => {
            this.display.innerText = "ENTER SEQUENCE";
            this.showOptions([
                this.currentValue,
                this.generateRandomSequence(),
                this.generateRandomSequence()
            ]);
        }, 3000);
    }

    generateRandomSequence() {
        let s = ""; for(let i=0; i<6; i++) s += Math.floor(Math.random() * 10); return s;
    }

    // --- MIRROR TASK ---
    setupMirrorTask() {
        // Create 3x3 grid pattern (represented as a bitmask or string)
        let pattern = [];
        for(let i=0; i<9; i++) pattern.push(Math.random() > 0.6 ? 1 : 0);
        
        this.currentValue = pattern.join('');
        this.display.innerHTML = `PATTERN:<br>${this.renderGrid(pattern)}`;

        this.timeoutId = setTimeout(() => {
            this.display.innerText = "CHOOSE MIRROR";
            
            const mirror = this.getMirrorPattern(pattern);
            const fake1 = this.mutatePattern(mirror);
            const fake2 = this.mutatePattern(mirror);

            this.showOptions([
                { label: 'OP 1', val: mirror.join(''), html: this.renderGrid(mirror) },
                { label: 'OP 2', val: fake1.join(''), html: this.renderGrid(fake1) },
                { label: 'OP 3', val: fake2.join(''), html: this.renderGrid(fake2) }
            ]);
        }, 2500);
    }

    renderGrid(p) {
        let html = '<div class="grid-container" style="display:inline-grid; padding: 5px; background: #222;">';
        p.forEach(cell => {
            html += `<div style="width:15px; height:15px; background: ${cell ? '#0f0' : '#111'}; margin:1px;"></div>`;
        });
        html += '</div>';
        return html;
    }

    getMirrorPattern(p) {
        let mirror = [];
        // Mirrors along vertical axis (0-2 becomes 2-0)
        for(let row=0; row<3; row++) {
            mirror.push(p[row*3 + 2]);
            mirror.push(p[row*3 + 1]);
            mirror.push(p[row*3 + 0]);
        }
        return mirror;
    }

    mutatePattern(p) {
        let m = [...p];
        let idx = Math.floor(Math.random() * 9);
        m[idx] = m[idx] ? 0 : 1;
        return m;
    }

    // --- COMPASS TASK ---
    setupCompassTask() {
        const dirs = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        const arrows = { 'NORTH': '↑', 'SOUTH': '↓', 'EAST': '→', 'WEST': '←' };
        
        const target = dirs[Math.floor(Math.random() * dirs.length)];
        const promptDir = dirs[Math.floor(Math.random() * dirs.length)];
        
        this.currentValue = target;
        this.display.innerHTML = `HEADING: ${promptDir}<br><span style="font-size: 40px;">${arrows[promptDir]}</span><br>WHICH PIN IS NORTH?`;

        // Wait a bit then show options as just words
        this.timeoutId = setTimeout(() => {
            this.showOptions(['NORTH', 'SOUTH', 'EAST', 'WEST'].sort(() => Math.random() - 0.5).slice(0, 3));
        }, 3000);
    }

    showOptions(opts) {
        if (!this.isActive) return;
        this.optionsContainer.classList.remove('hidden');
        
        // Randomize
        opts.sort(() => Math.random() - 0.5);

        this.buttons.forEach((btn, index) => {
            const opt = opts[index];
            if (typeof opt === 'string') {
                btn.innerText = opt;
                btn.setAttribute('data-val', opt);
            } else {
                btn.innerHTML = `${opt.label}<br>${opt.html}`;
                btn.setAttribute('data-val', opt.val);
            }
        });
    }

    handleResponse(selected) {
        if (!this.isActive || this.optionsContainer.classList.contains('hidden')) return;

        this.stats.total++;
        if (selected === this.currentValue) {
            this.stats.correct++;
        }

        this.display.innerHTML = selected === this.currentValue ? 
            '<span style="color: #0f0;">CORRECT</span>' : 
            '<span style="color: #f00;">ERROR</span>';
            
        this.optionsContainer.classList.add('hidden');
        this.timeoutId = setTimeout(() => this.nextTask(), 1000);
    }

    getMetrics() {
        return {
            correct: this.stats.correct,
            total: this.stats.total,
            accuracy: this.stats.total === 0 ? 0 : ((this.stats.correct / this.stats.total) * 100).toFixed(2)
        };
    }
}