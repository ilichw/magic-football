export class Player {
    constructor(x, y, color, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.score = 0;
        this.size = 20;
    }

    move(direction, player1GoalArea, player2GoalArea) {
        const gameArea = document.getElementById('gameArea');
        const gameAreaWidth = gameArea.clientWidth;
        const gameAreaHeight = gameArea.clientHeight;

        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case 'up':
                newY -= this.speed;
                if (newY < 0 || player2GoalArea.isPlayerCrossing(newX, newY, this.size)) {
                    return; // Prevent movement
                }
                break;
            case 'down':
                newY += this.speed;
                if (
                    newY + this.size > gameAreaHeight ||
                    player2GoalArea.isPlayerCrossing(newX, newY + this.size, this.size)
                ) {
                    return; // Prevent movement
                }
                break;
            case 'left':
                newX -= this.speed;
                if (newX < 0 || player1GoalArea.isPlayerCrossing(newX, newY, this.size)) {
                    return; // Prevent movement
                }
                break;
            case 'right':
                newX += this.speed;
                if (
                    newX + this.size > gameAreaWidth ||
                    player1GoalArea.isPlayerCrossing(newX + this.size, newY, this.size)
                ) {
                    return; // Prevent movement
                }
                break;
        }

        // Update position if all checks pass
        this.x = newX;
        this.y = newY;
    }

    draw(gameArea) {
        const playerDiv = document.createElement('div');
        playerDiv.style.position = 'absolute';
        playerDiv.style.left = this.x + 'px';
        playerDiv.style.top = this.y + 'px';
        playerDiv.style.width = this.size + 'px';
        playerDiv.style.height = this.size + 'px';
        playerDiv.style.backgroundColor = this.color;
        gameArea.appendChild(playerDiv);
    }
}
