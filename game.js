import { Ball } from './ball.js';
import { PlayerAI, Player } from './player.js';
import { config } from './config.js';
import { GoalArea } from './goalArea.js';
import { isCollidingCircleSquare } from './detect.js';
import { GameField } from './gameField.js';
import { SoundEngine } from './soundEngine.js';
import { getRandomElement } from './helpers.js';

class Game {
    constructor() {
        // create game field instance
        this.gameField = new GameField(
            config.fieldHeight,
            config.fieldWidth,
            config.fieldColor
        );

        // create ball instance
        this.ball = new Ball(
            /* x */ this.gameField.width / 2,
            /* y */ this.gameField.height / 2,
            config.ballSize,
            config.ballSpeed,
            config.ballColor
        );

        // create player instances
        this.player1 = new PlayerAI(
            /* x */ 50,
            /* y */ this.gameField.height / 2,
            config.playerSize,
            config.playerSpeed,
            'player 1',
            getRandomElement(config.playerColors),
            getRandomElement(config.playerDifficultyLevels)
        );
        this.score1 = 0;

        this.player2 = config.allBots
            ? new PlayerAI(
                  /* x */ this.gameField.width - 50 - config.playerSize,
                  /* y */ this.gameField.height / 2,
                  config.playerSize,
                  config.playerSpeed,
                  'player 2',
                  getRandomElement(config.playerColors),
                  getRandomElement(config.playerDifficultyLevels)
              )
            : new Player(
                  /* x */ this.gameField.width - 50 - config.playerSize,
                  /* y */ this.gameField.height / 2,
                  config.playerSize,
                  config.playerSpeed,
                  'player 2',
                  getRandomElement(config.playerColors)
              );
        this.score2 = 0;

        this.players = [this.player1, this.player2];

        // Create goal area instances
        this.goalAreaLeft = new GoalArea(
            /* x */ 0,
            /* y */ (this.gameField.height - config.goalAreaHeight) / 2,
            config.goalAreaWidth,
            config.goalAreaHeight
        );

        this.goalAreaRight = new GoalArea(
            this.gameField.width - config.goalAreaWidth,
            (this.gameField.height - config.goalAreaHeight) / 2,
            config.goalAreaWidth,
            config.goalAreaHeight
        );

        this.goalAreas = [this.goalAreaLeft, this.goalAreaRight];

        // init sound engine
        this.soundEngine = new SoundEngine(config.soundMap, config.soundOn);
        // game over options
        this.isOver = false;

        // pause options
        this.isPaused = false;

        // goal celebrating options
        this.isCelebrating = false;
        this.countdownStarted = false;
        this.celebratingDuration = config.gameCelebratingDuration;
        this.countdownDuration = config.countdownDuration;

        // keyboard management
        document.addEventListener('keydown', (event) => this.handleKeydownEvent(event));

        // start game
        this.ctx = this.initCanvasContext('2d');
        this.gameLoop();
    }

    initCanvasContext(contextType) {
        const canvas = document.getElementById('gameCanvas');
        return canvas.getContext(contextType);
    }

    gameLoop() {
        // update game
        if (!(this.isPaused || this.isCelebrating || this.isOver)) {
            this.updateGame();
        }
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    updateGame() {
        // check for the end of the game
        if (this.checkGameOver()) {
            this.gameOver();
        }

        // check for goals
        if (this.detectGoal()) {
            this.soundEngine.play('goal');
            this.startCelebrating();
        }

        // update ball position
        this.ball.update();

        // update ai players' position
        const bots = this.players.filter((player) => player.isControlledByAI);
        bots.forEach((bot) => {
            const { x, y } = bot.update(this.ball);
            bot.y = Math.max(0, Math.min(y, this.gameField.height - bot.size)); // Keep within field boundaries
        });

        // collisions detecting
        if (this.detectBallCollisionWithWalls()) {
            this.soundEngine.play('collision');
        }

        if (this.detectCollisions()) {
            this.soundEngine.play('collision');
        }
    }

    checkGameOver() {
        if (config.endlessGame) {
            return false;
        }
        return this.score1 >= config.finalScore || this.score2 >= config.finalScore;
    }

    gameOver() {
        this.isPaused = true;
        this.isOver = true;
        alert(`Game Over! Final Score: ${this.score1} - ${this.score2}`);
        // Optionally reset the game or provide a restart option
    }

    detectCollisions() {
        return (
            [this.player1, this.player2]
                .map((player) => {
                    this.resolveCollision(this.ball, player);
                })
                .filter((x) => x).length !== 0
        );
    }

    resolveCollision(ball, player) {
        // Проверяем на столкновение
        if (!isCollidingCircleSquare(ball, player)) {
            return false;
        }

        // Определяем ближайшую точку на квадрате
        const nearestX = Math.max(player.x, Math.min(ball.x, player.x + player.size));
        const nearestY = Math.max(player.y, Math.min(ball.y, player.y + player.size));

        // Вычисляем вектор столкновения
        const collisionVectorX = ball.x - nearestX;
        const collisionVectorY = ball.y - nearestY;

        // Определяем сторону столкновения
        if (Math.abs(collisionVectorX) > Math.abs(collisionVectorY)) {
            // Столкновение с левой или правой стороны
            if (collisionVectorX > 0) {
                // Столкновение с левой стороны
                ball.x = nearestX + ball.radius; // Перемещаем мяч вправо
            } else {
                // Столкновение с правой стороны
                ball.x = nearestX - ball.radius; // Перемещаем мяч влево
            }
            // Изменяем направление движения мяча по оси X
            ball.dx = -ball.dx; // Отскок
        } else {
            // Столкновение с верхней или нижней стороны
            if (collisionVectorY > 0) {
                // Столкновение с верхней стороны
                ball.y = nearestY + ball.radius; // Перемещаем мяч вниз
            } else {
                // Столкновение с нижней стороны
                ball.y = nearestY - ball.radius; // Перемещаем мяч вверх
            }
            // Изменяем направление движения мяча по оси Y
            ball.dy = -ball.dy; // Отскок
        }

        return true;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameField.width, this.gameField.height); // clear all
        this.gameField.draw(this.ctx);
        this.goalAreas.forEach((goalArea) => goalArea.draw(this.ctx));
        this.players.forEach((player) => player.draw(this.ctx));
        this.ball.draw(this.ctx);
        this.drawScore();
    }

    drawScore() {
        let newText = `Score: ${this.score1} - ${this.score2}`;
        if (this.isPaused) newText += ' (paused)';
        this.ctx.fillText(newText, this.gameField.width / 2 - 30, 20);
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
            this.ball.bottom >= this.gameField.height || // bottom border collision
            this.ball.top <= 0 // top border col
        ) {
            this.ball.dy *= -1; // Bounce the ball
            return true;
        }
        if (
            this.ball.left <= 0 || // left bord
            this.ball.right > this.gameField.width // right b
        ) {
            this.ball.dx *= -1; // Bounce the ball
            return true;
        }
        return false;
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
                this.player2.y = Math.min(
                    this.gameField.height - this.player2.size,
                    this.player2.y + this.player2.speed
                ); // Move down
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
