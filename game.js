import { Ball } from './ball.js';
import { PlayerAI, Player } from './player.js';
import { config } from './config.js';
import { GoalArea } from './goalArea.js';
import { GameField } from './gameField.js';
import { SoundEngine } from './soundEngine.js';
import { getRandomElement } from './helpers.js';
import { Attack } from './spell.js';

function slowdownAttack() {
    return new Attack('Slowdown', 'slowdown', 1000);
}

class Game {
    constructor() {
        // visible objects are drawn on each step of the game loop
        this.visibleObjects = [];

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
        this.visibleObjects.push(this.gameField);

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
        this.static.push(...this.goalAreas);
        this.visibleObjects.push(...this.goalAreas);

        // dynamic objects
        // (may update their position on each step of the game loop)
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
        this.visibleObjects.push(this.ball);

        const player1Color = getRandomElement(config.player.colors);
        this.player1 = new PlayerAI(
            /* x */ config.player.startPos,
            /* y */ this.gameField.height / 2,
            /* height */ config.player.size,
            /* width */ config.player.size,
            config.player.speed,
            'player 1',
            player1Color,
            [slowdownAttack()],
            getRandomElement(config.player.difficultyLevels)
        );
        this.score1 = 0;

        const filteredColors = config.player.colors.filter((color) => color !== player1Color);
        this.player2 = config.debug.allBots
            ? new PlayerAI(
                  /* x */ this.gameField.width - config.player.startPos - config.player.size,
                  /* y */ this.gameField.height / 2,
                  config.player.size,
                  config.player.size,
                  config.player.speed,
                  'player 2',
                  getRandomElement(filteredColors),
                  [slowdownAttack()],
                  getRandomElement(config.player.difficultyLevels)
              )
            : new Player(
                  /* x */ this.gameField.width - config.player.startPos - config.player.size,
                  /* y */ this.gameField.height / 2,
                  config.player.size,
                  config.player.size,
                  config.player.speed,
                  'player 2',
                  getRandomElement(filteredColors),
                  [slowdownAttack()]
              );
        this.score2 = 0;

        this.players = [this.player1, this.player2];

        // init spells
        this.spells = [];

        // add all players to dynamic and visible objects
        this.dynamic.push(...this.players);
        this.visibleObjects.push(...this.players);

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

        // canvas props
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = null;
    }

    start() {
        document.addEventListener('keydown', (event) => this.handleKeydownEvent(event));
        this.ctx = this.canvas.getContext('2d');
        this.gameLoop();
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

        // attacking
        [
            {
                player: this.player1,
                direction: 'right',
            },
            {
                player: this.player2,
                direction: 'left',
            },
        ].forEach(({ player, direction }) => {
            const spell = player.fire(0, direction);
            if (spell) {
                this.spells.push(spell);
                this.visibleObjects.push(spell);
            }
        });
    }

    checkGameOver() {
        if (config.debug.endlessGame) return false;
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

        const ballWallCollisions = this.checkBallWallCollision(this.ball, this.gameField);
        collisions.push(...ballWallCollisions);

        this.spells.forEach((spell) => {
            const spellWallCollisions = this.checkSpellWallCollision(spell, this.gameField);
            collisions.push(...spellWallCollisions);
        });

        this.players.forEach((player) => {
            const ballPlayerCollisions = this.checkBallPlayerCollision(this.ball, player);
            const spellPlayerCollisions = this.checkSpellPlayerCollision(this.spells, player);
            collisions.push(...ballPlayerCollisions);
            collisions.push(...spellPlayerCollisions);
        });

        return collisions;
    }

    checkBallWallCollision(ball, gameField) {
        const collisions = [];

        if (ball.top <= 0) {
            collisions.push({ type: 'ball x top wall' });
        } else if (ball.right >= gameField.width) {
            collisions.push({ type: 'ball x right wall' });
        } else if (ball.bottom >= gameField.height) {
            collisions.push({ type: 'ball x bottom wall' });
        } else if (ball.left <= 0) {
            collisions.push({ type: 'ball x left wall' });
        }

        return collisions;
    }

    checkBallPlayerCollision(ball, player) {
        const collisions = [];

        // Проверка коллизий по вертикали
        if (player.left <= ball.x && ball.x <= player.right) {
            if (ball.bottom >= player.top && ball.bottom < player.bottom && ball.dy > 0) {
                collisions.push({ type: 'ball x player top', player });
            } else if (ball.top <= player.bottom && ball.top > player.top && ball.dy < 0) {
                collisions.push({ type: 'ball x player bottom', player });
            }
        }

        // Проверка коллизий по горизонтали
        if (player.top <= ball.y && ball.y <= player.bottom) {
            if (ball.right >= player.left && ball.right < player.right && ball.dx > 0) {
                collisions.push({ type: 'ball x player left', player });
            } else if (ball.left <= player.right && ball.left > player.left && ball.dx < 0) {
                collisions.push({ type: 'ball x player right', player });
            }
        }

        return collisions;
    }

    checkSpellWallCollision(spell, gameField) {
        const collisions = [];

        if (
            spell.top <= 0 ||
            spell.right >= gameField.width ||
            spell.bottom >= gameField.height ||
            spell.left <= 0
        ) {
            collisions.push({ type: 'spell x wall', spell });
        }

        return collisions;
    }

    checkSpellPlayerCollision(spells, player) {
        const collisions = [];

        spells.forEach((spell) => {
            if (spell.isColliding(player)) {
                collisions.push({ type: 'spell x player', player, spell });
            }
        });

        return collisions;
    }

    collisionResolving(collisions) {
        collisions.forEach((collision) => {
            if (config.debug.loggingEnabled) console.log(collision.type);

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

                case 'spell x wall':
                    // remove spell
                    this.spells = this.spells.filter(
                        (spell) => spell.id !== collision.spell.id
                    );
                    this.visibleObjects = this.visibleObjects.filter(
                        (spell) => spell.id !== collision.spell.id
                    );

                    break;

                // spell x player
                case 'spell x player':
                    // remove spell
                    this.spells = this.spells.filter(
                        (spell) => spell.id !== collision.spell.id
                    );
                    this.visibleObjects = this.visibleObjects.filter(
                        (spell) => spell.id !== collision.spell.id
                    );

                    collision.player.getDamaged(collision.spell.type);
                    break;
            }
        });
    }

    defaultUpdate() {
        this.ball.update();

        this.spells.forEach((spell) => {
            spell.update();
        });

        // ai players
        const bots = this.players.filter((player) => player.isControlledByAI);

        const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

        const updateBotPosition = (bot, x, y) => {
            bot.x = clamp(
                x,
                this.gameField.playerZone.x,
                this.gameField.playerZone.x + this.gameField.playerZone.width - bot.width
            );
            bot.y = clamp(
                y,
                this.gameField.playerZone.y,
                this.gameField.playerZone.y + this.gameField.playerZone.height - bot.height
            );
        };

        const fn = config.debug.enableHorizontalMovement
            ? (bot) => {
                  const { x, y } = bot.follow(this.ball);
                  updateBotPosition(bot, x, y);
              }
            : (bot) => {
                  const y = bot.followY(this.ball);
                  updateBotPosition(bot, bot.x, y);
              };

        bots.forEach(fn);
    }

    draw() {
        // clear
        this.ctx.clearRect(0, 0, this.gameField.width, this.gameField.height);

        // draw objects
        this.visibleObjects.forEach((visibleObject) => visibleObject.draw(this.ctx));

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
                    this.gameField.height - this.player2.height,
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
game.start();
