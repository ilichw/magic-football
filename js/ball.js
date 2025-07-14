export class Ball {
    constructor(gameArea) {
        this.x = gameArea.clientWidth / 2;
        this.y = gameArea.clientHeight / 2;
        this.size = 15;
        this.color = 'green';
        this.speedX = 0;
        this.speedY = 0;
    }

    initializeSpeed() {
        this.speedX = 3;
        this.speedY = 2;
    }

    move(gameArea) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x <= 0 || this.x >= gameArea.clientWidth - this.size) {
            this.speedX = -this.speedX;
        }
        if (this.y <= 0 || this.y >= gameArea.clientHeight - this.size) {
            this.speedY = -this.speedY;
        }
    }

    draw(gameArea) {
        const ballDiv = document.createElement('div');
        ballDiv.style.position = 'absolute';
        ballDiv.style.left = this.x + 'px';
        ballDiv.style.top = this.y + 'px';
        ballDiv.style.width = this.size + 'px';
        ballDiv.style.height = this.size + 'px';
        ballDiv.style.backgroundColor = this.color;
        ballDiv.style.borderRadius = '50%';
        gameArea.appendChild(ballDiv);
    }

    bounceFromPlayer(player) {
        // Logic for bouncing the ball off the player
        this.speedX = player.x < this.x ? Math.abs(this.speedX) : -Math.abs(this.speedX);
    }
}
