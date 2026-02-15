// Main Game Engine - Will's Stanley Cup Run
(function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Canvas size
    canvas.width = 900;
    canvas.height = 600;

    // Game states
    const STATE = {
        START: 'start',
        PLAYING: 'playing',
        GAMEOVER: 'gameover',
        WIN: 'win',
        NAME_ENTRY: 'name_entry',
        LEADERBOARD: 'leaderboard'
    };

    let gameState = STATE.START;
    let player, level, ui;
    let leaderboard = new Leaderboard();
    let cameraX = 0;
    let keys = {};
    let keysJustPressed = {};
    let time = 0;
    let gameTimer = 0; // tracks game time in frames
    let particles = [];
    let shotPucks = [];
    let screenShake = 0;

    // Name entry
    let playerName = '';
    let nameEntryCursor = 0;
    let lastRank = 0;

    // Level end position
    const LEVEL_END = 4900;

    // Input handling
    window.addEventListener('keydown', (e) => {
        if (!keys[e.key]) {
            keysJustPressed[e.key] = true;
        }
        keys[e.key] = true;

        // Prevent scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        // === NAME ENTRY INPUT ===
        if (gameState === STATE.NAME_ENTRY) {
            if (e.key === 'Enter' && playerName.length > 0) {
                // Submit name
                const timeSeconds = gameTimer / 60;
                lastRank = leaderboard.addEntry(playerName, player.score, timeSeconds, ui.pucksCollected);
                gameState = STATE.LEADERBOARD;
            } else if (e.key === 'Backspace') {
                playerName = playerName.slice(0, -1);
            } else if (e.key.length === 1 && playerName.length < 12) {
                // Only allow letters, numbers, spaces
                if (/[a-zA-Z0-9 ]/.test(e.key)) {
                    playerName += e.key;
                }
            }
            return;
        }

        // === LEADERBOARD / START / GAMEOVER INPUT ===
        if (e.key === 'Enter') {
            if (gameState === STATE.START || gameState === STATE.GAMEOVER || gameState === STATE.LEADERBOARD) {
                startGame();
            }
        }

        if ((e.key === 'l' || e.key === 'L') && gameState === STATE.START) {
            gameState = STATE.LEADERBOARD;
        }

        if (e.key === 'Escape') {
            if (gameState === STATE.LEADERBOARD) {
                gameState = STATE.START;
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function startGame() {
        gameState = STATE.PLAYING;
        player = new Player(50, 400);
        level = createLevel();
        ui = new UI(canvas);
        ui.totalPucks = level.pucks.length;
        cameraX = 0;
        time = 0;
        gameTimer = 0;
        particles = [];
        shotPucks = [];
        screenShake = 0;
        playerName = '';
    }

    // Collision detection helper
    function rectsOverlap(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    // Particle system
    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                velX: (Math.random() - 0.5) * 6,
                velY: (Math.random() - 0.5) * 6 - 2,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.velX;
            p.y += p.velY;
            p.velY += 0.1;
            p.life--;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function drawParticles(ctx) {
        for (const p of particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }

    // Background drawing
    function drawBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a1628');
        grad.addColorStop(0.4, '#0d2040');
        grad.addColorStop(0.7, '#132d50');
        grad.addColorStop(1, '#1a3a6e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 200, 0.03)';
        for (let i = 0; i < 8; i++) {
            const lx = (i * 200 - cameraX * 0.1) % (canvas.width + 200) - 100;
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.lineTo(lx - 60, canvas.height);
            ctx.lineTo(lx + 60, canvas.height);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < canvas.width + 40; i += 12) {
            const crowdOffset = Math.sin((i + cameraX * 0.05) * 0.1) * 8;
            const crowdHeight = 30 + Math.sin(i * 0.3) * 10 + crowdOffset;
            ctx.fillRect(i, 80 - crowdHeight / 2, 10, crowdHeight);
        }

        const sbX = canvas.width / 2 - 80 - (cameraX * 0.05 % 20);
        ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
        ctx.fillRect(sbX, 20, 160, 40);
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sbX, 20, 160, 40);
        ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HOME', sbX + 40, 38);
        ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
        ctx.fillText('AWAY', sbX + 120, 38);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('vs', sbX + 80, 45);

        for (let i = 0; i < 15; i++) {
            const sparkleX = ((i * 137 + time * 0.5) % canvas.width);
            const sparkleY = 480 + Math.sin(i * 2.5 + time * 0.02) * 30;
            const sparkleAlpha = Math.sin(time * 0.1 + i) * 0.3 + 0.3;
            ctx.fillStyle = `rgba(200, 230, 255, ${sparkleAlpha})`;
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
    }

    function drawRinkMarkings(ctx) {
        const centerX = 400 - cameraX;
        ctx.strokeStyle = 'rgba(0, 51, 160, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, 540, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(200, 16, 46, 0.25)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, 520);
        ctx.lineTo(centerX, 600);
        ctx.stroke();

        const blueLine1 = 250 - cameraX;
        const blueLine2 = 550 - cameraX;
        ctx.strokeStyle = 'rgba(0, 51, 160, 0.2)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(blueLine1, 520);
        ctx.lineTo(blueLine1, 600);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(blueLine2, 520);
        ctx.lineTo(blueLine2, 600);
        ctx.stroke();

        const faceoffPositions = [1000, 2000, 3000, 4000];
        for (const pos of faceoffPositions) {
            const fx = pos - cameraX;
            if (fx > -100 && fx < canvas.width + 100) {
                ctx.strokeStyle = 'rgba(200, 16, 46, 0.15)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(fx, 540, 30, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(200, 16, 46, 0.2)';
                ctx.beginPath();
                ctx.arc(fx, 540, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Main game loop
    function gameLoop() {
        time++;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === STATE.START) {
            drawBackground(ctx);
            ui = ui || new UI(canvas);
            ui.drawStartScreen(ctx, leaderboard);
        } else if (gameState === STATE.PLAYING) {
            update();
            draw();
        } else if (gameState === STATE.GAMEOVER) {
            draw();
            ui.drawGameOver(ctx, player);
        } else if (gameState === STATE.WIN) {
            // Transition to name entry after a brief pause
            gameState = STATE.NAME_ENTRY;
        } else if (gameState === STATE.NAME_ENTRY) {
            draw();
            ui.drawNameEntry(ctx, player, gameTimer, playerName, ui.pucksCollected);
        } else if (gameState === STATE.LEADERBOARD) {
            drawBackground(ctx);
            ui.drawLeaderboard(ctx, leaderboard, lastRank);
        }

        // Clear just-pressed keys at end of frame
        keysJustPressed = {};

        requestAnimationFrame(gameLoop);
    }

    function update() {
        // Increment game timer
        gameTimer++;

        // Update player
        player.update(keys, level.platforms);

        // === SHOOTING ===
        if ((keysJustPressed['x'] || keysJustPressed['X'] || keysJustPressed['f'] || keysJustPressed['F']) && player.shoot()) {
            const shotX = player.facing === 1 ? player.x + player.width : player.x - 16;
            const shotY = player.y + player.height / 2 - 5;
            shotPucks.push(new ShotPuck(shotX, shotY, player.facing));
            spawnParticles(shotX, shotY, '#ffd700', 5);
            screenShake = 3;
        }

        // Update shot pucks
        for (let i = shotPucks.length - 1; i >= 0; i--) {
            shotPucks[i].update();
            if (!shotPucks[i].alive) {
                shotPucks.splice(i, 1);
            }
        }

        // Camera follows player
        const targetCameraX = player.x - canvas.width * 0.35;
        cameraX += (targetCameraX - cameraX) * 0.1;
        if (cameraX < 0) cameraX = 0;

        // Update enemies
        for (const goalie of level.goalies) {
            goalie.update();
        }

        // Update pucks
        for (const puck of level.pucks) {
            puck.update(time);
        }

        // Update stanley cups
        for (const cup of level.stanleyCups) {
            cup.update(time);
        }

        // Update flash messages
        ui.updateFlash();

        // Collision: Player vs Pucks
        const playerBounds = player.getBounds();
        for (const puck of level.pucks) {
            if (!puck.collected && rectsOverlap(playerBounds, puck.getBounds())) {
                puck.collected = true;
                player.collectPuck();
                ui.pucksCollected++;
                spawnParticles(puck.x + 10, puck.y + 6, '#333', 8);
                spawnParticles(puck.x + 10, puck.y + 6, '#ffd700', 4);

                if (player.pucksCollected % 5 === 0) {
                    ui.showFlash('🏒 NEW SHOT READY!', 90, '#ff8800', '#ff6600');
                }
            }
        }

        // Collision: Player vs Stanley Cups
        for (const cup of level.stanleyCups) {
            if (!cup.collected && rectsOverlap(playerBounds, cup.getBounds())) {
                cup.collected = true;
                player.activateSuperJump();
                player.score += 50;
                spawnParticles(cup.x + 14, cup.y + 20, '#ffd700', 25);
                spawnParticles(cup.x + 14, cup.y + 20, '#fff', 15);
                screenShake = 12;
                ui.showFlash('🏆 YOU GOT THE STANLEY CUP! 🏆', 180, '#ffd700', '#ffd700');
            }
        }

        // Collision: Player vs Goalies
        for (const goalie of level.goalies) {
            if (goalie.alive && !goalie.dying && rectsOverlap(playerBounds, goalie.getBounds())) {
                player.loseLife();
                spawnParticles(player.x + 18, player.y + 26, '#c8102e', 12);
                screenShake = 8;
            }
        }

        // Collision: Shot Pucks vs Goalies
        for (const shot of shotPucks) {
            if (!shot.alive) continue;
            for (const goalie of level.goalies) {
                if (goalie.alive && !goalie.dying && rectsOverlap(shot.getBounds(), goalie.getBounds())) {
                    goalie.kill();
                    shot.alive = false;
                    player.score += 25;
                    screenShake = 6;
                    spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#1a5e1a', 15);
                    spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#ff4444', 10);
                    spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#ffd700', 8);
                    ui.showFlash('💥 GOALIE DOWN!', 60, '#ff4444', '#ff2200');
                    break;
                }
            }
        }

        // Check game over
        if (player.lives <= 0) {
            gameState = STATE.GAMEOVER;
        }

        // Check win
        if (player.x >= LEVEL_END) {
            gameState = STATE.WIN;
            player.score += player.lives * 100;
        }

        updateParticles();
        if (screenShake > 0) screenShake *= 0.85;
    }

    function draw() {
        ctx.save();

        if (screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * screenShake,
                (Math.random() - 0.5) * screenShake
            );
        }

        drawBackground(ctx);
        drawRinkMarkings(ctx);

        for (const plat of level.platforms) {
            if (plat.x + plat.width > cameraX - 50 && plat.x < cameraX + canvas.width + 50) {
                plat.draw(ctx, cameraX);
            }
        }

        for (const puck of level.pucks) {
            if (!puck.collected && puck.x + 20 > cameraX - 50 && puck.x < cameraX + canvas.width + 50) {
                puck.draw(ctx, cameraX, time);
            }
        }

        for (const cup of level.stanleyCups) {
            if (!cup.collected && cup.x + 28 > cameraX - 50 && cup.x < cameraX + canvas.width + 50) {
                cup.draw(ctx, cameraX, time);
            }
        }

        for (const goalie of level.goalies) {
            if ((goalie.alive || goalie.dying) && goalie.x + goalie.width > cameraX - 50 && goalie.x < cameraX + canvas.width + 50) {
                goalie.draw(ctx, cameraX);
            }
        }

        for (const shot of shotPucks) {
            shot.draw(ctx, cameraX);
        }

        player.draw(ctx, cameraX);
        drawParticles(ctx);

        // Finish line
        const finishX = LEVEL_END - cameraX;
        if (finishX > -50 && finishX < canvas.width + 50) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.strokeRect(finishX - 5, 460, 50, 60);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 50; i += 8) {
                ctx.beginPath();
                ctx.moveTo(finishX - 5 + i, 460);
                ctx.lineTo(finishX - 5 + i, 520);
                ctx.stroke();
            }
            for (let j = 0; j < 60; j += 8) {
                ctx.beginPath();
                ctx.moveTo(finishX - 5, 460 + j);
                ctx.lineTo(finishX + 45, 460 + j);
                ctx.stroke();
            }
            const glowAlpha = Math.sin(time * 0.1) * 0.3 + 0.5;
            ctx.fillStyle = `rgba(255, 0, 0, ${glowAlpha})`;
            ctx.beginPath();
            ctx.arc(finishX + 20, 450, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('FINISH', finishX + 20, 445);
        }

        ctx.restore();

        // HUD
        if (gameState === STATE.PLAYING) {
            ui.drawHUD(ctx, player, gameTimer);
            ui.drawFlash(ctx);
        }
    }

    // Initialize
    ui = new UI(canvas);
    gameLoop();
})();
