// Player - Will the Hockey Player
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 58;
        this.velX = 0;
        this.velY = 0;
        this.speed = 5;
        this.jumpForce = -13;
        this.gravity = 0.6;
        this.grounded = false;
        this.facing = 1; // 1 = right, -1 = left
        this.lives = 5;
        this.score = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;

        // Stanley Cup power-up
        this.superJump = false;
        this.superJumpTimer = 0;
        this.superJumpDuration = 600; // 10 seconds at 60fps

        // Hat Trick power-up (water bottle freeze)
        this.hatTrickActive = false;
        this.hatTrickTimer = 0;
        this.hatTrickDuration = 600; // 10 seconds at 60fps
        this.waterBottleCooldown = 0;

        // Breakaway power-up (invincibility)
        this.breakawayActive = false;
        this.breakawayTimer = 0;
        this.breakawayDuration = 300; // 5 seconds at 60fps

        // Double jump
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        // Dash
        this.dashing = false;
        this.dashTimer = 0;
        this.dashDuration = 12; // frames
        this.dashSpeed = 14;
        this.dashCooldown = 0;
        this.dashCooldownMax = 45;

        // Combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboDuration = 180; // 3 seconds to chain

        // Checkpoint
        this.checkpointX = 50;
        this.checkpointY = 400;

        // Shooting
        this.pucksCollected = 0;
        this.shots = 0; // each shot costs 5 pucks
        this.shootCooldown = 0;

        // Puck magnet
        this.puckMagnetActive = false;
        this.puckMagnetTimer = 0;
        this.puckMagnetDuration = 300; // 5 seconds

        // Slapshot (screen clear)
        this.slapshotReady = false;
        this.slapshotChargeCount = 0;
        this.slapshotChargeMax = 25; // collect 25 pucks to charge

        // Speed boost
        this.speedBoosted = false;
        this.speedBoostTimer = 0;
        this.baseSpeed = 5;

        // Skin
        this.skinIndex = 0;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.skating = false;
        this.armSwing = 0;

        // Ice spray particles
        this.iceSpray = [];

        // Dash afterimages
        this.afterimages = [];
    }

    collectPuck() {
        this.pucksCollected++;
        this.score += 10;
        // Every 5 pucks = 1 shot
        if (this.pucksCollected % 5 === 0) {
            this.shots++;
        }
    }

    canShoot() {
        return this.shots > 0 && this.shootCooldown <= 0;
    }

    shoot() {
        if (this.canShoot()) {
            this.shots--;
            this.shootCooldown = 20; // cooldown frames
            return true;
        }
        return false;
    }

    canSquirt() {
        return this.hatTrickActive && this.waterBottleCooldown <= 0;
    }

    squirt() {
        if (this.canSquirt()) {
            this.waterBottleCooldown = 30; // cooldown frames
            return true;
        }
        return false;
    }

    activateHatTrick() {
        this.hatTrickActive = true;
        this.hatTrickTimer = this.hatTrickDuration;
    }

    activateBreakaway() {
        this.breakawayActive = true;
        this.breakawayTimer = this.breakawayDuration;
    }

    addCombo(points) {
        this.comboCount++;
        this.comboTimer = this.comboDuration;
        const multiplier = Math.min(this.comboCount, 5);
        this.score += points * multiplier;
        return { count: this.comboCount, multiplier: multiplier };
    }

    startDash() {
        if (this.dashCooldown <= 0 && !this.dashing) {
            this.dashing = true;
            this.dashTimer = this.dashDuration;
            this.dashCooldown = this.dashCooldownMax;
            return true;
        }
        return false;
    }

    update(keys, platforms) {
        // Combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        // Dash cooldown
        if (this.dashCooldown > 0) this.dashCooldown--;

        // Dash movement override
        if (this.dashing) {
            this.dashTimer--;
            this.velX = this.dashSpeed * this.facing;
            this.skating = true;
            if (this.dashTimer <= 0) {
                this.dashing = false;
            }
        } else {
            // Horizontal movement
            this.skating = false;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
                this.velX = -this.speed;
                this.facing = -1;
                this.skating = true;
            } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
                this.velX = this.speed;
                this.facing = 1;
                this.skating = true;
            } else {
                this.velX *= 0.8; // friction on ice
                if (Math.abs(this.velX) < 0.5) this.velX = 0;
            }
        }

        // Jump (grounded) — handled via keysJustPressed in game.js now for double jump
        // Basic grounded jump still works here as fallback
        if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && this.grounded && !this._jumpHeld) {
            const jumpMultiplier = this.superJump ? 1.7 : 1;
            this.velY = this.jumpForce * jumpMultiplier;
            this.grounded = false;
            this.hasDoubleJumped = false;
            this._jumpHeld = true;
            this._justJumped = true;
        }
        if (!(keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '])) {
            this._jumpHeld = false;
        }

        // Shoot cooldown
        if (this.shootCooldown > 0) this.shootCooldown--;

        // Water bottle cooldown
        if (this.waterBottleCooldown > 0) this.waterBottleCooldown--;

        // Gravity
        if (!this.dashing) {
            this.velY += this.gravity;
        } else {
            this.velY += this.gravity * 0.3; // reduced gravity during dash
        }

        // Move X
        this.x += this.velX;

        // Move Y
        this.y += this.velY;

        // Platform collision
        this.grounded = false;
        for (const plat of platforms) {
            // Handle moving platforms
            const platX = plat.currentX !== undefined ? plat.currentX : plat.x;
            const platY = plat.currentY !== undefined ? plat.currentY : plat.y;
            const platW = plat.width;
            const platH = plat.height || 20;

            if (this.velY >= 0 &&
                this.x + this.width > platX &&
                this.x < platX + platW &&
                this.y + this.height >= platY &&
                this.y + this.height <= platY + platH + this.velY + 2) {

                // Crumbling platform check
                if (plat.type === 'crumble' && !plat.crumbling) {
                    plat.crumbling = true;
                    plat.crumbleTimer = plat.crumbleDuration || 45;
                }

                if (!plat.fallen) {
                    this.y = platY - this.height;
                    this.velY = 0;
                    this.grounded = true;

                    // Move with moving platform
                    if (plat.velX) this.x += plat.velX;
                }
            }
        }

        // Reset double jump when grounded
        if (this.grounded) {
            this.hasDoubleJumped = false;
        }

        // Don't go below world bottom (fallback)
        if (this.y > 1000) {
            this.loseLife();
        }

        // Keep player from going left of level start
        if (this.x < 0) this.x = 0;

        // Super jump timer
        if (this.superJump) {
            this.superJumpTimer--;
            if (this.superJumpTimer <= 0) {
                this.superJump = false;
            }
        }

        // Hat Trick timer
        if (this.hatTrickActive) {
            this.hatTrickTimer--;
            if (this.hatTrickTimer <= 0) {
                this.hatTrickActive = false;
            }
        }

        // Breakaway timer
        if (this.breakawayActive) {
            this.breakawayTimer--;
            if (this.breakawayTimer <= 0) {
                this.breakawayActive = false;
            }
        }

        // Invincibility timer (after getting hit)
        if (this.invincible) {
            this.invincibleTimer--;
            this.blinkTimer++;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.blinkTimer = 0;
            }
        }

        // Animation
        if (this.skating) {
            this.animTimer++;
            if (this.animTimer > 5) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 6;
            }
            this.armSwing = Math.sin(this.animFrame * Math.PI / 3) * 5;
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
            this.armSwing = 0;
        }
    }

    loseLife() {
        if (!this.invincible && !this.breakawayActive) {
            this.lives--;
            this.invincible = true;
            this.invincibleTimer = 120; // 2 seconds
            this.x = this.checkpointX;
            this.y = this.checkpointY;
            this.velX = 0;
            this.velY = 0;
            this.dashing = false;
            this.dashTimer = 0;
            this.comboCount = 0;
            this.comboTimer = 0;
        }
    }

    setCheckpoint(x, y) {
        this.checkpointX = x;
        this.checkpointY = y;
    }

    activateSuperJump() {
        this.superJump = true;
        this.superJumpTimer = this.superJumpDuration;
    }

    draw(ctx, cameraX) {
        // Draw afterimages first (behind player)
        for (let i = this.afterimages.length - 1; i >= 0; i--) {
            const ai = this.afterimages[i];
            ai.life--;
            if (ai.life <= 0) {
                this.afterimages.splice(i, 1);
                continue;
            }
            const alpha = ai.life / ai.maxLife * 0.4;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.breakawayActive ? '#44ff88' : (this.superJump ? '#ffd700' : '#c8102e');
            ctx.fillRect(ai.x - cameraX + 4, ai.y + 16, this.width - 8, 22);
            ctx.beginPath();
            ctx.ellipse(ai.x - cameraX + this.width / 2, ai.y + 10, 14, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw ice spray particles
        for (let i = this.iceSpray.length - 1; i >= 0; i--) {
            const p = this.iceSpray[i];
            p.x += p.velX;
            p.y += p.velY;
            p.life--;
            if (p.life <= 0) {
                this.iceSpray.splice(i, 1);
                continue;
            }
            const alpha = p.life / p.maxLife * 0.6;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
            ctx.restore();
        }

        // Spawn ice spray when skating on ground
        if (this.skating && this.grounded && Math.abs(this.velX) > 2) {
            for (let i = 0; i < 2; i++) {
                this.iceSpray.push({
                    x: this.x + this.width / 2 - this.facing * 10 + Math.random() * 10,
                    y: this.y + this.height - 4 + Math.random() * 4,
                    velX: -this.facing * (1 + Math.random() * 2),
                    velY: -(0.5 + Math.random() * 1.5),
                    life: 10 + Math.random() * 10,
                    maxLife: 20,
                    size: 1 + Math.random() * 2,
                    color: Math.random() > 0.5 ? '#c8e8ff' : '#ffffff'
                });
            }
        }

        // Spawn afterimages when dashing
        if (this.dashing && this.dashTimer % 3 === 0) {
            this.afterimages.push({
                x: this.x, y: this.y,
                life: 12, maxLife: 12
            });
        }

        // Blink when invincible
        if (this.invincible && Math.floor(this.blinkTimer / 4) % 2 === 0) return;

        const drawX = this.x - cameraX;
        const drawY = this.y;
        const cx = drawX + this.width / 2; // center x

        ctx.save();

        // Player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        const shadowScale = Math.min(1, (520 - this.y) / 200);
        if (shadowScale > 0) {
            ctx.beginPath();
            ctx.ellipse(drawX + this.width / 2, 518, 16 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Speed boost visual
        if (this.speedBoosted) {
            ctx.strokeStyle = 'rgba(0, 255, 200, 0.4)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const lineX = drawX - this.facing * (8 + i * 6);
                ctx.beginPath();
                ctx.moveTo(lineX, drawY + 15 + i * 12);
                ctx.lineTo(lineX - this.facing * 12, drawY + 15 + i * 12);
                ctx.stroke();
            }
        }

        // Puck magnet visual
        if (this.puckMagnetActive) {
            const magnetPulse = Math.sin(Date.now() * 0.01) * 10;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + this.height / 2, 40 + magnetPulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + this.height / 2, 60 + magnetPulse, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Glow effect when super jump is active
        if (this.superJump) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 25;
        }

        // Glow effect when hat trick is active
        if (this.hatTrickActive) {
            ctx.shadowColor = '#4a9eff';
            ctx.shadowBlur = 20;
        }

        // Glow effect when breakaway is active
        if (this.breakawayActive) {
            ctx.shadowColor = '#44ff88';
            ctx.shadowBlur = 30;
        }

        // Flip for facing direction
        if (this.facing === -1) {
            ctx.translate(cx, 0);
            ctx.scale(-1, 1);
            ctx.translate(-cx, 0);
        }

        const legOffset = this.skating ? Math.sin(this.animFrame * Math.PI / 3) * 5 : 0;
        const jerseyColor = this.breakawayActive ? '#44ff88' : (this.superJump ? '#ffd700' : (this.hatTrickActive ? '#4a9eff' : '#c8102e'));
        const jerseyDark = this.breakawayActive ? '#22cc55' : (this.superJump ? '#c9a800' : (this.hatTrickActive ? '#2a6ecc' : '#9a0c24'));
        const pantsColor = '#1a3a6e';

        // === SKATES ===
        // Left skate
        ctx.fillStyle = '#1a1a1a';
        this._roundRect(ctx, drawX + 5, drawY + this.height - 8 + legOffset, 14, 8, 2);
        ctx.fill();
        // Left blade
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(drawX + 3, drawY + this.height - 1 + legOffset, 18, 2);
        // Blade curve
        ctx.beginPath();
        ctx.arc(drawX + 3, drawY + this.height - 1 + legOffset, 2, 0, Math.PI, true);
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();

        // Right skate
        ctx.fillStyle = '#1a1a1a';
        this._roundRect(ctx, drawX + this.width - 19, drawY + this.height - 8 - legOffset, 14, 8, 2);
        ctx.fill();
        // Right blade
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(drawX + this.width - 21, drawY + this.height - 1 - legOffset, 18, 2);
        ctx.beginPath();
        ctx.arc(drawX + this.width - 21, drawY + this.height - 1 - legOffset, 2, 0, Math.PI, true);
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();

        // === LEGS / HOCKEY PANTS ===
        // Left leg
        ctx.fillStyle = pantsColor;
        this._roundRect(ctx, drawX + 6, drawY + 34 + legOffset, 12, 18, 3);
        ctx.fill();
        // Shin guard
        ctx.fillStyle = '#e8e8e8';
        this._roundRect(ctx, drawX + 7, drawY + 42 + legOffset, 10, 10, 2);
        ctx.fill();

        // Right leg
        ctx.fillStyle = pantsColor;
        this._roundRect(ctx, drawX + this.width - 18, drawY + 34 - legOffset, 12, 18, 3);
        ctx.fill();
        // Shin guard
        ctx.fillStyle = '#e8e8e8';
        this._roundRect(ctx, drawX + this.width - 17, drawY + 42 - legOffset, 10, 10, 2);
        ctx.fill();

        // === BODY / JERSEY ===
        // Torso base
        ctx.fillStyle = jerseyColor;
        this._roundRect(ctx, drawX + 4, drawY + 16, this.width - 8, 22, 4);
        ctx.fill();

        // Jersey stripe (white band)
        ctx.fillStyle = '#fff';
        ctx.fillRect(drawX + 4, drawY + 30, this.width - 8, 3);
        ctx.fillStyle = jerseyDark;
        ctx.fillRect(drawX + 4, drawY + 33, this.width - 8, 2);

        // Shoulder pads (slight bump)
        ctx.fillStyle = jerseyColor;
        this._roundRect(ctx, drawX + 1, drawY + 15, this.width - 2, 8, 4);
        ctx.fill();
        // Shoulder stripe
        ctx.fillStyle = '#fff';
        ctx.fillRect(drawX + 2, drawY + 15, this.width - 4, 2);

        // Jersey number on back
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('97', cx, drawY + 28);

        // Name plate
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '6px Arial';
        ctx.fillText('WILL', cx, drawY + 20);

        // === ARMS ===
        // Left arm
        ctx.fillStyle = jerseyColor;
        ctx.save();
        ctx.translate(drawX + 2, drawY + 18);
        ctx.rotate((-this.armSwing * 0.03));
        this._roundRect(ctx, -4, 0, 10, 16, 3);
        ctx.fill();
        // Elbow pad
        ctx.fillStyle = jerseyDark;
        ctx.fillRect(-3, 10, 8, 4);
        // Glove
        ctx.fillStyle = pantsColor;
        this._roundRect(ctx, -4, 14, 10, 7, 3);
        ctx.fill();
        ctx.restore();

        // Right arm
        ctx.fillStyle = jerseyColor;
        ctx.save();
        ctx.translate(drawX + this.width - 8, drawY + 18);
        ctx.rotate((this.armSwing * 0.03));
        this._roundRect(ctx, -4, 0, 10, 16, 3);
        ctx.fill();
        // Elbow pad
        ctx.fillStyle = jerseyDark;
        ctx.fillRect(-3, 10, 8, 4);
        // Glove
        ctx.fillStyle = pantsColor;
        this._roundRect(ctx, -4, 14, 10, 7, 3);
        ctx.fill();
        ctx.restore();

        // === HOCKEY STICK ===
        ctx.strokeStyle = '#6B3410';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width - 4, drawY + 32);
        ctx.quadraticCurveTo(drawX + this.width + 6, drawY + 40, drawX + this.width + 12, drawY + 48);
        ctx.stroke();
        // Stick shaft tape
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width + 8, drawY + 44);
        ctx.lineTo(drawX + this.width + 12, drawY + 48);
        ctx.stroke();
        // Blade
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(drawX + this.width + 12, drawY + 47);
        ctx.lineTo(drawX + this.width + 22, drawY + 47);
        ctx.lineTo(drawX + this.width + 22, drawY + 50);
        ctx.lineTo(drawX + this.width + 11, drawY + 50);
        ctx.closePath();
        ctx.fill();

        // === HELMET ===
        const headY = drawY + 4;
        // Helmet shell
        ctx.fillStyle = jerseyColor;
        ctx.beginPath();
        ctx.ellipse(cx, headY + 6, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Helmet top ridge
        ctx.strokeStyle = jerseyDark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, headY + 4, 12, Math.PI + 0.3, -0.3);
        ctx.stroke();

        // Cage / Visor
        ctx.fillStyle = 'rgba(140, 200, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx + 5, headY + 8, 9, 7, 0, -0.5, Math.PI * 0.7);
        ctx.fill();
        // Cage bars
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.7)';
        ctx.lineWidth = 0.8;
        for (let i = -3; i <= 5; i += 2.5) {
            ctx.beginPath();
            ctx.moveTo(cx + i, headY + 2);
            ctx.lineTo(cx + i + 3, headY + 14);
            ctx.stroke();
        }

        // === FACE ===
        ctx.fillStyle = '#f0bb94';
        ctx.beginPath();
        ctx.ellipse(cx + 2, headY + 8, 6, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chin
        ctx.fillStyle = '#e8a87c';
        ctx.beginPath();
        ctx.ellipse(cx + 2, headY + 12, 4, 3, 0, 0, Math.PI);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(cx + 5, headY + 7, 3, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = '#2a4a2a';
        ctx.beginPath();
        ctx.arc(cx + 5.5, headY + 7, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlight
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + 6, headY + 6.5, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrow
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 2.5, headY + 4.5);
        ctx.lineTo(cx + 7.5, headY + 4);
        ctx.stroke();

        // Mouth
        ctx.strokeStyle = '#8a5a4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + 3, headY + 11, 2, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Ear
        ctx.fillStyle = '#e8a87c';
        ctx.beginPath();
        ctx.ellipse(cx - 8, headY + 8, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

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
