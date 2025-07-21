// ball.js

export class Ball {
    constructor(ctx, x, y, radius, speed) {
        this.ctx = ctx; // Store the context
        this.initialX = x; // Store initial x position
        this.initialY = y; // Store initial y position
        this.x = x;
        this.y = y;
        this.radius = radius;
        // this.speed = speed;
        this.dx = speed;
        this.dy = speed;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    reset() {
        this.x = this.initialX; // Reset to initial x position
        this.y = this.initialY; // Reset to initial y position
        this.dx = Math.random() < 0.5 ? 5 : -5;
        this.dy = Math.random() < 0.5 ? 5 : -5;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
    }

    // these props are for collision detection
    get left() {
        return this.x - this.radius;
    }
    get right() {
        return this.x + this.radius;
    }
    get top() {
        return this.y - this.radius;
    }
    get bottom() {
        return this.y + this.radius;
    }

    bounceX() {
        this.dx = -this.dx;
    }
    bounceY() {
        this.dy = -this.dy;
    }

    // get speed() {
    //     return Math.max(Math.abs(this.dx), Math.abs(this.dy));
    // }
    // set speed(newSpeed) {
    //     this.dx = this.dx > 0 ? newSpeed : -newSpeed;
    //     this.dy = this.dy > 0 ? newSpeed : -newSpeed;
    // }
}
