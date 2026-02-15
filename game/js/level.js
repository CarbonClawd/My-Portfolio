// Level - Platforms, Pucks, and Stanley Cup
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

        // Hockey puck - black disc
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

// Level builder
function createLevel() {
    const platforms = [];
    const pucks = [];
    const goalies = [];
    const stanleyCups = [];

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

    // Goalies on ground
    goalies.push(new Goalie(500, 464, 100));
    goalies.push(new Goalie(1100, 464, 80));
    goalies.push(new Goalie(1800, 464, 120));
    goalies.push(new Goalie(2500, 464, 100));
    goalies.push(new Goalie(3300, 464, 90));
    goalies.push(new Goalie(4000, 464, 110));
    goalies.push(new Goalie(4400, 464, 80));

    // Goalies on platforms
    goalies.push(new Goalie(620, 324, 40));
    goalies.push(new Goalie(1410, 224, 30));
    goalies.push(new Goalie(2610, 264, 35));
    goalies.push(new Goalie(3410, 264, 40));
    goalies.push(new Goalie(4310, 294, 40));

    // Stanley Cups (rare power-ups)
    stanleyCups.push(new StanleyCup(885, 255));
    stanleyCups.push(new StanleyCup(1985, 235));
    stanleyCups.push(new StanleyCup(2835, 215));
    stanleyCups.push(new StanleyCup(4145, 255));

    return { platforms, pucks, goalies, stanleyCups };
}
