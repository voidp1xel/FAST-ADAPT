class AlertTask {
    constructor() {
        this.btnAir = document.getElementById('btn-aircraft');
        this.btnWay = document.getElementById('btn-waypoint');
        this.isActive = false;
        
        this.currentAlert = null;
        this.alertStartTime = 0;
        
        this.stats = { correct: 0, total: 0, reactionTimes: [] };
        this.timeoutId = null;

        this.btnAir.addEventListener('click', () => this.handleResponse('AIRCRAFT'));
        this.btnWay.addEventListener('click', () => this.handleResponse('WAYPOINT'));
    }

    start() {
        this.isActive = true;
        this.resetVisuals();
        this.scheduleNextAlert();
    }

    stop() {
        this.isActive = false;
        clearTimeout(this.timeoutId);
        this.resetVisuals();
    }

    resetVisuals() {
        this.btnAir.style.opacity = "0.4";
        this.btnWay.style.opacity = "0.4";
        this.btnAir.style.boxShadow = "none";
        this.btnWay.style.boxShadow = "none";
    }

    scheduleNextAlert() {
        if (!this.isActive) return;
        this.resetVisuals();
        this.currentAlert = null;

        // Random delay
        let delay = Math.random() * 5000 + 3000;
        this.timeoutId = setTimeout(() => this.triggerAlert(), delay);
    }

    triggerAlert() {
        if (!this.isActive) return;
        this.currentAlert = Math.random() > 0.5 ? 'AIRCRAFT' : 'WAYPOINT';
        
        if (this.currentAlert === 'AIRCRAFT') {
            this.btnAir.style.opacity = "1.0";
            this.btnAir.style.boxShadow = "0 0 20px #00ff00";
        } else {
            this.btnWay.style.opacity = "1.0";
            this.btnWay.style.boxShadow = "0 0 20px #ff0000";
        }
        
        this.alertStartTime = performance.now();
    }

    handleResponse(type) {
        if (!this.isActive || !this.currentAlert) return;

        let rt = performance.now() - this.alertStartTime;
        this.stats.reactionTimes.push(rt);
        this.stats.total++;

        if (type === this.currentAlert) {
            this.stats.correct++;
        }

        this.scheduleNextAlert();
    }

    getMetrics() {
        let avgRt = this.stats.reactionTimes.length === 0 ? 0 : 
            (this.stats.reactionTimes.reduce((a, b) => a + b, 0) / this.stats.reactionTimes.length);
        return {
            accuracy: this.stats.total === 0 ? 0 : ((this.stats.correct / this.stats.total) * 100).toFixed(2),
            avgReactionMs: avgRt.toFixed(0)
        };
    }
}