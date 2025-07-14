import { Player } from './player.js';
import { Ball } from './ball.js';
import { GoalArea } from './goal-area.js'; // Import the GoalArea class

export class Game {
    constructor() {
        // Initialization of DOM elements
        this.gameArea = document.getElementById('gameArea');
        this.player1SpeedDisplay = document.getElementById('player1Speed');
        this.player1ScoreDisplay = document.getElementById('player1Score');
        this.player2SpeedDisplay = document.getElementById('player2Speed');
        this.player2ScoreDisplay = document.getElementById('player2Score');

        // Create players and ball
        this.player1 = new Player(50, 50, 'red', 5);
        this.player2 = new Player(100, 100, 'blue', 5);
        this.ball = new Ball(this.gameArea);

        // Create goal areas
        const goalWidth = 10; // Width of the goal area
        const goalHeight = 100; // Height of the goal area
        this.player1GoalArea = new GoalArea(0, (this.gameArea.clientHeight - goalHeight) / 2, goalWidth, goalHeight);
        this.player2GoalArea = new GoalArea(
            this.gameArea.clientWidth - goalWidth,
            (this.gameArea.clientHeight - goalHeight) / 2,
            goalWidth,
            goalHeight
        );

        // Setup event listeners
        this.setupEventListeners();

        // Game loop parameters
        this.gameLoopInterval = null;
        this.gameLoopIntervalFps = 60;
        this.gameLoopIntervalMs = 1000 / this.gameLoopIntervalFps;

        this.isPaused = false;
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('pauseButton').addEventListener('click', this.togglePause.bind(this));
    }

    start() {
        this.ball.initializeSpeed();
        this.startGameLoop();
    }

    startGameLoop() {
        if (this.isPaused) return;
        this.gameLoop(); // Start the game loop
    }

    gameLoop() {
        let lastTime = 0;

        const loop = (currentTime) => {
            if (this.isPaused) {
                requestAnimationFrame(loop);
                return;
            }

            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Update game state
            this.updateGame();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop); // Start the loop
    }

    updateGame() {
        this.ball.move(this.gameArea);
        this.checkCollisions();
        this.checkGoals();
        this.drawPlayers();
    }

    checkCollisions() {
        if (this.checkCollision(this.player1, this.ball)) {
            this.ball.bounceFromPlayer(this.player1);
        }
        if (this.checkCollision(this.player2, this.ball)) {
            this.ball.bounceFromPlayer(this.player2);
        }
    }

    checkCollision(player, ball) {
        const playerCenterX = player.x + player.size / 2;
        const playerCenterY = player.y + player.size / 2;
        const ballCenterX = ball.x + ball.size / 2;
        const ballCenterY = ball.y + ball.size / 2;

        const distanceX = Math.abs(playerCenterX - ballCenterX);
        const distanceY = Math.abs(playerCenterY - ballCenterY);

        const collisionThreshold = (player.size + ball.size) / 2;

        return distanceX < collisionThreshold && distanceY < collisionThreshold;
    }

    checkGoals() {
        // Goal for player 2 (ball in player 1's goal area)
        if (this.player1GoalArea.isBallCrossing(this.ball.x, this.ball.y, this.ball.size)) {
            this.player2.score++;
            this.showGoalMessage(this.player2);
            this.resetGame();
        }

        // Goal for player 1 (ball in player 2's goal area)
        if (this.player2GoalArea.isBallCrossing(this.ball.x, this.ball.y, this.ball.size)) {
            this.player1.score++;
            this.showGoalMessage(this.player1);
            this.resetGame();
        }
    }

    handleKeyPress(event) {
        event.preventDefault();

        // Prevent any actions if the game is paused
        if (this.isPaused) return;

        const keyActions = {
            KeyW: () => this.player1.move('up', this.player1GoalArea, this.player2GoalArea),
            KeyS: () => this.player1.move('down', this.player1GoalArea, this.player2GoalArea),
            KeyA: () => this.player1.move('left', this.player1GoalArea, this.player2GoalArea),
            KeyD: () => this.player1.move('right', this.player1GoalArea, this.player2GoalArea),
            ArrowUp: () => this.player2.move('up', this.player2GoalArea, this.player1GoalArea),
            ArrowDown: () => this.player2.move('down', this.player2GoalArea, this.player1GoalArea),
            ArrowLeft: () => this.player2.move('left', this.player2GoalArea, this.player1GoalArea),
            ArrowRight: () => this.player2.move('right', this.player2GoalArea, this.player1GoalArea),
        };

        const action = keyActions[event.code];
        if (action) {
            action();
            this.updateDisplay();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.textContent = this.isPaused ? 'Продолжить' : 'Пауза';
        this.isPaused ? this.showPauseOverlay() : this.removePauseOverlay();
    }

    stopGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
    }

    showPauseOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'pauseOverlay';
        overlay.classList.add('pause-overlay');

        const pauseText = document.createElement('div');
        pauseText.textContent = 'ПАУЗА';
        pauseText.classList.add('pause-text');

        overlay.appendChild(pauseText);
        this.gameArea.appendChild(overlay);
    }

    removePauseOverlay() {
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            this.gameArea.removeChild(overlay);
        }
    }

    pauseGame() {
        this.stopGameLoop();
    }

    resumeGame() {
        this.startGameLoop();
    }

    updateDisplay() {
        this.drawPlayers();
        this.updateStats();
    }

    drawPlayers() {
        this.gameArea.innerHTML = ''; // Очистка области игры
        this.drawGoalAreas(); // Draw goal areas
        this.player1.draw(this.gameArea);
        this.player2.draw(this.gameArea);
        this.ball.draw(this.gameArea);
    }

    drawGoalAreas() {
        // Draw goal area for player 1 (left side)
        const player1Goal = document.createElement('div');
        player1Goal.style.position = 'absolute';
        player1Goal.style.left = '0px';
        player1Goal.style.top = (this.gameArea.clientHeight - 100) / 2 + 'px'; // Center vertically
        player1Goal.style.width = '10px';
        player1Goal.style.height = '100px';
        player1Goal.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Semi-transparent red
        this.gameArea.appendChild(player1Goal);

        // Draw goal area for player 2 (right side)
        const player2Goal = document.createElement('div');
        player2Goal.style.position = 'absolute';
        player2Goal.style.right = '0px';
        player2Goal.style.top = (this.gameArea.clientHeight - 100) / 2 + 'px'; // Center vertically
        player2Goal.style.width = '10px';
        player2Goal.style.height = '100px';
        player2Goal.style.backgroundColor = 'rgba(0, 0, 255, 0.3)'; // Semi-transparent blue
        this.gameArea.appendChild(player2Goal);
    }

    updateStats() {
        this.player1SpeedDisplay.textContent = this.player1.speed;
        this.player1ScoreDisplay.textContent = this.player1.score;
        this.player2SpeedDisplay.textContent = this.player2.speed;
        this.player2ScoreDisplay.textContent = this.player2.score;
    }

    showGoalMessage(player) {
        // Remove the previous message if it exists
        const existingMessage = this.gameArea.querySelector('.goal-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('goal-message');
        messageDiv.textContent = `Гол! Очки игрока ${player === this.player1 ? '1' : '2'}`;

        this.gameArea.appendChild(messageDiv);

        // Remove the message after 2 seconds
        setTimeout(() => {
            const currentMessage = this.gameArea.querySelector('.goal-message');
            if (currentMessage) {
                currentMessage.remove();
            }
        }, 2000);
    }

    resetGame() {
        // Disable player movement temporarily
        this.isPaused = true;

        // Show the goal message
        setTimeout(() => {
            // Reset player positions
            this.player1.x = 50;
            this.player1.y = 50;
            this.player2.x = this.gameArea.clientWidth - 70;
            this.player2.y = this.gameArea.clientHeight - 70;

            // Reset ball position
            this.ball.x = this.gameArea.clientWidth / 2;
            this.ball.y = this.gameArea.clientHeight / 2;
            this.ball.initializeSpeed();

            this.updateDisplay();
            this.isPaused = false; // Allow movement again
        }, 2000); // 2 seconds delay
    }

    startCountdown() {
        this.isPaused = true; // Pause the game during countdown
        let countdown = 3; // 3 seconds countdown
        const countdownDisplay = document.createElement('div');
        countdownDisplay.classList.add('countdown-display');
        countdownDisplay.style.position = 'absolute';
        countdownDisplay.style.top = '50%';
        countdownDisplay.style.left = '50%';
        countdownDisplay.style.transform = 'translate(-50%, -50%)';
        countdownDisplay.style.fontSize = '48px';
        countdownDisplay.style.color = 'white';
        this.gameArea.appendChild(countdownDisplay);

        const countdownInterval = setInterval(() => {
            countdownDisplay.textContent = countdown;
            countdown--;
            if (countdown < 0) {
                clearInterval(countdownInterval);
                countdownDisplay.remove();
                this.isPaused = false; // Resume the game
                this.startGameLoop(); // Start the game loop
            }
        }, 1000);
    }
}
