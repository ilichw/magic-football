import { Ball } from './ball.js';
import { PlayerAI, Player } from './player.js';
import { config } from './config.js';
import { GoalArea } from './goalArea.js';
import { detectCollision } from './detect.js';

let goalSound, collisionSound;
if (config.soundOn) {
    goalSound = new Audio('path/to/goal-sound.mp3');
    collisionSound = new Audio('path/to/collision-sound.mp3');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const fieldWidth = 640;
const fieldHeight = 480;
const GAME_CELEBRATING_DURATION = 2000; // Pause duration in milliseconds
const COUNTDOWN_DURATION = 3000; // Countdown duration in milliseconds
const GOAL_AREA_HEIGHT = 100; // Height of the goal area
const GOAL_AREA_WIDTH = 10; // Width of the goal area

class Game {
    constructor() {
        // create ball instance
        this.ball = new Ball(ctx, fieldWidth / 2, fieldHeight / 2, 10, 5);

        // create player instances
        // Use PlayerAI for Player 1
        this.player1 = new PlayerAI(ctx, 50, fieldHeight / 2, 50, 10, 'player 1');
        this.score1 = 0;

        this.player2 = new Player(ctx, fieldWidth - 60, fieldHeight / 2, 50, 10, 'player 2');
        this.score2 = 0;

        // game over options
        this.isOver = false;

        // pause options
        this.isPaused = false;

        // goal celebrating options
        this.isCelebrating = false;
        this.countdownStarted = false;
        this.celebratingDuration = GAME_CELEBRATING_DURATION;
        this.countdownDuration = COUNTDOWN_DURATION;

        // Create goal area instances
        this.goalAreaLeft = new GoalArea(0, (fieldHeight - GOAL_AREA_HEIGHT) / 2, GOAL_AREA_WIDTH, GOAL_AREA_HEIGHT);
        this.goalAreaRight = new GoalArea(
            fieldWidth - GOAL_AREA_WIDTH,
            (fieldHeight - GOAL_AREA_HEIGHT) / 2,
            GOAL_AREA_WIDTH,
            GOAL_AREA_HEIGHT
        );

        // keyboard management
        document.addEventListener('keydown', (event) => this.handleKeydownEvent(event));

        // start game loop
        this.gameLoop();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (!(this.isPaused || this.isCelebrating || this.isOver)) {
            this.updateGame();
        }
    }

    updateGame() {
        // check for the end of the game
        if (this.checkGameOver()) {
            this.gameOver();
        }

        // check for goals
        if (this.detectGoal()) {
            this.playSound(goalSound);
            this.startCelebrating();
        }

        // update ball position
        this.ball.update();

        // update player 1 (bot) position
        if (this.player1 !== undefined) {
            const { x, y } = this.player1.update(this.ball); // Control Player 1 with AI
            this.player1.y = Math.max(0, Math.min(y, fieldHeight - this.player1.size)); // Keep within field boundaries
        }

        // collisions detecting
        if (this.detectBallCollisionWithWalls()) {
            this.playSound(collisionSound);
        }

        if (this.detectCollisions()) {
            this.playSound(collisionSound);
        }
    }

    checkGameOver() {
        return this.score1 >= 5 || this.score2 >= 5;
    }

    gameOver() {
        this.isPaused = true;
        alert(`Game Over! Final Score: ${this.score1} - ${this.score2}`);
        // Optionally reset the game or provide a restart option
    }

    detectCollisions() {
        [this.player1, this.player2].forEach((player) => this.fuckThis(player));
    }
    fuckThis(player) {
        // Check if player exists
        if (player === undefined) return false;

        // console.log(this.ball);
        const delta = Math.max(Math.abs(this.ball.dx), Math.abs(this.ball.dy));
        // console.log(delta);
        const collision = this.detectCollision(this.ball, player, delta);
        if (!collision.isCollision) return false;

        console.log(collision.collisionType);

        if (collision.collisionType === 'left' || collision.collisionType === 'right') {
            this.ball.bounceX();
        }

        if (collision.collisionType === 'top' || collision.collisionType === 'bottom') {
            this.ball.bounceY();
        }
        return true;
    }
    detectCollision(first, second, delta) {
        // if first.top isBetween(second.top, second.bottom)
        return detectCollision(first, second, delta);
    }

    playSound(sound) {
        if (config.soundOn) {
            sound.play();
        } else {
            // console.log(`sound: ${sound}`);
        }
    }

    draw() {
        //
        ctx.clearRect(0, 0, fieldWidth, fieldHeight);

        this.drawGoalAreas();

        // draw players
        [this.player1, this.player2].forEach((player) => {
            if (player !== undefined) player.draw();
        });
        // this.player1.draw();
        // this.player2.draw();

        this.ball.draw();
        this.drawScore();
    }

    drawScore() {
        let newText = `Score: ${this.score1} - ${this.score2}`;
        if (this.isPaused) newText += ' (paused)';
        ctx.fillText(newText, fieldWidth / 2 - 30, 20);
    }

    drawGoalAreas() {
        this.goalAreaLeft.draw(ctx);
        this.goalAreaRight.draw(ctx);
    }

    detectGoal() {
        if (this.goalAreaLeft.checkGoal(this.ball)) {
            this.score2++;
            return true;
        }
        if (this.goalAreaRight.checkGoal(this.ball)) {
            this.score1++;
            return true;
        }
        return false;
    }

    detectBallCollisionWithWalls() {
        if (
            this.ball.bottom >= fieldHeight || // bottom border collision
            this.ball.top <= 0 // top border col
        ) {
            this.ball.dy *= -1; // Bounce the ball
            return true;
        }
        if (
            this.ball.left <= 0 || // left bord
            this.ball.right > fieldWidth // right b
        ) {
            this.ball.dx *= -1; // Bounce the ball
            return true;
        }
        return false;
    }

    detectCollision_(player) {
        console.log(player.name, player.top, this.ball.y, player.bottom, '|', player.left, this.ball.x, player.right);

        if (
            (this.ball.y < player.top || this.ball.y > player.bottom) &&
            (this.ball.x < player.left || this.ball.x > player.right)
        ) {
            console.log(`${player.name}: collision with ball is not possible`);
            return false;
        }

        console.log(`${player.name}: collision with ball is possible`, player.left, this.ball.x, player.right);

        if (this.ball.dx > 0) {
            // means the ball moves right
            // detect collision with the left edge of the player
            const fuck = this.ball.right > player.left;
            if (fuck) {
                this.ball.bounceX();
            }
            return fuck;
        }
        if (this.ball.dx < 0) {
            // means the ball moves left
            // so detect collision with the right edge of the player
            const fuck = player.right > this.ball.left;
            if (fuck) {
                this.ball.bounceX();
            }
            return fuck;
        }

        return false;

        if (this.checkCollisionX(this.player1)) {
            this.ball.dx *= -1;
            return true;
        }
        if (this.checkCollisionX(this.player2)) {
            this.ball.dx *= -1;
            return true;
        }
        return false;
    }

    checkCollisionX(player) {
        // check for ball's y is inside player's y scope
        if (this.ball.y < player.top || this.ball.y > player.bottom) return false;

        if (this.ball.dx > 0) {
            // means the ball moves right
            // detect collision with the left edge of the player
            return !this.ball.right >= player.left;
        } else {
            // means the ball moves left
            // so detect collision with the right edge of the player
            return !player.right <= this.ball.left;
        }
    }

    checkCollisionY(player) {
        if (this.ball.dy > 0) {
            return this.ball.y + this.ball.radius > player.y;
        } else {
            return this.ball.y - this.ball.radius < player.y + player.size;
        }
    }

    startCelebrating() {
        this.isCelebrating = true;

        setTimeout(() => {
            this.countdownStarted = true;

            setTimeout(() => {
                this.countdownStarted = false;
                this.ball.reset();
                this.stopCelebrating();
            }, this.countdownDuration);
        }, this.celebratingDuration);
    }

    stopCelebrating() {
        this.isCelebrating = false;
    }

    handleKeydownEvent(event) {
        event.preventDefault(); // Prevent default behavior

        switch (event.code) {
            case 'KeyW':
                this.player2.y = Math.max(0, this.player2.y - this.player2.speed); // Move up
                break;
            case 'KeyS':
                this.player2.y = Math.min(fieldHeight - this.player2.size, this.player2.y + this.player2.speed); // Move down
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }
}

// Start the game
const game = new Game();
