// Enemies - Goalies
class Goalie {
    constructor(x, y, patrolRange) {
        this.x = x;
        this.y = y;
        this.width = 44;
        this.height = 56;
        this.startX = x;
        this.patrolRange = patrolRange || 120;
        this.speed = 1.5;
        this.direction = 1;
        this.alive = true;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update() {
        if (!this.alive) return;

        this.x += this.speed * this.direction;

        // Reverse direction at patrol bounds
        if (this.x > this.startX + this.patrolRange) {
            this.direction = -1;
        } else if (this.x < this.startX - this.patrolRange) {
            this.direction = 1;
        }

        // Animation
        this.animTimer++;
        if (this.animTimer > 10) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }

    draw(ctx, cameraX) {
        if (!this.alive) return;

        const drawX = this.x - cameraX;
        const drawY = this.y;

        ctx.save();

        // Flip based on direction
        if (this.direction === -1) {
            ctx.translate(drawX + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(drawX + this.width / 2), 0);
        }

        // === Draw Goalie ===

        // Leg pads
        const sway = this.animFrame === 1 ? 2 : 0;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(drawX + 6, drawY + 32 + sway, 14, 20);
        ctx.fillRect(drawX + this.width - 20, drawY + 32 - sway, 14, 20);

        // Skates
        ctx.fillStyle = '#222';
        ctx.fillRect(drawX + 4, drawY + this.height - 6, 16, 6);
        ctx.fillRect(drawX + this.width - 20, drawY + this.height - 6, 16, 6);
        // Blades
        ctx.fillStyle = '#aaa';
        ctx.fillRect(drawX + 2, drawY + this.height - 2, 20, 2);
        ctx.fillRect(drawX + this.width - 22, drawY + this.height - 2, 20, 2);

        // Body (chest protector)
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(drawX + 4, drawY + 14, this.width - 8, 22);

        // Jersey over chest protector
        ctx.fillStyle = '#1a5e1a'; // Green jersey for opposing team
        ctx.fillRect(drawX + 6, drawY + 16, this.width - 12, 18);

        // Arms (blocker and glove)
        ctx.fillStyle = '#1a5e1a';
        ctx.fillRect(drawX - 4, drawY + 16, 10, 16);
        ctx.fillRect(drawX + this.width - 6, drawY + 16, 10, 16);

        // Blocker (right hand)
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(drawX + this.width - 6, drawY + 28, 12, 10);

        // Catching glove (left hand)
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + 30, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Goalie mask/helmet
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + 8, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cage on mask
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        for (let i = -6; i <= 6; i += 4) {
            ctx.beginPath();
            ctx.moveTo(drawX + this.width / 2 + i, drawY + 2);
            ctx.lineTo(drawX + this.width / 2 + i, drawY + 16);
            ctx.stroke();
        }
        for (let j = 4; j <= 14; j += 4) {
            ctx.beginPath();
            ctx.moveTo(drawX + this.width / 2 - 8, drawY + j);
            ctx.lineTo(drawX + this.width / 2 + 8, drawY + j);
            ctx.stroke();
        }

        // Eyes behind cage
        ctx.fillStyle = '#c00';
        ctx.fillRect(drawX + this.width / 2 - 4, drawY + 7, 3, 3);
        ctx.fillRect(drawX + this.width / 2 + 2, drawY + 7, 3, 3);

        // Goalie stick
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width - 4, drawY + 32);
        ctx.lineTo(drawX + this.width + 8, drawY + this.height);
        ctx.stroke();
        // Wide blade
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(drawX + this.width + 4, drawY + this.height - 8, 6, 8);

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
