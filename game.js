import { Ball } from './ball.js';
import { PlayerAI, Player } from './player.js';
import { config } from './config.js';
import { GoalArea } from './goalArea.js';
import { GameField } from './gameField.js';
import { SoundEngine } from './soundEngine.js';
import { getRandomElement } from './helpers.js';

class Game {
    constructor() {
        // visible objects are drawn on each step of the game loop
        this.visibles = [];

        // static objects
        // (never update their position)
        this.static = [];

        this.gameField = new GameField(
            config.fieldHeight,
            config.fieldWidth,
            config.ballSize, // player zone offset
            config.fieldColor,
            config.playerZoneBorderColor
        );

        // add game field to static and visible objects
        this.static.push(this.gameField);
        this.visibles.push(this.gameField);

        this.goalAreaLeft = new GoalArea(
            /* x */ 0,
            /* y */ (this.gameField.height - config.goalAreaHeight) / 2,
            /* width */ config.ballSize,
            config.goalAreaHeight
        );

        this.goalAreaRight = new GoalArea(
            this.gameField.width - config.ballSize,
            (this.gameField.height - config.goalAreaHeight) / 2,
            config.ballSize,
            config.goalAreaHeight
        );

        this.goalAreas = [this.goalAreaLeft, this.goalAreaRight];

        // add goal areas to static and visible objects
        this.static.concat(this.goalAreas);
        this.visibles = this.visibles.concat(this.goalAreas);

        // dynamic objects
        // dynamic means they (may) update their position on each step of the game loop
        this.dynamic = [];

        this.ball = new Ball(
            /* x */ this.gameField.width / 2,
            /* y */ this.gameField.height / 2,
            /* radius */ config.ballSize / 2,
            config.ballSpeed,
            config.ballColor
        );

        // add ball to dynamic and visible objects
        this.dynamic.push(this.ball);
        this.visibles.push(this.ball);

        const player1Color = getRandomElement(config.playerColors);
        this.player1 = new PlayerAI(
            /* x */ 50,
            /* y */ this.gameField.height / 2,
            config.playerSize,
            config.playerSpeed,
            'player 1',
            player1Color,
            getRandomElement(config.playerDifficultyLevels)
        );
        this.score1 = 0;

        const filteredColors = config.playerColors.filter((color) => color !== player1Color);
        this.player2 = config.allBots
            ? new PlayerAI(
                  /* x */ this.gameField.width - 50 - config.playerSize,
                  /* y */ this.gameField.height / 2,
                  config.playerSize,
                  config.playerSpeed,
                  'player 2',
                  getRandomElement(filteredColors),
                  getRandomElement(config.playerDifficultyLevels)
              )
            : new Player(
                  /* x */ this.gameField.width - 50 - config.playerSize,
                  /* y */ this.gameField.height / 2,
                  config.playerSize,
                  config.playerSpeed,
                  'player 2',
                  getRandomElement(filteredColors)
              );
        this.score2 = 0;

        this.players = [this.player1, this.player2];

        // add all players to dynamic and visible objects
        this.dynamic.concat(this.players);
        this.visibles = this.visibles.concat(this.players);

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
        // check for the end of the game
        if (this.checkGameOver()) {
            this.gameOver();
            return;
        }

        // update game
        if (!(this.isPaused || this.isCelebrating || this.isOver)) {
            this.updateGame();
        }

        // update display
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    updateGame() {
        // check for goals
        if (this.resolveGoals()) {
            this.soundEngine.play('goal');
            this.startCelebrating();
        }

        // check for collisions
        const collisions = this.checkCollisions();

        if (collisions.length) {
            this.collisionResolving(collisions);
        } else {
            this.defaultUpdate();
        }
    }

    checkGameOver() {
        if (config.endlessGame) return false;
        return this.score1 >= config.finalScore || this.score2 >= config.finalScore;
    }

    gameOver() {
        this.isPaused = true;
        this.isOver = true;
        alert(`Game Over! Final Score: ${this.score1} - ${this.score2}`);
        // Optionally reset the game or provide a restart option
    }

    checkCollisions() {
        const collisions = [];

        // ball x walls
        if (this.ball.top <= 0) {
            collisions.push({ type: 'ball x top wall' });
        }

        if (this.ball.right >= this.gameField.width) {
            collisions.push({ type: 'ball x right wall' });
        }

        if (this.ball.bottom >= this.gameField.height) {
            collisions.push({ type: 'ball x bottom wall' });
        }

        if (this.ball.left <= 0) {
            collisions.push({ type: 'ball x left wall' });
        }

        // ball x players
        this.players.forEach((player) => {
            if (player.left <= this.ball.x && this.ball.x <= player.right) {
                if (
                    this.ball.bottom >= player.top &&
                    this.ball.bottom < player.bottom &&
                    this.ball.dy > 0
                ) {
                    collisions.push({ type: 'ball x player top', player });
                }

                if (
                    this.ball.top <= player.bottom &&
                    this.ball.top > player.top &&
                    this.ball.dy < 0
                ) {
                    collisions.push({ type: 'ball x player bottom', player });
                }
            }

            if (player.top <= this.ball.y && this.ball.y <= player.bottom) {
                if (
                    this.ball.right >= player.left &&
                    this.ball.right < player.right &&
                    this.ball.dx > 0
                ) {
                    collisions.push({ type: 'ball x player left', player });
                }

                if (
                    this.ball.left <= player.right &&
                    this.ball.left > player.left &&
                    this.ball.dx < 0
                ) {
                    collisions.push({ type: 'ball x player right', player });
                }
            }
        });

        return collisions;
    }

    collisionResolving(collisions) {
        collisions.forEach((collision) => {
            if (config.loggingEnabled) console.log(collision.type);

            switch (collision.type) {
                // ball x walls
                case 'ball x top wall':
                    this.ball.y = this.ball.radius + 1;
                    this.ball.dy = -this.ball.dy;
                    break;

                case 'ball x right wall':
                    this.ball.x = this.gameField.width - this.ball.radius - 1;
                    this.ball.dx = -this.ball.dx;
                    break;

                case 'ball x bottom wall':
                    this.ball.y = this.gameField.height - this.ball.radius - 1;
                    this.ball.dy = -this.ball.dy;
                    break;

                case 'ball x left wall':
                    this.ball.x = this.ball.radius + 1;
                    this.ball.dx = -this.ball.dx;
                    break;

                // ball x players
                case 'ball x player top':
                    this.ball.y = collision.player.top - this.ball.radius - 1;
                    this.ball.dy = -this.ball.dy;
                    break;

                case 'ball x player right':
                    this.ball.x = collision.player.right + this.ball.radius + 1;
                    this.ball.dx = -this.ball.dx;
                    break;

                case 'ball x player bottom':
                    this.ball.y = collision.player.bottom + this.ball.radius + 1;
                    this.ball.dy = -this.ball.dy;
                    break;

                case 'ball x player left':
                    this.ball.x = collision.player.left - this.ball.radius - 1;
                    this.ball.dx = -this.ball.dx;
                    break;
            }
        });
    }

    defaultUpdate() {
        // update ball position
        this.ball.update();

        // update ai players' position
        const bots = this.players.filter((player) => player.isControlledByAI);
        bots.forEach((bot) => {
            const { x, y } = bot.update(this.ball);
            bot.y = Math.max(
                this.gameField.playerZone.y,
                Math.min(
                    y,
                    this.gameField.playerZone.y + this.gameField.playerZone.height - bot.size
                )
            ); // Keep within field boundaries
        });
    }

    draw() {
        // clear
        this.ctx.clearRect(0, 0, this.gameField.width, this.gameField.height);

        // draw objects
        this.visibles.forEach((visible) => visible.draw(this.ctx));

        if (this.collisions !== undefined) {
            this.collisions.forEach((collision) => {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(collision.x, collision.y, 5, 5);
            });
        }

        this.drawScore();
    }

    drawScore() {
        let newText = `Score: ${this.score1} - ${this.score2}`;
        if (this.isPaused) newText += ' (paused)';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(newText, this.gameField.width / 2 - 30, 12);
    }

    resolveGoals() {
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
                this.isPaused = !this.isPaused;
                break;
        }
    }
}

// Start the game
const game = new Game();
