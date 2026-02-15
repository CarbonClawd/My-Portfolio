// UI - Score, Lives, Power-up Timer, Screens, Flash Messages
class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.pucksCollected = 0;
        this.totalPucks = 0;

        // Flash message system
        this.flashMessage = '';
        this.flashTimer = 0;
        this.flashDuration = 0;
        this.flashColor = '#ffd700';
        this.flashGlow = '#ffd700';
    }

    showFlash(message, duration, color, glow) {
        this.flashMessage = message;
        this.flashTimer = duration || 180; // 3 seconds default
        this.flashDuration = this.flashTimer;
        this.flashColor = color || '#ffd700';
        this.flashGlow = glow || '#ffd700';
    }

    updateFlash() {
        if (this.flashTimer > 0) {
            this.flashTimer--;
        }
    }

    drawFlash(ctx) {
        if (this.flashTimer <= 0) return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const progress = this.flashTimer / this.flashDuration;

        // Gold screen flash (fades quickly)
        if (progress > 0.85) {
            const flashAlpha = (progress - 0.85) / 0.15 * 0.4;
            ctx.fillStyle = `rgba(255, 215, 0, ${flashAlpha})`;
            ctx.fillRect(0, 0, w, h);
        }

        // Message
        ctx.save();

        // Scale animation - starts big, settles, then fades
        let scale = 1;
        let alpha = 1;
        if (progress > 0.8) {
            scale = 1 + (progress - 0.8) * 5; // zoom in
            alpha = Math.min(1, (1 - progress) / 0.1 + 0.5);
        } else if (progress < 0.3) {
            alpha = progress / 0.3; // fade out
        }

        ctx.globalAlpha = alpha;
        ctx.translate(w / 2, h / 2 - 40);
        ctx.scale(scale, scale);

        // Glow
        ctx.shadowColor = this.flashGlow;
        ctx.shadowBlur = 40 + Math.sin(this.flashTimer * 0.15) * 15;

        // Background banner
        const textWidth = ctx.measureText(this.flashMessage).width || 400;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this._roundRect(ctx, -220, -35, 440, 70, 15);
        ctx.fill();

        // Border
        ctx.strokeStyle = this.flashColor;
        ctx.lineWidth = 3;
        this._roundRect(ctx, -220, -35, 440, 70, 15);
        ctx.stroke();

        // Text
        ctx.fillStyle = this.flashColor;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.flashMessage, 0, 0);

        ctx.restore();
    }

    drawHUD(ctx, player) {
        ctx.save();

        // HUD Background bar
        ctx.fillStyle = 'rgba(0, 10, 40, 0.75)';
        ctx.fillRect(0, 0, this.canvas.width, 55);
        ctx.fillStyle = '#0033a0';
        ctx.fillRect(0, 53, this.canvas.width, 3);

        // Score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + player.score, 15, 22);

        // Lives as hearts
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('Lives:', 15, 44);
        for (let i = 0; i < player.lives; i++) {
            ctx.fillStyle = '#c8102e';
            ctx.font = '16px Arial';
            ctx.fillText('❤️', 60 + i * 22, 45);
        }

        // Pucks collected
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pucks: ' + this.pucksCollected + '/' + this.totalPucks, this.canvas.width / 2 - 60, 22);

        // === SHOTS AMMO DISPLAY ===
        ctx.textAlign = 'center';
        const ammoX = this.canvas.width / 2 + 80;

        // Ammo background
        ctx.fillStyle = player.shots > 0 ? 'rgba(255, 100, 0, 0.3)' : 'rgba(100, 100, 100, 0.2)';
        this._roundRect(ctx, ammoX - 55, 5, 110, 20, 5);
        ctx.fill();

        ctx.fillStyle = player.shots > 0 ? '#ff8800' : '#666';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🏒 Shots: ' + player.shots, ammoX, 19);

        // Puck progress to next shot (mini bar)
        const pucksToNext = player.pucksCollected % 5;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(ammoX - 50, 28, 100, 6);
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(ammoX - 50, 28, (pucksToNext / 5) * 100, 6);
        ctx.fillStyle = '#aaa';
        ctx.font = '9px Arial';
        ctx.fillText(pucksToNext + '/5 to next shot', ammoX, 44);

        // Shoot key hint
        if (player.shots > 0) {
            ctx.fillStyle = 'rgba(255, 136, 0, 0.8)';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[X] to shoot', ammoX, 53);
        }

        // Super Jump indicator
        if (player.superJump) {
            const timeLeft = Math.ceil(player.superJumpTimer / 60);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🏆 SUPER JUMP! ' + timeLeft + 's', this.canvas.width - 15, 22);

            // Pulsing glow bar
            const progress = player.superJumpTimer / player.superJumpDuration;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(this.canvas.width - 185, 28, 170, 8);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.fillRect(this.canvas.width - 185, 28, 170 * progress, 8);
        }

        ctx.restore();
    }

    drawStartScreen(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 5, 20, 0.92)';
        ctx.fillRect(0, 0, w, h);

        // Rink lines decoration
        ctx.strokeStyle = 'rgba(0, 51, 160, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
        ctx.stroke();

        // Red center line
        ctx.strokeStyle = 'rgba(200, 16, 46, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Blue lines
        ctx.strokeStyle = 'rgba(0, 51, 160, 0.2)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(w * 0.3, 0);
        ctx.lineTo(w * 0.3, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.7, 0);
        ctx.lineTo(w * 0.7, h);
        ctx.stroke();

        ctx.save();

        // Title glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("WILL'S", w / 2, h / 2 - 110);

        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('STANLEY CUP RUN', w / 2, h / 2 - 60);

        ctx.restore();

        // Hockey player icon
        ctx.fillStyle = '#c8102e';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏒', w / 2, h / 2 + 10);

        // Instructions
        ctx.fillStyle = '#aac8ff';
        ctx.font = '16px Arial';
        ctx.fillText('Arrow Keys / WASD to move  |  Space / Up to jump  |  X to shoot', w / 2, h / 2 + 55);

        ctx.fillStyle = '#888';
        ctx.font = '13px Arial';
        ctx.fillText('Collect 5 pucks = 1 shot  •  Shoot pucks at goalies to eliminate them!', w / 2, h / 2 + 80);
        ctx.fillText('Grab the Stanley Cup for SUPER JUMP  •  Reach the goal to win!', w / 2, h / 2 + 100);

        // Start prompt
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Start', w / 2, h / 2 + 155);
        }

        // Credits
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.fillText("A hockey platformer adventure", w / 2, h - 30);
    }

    drawGameOver(ctx, player) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#c8102e';
        ctx.shadowBlur = 20;

        // Game Over text
        ctx.fillStyle = '#c8102e';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

        ctx.restore();

        // Final score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Final Score: ' + player.score, w / 2, h / 2);

        // Pucks collected
        ctx.fillStyle = '#aaa';
        ctx.font = '20px Arial';
        ctx.fillText('Pucks Collected: ' + this.pucksCollected + ' / ' + this.totalPucks, w / 2, h / 2 + 40);

        // Restart prompt
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px Arial';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Play Again', w / 2, h / 2 + 100);
        }
    }

    drawWinScreen(ctx, player) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dark overlay with gold tint
        ctx.fillStyle = 'rgba(20, 15, 0, 0.88)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;

        // Win text
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 YOU WIN! 🏆', w / 2, h / 2 - 70);

        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Will wins the Stanley Cup!', w / 2, h / 2 - 20);

        // Final score
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Final Score: ' + player.score, w / 2, h / 2 + 30);

        ctx.fillStyle = '#aaa';
        ctx.font = '18px Arial';
        ctx.fillText('Pucks: ' + this.pucksCollected + ' / ' + this.totalPucks, w / 2, h / 2 + 60);

        // Restart
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Play Again', w / 2, h / 2 + 120);
        }
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
}
