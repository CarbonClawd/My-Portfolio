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

        // Shooting
        this.pucksCollected = 0;
        this.shots = 0; // each shot costs 5 pucks
        this.shootCooldown = 0;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.skating = false;
        this.armSwing = 0;
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

    update(keys, platforms) {
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

        // Jump
        if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && this.grounded) {
            const jumpMultiplier = this.superJump ? 1.7 : 1;
            this.velY = this.jumpForce * jumpMultiplier;
            this.grounded = false;
        }

        // Shoot cooldown
        if (this.shootCooldown > 0) this.shootCooldown--;

        // Water bottle cooldown
        if (this.waterBottleCooldown > 0) this.waterBottleCooldown--;

        // Gravity
        this.velY += this.gravity;

        // Move X
        this.x += this.velX;

        // Move Y
        this.y += this.velY;

        // Platform collision
        this.grounded = false;
        for (const plat of platforms) {
            if (this.velY >= 0 &&
                this.x + this.width > plat.x &&
                this.x < plat.x + plat.width &&
                this.y + this.height >= plat.y &&
                this.y + this.height <= plat.y + plat.height + this.velY + 2) {
                this.y = plat.y - this.height;
                this.velY = 0;
                this.grounded = true;
            }
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
            this.x = 50;
            this.y = 300;
            this.velX = 0;
            this.velY = 0;
        }
    }

    activateSuperJump() {
        this.superJump = true;
        this.superJumpTimer = this.superJumpDuration;
    }

    draw(ctx, cameraX) {
        // Blink when invincible
        if (this.invincible && Math.floor(this.blinkTimer / 4) % 2 === 0) return;

        const drawX = this.x - cameraX;
        const drawY = this.y;
        const cx = drawX + this.width / 2; // center x

        ctx.save();

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
