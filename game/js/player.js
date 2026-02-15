// Player - Will the Hockey Player
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 52;
        this.velX = 0;
        this.velY = 0;
        this.speed = 5;
        this.jumpForce = -13;
        this.gravity = 0.6;
        this.grounded = false;
        this.facing = 1; // 1 = right, -1 = left
        this.lives = 3;
        this.score = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;

        // Stanley Cup power-up
        this.superJump = false;
        this.superJumpTimer = 0;
        this.superJumpDuration = 600; // 10 seconds at 60fps

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.skating = false;
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
            if (this.animTimer > 6) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }
    }

    loseLife() {
        if (!this.invincible) {
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

        ctx.save();

        // Glow effect when super jump is active
        if (this.superJump) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20;
        }

        // Flip for facing direction
        if (this.facing === -1) {
            ctx.translate(drawX + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(drawX + this.width / 2), 0);
        }

        // === Draw Will the Hockey Player ===

        // Skates
        const legOffset = this.skating ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
        ctx.fillStyle = '#222';
        ctx.fillRect(drawX + 4, drawY + this.height - 6 + legOffset, 12, 6);
        ctx.fillRect(drawX + this.width - 16, drawY + this.height - 6 - legOffset, 12, 6);
        // Skate blades
        ctx.fillStyle = '#ccc';
        ctx.fillRect(drawX + 2, drawY + this.height - 2 + legOffset, 16, 2);
        ctx.fillRect(drawX + this.width - 18, drawY + this.height - 2 - legOffset, 16, 2);

        // Legs (pants)
        ctx.fillStyle = '#1a3a6e';
        ctx.fillRect(drawX + 6, drawY + 30 + legOffset, 10, 16);
        ctx.fillRect(drawX + this.width - 16, drawY + 30 - legOffset, 10, 16);

        // Body (jersey)
        const jerseyColor = this.superJump ? '#ffd700' : '#c8102e'; // Red jersey, gold when powered up
        ctx.fillStyle = jerseyColor;
        ctx.fillRect(drawX + 4, drawY + 14, this.width - 8, 20);

        // Jersey number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('97', drawX + this.width / 2, drawY + 29);

        // Arms
        ctx.fillStyle = jerseyColor;
        ctx.fillRect(drawX - 2, drawY + 16, 8, 14);
        ctx.fillRect(drawX + this.width - 6, drawY + 16, 8, 14);

        // Gloves
        ctx.fillStyle = '#1a3a6e';
        ctx.fillRect(drawX - 2, drawY + 28, 8, 6);
        ctx.fillRect(drawX + this.width - 6, drawY + 28, 8, 6);

        // Hockey stick
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width - 2, drawY + 30);
        ctx.lineTo(drawX + this.width + 10, drawY + 44);
        ctx.lineTo(drawX + this.width + 18, drawY + 44);
        ctx.stroke();
        // Stick blade
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width + 10, drawY + 44);
        ctx.lineTo(drawX + this.width + 18, drawY + 44);
        ctx.stroke();

        // Helmet
        ctx.fillStyle = '#c8102e';
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + 8, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Visor
        ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2 + 4, drawY + 10, 8, 5, 0, -0.3, Math.PI * 0.6);
        ctx.fill();

        // Face
        ctx.fillStyle = '#f5c6a0';
        ctx.fillRect(drawX + this.width / 2 - 2, drawY + 8, 8, 8);

        // Eye
        ctx.fillStyle = '#222';
        ctx.fillRect(drawX + this.width / 2 + 3, drawY + 9, 2, 2);

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
