import { Ball } from './ball.js';
import { PlayerAI, Player } from './player.js';
import { config } from './config.js';
import { GoalArea } from './goalArea.js';
import { GameField } from './gameField.js';
import { getRandomElement } from './helpers.js';
import { Attack } from './spell.js';
import { CollisionManager } from './collisionManager.js';
import { ScoreManager } from './scoreManager.js';
import { SoundManager } from './soundManager.js';
import { AnimatedObject } from './animatedObject.js';

// move to attack logic
function slowdownAttack() {
    return new Attack('Slowdown', 'slowdown', 1000);
}

function createBlowAnimation() {
    return new AnimatedObject();
}

class Game {
    constructor() {
        this.imageSources = null;

        // create separate animations logic and move there
        this.hitAnimationFrames = null;

        // visible objects
        // objects that are drawn on each step of the game loop
        this.visibleObjects = [];

        // animations
        this.animations = [];

        // static objects
        // (never update their position)
        this.static = [];

        // dynamic objects
        // (may update their position)
        this.dynamic = [];

        // settings
        this.settings = config;

        // goal area
        this.gameField = new GameField(
            this.settings.gameField.height,
            this.settings.gameField.width,
            this.settings.ball.size, // player zone offset
            this.settings.gameField.color,
            this.settings.playerZoneBorderColor
        );

        // add game field to static and visible objects
        this.static.push(this.gameField);
        this.visibleObjects.push(this.gameField);

        // goal areas
        this.goalAreaLeft = new GoalArea(
            /* x */ 0,
            /* y */ (this.gameField.height - this.settings.goalArea.height) / 2,
            /* width */ this.settings.ball.size,
            this.settings.goalArea.height
        );

        this.goalAreaRight = new GoalArea(
            this.gameField.width - this.settings.ball.size,
            (this.gameField.height - this.settings.goalArea.height) / 2,
            this.settings.ball.size,
            this.settings.goalArea.height
        );

        this.goalAreas = [this.goalAreaLeft, this.goalAreaRight];

        // add goal areas to static and visible objects
        this.static.push(...this.goalAreas);
        this.visibleObjects.push(...this.goalAreas);

        // ball
        this.ball = new Ball(
            /* x */ this.gameField.width / 2,
            /* y */ this.gameField.height / 2,
            /* radius */ this.settings.ball.size / 2,
            this.settings.ball.speed,
            this.settings.ball.color
        );

        // add ball to dynamic and visible objects
        this.dynamic.push(this.ball);
        this.visibleObjects.push(this.ball);

        const player1Color = getRandomElement(this.settings.player.colors);
        this.player1 = new PlayerAI(
            /* x */ this.settings.player.startPos,
            /* y */ this.gameField.height / 2,
            /* height */ this.settings.player.size,
            /* width */ this.settings.player.size,
            this.settings.player.speed,
            'player 1',
            player1Color,
            [slowdownAttack()],
            getRandomElement(this.settings.player.difficultyLevels)
        );

        const filteredColors = this.settings.player.colors.filter(
            (color) => color !== player1Color
        );
        this.player2 = this.settings.debug.allBots
            ? new PlayerAI(
                  /* x */ this.gameField.width -
                      this.settings.player.startPos -
                      this.settings.player.size,
                  /* y */ this.gameField.height / 2,
                  this.settings.player.size,
                  this.settings.player.size,
                  this.settings.player.speed,
                  'player 2',
                  getRandomElement(filteredColors),
                  [slowdownAttack()],
                  getRandomElement(this.settings.player.difficultyLevels)
              )
            : new Player(
                  /* x */ this.gameField.width -
                      this.settings.player.startPos -
                      this.settings.player.size,
                  /* y */ this.gameField.height / 2,
                  this.settings.player.size,
                  this.settings.player.size,
                  this.settings.player.speed,
                  'player 2',
                  getRandomElement(filteredColors),
                  [slowdownAttack()]
              );

        this.players = [this.player1, this.player2];

        // add all players to dynamic and visible objects
        this.dynamic.push(...this.players);
        this.visibleObjects.push(...this.players);

        // init spells
        this.spells = [];

        // collision manager
        this.collisionManager = new CollisionManager(this);

        // score manager
        this.scoreManager = new ScoreManager(this);
        this.visibleObjects.push(this.scoreManager.scoreTable); // add score table to visible objects

        // sound engine
        this.soundManager = new SoundManager(this);

        // game over options
        this.isOver = false;

        // pause options
        this.isPaused = false;

        // goal celebrating options
        this.isCelebrating = false;
        this.countdownStarted = false;
        this.celebratingDuration = this.settings.gameCelebratingDuration;
        this.countdownDuration = this.settings.countdownDuration;

        // canvas props
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = null;
    }

    setImageSources(imageSources) {
        // init images
        this.imageSources = imageSources;

        // create skin manager and move to
        const playerSkins = [
            this.imageSources['/assets/bot.png'],

            this.imageSources['/assets/bot-damaged.png'],
        ];
        this.players.forEach((player) => player.setSkins(playerSkins));

        this.ball.setSkin(this.imageSources['/assets/ball.png']);

        // create separate animations logic and move there
        this.hitAnimationFrames = [
            this.imageSources['/assets/attack-blows-01.png'],
            this.imageSources['/assets/attack-blows-02.png'],
            this.imageSources['/assets/attack-blows-03.png'],
            this.imageSources['/assets/attack-blows-04.png'],
        ];
    }

    start() {
        // event listeners
        document.addEventListener('keydown', (event) => this.handleKeydownEvent(event));

        // get canvas context
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
        const currentScoringPlayer = this.resolveGoals();

        if (currentScoringPlayer !== null) {
            this.soundManager.play('goal');
            this.scoreManager.increaseScore(currentScoringPlayer);
            this.startCelebrating();
        }

        // check for collisions
        const collisions = this.collisionManager.checkCollisions();

        if (collisions.length) {
            this.collisionManager.collisionResolving(collisions);
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

        // update animation
        this.animations.forEach((animation) => {
            // check if animation stopped if true remove it
            if (animation.stopped) {
                this.animations = this.animations.filter((a) => a.id !== animation.id);
                this.visibleObjects = this.visibleObjects.filter((a) => a.id !== animation.id);
            } else {
                animation.update();
            }
        });
    }

    checkGameOver() {
        if (this.settings.debug.endlessGame) return false;
        return (
            this.score1 >= this.settings.finalScore || this.score2 >= this.settings.finalScore
        );
    }

    gameOver() {
        this.isPaused = true;
        this.isOver = true;
        alert(`Game Over! Final Score: ${this.score1} - ${this.score2}`);
        // Optionally reset the game or provide a restart option
    }

    defaultUpdate() {
        // move ball
        this.ball.update();

        // move spells
        this.spells.forEach((spell) => spell.update());

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

        const fn = this.settings.debug.enableHorizontalMovement
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
    }

    // if there is a goal returns player that is scoring else returns null
    resolveGoals() {
        if (this.goalAreaLeft.checkGoal(this.ball)) {
            return this.player2;
        }

        if (this.goalAreaRight.checkGoal(this.ball)) {
            return this.player1;
        }

        return null;
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

// images preload
const images = {};
const imageSources = [
    '/assets/bot.png',
    '/assets/bot-damaged.png',
    '/assets/ball.png',
    '/assets/attack-blows-01.png',
    '/assets/attack-blows-02.png',
    '/assets/attack-blows-03.png',
    '/assets/attack-blows-04.png',
];

function loadImages(sources) {
    return new Promise((resolve) => {
        let loadedImages = 0;
        sources.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                images[src] = img;
                loadedImages++;
                if (loadedImages === sources.length) {
                    resolve();
                }
            };
        });
    });
}

loadImages(imageSources).then(() => {
    game.setImageSources(images);
    game.start(); // Запускаем игру после загрузки изображений
});
