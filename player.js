// player.js

export class Player {
    constructor(x, y, size, speed, name, color) {
        // coordinates
        this.x = x;
        this.y = y;

        // initial coordinates used in the reset() method
        this.startX = x;
        this.startY = y;

        this.size = size;
        this.speed = speed;
        this.name = name;
        this.color = color;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
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
    constructor(x, y, size, speed, name, color, level) {
        super(x, y, size, speed, name, color);
        this.level = level; // easy | normal | hard
    }

    update(ball) {
        let moveTowardsBall;

        switch (this.level) {
            case 'easy':
                moveTowardsBall = Math.random() < 0.2; // 20% chance to move towards the ball
                break;
            case 'normal':
                moveTowardsBall = Math.random() < 0.5; // 50% chance to move towards the ball
                break;
            case 'hard':
                moveTowardsBall = Math.random() < 0.8; // 80% chance to move towards the ball
                break;
        }

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
