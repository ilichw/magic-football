// goalArea.js

export class GoalArea {
    constructor(x, y, width, height) {
        this.x = x; // X position of the goal area
        this.y = y; // Y position of the goal area
        this.width = width; // Width of the goal area
        this.height = height; // Height of the goal area
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkGoal(ball) {
        const ballLeftEdge = ball.x - ball.radius;
        const ballRightEdge = ball.x + ball.radius;
        const ballTopEdge = ball.y - ball.radius;
        const ballBottomEdge = ball.y + ball.radius;

        return (
            ballRightEdge > this.x && // Ball's right edge is past the goal's left edge
            ballLeftEdge < this.x + this.width && // Ball's left edge is before the goal's right edge
            ballBottomEdge > this.y && // Ball's bottom edge is below the goal's top edge
            ballTopEdge < this.y + this.height // Ball's top edge is above the goal's bottom edge
        );
    }
}
