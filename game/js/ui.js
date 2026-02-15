// UI - Score, Lives, Power-up Timer, Screens
class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.pucksCollected = 0;
        this.totalPucks = 0;
    }

    drawHUD(ctx, player) {
        ctx.save();

        // HUD Background bar
        ctx.fillStyle = 'rgba(0, 10, 40, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 50);
        ctx.fillStyle = '#0033a0';
        ctx.fillRect(0, 48, this.canvas.width, 3);

        // Score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🏒 Score: ' + player.score, 20, 33);

        // Lives - draw as hockey sticks
        ctx.fillText('❤️ Lives: ', 220, 33);
        for (let i = 0; i < player.lives; i++) {
            ctx.fillStyle = '#c8102e';
            ctx.fillRect(320 + i * 25, 18, 4, 20);
            ctx.fillRect(320 + i * 25, 36, 10, 4);
        }

        // Pucks collected
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Pucks: ' + this.pucksCollected + '/' + this.totalPucks, this.canvas.width / 2, 33);

        // Super Jump indicator
        if (player.superJump) {
            const timeLeft = Math.ceil(player.superJumpTimer / 60);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🏆 SUPER JUMP! ' + timeLeft + 's', this.canvas.width - 20, 33);

            // Pulsing glow bar
            const progress = player.superJumpTimer / player.superJumpDuration;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.fillRect(this.canvas.width - 200, 40, 180 * progress, 6);
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
        ctx.fillText("WILL'S", w / 2, h / 2 - 100);

        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('STANLEY CUP RUN', w / 2, h / 2 - 50);

        ctx.restore();

        // Hockey player icon
        ctx.fillStyle = '#c8102e';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏒', w / 2, h / 2 + 20);

        // Instructions
        ctx.fillStyle = '#aac8ff';
        ctx.font = '18px Arial';
        ctx.fillText('Arrow Keys / WASD to move  |  Space / Up to jump', w / 2, h / 2 + 70);

        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        ctx.fillText('Collect pucks for points  •  Grab the Stanley Cup for SUPER JUMP  •  Avoid the goalies!', w / 2, h / 2 + 100);

        // Start prompt
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Start', w / 2, h / 2 + 160);
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
}
