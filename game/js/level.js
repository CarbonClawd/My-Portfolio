// Level - Platforms, Pucks, Stanley Cup, and Hat Trick
class Puck {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 12;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
        this.bobY = Math.sin(time * 0.05 + this.bobOffset) * 4;
    }

    draw(ctx, cameraX, time) {
        if (this.collected) return;

        const drawX = this.x - cameraX;
        const drawY = this.y + (this.bobY || 0);
        const t = time || 0;

        ctx.save();

        // Golden glow ring
        const glowAlpha = Math.sin(t * 0.08 + this.bobOffset) * 0.2 + 0.3;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8 + Math.sin(t * 0.1 + this.bobOffset) * 4;

        // Shadow on ground
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(drawX + 10, drawY + 16, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.strokeStyle = 'rgba(255, 215, 0, ' + glowAlpha + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(drawX + 10, drawY + 4, 13, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Puck side (3D effect) with gradient
        const sideGrad = ctx.createLinearGradient(drawX, drawY + 2, drawX, drawY + 10);
        sideGrad.addColorStop(0, '#222');
        sideGrad.addColorStop(0.5, '#111');
        sideGrad.addColorStop(1, '#050505');
        ctx.fillStyle = sideGrad;
        ctx.fillRect(drawX, drawY + 2, 20, 8);

        // Puck top with gradient
        const topGrad = ctx.createRadialGradient(drawX + 8, drawY, 2, drawX + 10, drawY + 2, 10);
        topGrad.addColorStop(0, '#333');
        topGrad.addColorStop(0.5, '#1a1a1a');
        topGrad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.ellipse(drawX + 10, drawY + 2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rotating shine highlight
        const shineAngle = t * 0.05 + this.bobOffset;
        const shineX = drawX + 10 + Math.cos(shineAngle) * 4;
        const shineY = drawY + 1 + Math.sin(shineAngle) * 2;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.ellipse(shineX, shineY, 3, 1.5, shineAngle * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Edge highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.ellipse(drawX + 10, drawY + 2, 10, 5, 0, Math.PI + 0.3, Math.PI * 2 - 0.3);
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

class StanleyCup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 40;
        this.collected = false;
        this.glowTimer = 0;
    }

    update(time) {
        this.glowTimer = time;
        this.bobY = Math.sin(time * 0.03) * 3;
    }

    draw(ctx, cameraX, time) {
        if (this.collected) return;

        const drawX = this.x - cameraX;
        const drawY = this.y + (this.bobY || 0);

        ctx.save();

        // Glow effect
        const glowIntensity = Math.sin(time * 0.05) * 0.3 + 0.7;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15 * glowIntensity;

        // Base
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(drawX + 4, drawY + 34, 20, 6);

        // Lower bowl / barrel bands
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(drawX + 6, drawY + 18, 16, 16);

        // Band lines
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(drawX + 6, drawY + 20 + i * 4);
            ctx.lineTo(drawX + 22, drawY + 20 + i * 4);
            ctx.stroke();
        }

        // Middle stem
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(drawX + 10, drawY + 14, 8, 6);

        // Cup bowl (top)
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.moveTo(drawX + 2, drawY + 14);
        ctx.lineTo(drawX + 6, drawY + 2);
        ctx.lineTo(drawX + 22, drawY + 2);
        ctx.lineTo(drawX + 26, drawY + 14);
        ctx.closePath();
        ctx.fill();

        // Cup rim
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX + 5, drawY + 2);
        ctx.lineTo(drawX + 23, drawY + 2);
        ctx.stroke();

        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(drawX + 8, drawY + 4, 3, 8);

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

// Hat Trick Power-Up (Level 2) - Freezes goalies with water bottle
class HatTrick {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 36;
        this.collected = false;
        this.glowTimer = 0;
    }

    update(time) {
        this.glowTimer = time;
        this.bobY = Math.sin(time * 0.03) * 4;
    }

    draw(ctx, cameraX, time) {
        if (this.collected) return;

        const drawX = this.x - cameraX;
        const drawY = this.y + (this.bobY || 0);

        ctx.save();

        // Glow effect - icy blue
        const glowIntensity = Math.sin(time * 0.06) * 0.3 + 0.7;
        ctx.shadowColor = '#4a9eff';
        ctx.shadowBlur = 18 * glowIntensity;

        // === THREE STACKED HATS ===

        // Bottom hat (largest)
        ctx.fillStyle = '#1a1a3a';
        ctx.beginPath();
        ctx.ellipse(drawX + 16, drawY + 32, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hat crown
        ctx.fillStyle = '#2a2a5a';
        this._roundRect(ctx, drawX + 4, drawY + 22, 24, 10, 3);
        ctx.fill();
        // Hat band
        ctx.fillStyle = '#4a9eff';
        ctx.fillRect(drawX + 4, drawY + 28, 24, 3);

        // Middle hat
        ctx.fillStyle = '#222244';
        ctx.beginPath();
        ctx.ellipse(drawX + 16, drawY + 22, 13, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333366';
        this._roundRect(ctx, drawX + 6, drawY + 13, 20, 9, 3);
        ctx.fill();
        // Hat band
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(drawX + 6, drawY + 18, 20, 2);

        // Top hat (smallest)
        ctx.fillStyle = '#2a2a55';
        ctx.beginPath();
        ctx.ellipse(drawX + 16, drawY + 13, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a3a77';
        this._roundRect(ctx, drawX + 8, drawY + 4, 16, 9, 3);
        ctx.fill();
        // Hat band
        ctx.fillStyle = '#aaddff';
        ctx.fillRect(drawX + 8, drawY + 9, 16, 2);

        // Star on top
        ctx.fillStyle = '#4a9eff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', drawX + 16, drawY + 6);

        // Sparkle effects
        const sparkle1 = Math.sin(time * 0.1) * 0.5 + 0.5;
        const sparkle2 = Math.sin(time * 0.1 + 2) * 0.5 + 0.5;
        const sparkle3 = Math.sin(time * 0.1 + 4) * 0.5 + 0.5;

        ctx.globalAlpha = sparkle1;
        ctx.fillStyle = '#88ccff';
        ctx.beginPath();
        ctx.arc(drawX + 2, drawY + 8, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = sparkle2;
        ctx.beginPath();
        ctx.arc(drawX + 30, drawY + 15, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = sparkle3;
        ctx.beginPath();
        ctx.arc(drawX + 5, drawY + 28, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        // "HAT TRICK" label
        ctx.fillStyle = '#4a9eff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HAT TRICK', drawX + 16, drawY + 42);

        ctx.restore();
    }

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

// Moving Platform
class MovingPlatform {
    constructor(x, y, width, height, type, moveX, moveY, moveSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height || 18;
        this.type = type || 'ice';
        this.startX = x;
        this.startY = y;
        this.moveRangeX = moveX || 0;
        this.moveRangeY = moveY || 0;
        this.moveSpeed = moveSpeed || 0.02;
        this.movePhase = 0;
        this.currentX = x;
        this.currentY = y;
        this.velX = 0;
    }

    update(time) {
        this.movePhase += this.moveSpeed;
        const prevX = this.currentX;
        this.currentX = this.startX + Math.sin(this.movePhase) * this.moveRangeX;
        this.currentY = this.startY + Math.sin(this.movePhase) * this.moveRangeY;
        this.velX = this.currentX - prevX;
    }

    draw(ctx, cameraX) {
        const drawX = this.currentX - cameraX;
        const drawY = this.currentY;

        ctx.save();

        // Moving platform - glowing edges
        ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
        ctx.fillRect(drawX, drawY, this.width, this.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(drawX, drawY, this.width, 3);

        // Arrow indicators
        ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
        if (this.moveRangeX !== 0) {
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('◄►', drawX + this.width / 2, drawY + this.height / 2 + 4);
        }
        if (this.moveRangeY !== 0) {
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲▼', drawX + this.width / 2, drawY + this.height / 2 + 4);
        }

        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 1;
        ctx.strokeRect(drawX, drawY, this.width, this.height);

        ctx.restore();
    }
}

// Crumbling Platform
class CrumblePlatform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height || 18;
        this.type = 'crumble';
        this.crumbling = false;
        this.crumbleTimer = 0;
        this.crumbleDuration = 45; // frames before falling
        this.fallen = false;
        this.fallSpeed = 0;
        this.currentX = x;
        this.currentY = y;
        this.shakeOffset = 0;
        this.particles = [];
    }

    update() {
        this.currentX = this.x;
        this.currentY = this.y;

        if (this.crumbling && !this.fallen) {
            this.crumbleTimer--;
            this.shakeOffset = (Math.random() - 0.5) * 4;
            // Spawn crumble particles
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: this.x + Math.random() * this.width,
                    y: this.y + this.height,
                    velY: 1 + Math.random() * 2,
                    life: 20,
                    size: 2 + Math.random() * 3
                });
            }
            if (this.crumbleTimer <= 0) {
                this.fallen = true;
            }
        }

        if (this.fallen) {
            this.fallSpeed += 0.5;
            this.y += this.fallSpeed;
            this.currentY = this.y;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].y += this.particles[i].velY;
            this.particles[i].life--;
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx, cameraX) {
        if (this.fallen && this.y > 800) return;

        const drawX = this.x - cameraX + (this.crumbling ? this.shakeOffset : 0);
        const drawY = this.currentY;

        ctx.save();

        if (this.fallen) {
            ctx.globalAlpha = Math.max(0, 1 - (this.y - 520) / 200);
        }

        // Cracked ice look
        ctx.fillStyle = this.crumbling ? 'rgba(255, 200, 200, 0.9)' : 'rgba(200, 225, 255, 0.9)';
        ctx.fillRect(drawX, drawY, this.width, this.height);

        // Crack lines when crumbling
        if (this.crumbling) {
            ctx.strokeStyle = 'rgba(200, 50, 50, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(drawX + this.width * 0.3, drawY);
            ctx.lineTo(drawX + this.width * 0.5, drawY + this.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(drawX + this.width * 0.7, drawY);
            ctx.lineTo(drawX + this.width * 0.4, drawY + this.height);
            ctx.stroke();
        }

        // Warning indicator
        ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
        ctx.fillRect(drawX, drawY + this.height - 2, this.width, 2);

        // Exclamation mark
        if (!this.crumbling && !this.fallen) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', drawX + this.width / 2, drawY + this.height / 2 + 4);
        }

        // Draw particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.life / 20;
            ctx.fillStyle = '#c8d8ff';
            ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
        }

        ctx.restore();
    }
}

// Checkpoint Flag
class Checkpoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 50;
        this.activated = false;
        this.animTimer = 0;
    }

    update(time) {
        this.animTimer = time;
    }

    draw(ctx, cameraX, time) {
        const drawX = this.x - cameraX;
        const drawY = this.y;

        ctx.save();

        // Pole
        ctx.fillStyle = this.activated ? '#ffd700' : '#888';
        ctx.fillRect(drawX + 8, drawY, 4, this.height);

        // Flag
        const wave = Math.sin((time || 0) * 0.08) * 3;
        ctx.fillStyle = this.activated ? '#44ff88' : '#c8102e';
        ctx.beginPath();
        ctx.moveTo(drawX + 12, drawY + 2);
        ctx.lineTo(drawX + 32 + wave, drawY + 10);
        ctx.lineTo(drawX + 12, drawY + 20);
        ctx.closePath();
        ctx.fill();

        // Glow when activated
        if (this.activated) {
            ctx.shadowColor = '#44ff88';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(68, 255, 136, 0.3)';
            ctx.beginPath();
            ctx.arc(drawX + 10, drawY + 10, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#44ff88';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓', drawX + 10, drawY - 5);
        }

        // Base
        ctx.fillStyle = this.activated ? '#ffd700' : '#666';
        ctx.fillRect(drawX + 2, drawY + this.height - 4, 16, 4);

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Platform {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height || 20;
        this.type = type || 'ice'; // 'ice', 'boards', 'ground', 'bounce', 'speed'
    }

    draw(ctx, cameraX, time) {
        const drawX = this.x - cameraX;
        const drawY = this.y;
        const t = time || 0;

        ctx.save();

        if (this.type === 'ground') {
            // Ice surface ground with gradient
            const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + this.height);
            grad.addColorStop(0, '#dce8ff');
            grad.addColorStop(0.15, '#e8f0ff');
            grad.addColorStop(0.5, '#f0f6ff');
            grad.addColorStop(1, '#c8d8f0');
            ctx.fillStyle = grad;
            ctx.fillRect(drawX, drawY, this.width, this.height);

            // Ice scratch lines (subtle)
            ctx.strokeStyle = 'rgba(180, 210, 255, 0.35)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < this.width; i += 18) {
                ctx.beginPath();
                ctx.moveTo(drawX + i, drawY + 4);
                ctx.lineTo(drawX + i + 10, drawY + this.height);
                ctx.stroke();
            }

            // Shimmer effect
            for (let i = 0; i < this.width; i += 40) {
                const shimmer = Math.sin(t * 0.04 + i * 0.1) * 0.15 + 0.15;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + shimmer + ')';
                ctx.fillRect(drawX + i, drawY + 5, 20, 2);
            }

            // Top edge - boards with gradient
            const boardGrad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + 5);
            boardGrad.addColorStop(0, '#e02040');
            boardGrad.addColorStop(1, '#a01030');
            ctx.fillStyle = boardGrad;
            ctx.fillRect(drawX, drawY, this.width, 5);

            // Board highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(drawX, drawY, this.width, 1);

        } else if (this.type === 'boards') {
            // Rink boards platform with 3D depth
            const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + this.height);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#f0f0f0');
            grad.addColorStop(0.8, '#e0e0e0');
            grad.addColorStop(1, '#cccccc');
            ctx.fillStyle = grad;
            this._roundRect(ctx, drawX, drawY, this.width, this.height, 3);
            ctx.fill();

            // Wood grain texture
            ctx.strokeStyle = 'rgba(180, 170, 160, 0.2)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < this.width; i += 12) {
                const wobble = Math.sin(i * 0.3) * 2;
                ctx.beginPath();
                ctx.moveTo(drawX + i, drawY + 2);
                ctx.quadraticCurveTo(drawX + i + 6, drawY + this.height / 2 + wobble, drawX + i, drawY + this.height - 2);
                ctx.stroke();
            }

            // Top highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(drawX + 2, drawY, this.width - 4, 2);

            // Red line on boards
            const redGrad = ctx.createLinearGradient(drawX, drawY + this.height - 4, drawX, drawY + this.height);
            redGrad.addColorStop(0, '#e02040');
            redGrad.addColorStop(1, '#901020');
            ctx.fillStyle = redGrad;
            ctx.fillRect(drawX, drawY + this.height - 3, this.width, 3);

            // Dasher boards pattern with depth
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(drawX + i, drawY + 3);
                ctx.lineTo(drawX + i, drawY + this.height - 3);
                ctx.stroke();
            }

            // Bottom shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(drawX + 2, drawY + this.height, this.width - 4, 3);

        } else if (this.type === 'bounce') {
            // Bounce pad - spring platform
            const bouncePhase = Math.sin(t * 0.08) * 2;
            const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + this.height);
            grad.addColorStop(0, '#ff6644');
            grad.addColorStop(0.5, '#ff4422');
            grad.addColorStop(1, '#cc2200');
            ctx.fillStyle = grad;
            this._roundRect(ctx, drawX, drawY + bouncePhase, this.width, this.height, 4);
            ctx.fill();

            // Spring coils
            ctx.strokeStyle = '#ffaa44';
            ctx.lineWidth = 2;
            for (let i = 0; i < this.width - 8; i += 8) {
                ctx.beginPath();
                ctx.moveTo(drawX + 4 + i, drawY + 3 + bouncePhase);
                ctx.lineTo(drawX + 8 + i, drawY + this.height - 3 + bouncePhase);
                ctx.stroke();
            }

            // Glow
            ctx.shadowColor = '#ff6644';
            ctx.shadowBlur = 8 + Math.sin(t * 0.1) * 4;
            ctx.strokeStyle = 'rgba(255, 100, 68, 0.6)';
            ctx.lineWidth = 1.5;
            this._roundRect(ctx, drawX, drawY + bouncePhase, this.width, this.height, 4);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Arrow indicator
            ctx.fillStyle = '#ffdd44';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', drawX + this.width / 2, drawY - 4 + bouncePhase);

        } else if (this.type === 'speed') {
            // Speed boost zone
            const grad = ctx.createLinearGradient(drawX, drawY, drawX + this.width, drawY);
            grad.addColorStop(0, 'rgba(0, 200, 255, 0.6)');
            grad.addColorStop(0.5, 'rgba(0, 255, 200, 0.8)');
            grad.addColorStop(1, 'rgba(0, 200, 255, 0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(drawX, drawY, this.width, this.height);

            // Animated chevrons
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            const chevronOffset = (t * 3) % 30;
            for (let i = -30; i < this.width + 30; i += 30) {
                const cx = drawX + i + chevronOffset;
                if (cx > drawX - 5 && cx < drawX + this.width + 5) {
                    ctx.beginPath();
                    ctx.moveTo(cx, drawY + 2);
                    ctx.lineTo(cx + 8, drawY + this.height / 2);
                    ctx.lineTo(cx, drawY + this.height - 2);
                    ctx.fill();
                }
            }

            // Glow
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, this.width, this.height);
            ctx.shadowBlur = 0;

            // Speed label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡SPEED⚡', drawX + this.width / 2, drawY + this.height / 2 + 3);

        } else {
            // Ice platform with gradient and shimmer
            const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + this.height);
            grad.addColorStop(0, 'rgba(220, 240, 255, 0.95)');
            grad.addColorStop(0.3, 'rgba(200, 225, 255, 0.9)');
            grad.addColorStop(1, 'rgba(170, 200, 240, 0.85)');
            ctx.fillStyle = grad;
            this._roundRect(ctx, drawX, drawY, this.width, this.height, 3);
            ctx.fill();

            // Shimmer on top
            const shimmerPos = (t * 2) % (this.width + 40) - 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(drawX, drawY, this.width, 2);
            // Moving shimmer highlight
            const shimmerAlpha = 0.4;
            ctx.fillStyle = 'rgba(255, 255, 255, ' + shimmerAlpha + ')';
            ctx.fillRect(drawX + shimmerPos, drawY, 20, 3);

            // Blue line accent with gradient
            const blueGrad = ctx.createLinearGradient(drawX, drawY + this.height - 3, drawX, drawY + this.height);
            blueGrad.addColorStop(0, '#0044cc');
            blueGrad.addColorStop(1, '#002288');
            ctx.fillStyle = blueGrad;
            ctx.fillRect(drawX, drawY + this.height - 2, this.width, 2);

            // Bottom shadow
            ctx.fillStyle = 'rgba(0, 0, 50, 0.1)';
            ctx.fillRect(drawX + 2, drawY + this.height, this.width - 4, 2);
        }

        ctx.restore();
    }

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
}

// Level 1 builder
function createLevel1() {
    const platforms = [];
    const pucks = [];
    const goalies = [];
    const stanleyCups = [];
    const hatTricks = [];

    // Ground - long ice surface
    platforms.push(new Platform(0, 520, 800, 80, 'ground'));
    platforms.push(new Platform(900, 520, 600, 80, 'ground'));
    platforms.push(new Platform(1600, 520, 500, 80, 'ground'));
    platforms.push(new Platform(2200, 520, 800, 80, 'ground'));
    platforms.push(new Platform(3100, 520, 600, 80, 'ground'));
    platforms.push(new Platform(3800, 520, 1200, 80, 'ground'));

    // Floating platforms - boards style
    platforms.push(new Platform(200, 400, 120, 18, 'boards'));
    platforms.push(new Platform(400, 330, 100, 18, 'ice'));
    platforms.push(new Platform(600, 380, 140, 18, 'boards'));
    platforms.push(new Platform(850, 300, 100, 18, 'ice'));

    platforms.push(new Platform(1050, 420, 120, 18, 'boards'));
    platforms.push(new Platform(1200, 340, 100, 18, 'ice'));
    platforms.push(new Platform(1400, 280, 130, 18, 'boards'));
    platforms.push(new Platform(1550, 400, 100, 18, 'ice'));

    platforms.push(new Platform(1750, 350, 120, 18, 'boards'));
    platforms.push(new Platform(1950, 280, 100, 18, 'ice'));
    platforms.push(new Platform(2150, 380, 140, 18, 'boards'));

    platforms.push(new Platform(2450, 400, 100, 18, 'ice'));
    platforms.push(new Platform(2600, 320, 130, 18, 'boards'));
    platforms.push(new Platform(2800, 260, 100, 18, 'ice'));
    platforms.push(new Platform(2950, 380, 120, 18, 'boards'));

    platforms.push(new Platform(3200, 400, 100, 18, 'ice'));
    platforms.push(new Platform(3400, 320, 140, 18, 'boards'));
    platforms.push(new Platform(3600, 260, 100, 18, 'ice'));

    platforms.push(new Platform(3900, 380, 120, 18, 'boards'));
    platforms.push(new Platform(4100, 300, 100, 18, 'ice'));
    platforms.push(new Platform(4300, 350, 150, 18, 'boards'));
    platforms.push(new Platform(4550, 280, 120, 18, 'ice'));

    // Pucks on ground
    for (let i = 100; i < 700; i += 80) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 950; i < 1400; i += 90) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 1650; i < 2000; i += 85) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 2250; i < 2900; i += 75) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 3150; i < 3600; i += 80) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 3850; i < 4800; i += 70) {
        pucks.push(new Puck(i, 498));
    }

    // Pucks on platforms
    pucks.push(new Puck(240, 378));
    pucks.push(new Puck(430, 308));
    pucks.push(new Puck(650, 358));
    pucks.push(new Puck(880, 278));
    pucks.push(new Puck(1090, 398));
    pucks.push(new Puck(1230, 318));
    pucks.push(new Puck(1440, 258));
    pucks.push(new Puck(1790, 328));
    pucks.push(new Puck(1980, 258));
    pucks.push(new Puck(2480, 378));
    pucks.push(new Puck(2640, 298));
    pucks.push(new Puck(2830, 238));
    pucks.push(new Puck(3440, 298));
    pucks.push(new Puck(3630, 238));
    pucks.push(new Puck(4140, 278));
    pucks.push(new Puck(4360, 328));
    pucks.push(new Puck(4590, 258));

    // Goalies on ground (difficulty 1)
    goalies.push(new Goalie(500, 464, 100, 1));
    goalies.push(new Goalie(1100, 464, 80, 1));
    goalies.push(new Goalie(1800, 464, 120, 1));
    goalies.push(new Goalie(2500, 464, 100, 1));
    goalies.push(new Goalie(3300, 464, 90, 1));
    goalies.push(new Goalie(4000, 464, 110, 1));
    goalies.push(new Goalie(4400, 464, 80, 1));

    // Goalies on platforms (difficulty 1)
    goalies.push(new Goalie(620, 324, 40, 1));
    goalies.push(new Goalie(1410, 224, 30, 1));
    goalies.push(new Goalie(2610, 264, 35, 1));
    goalies.push(new Goalie(3410, 264, 40, 1));
    goalies.push(new Goalie(4310, 294, 40, 1));

    // Stanley Cups (rare power-ups)
    stanleyCups.push(new StanleyCup(885, 255));
    stanleyCups.push(new StanleyCup(1985, 235));
    stanleyCups.push(new StanleyCup(2835, 215));
    stanleyCups.push(new StanleyCup(4145, 255));

    // Moving platforms
    const movingPlatforms = [];
    movingPlatforms.push(new MovingPlatform(830, 440, 80, 18, 'ice', 60, 0, 0.02));
    movingPlatforms.push(new MovingPlatform(1520, 380, 80, 18, 'ice', 0, 40, 0.025));
    movingPlatforms.push(new MovingPlatform(2950, 340, 90, 18, 'ice', 50, 0, 0.02));

    // Crumbling platforms
    const crumblePlatforms = [];
    crumblePlatforms.push(new CrumblePlatform(1750, 420, 80, 18));
    crumblePlatforms.push(new CrumblePlatform(3200, 360, 80, 18));

    // Bounce pads
    platforms.push(new Platform(820, 500, 60, 16, 'bounce'));
    platforms.push(new Platform(2100, 500, 60, 16, 'bounce'));
    platforms.push(new Platform(3750, 500, 60, 16, 'bounce'));

    // Speed zones
    platforms.push(new Platform(300, 516, 120, 6, 'speed'));
    platforms.push(new Platform(1700, 516, 120, 6, 'speed'));
    platforms.push(new Platform(3200, 516, 120, 6, 'speed'));
    platforms.push(new Platform(4100, 516, 120, 6, 'speed'));

    // Checkpoints
    const checkpoints = [];
    checkpoints.push(new Checkpoint(1600, 470));
    checkpoints.push(new Checkpoint(3100, 470));

    return { platforms, pucks, goalies, stanleyCups, hatTricks, movingPlatforms, crumblePlatforms, checkpoints };
}

// Level 2 builder - harder, different layout, Hat Trick power-ups
function createLevel2() {
    const platforms = [];
    const pucks = [];
    const goalies = [];
    const stanleyCups = [];
    const hatTricks = [];

    // Ground - ice surface with more gaps
    platforms.push(new Platform(0, 520, 600, 80, 'ground'));
    platforms.push(new Platform(750, 520, 500, 80, 'ground'));
    platforms.push(new Platform(1400, 520, 400, 80, 'ground'));
    platforms.push(new Platform(1950, 520, 700, 80, 'ground'));
    platforms.push(new Platform(2800, 520, 500, 80, 'ground'));
    platforms.push(new Platform(3450, 520, 600, 80, 'ground'));
    platforms.push(new Platform(4200, 520, 900, 80, 'ground'));

    // Floating platforms - more challenging layout
    platforms.push(new Platform(150, 420, 100, 18, 'boards'));
    platforms.push(new Platform(320, 350, 90, 18, 'ice'));
    platforms.push(new Platform(500, 300, 110, 18, 'boards'));
    platforms.push(new Platform(680, 400, 100, 18, 'ice'));

    platforms.push(new Platform(850, 320, 90, 18, 'boards'));
    platforms.push(new Platform(1020, 260, 100, 18, 'ice'));
    platforms.push(new Platform(1180, 380, 110, 18, 'boards'));
    platforms.push(new Platform(1350, 300, 90, 18, 'ice'));

    platforms.push(new Platform(1500, 420, 100, 18, 'boards'));
    platforms.push(new Platform(1680, 340, 90, 18, 'ice'));
    platforms.push(new Platform(1850, 270, 110, 18, 'boards'));

    platforms.push(new Platform(2100, 400, 90, 18, 'ice'));
    platforms.push(new Platform(2280, 320, 100, 18, 'boards'));
    platforms.push(new Platform(2450, 250, 90, 18, 'ice'));
    platforms.push(new Platform(2620, 380, 110, 18, 'boards'));

    platforms.push(new Platform(2900, 400, 90, 18, 'ice'));
    platforms.push(new Platform(3080, 310, 100, 18, 'boards'));
    platforms.push(new Platform(3250, 250, 90, 18, 'ice'));
    platforms.push(new Platform(3400, 380, 110, 18, 'boards'));

    platforms.push(new Platform(3600, 340, 90, 18, 'ice'));
    platforms.push(new Platform(3780, 270, 100, 18, 'boards'));
    platforms.push(new Platform(3950, 350, 110, 18, 'ice'));
    platforms.push(new Platform(4150, 290, 100, 18, 'boards'));
    platforms.push(new Platform(4350, 350, 120, 18, 'ice'));
    platforms.push(new Platform(4550, 270, 100, 18, 'boards'));

    // Pucks on ground
    for (let i = 80; i < 550; i += 70) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 800; i < 1200; i += 80) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 1450; i < 1750; i += 75) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 2000; i < 2600; i += 70) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 2850; i < 3300; i += 75) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 3500; i < 4000; i += 70) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 4250; i < 4900; i += 65) {
        pucks.push(new Puck(i, 498));
    }

    // Pucks on platforms
    pucks.push(new Puck(180, 398));
    pucks.push(new Puck(345, 328));
    pucks.push(new Puck(535, 278));
    pucks.push(new Puck(710, 378));
    pucks.push(new Puck(875, 298));
    pucks.push(new Puck(1050, 238));
    pucks.push(new Puck(1215, 358));
    pucks.push(new Puck(1375, 278));
    pucks.push(new Puck(1530, 398));
    pucks.push(new Puck(1710, 318));
    pucks.push(new Puck(1885, 248));
    pucks.push(new Puck(2130, 378));
    pucks.push(new Puck(2310, 298));
    pucks.push(new Puck(2480, 228));
    pucks.push(new Puck(2650, 358));
    pucks.push(new Puck(3110, 288));
    pucks.push(new Puck(3280, 228));
    pucks.push(new Puck(3630, 318));
    pucks.push(new Puck(3810, 248));
    pucks.push(new Puck(4185, 268));
    pucks.push(new Puck(4385, 328));
    pucks.push(new Puck(4585, 248));

    // Goalies on ground (difficulty 2 - harder!)
    goalies.push(new Goalie(350, 464, 120, 2));
    goalies.push(new Goalie(900, 464, 100, 2));
    goalies.push(new Goalie(1500, 464, 90, 2));
    goalies.push(new Goalie(2100, 464, 130, 2));
    goalies.push(new Goalie(2600, 464, 100, 2));
    goalies.push(new Goalie(3100, 464, 110, 2));
    goalies.push(new Goalie(3600, 464, 100, 2));
    goalies.push(new Goalie(4300, 464, 120, 2));
    goalies.push(new Goalie(4700, 464, 90, 2));

    // Goalies on platforms (difficulty 2)
    goalies.push(new Goalie(510, 244, 30, 2));
    goalies.push(new Goalie(1030, 204, 25, 2));
    goalies.push(new Goalie(1860, 214, 30, 2));
    goalies.push(new Goalie(2460, 194, 25, 2));
    goalies.push(new Goalie(3260, 194, 25, 2));
    goalies.push(new Goalie(3790, 214, 30, 2));
    goalies.push(new Goalie(4560, 214, 30, 2));

    // Hat Trick power-ups (replaces Stanley Cup on Level 2)
    hatTricks.push(new HatTrick(1055, 215));
    hatTricks.push(new HatTrick(1890, 225));
    hatTricks.push(new HatTrick(2485, 205));
    hatTricks.push(new HatTrick(3815, 225));

    // Moving platforms
    const movingPlatforms = [];
    movingPlatforms.push(new MovingPlatform(680, 420, 80, 18, 'ice', 70, 0, 0.025));
    movingPlatforms.push(new MovingPlatform(1350, 360, 75, 18, 'ice', 0, 50, 0.03));
    movingPlatforms.push(new MovingPlatform(2620, 340, 80, 18, 'ice', 60, 0, 0.025));
    movingPlatforms.push(new MovingPlatform(3950, 320, 75, 18, 'ice', 50, 30, 0.02));

    // Crumbling platforms
    const crumblePlatforms = [];
    crumblePlatforms.push(new CrumblePlatform(1180, 420, 75, 18));
    crumblePlatforms.push(new CrumblePlatform(2280, 380, 75, 18));
    crumblePlatforms.push(new CrumblePlatform(3600, 400, 70, 18));

    // Bounce pads
    platforms.push(new Platform(700, 500, 55, 16, 'bounce'));
    platforms.push(new Platform(1900, 500, 55, 16, 'bounce'));
    platforms.push(new Platform(3400, 500, 55, 16, 'bounce'));
    platforms.push(new Platform(4500, 500, 55, 16, 'bounce'));

    // Speed zones
    platforms.push(new Platform(200, 516, 100, 6, 'speed'));
    platforms.push(new Platform(1500, 516, 100, 6, 'speed'));
    platforms.push(new Platform(2900, 516, 100, 6, 'speed'));
    platforms.push(new Platform(3800, 516, 100, 6, 'speed'));
    platforms.push(new Platform(4400, 516, 100, 6, 'speed'));

    // Checkpoints
    const checkpoints = [];
    checkpoints.push(new Checkpoint(1400, 470));
    checkpoints.push(new Checkpoint(2800, 470));
    checkpoints.push(new Checkpoint(4200, 470));

    return { platforms, pucks, goalies, stanleyCups, hatTricks, movingPlatforms, crumblePlatforms, checkpoints };
}

// Breakaway Power-Up (Level 3) - Invincibility for 5 seconds
class Breakaway {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 34;
        this.height = 38;
        this.collected = false;
        this.glowTimer = 0;
    }

    update(time) {
        this.glowTimer = time;
        this.bobY = Math.sin(time * 0.04) * 5;
    }

    draw(ctx, cameraX, time) {
        if (this.collected) return;

        const drawX = this.x - cameraX;
        const drawY = this.y + (this.bobY || 0);

        ctx.save();

        // Glow effect - green/gold
        const glowIntensity = Math.sin(time * 0.07) * 0.3 + 0.7;
        ctx.shadowColor = '#44ff88';
        ctx.shadowBlur = 20 * glowIntensity;

        // === SPEED BURST ICON ===

        // Shield/aura circle
        const pulse = Math.sin(time * 0.08) * 3;
        ctx.strokeStyle = 'rgba(68, 255, 136, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(drawX + 17, drawY + 19, 18 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow circle
        ctx.fillStyle = 'rgba(68, 255, 136, 0.15)';
        ctx.beginPath();
        ctx.arc(drawX + 17, drawY + 19, 16, 0, Math.PI * 2);
        ctx.fill();

        // Player silhouette (skating figure)
        ctx.fillStyle = '#44ff88';
        // Body
        ctx.beginPath();
        ctx.ellipse(drawX + 17, drawY + 14, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(drawX + 17, drawY + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        // Legs (skating pose)
        ctx.strokeStyle = '#44ff88';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(drawX + 17, drawY + 20);
        ctx.lineTo(drawX + 12, drawY + 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(drawX + 17, drawY + 20);
        ctx.lineTo(drawX + 24, drawY + 26);
        ctx.stroke();
        // Stick
        ctx.strokeStyle = '#88ffbb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX + 22, drawY + 12);
        ctx.lineTo(drawX + 28, drawY + 22);
        ctx.stroke();

        // Speed lines
        ctx.strokeStyle = 'rgba(68, 255, 136, 0.6)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const lineY = drawY + 8 + i * 8;
            const linePhase = Math.sin(time * 0.12 + i * 1.5) * 3;
            ctx.beginPath();
            ctx.moveTo(drawX - 2 + linePhase, lineY);
            ctx.lineTo(drawX + 8 + linePhase, lineY);
            ctx.stroke();
        }

        // Sparkle effects
        const sparkle1 = Math.sin(time * 0.12) * 0.5 + 0.5;
        const sparkle2 = Math.sin(time * 0.12 + 2) * 0.5 + 0.5;
        const sparkle3 = Math.sin(time * 0.12 + 4) * 0.5 + 0.5;

        ctx.globalAlpha = sparkle1;
        ctx.fillStyle = '#88ffbb';
        ctx.beginPath();
        ctx.arc(drawX + 1, drawY + 6, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = sparkle2;
        ctx.beginPath();
        ctx.arc(drawX + 32, drawY + 14, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = sparkle3;
        ctx.beginPath();
        ctx.arc(drawX + 4, drawY + 30, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        // "BREAKAWAY" label
        ctx.fillStyle = '#44ff88';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BREAKAWAY', drawX + 17, drawY + 38);

        ctx.restore();
    }

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

// Level 3 builder - The Finals! Hardest level with Breakaway power-ups
function createLevel3() {
    const platforms = [];
    const pucks = [];
    const goalies = [];
    const stanleyCups = [];
    const hatTricks = [];
    const breakaways = [];

    // Ground - ice surface with bigger gaps (harder jumps)
    platforms.push(new Platform(0, 520, 500, 80, 'ground'));
    platforms.push(new Platform(650, 520, 400, 80, 'ground'));
    platforms.push(new Platform(1200, 520, 350, 80, 'ground'));
    platforms.push(new Platform(1700, 520, 500, 80, 'ground'));
    platforms.push(new Platform(2350, 520, 400, 80, 'ground'));
    platforms.push(new Platform(2900, 520, 350, 80, 'ground'));
    platforms.push(new Platform(3400, 520, 500, 80, 'ground'));
    platforms.push(new Platform(4050, 520, 400, 80, 'ground'));
    platforms.push(new Platform(4600, 520, 500, 80, 'ground'));

    // Floating platforms - narrower and trickier
    platforms.push(new Platform(130, 430, 80, 18, 'boards'));
    platforms.push(new Platform(280, 360, 70, 18, 'ice'));
    platforms.push(new Platform(420, 300, 80, 18, 'boards'));
    platforms.push(new Platform(560, 410, 70, 18, 'ice'));

    platforms.push(new Platform(720, 340, 75, 18, 'boards'));
    platforms.push(new Platform(870, 270, 70, 18, 'ice'));
    platforms.push(new Platform(1010, 390, 80, 18, 'boards'));
    platforms.push(new Platform(1150, 310, 70, 18, 'ice'));

    platforms.push(new Platform(1300, 430, 75, 18, 'boards'));
    platforms.push(new Platform(1450, 350, 70, 18, 'ice'));
    platforms.push(new Platform(1600, 280, 80, 18, 'boards'));

    platforms.push(new Platform(1800, 410, 70, 18, 'ice'));
    platforms.push(new Platform(1950, 330, 75, 18, 'boards'));
    platforms.push(new Platform(2100, 260, 70, 18, 'ice'));
    platforms.push(new Platform(2250, 390, 80, 18, 'boards'));

    platforms.push(new Platform(2430, 340, 70, 18, 'ice'));
    platforms.push(new Platform(2580, 270, 75, 18, 'boards'));
    platforms.push(new Platform(2730, 400, 70, 18, 'ice'));

    platforms.push(new Platform(2970, 350, 75, 18, 'boards'));
    platforms.push(new Platform(3120, 280, 70, 18, 'ice'));
    platforms.push(new Platform(3270, 400, 80, 18, 'boards'));

    platforms.push(new Platform(3480, 340, 70, 18, 'ice'));
    platforms.push(new Platform(3630, 270, 75, 18, 'boards'));
    platforms.push(new Platform(3780, 360, 70, 18, 'ice'));
    platforms.push(new Platform(3930, 290, 80, 18, 'boards'));

    platforms.push(new Platform(4130, 380, 70, 18, 'ice'));
    platforms.push(new Platform(4280, 300, 75, 18, 'boards'));
    platforms.push(new Platform(4430, 240, 70, 18, 'ice'));
    platforms.push(new Platform(4580, 350, 80, 18, 'boards'));
    platforms.push(new Platform(4750, 270, 75, 18, 'ice'));
    platforms.push(new Platform(4900, 380, 70, 18, 'boards'));

    // Pucks on ground
    for (let i = 60; i < 450; i += 65) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 700; i < 1000; i += 70) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 1250; i < 1500; i += 65) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 1750; i < 2150; i += 60) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 2400; i < 2700; i += 65) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 2950; i < 3200; i += 60) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 3450; i < 3850; i += 65) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 4100; i < 4400; i += 60) {
        pucks.push(new Puck(i, 498));
    }
    for (let i = 4650; i < 5000; i += 55) {
        pucks.push(new Puck(i, 498));
    }

    // Pucks on platforms
    pucks.push(new Puck(155, 408));
    pucks.push(new Puck(300, 338));
    pucks.push(new Puck(445, 278));
    pucks.push(new Puck(580, 388));
    pucks.push(new Puck(745, 318));
    pucks.push(new Puck(890, 248));
    pucks.push(new Puck(1035, 368));
    pucks.push(new Puck(1170, 288));
    pucks.push(new Puck(1325, 408));
    pucks.push(new Puck(1470, 328));
    pucks.push(new Puck(1625, 258));
    pucks.push(new Puck(1820, 388));
    pucks.push(new Puck(1975, 308));
    pucks.push(new Puck(2120, 238));
    pucks.push(new Puck(2275, 368));
    pucks.push(new Puck(2450, 318));
    pucks.push(new Puck(2600, 248));
    pucks.push(new Puck(2990, 328));
    pucks.push(new Puck(3140, 258));
    pucks.push(new Puck(3500, 318));
    pucks.push(new Puck(3650, 248));
    pucks.push(new Puck(3800, 338));
    pucks.push(new Puck(3955, 268));
    pucks.push(new Puck(4300, 278));
    pucks.push(new Puck(4450, 218));
    pucks.push(new Puck(4770, 248));

    // Goalies on ground (difficulty 3 - hardest!)
    goalies.push(new Goalie(250, 464, 130, 3));
    goalies.push(new Goalie(750, 464, 110, 3));
    goalies.push(new Goalie(1300, 464, 100, 3));
    goalies.push(new Goalie(1850, 464, 140, 3));
    goalies.push(new Goalie(2150, 464, 110, 3));
    goalies.push(new Goalie(2500, 464, 120, 3));
    goalies.push(new Goalie(3000, 464, 100, 3));
    goalies.push(new Goalie(3500, 464, 130, 3));
    goalies.push(new Goalie(3800, 464, 110, 3));
    goalies.push(new Goalie(4200, 464, 120, 3));
    goalies.push(new Goalie(4700, 464, 100, 3));

    // Goalies on platforms (difficulty 3)
    goalies.push(new Goalie(430, 244, 20, 3));
    goalies.push(new Goalie(880, 214, 20, 3));
    goalies.push(new Goalie(1610, 224, 20, 3));
    goalies.push(new Goalie(2110, 204, 20, 3));
    goalies.push(new Goalie(2590, 214, 20, 3));
    goalies.push(new Goalie(3130, 224, 20, 3));
    goalies.push(new Goalie(3640, 214, 20, 3));
    goalies.push(new Goalie(3940, 234, 20, 3));
    goalies.push(new Goalie(4440, 184, 20, 3));
    goalies.push(new Goalie(4760, 214, 20, 3));

    // Breakaway power-ups (Level 3 special)
    breakaways.push(new Breakaway(895, 225));
    breakaways.push(new Breakaway(1630, 235));
    breakaways.push(new Breakaway(2605, 225));
    breakaways.push(new Breakaway(3960, 245));

    // Moving platforms - more and trickier
    const movingPlatforms = [];
    movingPlatforms.push(new MovingPlatform(540, 380, 70, 18, 'ice', 80, 0, 0.03));
    movingPlatforms.push(new MovingPlatform(1010, 350, 65, 18, 'ice', 0, 60, 0.035));
    movingPlatforms.push(new MovingPlatform(1600, 400, 70, 18, 'ice', 70, 0, 0.03));
    movingPlatforms.push(new MovingPlatform(2250, 320, 65, 18, 'ice', 60, 40, 0.025));
    movingPlatforms.push(new MovingPlatform(2730, 360, 70, 18, 'ice', 0, 70, 0.03));
    movingPlatforms.push(new MovingPlatform(3480, 380, 65, 18, 'ice', 80, 0, 0.035));
    movingPlatforms.push(new MovingPlatform(4130, 340, 70, 18, 'ice', 60, 50, 0.025));

    // Crumbling platforms - more dangerous
    const crumblePlatforms = [];
    crumblePlatforms.push(new CrumblePlatform(720, 400, 65, 18));
    crumblePlatforms.push(new CrumblePlatform(1300, 390, 65, 18));
    crumblePlatforms.push(new CrumblePlatform(1950, 380, 60, 18));
    crumblePlatforms.push(new CrumblePlatform(2580, 350, 65, 18));
    crumblePlatforms.push(new CrumblePlatform(3270, 360, 60, 18));
    crumblePlatforms.push(new CrumblePlatform(3930, 370, 65, 18));
    crumblePlatforms.push(new CrumblePlatform(4580, 390, 60, 18));

    // Bounce pads - more in Level 3
    platforms.push(new Platform(600, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(1150, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(1650, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(2300, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(2850, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(3350, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(4000, 500, 50, 16, 'bounce'));
    platforms.push(new Platform(4550, 500, 50, 16, 'bounce'));

    // Speed zones
    platforms.push(new Platform(100, 516, 90, 6, 'speed'));
    platforms.push(new Platform(1250, 516, 90, 6, 'speed'));
    platforms.push(new Platform(1800, 516, 90, 6, 'speed'));
    platforms.push(new Platform(2450, 516, 90, 6, 'speed'));
    platforms.push(new Platform(3000, 516, 90, 6, 'speed'));
    platforms.push(new Platform(3500, 516, 90, 6, 'speed'));
    platforms.push(new Platform(4100, 516, 90, 6, 'speed'));
    platforms.push(new Platform(4650, 516, 90, 6, 'speed'));

    // Checkpoints
    const checkpoints = [];
    checkpoints.push(new Checkpoint(1200, 470));
    checkpoints.push(new Checkpoint(2350, 470));
    checkpoints.push(new Checkpoint(3400, 470));
    checkpoints.push(new Checkpoint(4600, 470));

    // Boss goalie at the end
    const bossGoalie = new BossGoalie(4750, 420);

    return { platforms, pucks, goalies, stanleyCups, hatTricks, breakaways, movingPlatforms, crumblePlatforms, checkpoints, bossGoalie };
}

// Legacy function for backward compatibility
function createLevel() {
    return createLevel1();
}
