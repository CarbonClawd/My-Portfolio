// UI - Score, Lives, Power-up Timer, Screens, Flash Messages, Leaderboard
class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.pucksCollected = 0;
        this.totalPucks = 0;
        this.currentLevel = 1;

        // Flash message system
        this.flashMessage = '';
        this.flashTimer = 0;
        this.flashDuration = 0;
        this.flashColor = '#ffd700';
        this.flashGlow = '#ffd700';
    }

    showFlash(message, duration, color, glow) {
        this.flashMessage = message;
        this.flashTimer = duration || 180;
        this.flashDuration = this.flashTimer;
        this.flashColor = color || '#ffd700';
        this.flashGlow = glow || '#ffd700';
    }

    updateFlash() {
        if (this.flashTimer > 0) this.flashTimer--;
    }

    drawFlash(ctx) {
        if (this.flashTimer <= 0) return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const progress = this.flashTimer / this.flashDuration;

        if (progress > 0.85) {
            const flashAlpha = (progress - 0.85) / 0.15 * 0.4;
            ctx.fillStyle = `rgba(255, 215, 0, ${flashAlpha})`;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.save();
        let scale = 1;
        let alpha = 1;
        if (progress > 0.8) {
            scale = 1 + (progress - 0.8) * 5;
            alpha = Math.min(1, (1 - progress) / 0.1 + 0.5);
        } else if (progress < 0.3) {
            alpha = progress / 0.3;
        }

        ctx.globalAlpha = alpha;
        ctx.translate(w / 2, h / 2 - 40);
        ctx.scale(scale, scale);

        ctx.shadowColor = this.flashGlow;
        ctx.shadowBlur = 40 + Math.sin(this.flashTimer * 0.15) * 15;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this._roundRect(ctx, -220, -35, 440, 70, 15);
        ctx.fill();

        ctx.strokeStyle = this.flashColor;
        ctx.lineWidth = 3;
        this._roundRect(ctx, -220, -35, 440, 70, 15);
        ctx.stroke();

        ctx.fillStyle = this.flashColor;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.flashMessage, 0, 0);

        ctx.restore();
    }

    drawHUD(ctx, player, gameTimer) {
        ctx.save();

        // HUD Background bar
        ctx.fillStyle = 'rgba(0, 10, 40, 0.75)';
        ctx.fillRect(0, 0, this.canvas.width, 55);
        ctx.fillStyle = this.currentLevel === 2 ? '#8B4513' : '#0033a0';
        ctx.fillRect(0, 53, this.canvas.width, 3);

        // Level indicator
        ctx.fillStyle = this.currentLevel === 2 ? '#ff8844' : '#4a9eff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('LEVEL ' + this.currentLevel, this.canvas.width - 15, 48);

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

        // Timer - color coded for urgency
        const timeSeconds = gameTimer / 60;
        let timerColor = '#44ff44'; // green = fast
        if (timeSeconds > 300) timerColor = '#ff4444'; // red = slow
        else if (timeSeconds > 210) timerColor = '#ff8844'; // orange
        else if (timeSeconds > 150) timerColor = '#ffdd44'; // yellow
        else if (timeSeconds > 90) timerColor = '#aaffaa'; // light green
        ctx.fillStyle = timerColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('⏱ ' + Leaderboard.formatTime(timeSeconds), 140, 22);

        // Pucks collected
        ctx.fillStyle = '#ccc';
        ctx.font = '15px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pucks: ' + this.pucksCollected + '/' + this.totalPucks, this.canvas.width / 2 - 60, 22);

        // === SHOTS AMMO DISPLAY ===
        ctx.textAlign = 'center';
        const ammoX = this.canvas.width / 2 + 80;

        ctx.fillStyle = player.shots > 0 ? 'rgba(255, 100, 0, 0.3)' : 'rgba(100, 100, 100, 0.2)';
        this._roundRect(ctx, ammoX - 55, 5, 110, 20, 5);
        ctx.fill();

        ctx.fillStyle = player.shots > 0 ? '#ff8800' : '#666';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🏒 Shots: ' + player.shots, ammoX, 19);

        const pucksToNext = player.pucksCollected % 5;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(ammoX - 50, 28, 100, 6);
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(ammoX - 50, 28, (pucksToNext / 5) * 100, 6);
        ctx.fillStyle = '#aaa';
        ctx.font = '9px Arial';
        ctx.fillText(pucksToNext + '/5 to next shot', ammoX, 44);

        if (player.shots > 0) {
            ctx.fillStyle = 'rgba(255, 136, 0, 0.8)';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('[X] to shoot', ammoX, 53);
        }

        // Super Jump indicator (Level 1)
        if (player.superJump) {
            const timeLeft = Math.ceil(player.superJumpTimer / 60);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🏆 SUPER JUMP! ' + timeLeft + 's', this.canvas.width - 15, 22);

            const progress = player.superJumpTimer / player.superJumpDuration;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(this.canvas.width - 185, 28, 170, 8);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.fillRect(this.canvas.width - 185, 28, 170 * progress, 8);
        }

        // Hat Trick indicator (Level 2)
        if (player.hatTrickActive) {
            const timeLeft = Math.ceil(player.hatTrickTimer / 60);
            ctx.fillStyle = '#4a9eff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🎩 HAT TRICK! ' + timeLeft + 's', this.canvas.width - 15, 22);

            const progress = player.hatTrickTimer / player.hatTrickDuration;
            ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
            ctx.fillRect(this.canvas.width - 185, 28, 170, 8);
            ctx.fillStyle = 'rgba(74, 158, 255, 0.7)';
            ctx.fillRect(this.canvas.width - 185, 28, 170 * progress, 8);

            // Squirt hint
            ctx.fillStyle = 'rgba(74, 158, 255, 0.8)';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('[Z] squirt water bottle', this.canvas.width - 15, 48);
        }

        ctx.restore();
    }

    drawStartScreen(ctx, leaderboard) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 5, 20, 0.92)';
        ctx.fillRect(0, 0, w, h);

        // Rink decorations
        ctx.strokeStyle = 'rgba(0, 51, 160, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(200, 16, 46, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

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
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("WILL'S", w / 2, h / 2 - 120);

        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('STANLEY CUP RUN', w / 2, h / 2 - 70);
        ctx.restore();

        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏒', w / 2, h / 2 - 5);

        ctx.fillStyle = '#aac8ff';
        ctx.font = '15px Arial';
        ctx.fillText('Arrow Keys / WASD to move  |  Space / Up to jump  |  X to shoot', w / 2, h / 2 + 40);

        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText('Collect 5 pucks = 1 shot  •  Shoot pucks at goalies to eliminate them!', w / 2, h / 2 + 62);
        ctx.fillText('Level 1: Stanley Cup = SUPER JUMP  •  Level 2: Hat Trick = FREEZE GOALIES', w / 2, h / 2 + 80);
        ctx.fillStyle = '#44ff44';
        ctx.fillText('⚡ Finish fast for a SPEED MULTIPLIER on your bonus score!', w / 2, h / 2 + 96);

        // Show top score if exists
        const entries = leaderboard ? leaderboard.getEntries() : [];
        if (entries.length > 0) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('🏆 Top Score: ' + entries[0].name + ' — ' + entries[0].score + ' pts (' + Leaderboard.formatTime(entries[0].time) + ')', w / 2, h / 2 + 108);
        }

        // Start prompt
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Start', w / 2, h / 2 + 148);
        }

        // Leaderboard hint
        ctx.fillStyle = '#6a8abf';
        ctx.font = '16px Arial';
        ctx.fillText('Press L for Leaderboard', w / 2, h / 2 + 178);

        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Developed by Will and Dan DeYoung", w / 2, h - 18);
        ctx.restore();
    }

    drawLevelTransition(ctx, targetLevel) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = targetLevel === 2 ? '#ff8844' : '#ffd700';
        ctx.shadowBlur = 30;

        ctx.fillStyle = targetLevel === 2 ? '#ff8844' : '#ffd700';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL ' + targetLevel, w / 2, h / 2 - 30);

        ctx.fillStyle = '#fff';
        ctx.font = '22px Arial';
        if (targetLevel === 2) {
            ctx.fillText('The Playoffs Begin! Goalies are tougher!', w / 2, h / 2 + 20);
            ctx.fillStyle = '#4a9eff';
            ctx.font = '18px Arial';
            ctx.fillText('🎩 Grab Hat Tricks to freeze goalies with water bottles!', w / 2, h / 2 + 55);
        } else {
            ctx.fillText('Get ready!', w / 2, h / 2 + 20);
        }

        ctx.restore();

        // Show Level 1 time multiplier breakdown
        if (this.level1Multiplier && this.level1Multiplier > 0) {
            const multColor = this.level1Multiplier >= 3 ? '#44ff44' : this.level1Multiplier >= 2 ? '#ffdd44' : '#aaa';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this._roundRect(ctx, w / 2 - 200, h / 2 + 65, 400, 80, 8);
            ctx.fill();

            ctx.fillStyle = '#aac8ff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Level 1 Time: ' + Leaderboard.formatTime(this.level1Time), w / 2, h / 2 + 82);

            ctx.fillStyle = multColor;
            ctx.font = 'bold 20px Arial';
            ctx.fillText(this.level1Multiplier + 'x MULTIPLIER', w / 2, h / 2 + 105);

            if (this.level1MultLabel) {
                ctx.fillStyle = multColor;
                ctx.font = 'bold 14px Arial';
                ctx.fillText(this.level1MultLabel, w / 2, h / 2 + 122);
            }

            ctx.fillStyle = '#ffd700';
            ctx.font = '13px Arial';
            ctx.fillText('Bonus: ' + this.level1BaseBonus + ' × ' + this.level1Multiplier + ' = ' + this.level1MultipliedBonus + ' + ' + this.level1TimeBonus + ' speed bonus', w / 2, h / 2 + 140);
        }

        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to continue', w / 2, h / 2 + 170);
        }
    }

    drawGameOver(ctx, player) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#c8102e';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#c8102e';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 60);
        ctx.restore();

        ctx.fillStyle = '#aaa';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Level ' + this.currentLevel, w / 2, h / 2 - 20);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Final Score: ' + player.score, w / 2, h / 2 + 10);

        ctx.fillStyle = '#aaa';
        ctx.font = '20px Arial';
        ctx.fillText('Pucks Collected: ' + this.pucksCollected + ' / ' + this.totalPucks, w / 2, h / 2 + 50);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px Arial';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Play Again', w / 2, h / 2 + 110);
        }
    }

    drawNameEntry(ctx, player, gameTimer, playerName, pucksCollected) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const timeSeconds = gameTimer / 60;

        // Dark overlay with gold tint
        ctx.fillStyle = 'rgba(20, 15, 0, 0.90)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 YOU WIN! 🏆', w / 2, h / 2 - 140);
        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Will wins the Stanley Cup!', w / 2, h / 2 - 95);

        // Stats
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Score: ' + player.score, w / 2 - 120, h / 2 - 55);
        ctx.fillStyle = '#aac8ff';
        ctx.fillText('Time: ' + Leaderboard.formatTime(timeSeconds), w / 2 + 120, h / 2 - 55);

        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        ctx.fillText('Pucks: ' + pucksCollected + '  |  Lives Remaining: ' + player.lives, w / 2, h / 2 - 25);

        // Time multiplier breakdown
        if (this.level2Multiplier && this.level2Multiplier > 0) {
            const m2Color = this.level2Multiplier >= 3 ? '#44ff44' : this.level2Multiplier >= 2 ? '#ffdd44' : '#aaa';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this._roundRect(ctx, w / 2 - 200, h / 2 - 15, 400, 30, 6);
            ctx.fill();
            ctx.fillStyle = m2Color;
            ctx.font = 'bold 14px Arial';
            const multText = 'Level 2: ' + this.level2Multiplier + 'x' + (this.level2MultLabel ? ' ' + this.level2MultLabel : '') + '  (+' + (this.level2MultipliedBonus + this.level2TimeBonus) + ' bonus)';
            ctx.fillText(multText, w / 2, h / 2 - 2);
        }

        // Name entry box
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('Enter your name for the leaderboard:', w / 2, h / 2 + 20);

        // Input box
        const boxW = 300;
        const boxH = 45;
        const boxX = w / 2 - boxW / 2;
        const boxY = h / 2 + 35;

        ctx.fillStyle = 'rgba(0, 20, 60, 0.8)';
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 8);
        ctx.fill();

        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 8);
        ctx.stroke();

        // Player name text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        const displayName = playerName + (Math.sin(Date.now() * 0.006) > 0 ? '|' : '');
        ctx.fillText(displayName, w / 2, boxY + 31);

        // Hint
        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        ctx.fillText('Type your name and press ENTER', w / 2, boxY + 65);

        // Character count
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(playerName.length + '/12', boxX + boxW - 5, boxY - 5);
    }

    drawLeaderboard(ctx, leaderboard, highlightRank) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const entries = leaderboard.getEntries();

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 5, 20, 0.94)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 LEADERBOARD 🏆', w / 2, 60);
        ctx.restore();

        // Table header
        const tableX = w / 2 - 350;
        const tableW = 700;
        let y = 100;

        // Header background
        ctx.fillStyle = 'rgba(0, 51, 160, 0.4)';
        this._roundRect(ctx, tableX, y, tableW, 35, 6);
        ctx.fill();

        ctx.fillStyle = '#aac8ff';
        ctx.font = 'bold 15px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RANK', tableX + 40, y + 23);
        ctx.fillText('NAME', tableX + 160, y + 23);
        ctx.fillText('SCORE', tableX + 330, y + 23);
        ctx.fillText('TIME', tableX + 450, y + 23);
        ctx.fillText('PUCKS', tableX + 550, y + 23);
        ctx.fillText('DATE', tableX + 650, y + 23);

        y += 42;

        if (entries.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No entries yet — be the first to finish!', w / 2, y + 40);
        } else {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                const rank = i + 1;
                const isHighlighted = rank === highlightRank;

                // Row background
                if (isHighlighted) {
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
                    this._roundRect(ctx, tableX, y, tableW, 34, 4);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
                    ctx.lineWidth = 1;
                    this._roundRect(ctx, tableX, y, tableW, 34, 4);
                    ctx.stroke();
                } else if (i % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.fillRect(tableX, y, tableW, 34);
                }

                // Rank medal
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                if (rank === 1) {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillText('🥇', tableX + 40, y + 23);
                } else if (rank === 2) {
                    ctx.fillStyle = '#c0c0c0';
                    ctx.fillText('🥈', tableX + 40, y + 23);
                } else if (rank === 3) {
                    ctx.fillStyle = '#cd7f32';
                    ctx.fillText('🥉', tableX + 40, y + 23);
                } else {
                    ctx.fillStyle = '#888';
                    ctx.fillText('#' + rank, tableX + 40, y + 23);
                }

                // Name
                ctx.fillStyle = isHighlighted ? '#ffd700' : '#fff';
                ctx.font = isHighlighted ? 'bold 15px Arial' : '15px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(entry.name, tableX + 160, y + 23);

                // Score
                ctx.fillStyle = isHighlighted ? '#ffd700' : '#fff';
                ctx.font = 'bold 15px Arial';
                ctx.fillText(entry.score, tableX + 330, y + 23);

                // Time
                ctx.fillStyle = '#aac8ff';
                ctx.font = '15px Arial';
                ctx.fillText(Leaderboard.formatTime(entry.time), tableX + 450, y + 23);

                // Pucks
                ctx.fillStyle = '#aaa';
                ctx.fillText(entry.pucks || '-', tableX + 550, y + 23);

                // Date
                ctx.fillStyle = '#666';
                ctx.font = '13px Arial';
                ctx.fillText(entry.date || '', tableX + 650, y + 23);

                y += 36;
            }
        }

        // Bottom prompts
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
            ctx.fillText('Press ENTER to Play  |  ESC to go Back', w / 2, h - 40);
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
