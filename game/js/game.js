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
        LEADERBOARD: 'leaderboard',
        LEVEL_TRANSITION: 'level_transition'
    };

    let gameState = STATE.START;
    let player, level, ui;
    let leaderboard = new Leaderboard();
    let cameraX = 0;
    let keys = {};
    let keysJustPressed = {};
    let time = 0;
    let gameTimer = 0;
    let particles = [];
    let shotPucks = [];
    let waterBottles = [];
    let screenShake = 0;
    let currentLevel = 1;

    // Time multiplier system
    let level1StartTime = 0;
    let level1EndTime = 0;
    let level2StartTime = 0;
    let level2EndTime = 0;
    let level3StartTime = 0;
    let level3EndTime = 0;
    let level1Multiplier = 1;
    let level2Multiplier = 1;
    let level3Multiplier = 1;
    let level1TimeBonus = 0;
    let level2TimeBonus = 0;
    let level3TimeBonus = 0;
    let level1MultLabel = '';
    let level2MultLabel = '';
    let level3MultLabel = '';
    let transitionTargetLevel = 2;

    // Name entry
    let playerName = '';
    let nameEntryCursor = 0;
    let lastRank = 0;

    // Level end position
    const LEVEL_END = 4900;

    // Calculate time multiplier for a level
    function calcTimeMultiplier(timeSeconds) {
        if (timeSeconds < 90) return { mult: 3.0, bonus: 200, label: '⚡ LIGHTNING FAST' };
        if (timeSeconds < 150) return { mult: 2.5, bonus: 150, label: '🔥 BLAZING' };
        if (timeSeconds < 210) return { mult: 2.0, bonus: 100, label: '💨 SPEEDY' };
        if (timeSeconds < 300) return { mult: 1.5, bonus: 50, label: '👍 SOLID' };
        return { mult: 1.0, bonus: 0, label: '' };
    }

    // Input handling
    window.addEventListener('keydown', (e) => {
        if (!keys[e.key]) {
            keysJustPressed[e.key] = true;
        }
        keys[e.key] = true;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        // NAME ENTRY INPUT
        if (gameState === STATE.NAME_ENTRY) {
            if (e.key === 'Enter' && playerName.length > 0) {
                const timeSeconds = gameTimer / 60;
                lastRank = leaderboard.addEntry(playerName, player.score, timeSeconds, ui.pucksCollected);
                gameState = STATE.LEADERBOARD;
            } else if (e.key === 'Backspace') {
                playerName = playerName.slice(0, -1);
            } else if (e.key.length === 1 && playerName.length < 12) {
                if (/[a-zA-Z0-9 ]/.test(e.key)) {
                    playerName += e.key;
                }
            }
            return;
        }

        // LEVEL TRANSITION INPUT
        if (gameState === STATE.LEVEL_TRANSITION) {
            if (e.key === 'Enter') {
                if (transitionTargetLevel === 3) {
                    startLevel3();
                } else {
                    startLevel2();
                }
            }
            return;
        }

        // LEADERBOARD / START / GAMEOVER INPUT
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
        audio.init();
        audio.startMusic(1);
        gameState = STATE.PLAYING;
        currentLevel = 1;
        player = new Player(50, 400);
        level = createLevel1();
        ui = new UI(canvas);
        ui.currentLevel = 1;
        ui.totalPucks = level.pucks.length;
        cameraX = 0;
        time = 0;
        gameTimer = 0;
        particles = [];
        shotPucks = [];
        waterBottles = [];
        screenShake = 0;
        playerName = '';
        level1StartTime = 0;
        level1EndTime = 0;
        level2StartTime = 0;
        level2EndTime = 0;
        level1Multiplier = 1;
        level2Multiplier = 1;
        level1TimeBonus = 0;
        level2TimeBonus = 0;
        level1MultLabel = '';
        level2MultLabel = '';
    }

    function startLevel2() {
        gameState = STATE.PLAYING;
        currentLevel = 2;
        // Keep player stats (score, lives, shots, pucks)
        const savedScore = player.score;
        const savedLives = player.lives;
        const savedShots = player.shots;
        const savedPucksCollected = player.pucksCollected;
        const savedUiPucks = ui.pucksCollected;

        player.x = 50;
        player.y = 400;
        player.velX = 0;
        player.velY = 0;
        player.superJump = false;
        player.hatTrickActive = false;
        player.invincible = false;

        level = createLevel2();
        ui.currentLevel = 2;
        ui.totalPucks = savedUiPucks + level.pucks.length;
        cameraX = 0;
        particles = [];
        shotPucks = [];
        waterBottles = [];
        screenShake = 0;
        level2StartTime = gameTimer;
        audio.startMusic(2);
    }

    function startLevel3() {
        gameState = STATE.PLAYING;
        currentLevel = 3;
        const savedUiPucks = ui.pucksCollected;

        player.x = 50;
        player.y = 400;
        player.checkpointX = 50;
        player.checkpointY = 400;
        player.velX = 0;
        player.velY = 0;
        player.superJump = false;
        player.hatTrickActive = false;
        player.breakawayActive = false;
        player.invincible = false;
        player.dashing = false;
        player.dashTimer = 0;
        player.comboCount = 0;
        player.comboTimer = 0;

        level = createLevel3();
        ui.currentLevel = 3;
        ui.totalPucks = savedUiPucks + level.pucks.length;
        cameraX = 0;
        particles = [];
        shotPucks = [];
        waterBottles = [];
        screenShake = 0;
        level3StartTime = gameTimer;
        audio.startMusic(3);
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

    // Level 1 Background - dark blue arena
    function drawBackground1(ctx) {
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
            ctx.fillStyle = 'rgba(200, 230, 255, ' + sparkleAlpha + ')';
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
    }

    // Level 2 Background - warm playoff arena
    function drawBackground2(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#2a1008');
        grad.addColorStop(0.4, '#3d1a0a');
        grad.addColorStop(0.7, '#4a2510');
        grad.addColorStop(1, '#5c3318');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Warm spotlight beams
        ctx.fillStyle = 'rgba(255, 180, 80, 0.04)';
        for (let i = 0; i < 8; i++) {
            const lx = (i * 200 - cameraX * 0.1) % (canvas.width + 200) - 100;
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.lineTo(lx - 70, canvas.height);
            ctx.lineTo(lx + 70, canvas.height);
            ctx.closePath();
            ctx.fill();
        }

        // Crowd - warmer tones
        ctx.fillStyle = 'rgba(40, 15, 5, 0.4)';
        for (let i = 0; i < canvas.width + 40; i += 12) {
            const crowdOffset = Math.sin((i + cameraX * 0.05) * 0.1) * 10;
            const crowdHeight = 32 + Math.sin(i * 0.3) * 12 + crowdOffset;
            ctx.fillRect(i, 78 - crowdHeight / 2, 10, crowdHeight);
        }

        // Occasional crowd color (towel waving)
        for (let i = 0; i < canvas.width + 40; i += 36) {
            const wave = Math.sin((i + time * 2) * 0.05);
            if (wave > 0.7) {
                ctx.fillStyle = 'rgba(255, 200, 50, 0.15)';
                ctx.fillRect(i, 65, 8, 12);
            }
        }

        // Scoreboard - PLAYOFFS
        const sbX = canvas.width / 2 - 80 - (cameraX * 0.05 % 20);
        ctx.fillStyle = 'rgba(30, 10, 5, 0.6)';
        ctx.fillRect(sbX, 20, 160, 40);
        ctx.strokeStyle = 'rgba(255, 150, 50, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sbX, 20, 160, 40);
        ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PLAYOFFS', sbX + 80, 38);
        ctx.fillStyle = 'rgba(255, 100, 50, 0.4)';
        ctx.font = '11px Arial';
        ctx.fillText('ROUND 2', sbX + 80, 52);

        // Golden/amber sparkles on ice
        for (let i = 0; i < 15; i++) {
            const sparkleX = ((i * 137 + time * 0.5) % canvas.width);
            const sparkleY = 480 + Math.sin(i * 2.5 + time * 0.02) * 30;
            const sparkleAlpha = Math.sin(time * 0.1 + i) * 0.3 + 0.3;
            ctx.fillStyle = 'rgba(255, 200, 100, ' + sparkleAlpha + ')';
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
    }

    // Level 3 Background - purple/green aurora (Stanley Cup Finals)
    function drawBackground3(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a0520');
        grad.addColorStop(0.3, '#1a0a35');
        grad.addColorStop(0.5, '#0d2a2a');
        grad.addColorStop(0.7, '#0a3520');
        grad.addColorStop(1, '#0d4028');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Aurora / Northern Lights beams
        for (let i = 0; i < 10; i++) {
            const lx = (i * 160 - cameraX * 0.08) % (canvas.width + 200) - 100;
            const auroraPhase = Math.sin(time * 0.015 + i * 0.7);
            const green = Math.floor(100 + auroraPhase * 50);
            const purple = Math.floor(80 + Math.sin(time * 0.02 + i) * 40);
            ctx.fillStyle = 'rgba(' + purple + ', ' + Math.floor(green * 0.3) + ', ' + green + ', 0.04)';
            ctx.beginPath();
            ctx.moveTo(lx + auroraPhase * 20, 0);
            ctx.lineTo(lx - 80 + auroraPhase * 10, canvas.height);
            ctx.lineTo(lx + 80 + auroraPhase * 10, canvas.height);
            ctx.closePath();
            ctx.fill();
        }

        // Crowd - dark with green/purple accents
        ctx.fillStyle = 'rgba(10, 5, 20, 0.5)';
        for (let i = 0; i < canvas.width + 40; i += 12) {
            const crowdOffset = Math.sin((i + cameraX * 0.05) * 0.1) * 12;
            const crowdHeight = 34 + Math.sin(i * 0.3) * 14 + crowdOffset;
            ctx.fillRect(i, 76 - crowdHeight / 2, 10, crowdHeight);
        }

        // Crowd towel waving - white towels for Finals
        for (let i = 0; i < canvas.width + 40; i += 28) {
            const wave = Math.sin((i + time * 3) * 0.06);
            if (wave > 0.5) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.fillRect(i, 62, 8, 14);
            }
            if (wave < -0.6) {
                ctx.fillStyle = 'rgba(68, 255, 136, 0.1)';
                ctx.fillRect(i + 4, 64, 6, 10);
            }
        }

        // Scoreboard - STANLEY CUP FINALS
        const sbX = canvas.width / 2 - 100 - (cameraX * 0.05 % 20);
        ctx.fillStyle = 'rgba(10, 5, 20, 0.7)';
        ctx.fillRect(sbX, 18, 200, 44);
        ctx.strokeStyle = 'rgba(68, 255, 136, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sbX, 18, 200, 44);
        ctx.fillStyle = 'rgba(68, 255, 136, 0.7)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STANLEY CUP', sbX + 100, 36);
        ctx.fillStyle = 'rgba(200, 150, 255, 0.6)';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('⭐ THE FINALS ⭐', sbX + 100, 54);

        // Green/purple sparkles on ice
        for (let i = 0; i < 20; i++) {
            const sparkleX = ((i * 113 + time * 0.6) % canvas.width);
            const sparkleY = 478 + Math.sin(i * 2.5 + time * 0.025) * 32;
            const sparkleAlpha = Math.sin(time * 0.12 + i) * 0.3 + 0.3;
            const isGreen = i % 2 === 0;
            if (isGreen) {
                ctx.fillStyle = 'rgba(68, 255, 136, ' + sparkleAlpha + ')';
            } else {
                ctx.fillStyle = 'rgba(180, 120, 255, ' + sparkleAlpha + ')';
            }
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
    }

    function drawBackground(ctx) {
        if (currentLevel === 3) {
            drawBackground3(ctx);
        } else if (currentLevel === 2) {
            drawBackground2(ctx);
        } else {
            drawBackground1(ctx);
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
            gameState = STATE.NAME_ENTRY;
        } else if (gameState === STATE.NAME_ENTRY) {
            draw();
            ui.drawNameEntry(ctx, player, gameTimer, playerName, ui.pucksCollected);
        } else if (gameState === STATE.LEADERBOARD) {
            drawBackground(ctx);
            ui.drawLeaderboard(ctx, leaderboard, lastRank);
        } else if (gameState === STATE.LEVEL_TRANSITION) {
            drawBackground(ctx);
            ui.drawLevelTransition(ctx, transitionTargetLevel);
        }

        keysJustPressed = {};
        requestAnimationFrame(gameLoop);
    }

    function update() {
        gameTimer++;
        player.update(keys, level.platforms);

        // SHOOTING PUCKS
        if ((keysJustPressed['x'] || keysJustPressed['X'] || keysJustPressed['f'] || keysJustPressed['F']) && player.shoot()) {
            const shotX = player.facing === 1 ? player.x + player.width : player.x - 16;
            const shotY = player.y + player.height / 2 - 5;
            shotPucks.push(new ShotPuck(shotX, shotY, player.facing));
            spawnParticles(shotX, shotY, '#ffd700', 5);
            screenShake = 3;
            audio.playShot();
        }

        // SQUIRTING WATER BOTTLE (Hat Trick power-up)
        if ((keysJustPressed['z'] || keysJustPressed['Z']) && player.squirt()) {
            const bottleX = player.facing === 1 ? player.x + player.width : player.x - 20;
            const bottleY = player.y + player.height / 2 - 6;
            waterBottles.push(new WaterBottle(bottleX, bottleY, player.facing));
            spawnParticles(bottleX, bottleY, '#4a9eff', 8);
            screenShake = 2;
            audio.playWaterSquirt();
        }

        // Update shot pucks
        for (let i = shotPucks.length - 1; i >= 0; i--) {
            shotPucks[i].update();
            if (!shotPucks[i].alive) {
                shotPucks.splice(i, 1);
            }
        }

        // Update water bottles
        for (let i = waterBottles.length - 1; i >= 0; i--) {
            waterBottles[i].update();
            if (!waterBottles[i].alive) {
                waterBottles.splice(i, 1);
            }
        }

        // Camera follows player
        const targetCameraX = player.x - canvas.width * 0.35;
        cameraX += (targetCameraX - cameraX) * 0.1;
        if (cameraX < 0) cameraX = 0;

        // Update enemies (pass player position for charge behavior)
        for (const goalie of level.goalies) {
            goalie.update(player.x);
        }

        // Update boss goalie
        if (level.bossGoalie && level.bossGoalie.alive) {
            level.bossGoalie.update(player.x);
        }

        // Update pucks
        for (const puck of level.pucks) {
            puck.update(time);
        }

        // Update stanley cups
        for (const cup of level.stanleyCups) {
            cup.update(time);
        }

        // Update hat tricks
        for (const ht of level.hatTricks) {
            ht.update(time);
        }

        // Update breakaways
        if (level.breakaways) {
            for (const ba of level.breakaways) {
                ba.update(time);
            }
        }

        // Update moving platforms
        if (level.movingPlatforms) {
            for (const mp of level.movingPlatforms) {
                mp.update(time);
            }
        }

        // Update crumbling platforms
        if (level.crumblePlatforms) {
            for (const cp of level.crumblePlatforms) {
                cp.update();
            }
        }

        // Update checkpoints
        if (level.checkpoints) {
            for (const cp of level.checkpoints) {
                cp.update(time);
            }
        }

        // Update flash messages
        ui.updateFlash();

        // === BOUNCE PAD COLLISION ===
        for (const plat of level.platforms) {
            if (plat.type === 'bounce') {
                if (player.velY >= 0 &&
                    player.x + player.width > plat.x &&
                    player.x < plat.x + plat.width &&
                    player.y + player.height >= plat.y &&
                    player.y + player.height <= plat.y + plat.height + player.velY + 4) {
                    player.velY = -20; // Super bounce!
                    player.grounded = false;
                    spawnParticles(player.x + player.width / 2, plat.y, '#ff6644', 12);
                    spawnParticles(player.x + player.width / 2, plat.y, '#ffaa44', 8);
                    screenShake = 5;
                    audio.playJump();
                }
            }
        }

        // === SPEED ZONE COLLISION ===
        for (const plat of level.platforms) {
            if (plat.type === 'speed') {
                if (player.x + player.width > plat.x &&
                    player.x < plat.x + plat.width &&
                    player.y + player.height >= plat.y &&
                    player.y + player.height <= plat.y + plat.height + 10) {
                    if (!player.speedBoosted) {
                        player.speedBoosted = true;
                        player.speedBoostTimer = 120; // 2 seconds
                        player.speed = player.baseSpeed * 1.8;
                        spawnParticles(player.x + player.width / 2, player.y + player.height, '#00ffcc', 8);
                    }
                }
            }
        }

        // Speed boost timer
        if (player.speedBoosted) {
            player.speedBoostTimer--;
            if (player.speedBoostTimer <= 0) {
                player.speedBoosted = false;
                player.speed = player.baseSpeed;
            }
        }

        // === PUCK MAGNET EFFECT ===
        if (player.puckMagnetActive) {
            player.puckMagnetTimer--;
            if (player.puckMagnetTimer <= 0) {
                player.puckMagnetActive = false;
            }
            // Attract nearby pucks
            for (const puck of level.pucks) {
                if (!puck.collected) {
                    const dx = player.x + player.width / 2 - puck.x;
                    const dy = player.y + player.height / 2 - puck.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        puck.x += dx * 0.08;
                        puck.y += dy * 0.08;
                    }
                }
            }
        }

        // === SLAPSHOT CHARGE ===
        if (player.slapshotChargeCount >= player.slapshotChargeMax && !player.slapshotReady) {
            player.slapshotReady = true;
            ui.showFlash('💥 SLAPSHOT READY! Press [C]!', 120, '#ff4444', '#ff0000');
        }

        // SLAPSHOT ACTIVATION
        if ((keysJustPressed['c'] || keysJustPressed['C']) && player.slapshotReady) {
            player.slapshotReady = false;
            player.slapshotChargeCount = 0;
            screenShake = 20;
            // Kill all visible goalies
            let killCount = 0;
            for (const goalie of level.goalies) {
                if (goalie.alive && !goalie.dying) {
                    const gx = goalie.x - cameraX;
                    if (gx > -50 && gx < canvas.width + 50) {
                        goalie.kill();
                        killCount++;
                        spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#ff4444', 20);
                        spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#ffd700', 15);
                    }
                }
            }
            player.score += killCount * 50;
            // Screen flash
            ui.showFlash('💥 SLAPSHOT! ' + killCount + ' GOALIES DOWN! 💥', 120, '#ff4444', '#ff0000');
            audio.playBossHit();
        }

        // Collision: Player vs Pucks (with combo system)
        const playerBounds = player.getBounds();
        for (const puck of level.pucks) {
            if (!puck.collected && rectsOverlap(playerBounds, puck.getBounds())) {
                puck.collected = true;
                player.collectPuck();
                ui.pucksCollected++;

                // Combo system for rapid puck collection
                const combo = player.addCombo(5); // bonus points via combo
                if (combo.count >= 3) {
                    ui.showFlash('🔥 COMBO x' + combo.multiplier + '!', 45, '#ff8800', '#ff6600');
                    audio.playCombo(combo.count);
                }

                // Slapshot charge
                player.slapshotChargeCount++;

                spawnParticles(puck.x + 10, puck.y + 6, '#333', 8);
                spawnParticles(puck.x + 10, puck.y + 6, '#ffd700', 4);
                audio.playPuckCollect();

                if (player.pucksCollected % 5 === 0) {
                    ui.showFlash('🏒 NEW SHOT READY!', 90, '#ff8800', '#ff6600');
                    audio.playNewShot();
                }

                // Every 10 pucks activates puck magnet briefly
                if (player.pucksCollected % 10 === 0) {
                    player.puckMagnetActive = true;
                    player.puckMagnetTimer = player.puckMagnetDuration;
                    ui.showFlash('🧲 PUCK MAGNET!', 60, '#ffd700', '#ffaa00');
                }
            }
        }

        // Collision: Player vs Stanley Cups (Level 1)
        for (const cup of level.stanleyCups) {
            if (!cup.collected && rectsOverlap(playerBounds, cup.getBounds())) {
                cup.collected = true;
                player.activateSuperJump();
                player.score += 50;
                spawnParticles(cup.x + 14, cup.y + 20, '#ffd700', 25);
                spawnParticles(cup.x + 14, cup.y + 20, '#fff', 15);
                screenShake = 12;
                ui.showFlash('🏆 YOU GOT THE STANLEY CUP! 🏆', 180, '#ffd700', '#ffd700');
                audio.playPowerUp();
            }
        }

        // Collision: Player vs Hat Tricks (Level 2)
        for (const ht of level.hatTricks) {
            if (!ht.collected && rectsOverlap(playerBounds, ht.getBounds())) {
                ht.collected = true;
                player.activateHatTrick();
                player.score += 50;
                spawnParticles(ht.x + 16, ht.y + 18, '#4a9eff', 25);
                spawnParticles(ht.x + 16, ht.y + 18, '#88ccff', 15);
                screenShake = 12;
                ui.showFlash('🎩 HAT TRICK! FREEZE THEM! 🎩', 180, '#4a9eff', '#4a9eff');
                audio.playPowerUp();
            }
        }

        // Collision: Player vs Breakaways (Level 3)
        if (level.breakaways) {
            for (const ba of level.breakaways) {
                if (!ba.collected && rectsOverlap(playerBounds, ba.getBounds())) {
                    ba.collected = true;
                    player.activateBreakaway();
                    player.score += 75;
                    spawnParticles(ba.x + 17, ba.y + 19, '#44ff88', 30);
                    spawnParticles(ba.x + 17, ba.y + 19, '#88ffbb', 15);
                    spawnParticles(ba.x + 17, ba.y + 19, '#ffd700', 10);
                    screenShake = 15;
                    ui.showFlash('🏃 BREAKAWAY! INVINCIBLE! 🏃', 180, '#44ff88', '#44ff88');
                    audio.playPowerUp();
                }
            }
        }

        // Breakaway particle trail
        if (player.breakawayActive && time % 3 === 0) {
            spawnParticles(player.x + player.width / 2, player.y + player.height, '#44ff88', 2);
        }

        // Collision: Player vs Checkpoints
        if (level.checkpoints) {
            for (const cp of level.checkpoints) {
                if (!cp.activated && rectsOverlap(playerBounds, cp.getBounds())) {
                    cp.activated = true;
                    player.setCheckpoint(cp.x, cp.y - 10);
                    spawnParticles(cp.x + 10, cp.y + 10, '#44ff88', 15);
                    spawnParticles(cp.x + 10, cp.y + 10, '#ffd700', 8);
                    screenShake = 4;
                    ui.showFlash('✓ CHECKPOINT!', 60, '#44ff88', '#22cc55');
                    audio.playCheckpoint();
                }
            }
        }

        // Collision: Player vs Moving Platforms (handled in player.update via platforms array)
        // We need to add moving/crumble platforms to the collision check
        if (level.movingPlatforms) {
            for (const mp of level.movingPlatforms) {
                const platX = mp.currentX;
                const platY = mp.currentY;
                if (player.velY >= 0 &&
                    player.x + player.width > platX &&
                    player.x < platX + mp.width &&
                    player.y + player.height >= platY &&
                    player.y + player.height <= platY + mp.height + player.velY + 2) {
                    player.y = platY - player.height;
                    player.velY = 0;
                    player.grounded = true;
                    player.hasDoubleJumped = false;
                    if (mp.velX) player.x += mp.velX;
                }
            }
        }

        // Collision: Player vs Crumbling Platforms
        if (level.crumblePlatforms) {
            for (const cp of level.crumblePlatforms) {
                if (cp.fallen) continue;
                const platX = cp.currentX || cp.x;
                const platY = cp.currentY || cp.y;
                if (player.velY >= 0 &&
                    player.x + player.width > platX &&
                    player.x < platX + cp.width &&
                    player.y + player.height >= platY &&
                    player.y + player.height <= platY + cp.height + player.velY + 2) {
                    player.y = platY - player.height;
                    player.velY = 0;
                    player.grounded = true;
                    player.hasDoubleJumped = false;
                    if (!cp.crumbling) {
                        cp.crumbling = true;
                        cp.crumbleTimer = cp.crumbleDuration;
                    }
                }
            }
        }

        // Collision: Player vs Boss Goalie
        if (level.bossGoalie && level.bossGoalie.alive && !level.bossGoalie.dying) {
            if (rectsOverlap(playerBounds, level.bossGoalie.getBounds())) {
                player.loseLife();
                spawnParticles(player.x + 18, player.y + 26, '#c8102e', 15);
                screenShake = 12;
                audio.playHurt();
            }
            // Boss shockwave collision
            const shockBounds = level.bossGoalie.getShockwaveBounds();
            if (shockBounds && rectsOverlap(playerBounds, shockBounds)) {
                player.loseLife();
                spawnParticles(player.x + 18, player.y + 26, '#ff4444', 12);
                screenShake = 10;
                audio.playHurt();
                ui.showFlash('💥 SHOCKWAVE!', 45, '#ff4444', '#ff0000');
            }
        }

        // Collision: Player vs Goalies
        for (const goalie of level.goalies) {
            if (goalie.alive && !goalie.dying && !goalie.frozen && rectsOverlap(playerBounds, goalie.getBounds())) {
                player.loseLife();
                spawnParticles(player.x + 18, player.y + 26, '#c8102e', 12);
                screenShake = 8;
                audio.playHurt();
            }
        }

        // Collision: Shot Pucks vs Boss Goalie
        if (level.bossGoalie && level.bossGoalie.alive && !level.bossGoalie.dying) {
            for (const shot of shotPucks) {
                if (!shot.alive) continue;
                if (rectsOverlap(shot.getBounds(), level.bossGoalie.getBounds())) {
                    const didHit = level.bossGoalie.hit();
                    shot.alive = false;
                    if (didHit) {
                        player.score += 50;
                        screenShake = 8;
                        spawnParticles(level.bossGoalie.x + 40, level.bossGoalie.y + 50, '#ff4444', 15);
                        spawnParticles(level.bossGoalie.x + 40, level.bossGoalie.y + 50, '#ffd700', 10);
                        ui.showFlash('💥 BOSS HIT! HP: ' + level.bossGoalie.hp + '/' + level.bossGoalie.maxHp, 60, '#ff4444', '#ff2200');
                        audio.playBossHit();
                        if (level.bossGoalie.hp <= 0) {
                            player.score += 500;
                            screenShake = 20;
                            spawnParticles(level.bossGoalie.x + 40, level.bossGoalie.y + 50, '#ffd700', 40);
                            spawnParticles(level.bossGoalie.x + 40, level.bossGoalie.y + 50, '#44ff88', 30);
                            ui.showFlash('🏆 BOSS DEFEATED! 🏆', 180, '#ffd700', '#ffd700');
                            audio.playBossDefeat();
                        }
                    } else {
                        screenShake = 4;
                        spawnParticles(level.bossGoalie.x + 40, level.bossGoalie.y + 30, '#ffdd44', 10);
                        ui.showFlash('🧤 BOSS BLOCKED!', 45, '#ffdd44', '#ffaa00');
                        audio.playGoalieBlock();
                    }
                    break;
                }
            }
        }

        // Collision: Shot Pucks vs Goalies
        for (const shot of shotPucks) {
            if (!shot.alive) continue;
            for (const goalie of level.goalies) {
                if (goalie.alive && !goalie.dying && rectsOverlap(shot.getBounds(), goalie.getBounds())) {
                    // Check if goalie blocks the shot
                    if (goalie.canBlockShot()) {
                        shot.alive = false;
                        spawnParticles(goalie.x + goalie.width / 2, goalie.y + 20, '#ffdd44', 8);
                        screenShake = 3;
                        ui.showFlash('🧤 BLOCKED!', 45, '#ffdd44', '#ffaa00');
                        audio.playGoalieBlock();
                    } else {
                        goalie.kill();
                        shot.alive = false;
                        player.score += 25;
                        screenShake = 6;
                        spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#1a5e1a', 15);
                        spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#ff4444', 10);
                        spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#ffd700', 8);
                        ui.showFlash('💥 GOALIE DOWN!', 60, '#ff4444', '#ff2200');
                        audio.playGoalieHit();
                    }
                    break;
                }
            }
        }

        // Collision: Water Bottles vs Goalies (freeze them)
        for (const bottle of waterBottles) {
            if (!bottle.alive) continue;
            for (const goalie of level.goalies) {
                if (goalie.alive && !goalie.dying && !goalie.frozen && rectsOverlap(bottle.getBounds(), goalie.getBounds())) {
                    goalie.freeze();
                    bottle.alive = false;
                    player.score += 15;
                    screenShake = 4;
                    spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#4a9eff', 20);
                    spawnParticles(goalie.x + goalie.width / 2, goalie.y + goalie.height / 2, '#88ccff', 12);
                    ui.showFlash('❄ GOALIE FROZEN! ❄', 60, '#4a9eff', '#4a9eff');
                    audio.playGoalieFreeze();
                    break;
                }
            }
        }

        // Check game over
        if (player.lives <= 0) {
            gameState = STATE.GAMEOVER;
            audio.fadeOutMusic(1);
            audio.playGameOver();
        }

        // Check level completion
        if (player.x >= LEVEL_END) {
            if (currentLevel === 1) {
                // Calculate Level 1 time and multiplier
                level1EndTime = gameTimer;
                const l1Seconds = (level1EndTime - level1StartTime) / 60;
                const l1Result = calcTimeMultiplier(l1Seconds);
                level1Multiplier = l1Result.mult;
                level1TimeBonus = l1Result.bonus;
                level1MultLabel = l1Result.label;

                // Apply multiplied completion bonus
                const baseBonus = player.lives * 50;
                const multipliedBonus = Math.floor(baseBonus * level1Multiplier);
                player.score += multipliedBonus + level1TimeBonus;

                // Store multiplier info for UI
                ui.level1Time = l1Seconds;
                ui.level1Multiplier = level1Multiplier;
                ui.level1TimeBonus = level1TimeBonus;
                ui.level1MultLabel = level1MultLabel;
                ui.level1BaseBonus = baseBonus;
                ui.level1MultipliedBonus = multipliedBonus;

                transitionTargetLevel = 2;
                gameState = STATE.LEVEL_TRANSITION;
                audio.playLevelComplete();
            } else if (currentLevel === 2) {
                // Calculate Level 2 time and multiplier
                level2EndTime = gameTimer;
                const l2Seconds = (level2EndTime - level2StartTime) / 60;
                const l2Result = calcTimeMultiplier(l2Seconds);
                level2Multiplier = l2Result.mult;
                level2TimeBonus = l2Result.bonus;
                level2MultLabel = l2Result.label;

                // Apply multiplied completion bonus
                const baseBonus = player.lives * 100;
                const multipliedBonus = Math.floor(baseBonus * level2Multiplier);
                player.score += multipliedBonus + level2TimeBonus;

                // Store multiplier info for UI
                ui.level2Time = l2Seconds;
                ui.level2Multiplier = level2Multiplier;
                ui.level2TimeBonus = level2TimeBonus;
                ui.level2MultLabel = level2MultLabel;
                ui.level2BaseBonus = baseBonus;
                ui.level2MultipliedBonus = multipliedBonus;

                transitionTargetLevel = 3;
                gameState = STATE.LEVEL_TRANSITION;
                audio.playLevelComplete();
            } else {
                // Calculate Level 3 time and multiplier
                level3EndTime = gameTimer;
                const l3Seconds = (level3EndTime - level3StartTime) / 60;
                const l3Result = calcTimeMultiplier(l3Seconds);
                level3Multiplier = l3Result.mult;
                level3TimeBonus = l3Result.bonus;
                level3MultLabel = l3Result.label;

                // Apply multiplied completion bonus
                const baseBonus = player.lives * 150;
                const multipliedBonus = Math.floor(baseBonus * level3Multiplier);
                player.score += multipliedBonus + level3TimeBonus;

                // Store multiplier info for UI
                ui.level3Time = l3Seconds;
                ui.level3Multiplier = level3Multiplier;
                ui.level3TimeBonus = level3TimeBonus;
                ui.level3MultLabel = level3MultLabel;
                ui.level3BaseBonus = baseBonus;
                ui.level3MultipliedBonus = multipliedBonus;

                gameState = STATE.WIN;
                audio.fadeOutMusic(1);
                audio.playWin();
            }
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
                plat.draw(ctx, cameraX, time);
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

        for (const ht of level.hatTricks) {
            if (!ht.collected && ht.x + 32 > cameraX - 50 && ht.x < cameraX + canvas.width + 50) {
                ht.draw(ctx, cameraX, time);
            }
        }

        if (level.breakaways) {
            for (const ba of level.breakaways) {
                if (!ba.collected && ba.x + 34 > cameraX - 50 && ba.x < cameraX + canvas.width + 50) {
                    ba.draw(ctx, cameraX, time);
                }
            }
        }

        // Draw moving platforms
        if (level.movingPlatforms) {
            for (const mp of level.movingPlatforms) {
                mp.draw(ctx, cameraX);
            }
        }

        // Draw crumbling platforms
        if (level.crumblePlatforms) {
            for (const cp of level.crumblePlatforms) {
                cp.draw(ctx, cameraX);
            }
        }

        // Draw checkpoints
        if (level.checkpoints) {
            for (const cp of level.checkpoints) {
                cp.draw(ctx, cameraX, time);
            }
        }

        for (const goalie of level.goalies) {
            if ((goalie.alive || goalie.dying) && goalie.x + goalie.width > cameraX - 50 && goalie.x < cameraX + canvas.width + 50) {
                goalie.draw(ctx, cameraX);
            }
        }

        // Draw boss goalie
        if (level.bossGoalie && (level.bossGoalie.alive || level.bossGoalie.dying)) {
            level.bossGoalie.draw(ctx, cameraX);
        }

        for (const shot of shotPucks) {
            shot.draw(ctx, cameraX);
        }

        for (const bottle of waterBottles) {
            bottle.draw(ctx, cameraX);
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
            ctx.fillStyle = 'rgba(255, 0, 0, ' + glowAlpha + ')';
            ctx.beginPath();
            ctx.arc(finishX + 20, 450, 8, 0, Math.PI * 2);
            ctx.fill();

            // Label changes based on level
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            if (currentLevel === 3) {
                ctx.fillText('FINISH', finishX + 20, 445);
            } else {
                ctx.fillText('NEXT LEVEL', finishX + 20, 445);
            }
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
