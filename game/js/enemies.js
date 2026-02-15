// Enemies - Goalies
class Goalie {
    constructor(x, y, patrolRange) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 60;
        this.startX = x;
        this.patrolRange = patrolRange || 120;
        this.speed = 1.5;
        this.direction = 1;
        this.alive = true;

        // Death animation
        this.dying = false;
        this.deathTimer = 0;
        this.deathY = 0;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.butterflyTimer = 0;
        this.inButterfly = false;
    }

    update() {
        if (this.dying) {
            this.deathTimer++;
            this.deathY += 1;
            if (this.deathTimer > 40) {
                this.alive = false;
                this.dying = false;
            }
            return;
        }

        if (!this.alive) return;

        this.x += this.speed * this.direction;

        // Reverse direction at patrol bounds
        if (this.x > this.startX + this.patrolRange) {
            this.direction = -1;
        } else if (this.x < this.startX - this.patrolRange) {
            this.direction = 1;
        }

        // Animation
        this.animTimer++;
        if (this.animTimer > 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Occasional butterfly stance
        this.butterflyTimer++;
        if (this.butterflyTimer > 120 && !this.inButterfly) {
            this.inButterfly = true;
            this.butterflyTimer = 0;
        }
        if (this.inButterfly && this.butterflyTimer > 30) {
            this.inButterfly = false;
            this.butterflyTimer = 0;
        }
    }

    kill() {
        this.dying = true;
        this.deathTimer = 0;
        this.deathY = 0;
    }

    draw(ctx, cameraX) {
        if (!this.alive && !this.dying) return;

        const drawX = this.x - cameraX;
        const drawY = this.y + this.deathY;

        ctx.save();

        // Death fade
        if (this.dying) {
            ctx.globalAlpha = 1 - (this.deathTimer / 40);
            // Spin when dying
            ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
            ctx.rotate(this.deathTimer * 0.15);
            ctx.translate(-(drawX + this.width / 2), -(drawY + this.height / 2));
        }

        // Flip based on direction
        if (this.direction === -1) {
            ctx.translate(drawX + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(drawX + this.width / 2), 0);
        }

        const gcx = drawX + this.width / 2; // goalie center x
        const sway = Math.sin(this.animFrame * Math.PI / 2) * 2;
        const butterflyDrop = this.inButterfly ? 8 : 0;

        // === GOALIE LEG PADS ===
        // Left pad
        ctx.fillStyle = '#f5f5f5';
        this._roundRect(ctx, drawX + 4, drawY + 30 + sway + butterflyDrop, 16, 24 - butterflyDrop, 3);
        ctx.fill();
        // Pad stripes
        ctx.fillStyle = '#1a5e1a';
        ctx.fillRect(drawX + 6, drawY + 34 + sway + butterflyDrop, 12, 3);
        ctx.fillRect(drawX + 6, drawY + 42 + sway, 12, 3);
        // Pad knee roll
        ctx.fillStyle = '#e0e0e0';
        this._roundRect(ctx, drawX + 5, drawY + 30 + sway + butterflyDrop, 14, 5, 2);
        ctx.fill();

        // Right pad
        ctx.fillStyle = '#f5f5f5';
        this._roundRect(ctx, drawX + this.width - 20, drawY + 30 - sway + butterflyDrop, 16, 24 - butterflyDrop, 3);
        ctx.fill();
        // Pad stripes
        ctx.fillStyle = '#1a5e1a';
        ctx.fillRect(drawX + this.width - 18, drawY + 34 - sway + butterflyDrop, 12, 3);
        ctx.fillRect(drawX + this.width - 18, drawY + 42 - sway, 12, 3);
        // Pad knee roll
        ctx.fillStyle = '#e0e0e0';
        this._roundRect(ctx, drawX + this.width - 19, drawY + 30 - sway + butterflyDrop, 14, 5, 2);
        ctx.fill();

        // === SKATES ===
        ctx.fillStyle = '#1a1a1a';
        this._roundRect(ctx, drawX + 2, drawY + this.height - 8, 18, 8, 2);
        ctx.fill();
        this._roundRect(ctx, drawX + this.width - 20, drawY + this.height - 8, 18, 8, 2);
        ctx.fill();
        // Blades
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(drawX, drawY + this.height - 2, 22, 2);
        ctx.fillRect(drawX + this.width - 22, drawY + this.height - 2, 22, 2);

        // === BODY / CHEST PROTECTOR ===
        // Chest protector base
        ctx.fillStyle = '#2a2a2a';
        this._roundRect(ctx, drawX + 3, drawY + 12, this.width - 6, 24, 5);
        ctx.fill();

        // Jersey over chest protector
        ctx.fillStyle = '#1a5e1a';
        this._roundRect(ctx, drawX + 5, drawY + 14, this.width - 10, 20, 4);
        ctx.fill();

        // Jersey stripes
        ctx.fillStyle = '#fff';
        ctx.fillRect(drawX + 5, drawY + 26, this.width - 10, 2);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(drawX + 5, drawY + 28, this.width - 10, 2);

        // Chest protector bulk (shoulders)
        ctx.fillStyle = '#2a2a2a';
        this._roundRect(ctx, drawX, drawY + 12, this.width, 10, 5);
        ctx.fill();
        ctx.fillStyle = '#1a5e1a';
        this._roundRect(ctx, drawX + 2, drawY + 13, this.width - 4, 8, 4);
        ctx.fill();

        // === ARMS ===
        // Left arm
        ctx.fillStyle = '#1a5e1a';
        this._roundRect(ctx, drawX - 6, drawY + 14, 12, 18, 3);
        ctx.fill();
        // Left arm pad
        ctx.fillStyle = '#2a2a2a';
        this._roundRect(ctx, drawX - 7, drawY + 18, 13, 6, 2);
        ctx.fill();

        // Right arm
        ctx.fillStyle = '#1a5e1a';
        this._roundRect(ctx, drawX + this.width - 6, drawY + 14, 12, 18, 3);
        ctx.fill();
        // Right arm pad
        ctx.fillStyle = '#2a2a2a';
        this._roundRect(ctx, drawX + this.width - 6, drawY + 18, 13, 6, 2);
        ctx.fill();

        // === BLOCKER (right hand) ===
        ctx.fillStyle = '#f0f0f0';
        this._roundRect(ctx, drawX + this.width - 4, drawY + 28, 14, 12, 3);
        ctx.fill();
        // Blocker detail
        ctx.fillStyle = '#1a5e1a';
        ctx.fillRect(drawX + this.width - 2, drawY + 30, 10, 2);

        // === CATCHING GLOVE (left hand) ===
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(drawX - 2, drawY + 30, 10, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Glove pocket
        ctx.strokeStyle = '#1a5e1a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(drawX - 2, drawY + 30, 6, 0.5, Math.PI + 0.5);
        ctx.stroke();
        // Glove webbing
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(drawX - 8, drawY + 26 + i * 3);
            ctx.lineTo(drawX + 4, drawY + 26 + i * 3);
            ctx.stroke();
        }

        // === GOALIE MASK / HELMET ===
        const headY = drawY + 2;
        // Helmet shell
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(gcx, headY + 7, 16, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mask paint job (team color accents)
        ctx.fillStyle = '#1a5e1a';
        ctx.beginPath();
        ctx.ellipse(gcx, headY + 3, 12, 6, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Cage
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.2;
        // Vertical bars
        for (let i = -8; i <= 8; i += 3) {
            ctx.beginPath();
            ctx.moveTo(gcx + i, headY + 1);
            ctx.lineTo(gcx + i, headY + 16);
            ctx.stroke();
        }
        // Horizontal bars
        for (let j = 3; j <= 15; j += 3) {
            ctx.beginPath();
            ctx.moveTo(gcx - 10, headY + j);
            ctx.lineTo(gcx + 10, headY + j);
            ctx.stroke();
        }

        // Menacing eyes behind cage
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.ellipse(gcx - 4, headY + 8, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(gcx + 4, headY + 8, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye glow
        ctx.fillStyle = '#ff6644';
        ctx.beginPath();
        ctx.arc(gcx - 3.5, headY + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gcx + 4.5, headY + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();

        // Chin guard
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.ellipse(gcx, headY + 16, 8, 4, 0, 0, Math.PI);
        ctx.fill();

        // === GOALIE STICK ===
        ctx.strokeStyle = '#6B3410';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width, drawY + 32);
        ctx.quadraticCurveTo(drawX + this.width + 4, drawY + 44, drawX + this.width + 6, drawY + this.height - 2);
        ctx.stroke();
        // Wide paddle
        ctx.fillStyle = '#f5f5f5';
        this._roundRect(ctx, drawX + this.width + 2, drawY + this.height - 14, 8, 14, 2);
        ctx.fill();
        // Paddle stripe
        ctx.fillStyle = '#1a5e1a';
        ctx.fillRect(drawX + this.width + 3, drawY + this.height - 10, 6, 3);

        // Blade
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(drawX + this.width + 2, drawY + this.height - 4, 14, 4);

        ctx.restore();
    }

    // Helper for rounded rectangles
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Projectile - Shot puck
class ShotPuck {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 10;
        this.speed = 12;
        this.direction = direction; // 1 = right, -1 = left
        this.alive = true;
        this.life = 120; // disappears after 2 seconds
        this.trail = [];
    }

    update() {
        this.x += this.speed * this.direction;
        this.life--;

        // Trail effect
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 8) this.trail.shift();
        for (const t of this.trail) {
            t.alpha -= 0.12;
        }

        if (this.life <= 0) {
            this.alive = false;
        }
    }

    draw(ctx, cameraX) {
        if (!this.alive) return;

        // Draw trail
        for (const t of this.trail) {
            if (t.alpha > 0) {
                ctx.globalAlpha = t.alpha * 0.4;
                ctx.fillStyle = '#555';
                ctx.beginPath();
                ctx.ellipse(t.x - cameraX + 8, t.y + 5, 6, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        const drawX = this.x - cameraX;
        const drawY = this.y;

        // Spinning puck
        ctx.save();

        // Motion blur glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;

        // Puck body
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(drawX + 8, drawY + 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Puck shine
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(drawX + 6, drawY + 3, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
