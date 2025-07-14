export class GoalArea {
    constructor(x, y, width, height) {
        this.x = x; // X position of the goal area
        this.y = y; // Y position of the goal area
        this.width = width; // Width of the goal area
        this.height = height; // Height of the goal area
    }

    // Method to check if the player's coordinates cross the goal area borders
    isPlayerCrossing(playerX, playerY, playerSize) {
        return (
            playerX < this.x + this.width && // Player is to the left of the right border
            playerX + playerSize > this.x && // Player is to the right of the left border
            playerY < this.y + this.height && // Player is above the bottom border
            playerY + playerSize > this.y // Player is below the top border
        );
    }

    // Method to check if the ball's coordinates cross the goal area borders
    isBallCrossing(ballX, ballY, ballSize) {
        return (
            ballX < this.x + this.width && // Ball is to the left of the right border
            ballX + ballSize > this.x && // Ball is to the right of the left border
            ballY < this.y + this.height && // Ball is above the bottom border
            ballY + ballSize > this.y // Ball is below the top border
        );
    }
}
