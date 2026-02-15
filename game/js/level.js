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

        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(drawX + 10, drawY + 14, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Puck side (3D effect)
        ctx.fillStyle = '#111';
        ctx.fillRect(drawX, drawY + 2, 20, 8);

        // Puck top
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(drawX + 10, drawY + 2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.ellipse(drawX + 8, drawY, 4, 2, -0.3, 0, Math.PI * 2);
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

class Platform {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height || 20;
        this.type = type || 'ice'; // 'ice', 'boards', 'ground'
    }

    draw(ctx, cameraX) {
        const drawX = this.x - cameraX;
        const drawY = this.y;

        ctx.save();

        if (this.type === 'ground') {
            // Ice surface ground
            ctx.fillStyle = '#e8f0ff';
            ctx.fillRect(drawX, drawY, this.width, this.height);

            // Ice lines
            ctx.strokeStyle = 'rgba(180, 210, 255, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.width; i += 30) {
                ctx.beginPath();
                ctx.moveTo(drawX + i, drawY);
                ctx.lineTo(drawX + i + 15, drawY + this.height);
                ctx.stroke();
            }

            // Top edge - boards
            ctx.fillStyle = '#c8102e';
            ctx.fillRect(drawX, drawY, this.width, 4);

        } else if (this.type === 'boards') {
            // Rink boards platform
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(drawX, drawY, this.width, this.height);

            // Board texture
            ctx.fillStyle = '#ddd';
            ctx.fillRect(drawX, drawY, this.width, 3);

            // Red line on boards
            ctx.fillStyle = '#c8102e';
            ctx.fillRect(drawX, drawY + this.height - 3, this.width, 3);

            // Dasher boards pattern
            ctx.strokeStyle = '#bbb';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(drawX + i, drawY);
                ctx.lineTo(drawX + i, drawY + this.height);
                ctx.stroke();
            }

        } else {
            // Ice platform
            ctx.fillStyle = 'rgba(200, 225, 255, 0.9)';
            ctx.fillRect(drawX, drawY, this.width, this.height);

            // Shine on top
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(drawX, drawY, this.width, 3);

            // Blue line accent
            ctx.fillStyle = '#0033a0';
            ctx.fillRect(drawX, drawY + this.height - 2, this.width, 2);
        }

        ctx.restore();
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

    return { platforms, pucks, goalies, stanleyCups, hatTricks };
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

    return { platforms, pucks, goalies, stanleyCups, hatTricks };
}

// Legacy function for backward compatibility
function createLevel() {
    return createLevel1();
}
