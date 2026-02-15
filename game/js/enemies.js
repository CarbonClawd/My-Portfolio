// Enemies - Goalies
class Goalie {
    constructor(x, y, patrolRange, difficulty) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 60;
        this.startX = x;
        this.patrolRange = patrolRange || 120;
        this.speed = 1.5;
        this.baseSpeed = 1.5;
        this.direction = 1;
        this.alive = true;
        this.difficulty = difficulty || 1; // 1 = normal, 2 = hard

        // Death animation
        this.dying = false;
        this.deathTimer = 0;
        this.deathY = 0;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.butterflyTimer = 0;
        this.inButterfly = false;

        // === DIFFICULTY BEHAVIORS ===

        // Puck Blocking - goalie raises blocker to deflect shots
        this.blocking = false;
        this.blockTimer = 0;
        this.blockCooldown = 0;
        this.blockDuration = 40; // frames of blocking
        this.blockChance = this.difficulty >= 2 ? 0.008 : 0.004; // chance per frame to start blocking

        // Charge/Lunge - goalie lunges toward player when close
        this.charging = false;
        this.chargeTimer = 0;
        this.chargeCooldown = 0;
        this.chargeSpeed = this.difficulty >= 2 ? 5 : 3.5;
        this.chargeDirection = 1;
        this.chargeDuration = 25;

        // Poke Check - extends stick, wider hitbox
        this.pokeChecking = false;
        this.pokeTimer = 0;
        this.pokeCooldown = 0;
        this.pokeDuration = 35;
        this.pokeChance = this.difficulty >= 2 ? 0.006 : 0.003;
        this.pokeExtend = 20; // extra width when poke checking

        // Freeze state (from Hat Trick water bottle)
        this.frozen = false;
        this.frozenTimer = 0;
        this.frozenDuration = 480; // 8 seconds at 60fps
        this.iceParticles = [];

        // Apply difficulty scaling
        if (this.difficulty >= 2) {
            this.speed = 2.2;
            this.baseSpeed = 2.2;
        }
    }

    update(playerX) {
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

        // === FROZEN STATE ===
        if (this.frozen) {
            this.frozenTimer--;
            // Update ice particles
            for (let i = this.iceParticles.length - 1; i >= 0; i--) {
                this.iceParticles[i].life--;
                this.iceParticles[i].y -= 0.3;
                if (this.iceParticles[i].life <= 0) {
                    this.iceParticles.splice(i, 1);
                }
            }
            // Spawn new ice particles
            if (Math.random() < 0.15) {
                this.iceParticles.push({
                    x: this.x + Math.random() * this.width,
                    y: this.y + Math.random() * this.height,
                    life: 30 + Math.random() * 20,
                    maxLife: 50,
                    size: 2 + Math.random() * 3
                });
            }
            if (this.frozenTimer <= 0) {
                this.frozen = false;
                this.iceParticles = [];
            }
            return; // Don't move or act while frozen
        }

        // Cooldown timers
        if (this.blockCooldown > 0) this.blockCooldown--;
        if (this.chargeCooldown > 0) this.chargeCooldown--;
        if (this.pokeCooldown > 0) this.pokeCooldown--;

        // === PUCK BLOCKING ===
        if (this.blocking) {
            this.blockTimer--;
            if (this.blockTimer <= 0) {
                this.blocking = false;
                this.blockCooldown = 120; // cooldown before can block again
            }
        } else if (this.blockCooldown <= 0 && Math.random() < this.blockChance) {
            this.blocking = true;
            this.blockTimer = this.blockDuration;
        }

        // === CHARGE/LUNGE ===
        if (this.charging) {
            this.x += this.chargeSpeed * this.chargeDirection;
            this.chargeTimer--;
            if (this.chargeTimer <= 0) {
                this.charging = false;
                this.chargeCooldown = 180; // 3 second cooldown
                this.speed = this.baseSpeed;
            }
        } else {
            // Check if player is nearby to trigger charge
            if (playerX !== undefined && this.chargeCooldown <= 0) {
                const dist = Math.abs(playerX - this.x);
                if (dist < 200 && dist > 30) {
                    const chargeChance = this.difficulty >= 2 ? 0.015 : 0.008;
                    if (Math.random() < chargeChance) {
                        this.charging = true;
                        this.chargeTimer = this.chargeDuration;
                        this.chargeDirection = playerX > this.x ? 1 : -1;
                    }
                }
            }

            // Normal patrol movement
            this.x += this.speed * this.direction;
        }

        // === POKE CHECK ===
        if (this.pokeChecking) {
            this.pokeTimer--;
            if (this.pokeTimer <= 0) {
                this.pokeChecking = false;
                this.pokeCooldown = 100;
            }
        } else if (this.pokeCooldown <= 0 && Math.random() < this.pokeChance) {
            this.pokeChecking = true;
            this.pokeTimer = this.pokeDuration;
        }

        // Reverse direction at patrol bounds
        if (this.x > this.startX + this.patrolRange) {
            this.direction = -1;
        } else if (this.x < this.startX - this.patrolRange) {
            this.direction = 1;
        }

        // Random direction change (difficulty behavior)
        if (Math.random() < (this.difficulty >= 2 ? 0.005 : 0.002)) {
            this.direction *= -1;
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

    freeze() {
        this.frozen = true;
        this.frozenTimer = this.frozenDuration;
        this.iceParticles = [];
        this.blocking = false;
        this.charging = false;
        this.pokeChecking = false;
    }

    kill() {
        this.dying = true;
        this.deathTimer = 0;
        this.deathY = 0;
    }

    // Returns true if this goalie blocks the shot
    canBlockShot() {
        return this.blocking && !this.frozen;
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

        // Frozen tint
        if (this.frozen) {
            ctx.globalAlpha = 0.85;
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

        // Frozen ice overlay color
        const jerseyColor = this.frozen ? '#4a9eff' : '#1a5e1a';
        const bodyColor = this.frozen ? '#6ab8ff' : '#2a2a2a';
        const padColor = this.frozen ? '#c8e8ff' : '#f5f5f5';
        const stripeColor = this.frozen ? '#3a7acc' : '#1a5e1a';

        // === GOALIE LEG PADS ===
        // Left pad
        ctx.fillStyle = padColor;
        this._roundRect(ctx, drawX + 4, drawY + 30 + sway + butterflyDrop, 16, 24 - butterflyDrop, 3);
        ctx.fill();
        ctx.fillStyle = stripeColor;
        ctx.fillRect(drawX + 6, drawY + 34 + sway + butterflyDrop, 12, 3);
        ctx.fillRect(drawX + 6, drawY + 42 + sway, 12, 3);
        ctx.fillStyle = this.frozen ? '#a0d0ff' : '#e0e0e0';
        this._roundRect(ctx, drawX + 5, drawY + 30 + sway + butterflyDrop, 14, 5, 2);
        ctx.fill();

        // Right pad
        ctx.fillStyle = padColor;
        this._roundRect(ctx, drawX + this.width - 20, drawY + 30 - sway + butterflyDrop, 16, 24 - butterflyDrop, 3);
        ctx.fill();
        ctx.fillStyle = stripeColor;
        ctx.fillRect(drawX + this.width - 18, drawY + 34 - sway + butterflyDrop, 12, 3);
        ctx.fillRect(drawX + this.width - 18, drawY + 42 - sway, 12, 3);
        ctx.fillStyle = this.frozen ? '#a0d0ff' : '#e0e0e0';
        this._roundRect(ctx, drawX + this.width - 19, drawY + 30 - sway + butterflyDrop, 14, 5, 2);
        ctx.fill();

        // === SKATES ===
        ctx.fillStyle = '#1a1a1a';
        this._roundRect(ctx, drawX + 2, drawY + this.height - 8, 18, 8, 2);
        ctx.fill();
        this._roundRect(ctx, drawX + this.width - 20, drawY + this.height - 8, 18, 8, 2);
        ctx.fill();
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(drawX, drawY + this.height - 2, 22, 2);
        ctx.fillRect(drawX + this.width - 22, drawY + this.height - 2, 22, 2);

        // === BODY / CHEST PROTECTOR ===
        ctx.fillStyle = bodyColor;
        this._roundRect(ctx, drawX + 3, drawY + 12, this.width - 6, 24, 5);
        ctx.fill();

        ctx.fillStyle = jerseyColor;
        this._roundRect(ctx, drawX + 5, drawY + 14, this.width - 10, 20, 4);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillRect(drawX + 5, drawY + 26, this.width - 10, 2);
        ctx.fillStyle = this.frozen ? '#88ccff' : '#ffd700';
        ctx.fillRect(drawX + 5, drawY + 28, this.width - 10, 2);

        ctx.fillStyle = bodyColor;
        this._roundRect(ctx, drawX, drawY + 12, this.width, 10, 5);
        ctx.fill();
        ctx.fillStyle = jerseyColor;
        this._roundRect(ctx, drawX + 2, drawY + 13, this.width - 4, 8, 4);
        ctx.fill();

        // === ARMS ===
        ctx.fillStyle = jerseyColor;
        this._roundRect(ctx, drawX - 6, drawY + 14, 12, 18, 3);
        ctx.fill();
        ctx.fillStyle = bodyColor;
        this._roundRect(ctx, drawX - 7, drawY + 18, 13, 6, 2);
        ctx.fill();

        ctx.fillStyle = jerseyColor;
        this._roundRect(ctx, drawX + this.width - 6, drawY + 14, 12, 18, 3);
        ctx.fill();
        ctx.fillStyle = bodyColor;
        this._roundRect(ctx, drawX + this.width - 6, drawY + 18, 13, 6, 2);
        ctx.fill();

        // === BLOCKER (right hand) ===
        // If blocking, raise the blocker up
        const blockerYOffset = this.blocking ? -10 : 0;
        ctx.fillStyle = this.blocking ? '#ffdd44' : (this.frozen ? '#c8e8ff' : '#f0f0f0');
        this._roundRect(ctx, drawX + this.width - 4, drawY + 28 + blockerYOffset, 14, 12, 3);
        ctx.fill();
        ctx.fillStyle = stripeColor;
        ctx.fillRect(drawX + this.width - 2, drawY + 30 + blockerYOffset, 10, 2);

        // Blocking indicator glow
        if (this.blocking) {
            ctx.save();
            ctx.shadowColor = '#ffdd44';
            ctx.shadowBlur = 12;
            ctx.fillStyle = 'rgba(255, 221, 68, 0.4)';
            this._roundRect(ctx, drawX + this.width - 6, drawY + 26 + blockerYOffset, 18, 16, 4);
            ctx.fill();
            ctx.restore();
        }

        // === CATCHING GLOVE (left hand) ===
        ctx.fillStyle = this.frozen ? '#c8e8ff' : '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(drawX - 2, drawY + 30, 10, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = stripeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(drawX - 2, drawY + 30, 6, 0.5, Math.PI + 0.5);
        ctx.stroke();
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
        ctx.fillStyle = this.frozen ? '#c8e8ff' : '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(gcx, headY + 7, 16, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = jerseyColor;
        ctx.beginPath();
        ctx.ellipse(gcx, headY + 3, 12, 6, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.2;
        for (let i = -8; i <= 8; i += 3) {
            ctx.beginPath();
            ctx.moveTo(gcx + i, headY + 1);
            ctx.lineTo(gcx + i, headY + 16);
            ctx.stroke();
        }
        for (let j = 3; j <= 15; j += 3) {
            ctx.beginPath();
            ctx.moveTo(gcx - 10, headY + j);
            ctx.lineTo(gcx + 10, headY + j);
            ctx.stroke();
        }

        // Eyes - frozen = blue, normal = red
        ctx.fillStyle = this.frozen ? '#4a9eff' : '#ff2200';
        ctx.beginPath();
        ctx.ellipse(gcx - 4, headY + 8, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(gcx + 4, headY + 8, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.frozen ? '#88ccff' : '#ff6644';
        ctx.beginPath();
        ctx.arc(gcx - 3.5, headY + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gcx + 4.5, headY + 7.5, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.frozen ? '#a0d0ff' : '#e0e0e0';
        ctx.beginPath();
        ctx.ellipse(gcx, headY + 16, 8, 4, 0, 0, Math.PI);
        ctx.fill();

        // === GOALIE STICK ===
        // Poke check extends the stick further
        const stickExtend = this.pokeChecking ? this.pokeExtend : 0;
        ctx.strokeStyle = '#6B3410';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width, drawY + 32);
        ctx.quadraticCurveTo(drawX + this.width + 4, drawY + 44, drawX + this.width + 6 + stickExtend, drawY + this.height - 2);
        ctx.stroke();

        ctx.fillStyle = padColor;
        this._roundRect(ctx, drawX + this.width + 2 + stickExtend, drawY + this.height - 14, 8, 14, 2);
        ctx.fill();
        ctx.fillStyle = stripeColor;
        ctx.fillRect(drawX + this.width + 3 + stickExtend, drawY + this.height - 10, 6, 3);

        ctx.fillStyle = padColor;
        ctx.fillRect(drawX + this.width + 2 + stickExtend, drawY + this.height - 4, 14, 4);

        // Poke check glow
        if (this.pokeChecking) {
            ctx.save();
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = 'rgba(255, 68, 68, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawX + this.width + 6, drawY + this.height - 6);
            ctx.lineTo(drawX + this.width + 6 + stickExtend + 14, drawY + this.height - 6);
            ctx.stroke();
            ctx.restore();
        }

        // === CHARGE INDICATOR ===
        if (this.charging) {
            ctx.save();
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(drawX + this.width / 2, drawY + this.height / 2, this.width / 2 + 5, this.height / 2 + 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // === FROZEN ICE OVERLAY ===
        if (this.frozen) {
            // Ice crystal overlay
            ctx.fillStyle = 'rgba(100, 180, 255, 0.25)';
            this._roundRect(ctx, drawX - 2, drawY - 2, this.width + 4, this.height + 4, 6);
            ctx.fill();

            ctx.strokeStyle = 'rgba(150, 220, 255, 0.6)';
            ctx.lineWidth = 2;
            this._roundRect(ctx, drawX - 2, drawY - 2, this.width + 4, this.height + 4, 6);
            ctx.stroke();

            // Draw ice particles
            for (const p of this.iceParticles) {
                const alpha = p.life / p.maxLife;
                ctx.globalAlpha = alpha * 0.7;
                ctx.fillStyle = '#c8e8ff';
                ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
            }
            ctx.globalAlpha = 1;

            // Frozen text
            ctx.fillStyle = '#4a9eff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❄ FROZEN ❄', drawX + this.width / 2, drawY - 8);
        }

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
        // Wider hitbox when poke checking
        const extra = this.pokeChecking ? this.pokeExtend : 0;
        return {
            x: this.x,
            y: this.y,
            width: this.width + extra,
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

        ctx.save();

        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(drawX + 8, drawY + 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

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

// Projectile - Water Bottle (from Hat Trick power-up)
class WaterBottle {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 12;
        this.speed = 10;
        this.direction = direction;
        this.alive = true;
        this.life = 100;
        this.trail = [];
    }

    update() {
        this.x += this.speed * this.direction;
        this.life--;

        // Water trail effect
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 12) this.trail.shift();
        for (const t of this.trail) {
            t.alpha -= 0.08;
        }

        if (this.life <= 0) {
            this.alive = false;
        }
    }

    draw(ctx, cameraX) {
        if (!this.alive) return;

        // Draw water trail
        for (const t of this.trail) {
            if (t.alpha > 0) {
                ctx.globalAlpha = t.alpha * 0.5;
                ctx.fillStyle = '#4a9eff';
                ctx.beginPath();
                ctx.ellipse(t.x - cameraX + 10, t.y + 6, 8, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                // Water droplets
                ctx.fillStyle = '#88ccff';
                ctx.beginPath();
                ctx.arc(t.x - cameraX + 6 + Math.random() * 8, t.y + 2 + Math.random() * 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        const drawX = this.x - cameraX;
        const drawY = this.y;

        ctx.save();

        // Glow
        ctx.shadowColor = '#4a9eff';
        ctx.shadowBlur = 12;

        // Water bottle body
        ctx.fillStyle = '#e8e8e8';
        this._roundRect(ctx, drawX + 2, drawY + 1, 14, 10, 3);
        ctx.fill();

        // Water inside
        ctx.fillStyle = 'rgba(74, 158, 255, 0.7)';
        this._roundRect(ctx, drawX + 3, drawY + 3, 12, 6, 2);
        ctx.fill();

        // Cap
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(drawX + (this.direction === 1 ? 16 : 0), drawY + 3, 4, 6);

        // Water spray coming out
        ctx.fillStyle = 'rgba(74, 158, 255, 0.6)';
        const sprayX = this.direction === 1 ? drawX + 20 : drawX - 8;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(sprayX + (this.direction * i * 4), drawY + 4 + Math.random() * 4, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
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

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
