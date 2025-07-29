// ball.js

export class Ball {
    constructor(skin, x, y, radius, speed, color) {
        this.skin = skin;

        // coordinates
        this.x = x;
        this.y = y;
        this.radius = radius;

        // speed
        this.dx = speed;
        this.dy = speed;

        // initial coordinates and speed (for reset)
        this.initialX = x;
        this.initialY = y;
        this.initialSpeed = speed;

        // color
        this.color = color;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    reset() {
        // Reset to initial position
        this.x = this.initialX;
        this.y = this.initialY;

        // set speed
        this.dx = Math.random() < 0.5 ? this.initialSpeed : -this.initialSpeed;
        this.dy = Math.random() < 0.5 ? this.initialSpeed : -this.initialSpeed;
    }

    draw(ctx) {
        if (this.skin) {
            ctx.drawImage(this.skin, this.left, this.top, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
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
    get size() {
        return this.radius * 2;
    }
    get height() {
        return this.size;
    }
    get width() {
        return this.size;
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
