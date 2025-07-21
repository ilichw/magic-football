// player.js

export class Player {
    constructor(ctx, x, y, size, speed, name) {
        this.ctx = ctx; // Store the context
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.name = name;
    }

    draw() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    get left() {
        return this.x;
    }
    get right() {
        return this.x + this.size;
    }
    get top() {
        return this.y;
    }
    get bottom() {
        return this.y + this.size;
    }
}

export class PlayerAI extends Player {
    constructor(ctx, x, y, size, speed, name) {
        super(ctx, x, y, size, speed, name); // Call the parent constructor
    }

    update(ball) {
        const moveTowardsBall = Math.random() < 0.8; // 80% chance to move towards the ball
        if (moveTowardsBall) {
            if (ball.y < this.y) {
                this.y -= this.speed; // Move up
            } else if (ball.y > this.y + this.size) {
                this.y += this.speed; // Move down
            }
        }
        return this;
    }
}
