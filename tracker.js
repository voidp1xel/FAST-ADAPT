class TrackerTask {
    constructor() {
        this.canvas = document.getElementById('tracker-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        
        this.aircraftX = 50;
        this.aircraftY = this.canvas.height / 2;
        this.aircraftWidth = 30; 
        this.aircraftHeight = 20; 

        // Increased Difficulty: Smaller Vertical Range
        // Available space is middle 50% of the canvas height
        this.minY = this.canvas.height * 0.25;
        this.maxY = this.canvas.height * 0.75;
        this.aircraftY = (this.minY + this.maxY) / 2;
        
        this.obstacles = [];
        this.particles = [];
        this.obstacleSpeed = 1.8; 
        this.spawnTimer = 0;
        this.spawnRate = 80; 
        
        this.keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };
        this.scoreTicks = 0;
        this.totalTicks = 0;

        window.addEventListener('keydown', e => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
                e.preventDefault();
            }
        });
    }

    start() { this.isActive = true; }
    stop() { this.isActive = false; }

    update() {
        if (!this.isActive) return;

        // Move aircraft
        if (this.keys.w || this.keys.ArrowUp) this.aircraftY -= 3;
        if (this.keys.s || this.keys.ArrowDown) this.aircraftY += 3;
        
        // Tight Vertical constraint
        this.aircraftY = Math.max(this.minY, Math.min(this.maxY, this.aircraftY));

        // Manage obstacles
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            // Obstacles also spawned in a more constrained vertical space to ensure collision threat
            const h = 8; // Thin horizontal bars
            const w = 50 + Math.random() * 20; 
            const y = this.minY - 20 + Math.random() * (this.maxY - this.minY + 40);
            this.obstacles.push({
                x: this.canvas.width,
                y: Math.max(0, Math.min(this.canvas.height - h, y)),
                width: w,
                height: h
            });
        }

        let collision = false;
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= this.obstacleSpeed;

            if (
                this.aircraftX < obs.x + obs.width &&
                this.aircraftX + this.aircraftWidth > obs.x &&
                this.aircraftY - this.aircraftHeight/2 < obs.y + obs.height &&
                this.aircraftY + this.aircraftHeight/2 > obs.y
            ) {
                collision = true;
                if (Math.random() > 0.5) {
                    this.particles.push({
                        x: this.aircraftX + 20,
                        y: this.aircraftY,
                        vx: -Math.random() * 5,
                        vy: (Math.random() - 0.5) * 5,
                        life: 1
                    });
                }
            }

            if (obs.x + obs.width < -100) {
                this.obstacles.splice(i, 1);
            }
        }

        for (let i = this.particles.length-1; i>=0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.totalTicks++;
        if (!collision) {
            this.scoreTicks++;
        }

        this.draw(collision);
    }

    draw(isColliding = false) {
        this.ctx.fillStyle = '#0a0c10';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Boundary Lines to show restricted flight envelope
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.minY - 5);
        this.ctx.lineTo(this.canvas.width, this.minY - 5);
        this.ctx.moveTo(0, this.maxY + 5);
        this.ctx.lineTo(this.canvas.width, this.maxY + 5);
        this.ctx.stroke();

        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.minY - 5);
        this.ctx.fillRect(0, this.maxY + 5, this.canvas.width, this.canvas.height - this.maxY);

        // Dynamic Grid
        this.ctx.strokeStyle = '#1a1f26';
        this.ctx.lineWidth = 1;
        const offset = (this.totalTicks * this.obstacleSpeed) % 40;
        for(let x = -offset; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Obstacles
        this.ctx.fillStyle = '#ffffff';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(255,255,255,0.3)';
        });
        this.ctx.shadowBlur = 0;

        // Plane
        this.drawPlane(this.aircraftX, this.aircraftY, isColliding);

        // Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 51, 102, ${p.life})`;
            this.ctx.fillRect(p.x, p.y, 3, 3);
        });

        this.ctx.strokeStyle = '#2a3441';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPlane(x, y, highlight = false) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        if (highlight) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ff3366';
            this.ctx.fillStyle = '#ff3366';
        } else {
            this.ctx.fillStyle = '#ffffff';
        }
        
        this.ctx.beginPath();
        this.ctx.ellipse(15, 0, 15, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath(); this.ctx.moveTo(10, -3); this.ctx.lineTo(5, -12); this.ctx.lineTo(10, -12); this.ctx.lineTo(18, -3); this.ctx.closePath(); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.moveTo(10, 3); this.ctx.lineTo(5, 12); this.ctx.lineTo(10, 12); this.ctx.lineTo(18, 3); this.ctx.closePath(); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.moveTo(2, 0); this.ctx.lineTo(-3, -7); this.ctx.lineTo(2, -7); this.ctx.lineTo(5, 0); this.ctx.closePath(); this.ctx.fill();
        
        this.ctx.restore();
    }

    getAccuracy() {
        return this.totalTicks === 0 ? 0 : ((this.scoreTicks / this.totalTicks) * 100).toFixed(2);
    }
}