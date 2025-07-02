class Game {
    constructor() {
        // Инициализация элементов DOM
        this.gameArea = document.getElementById('gameArea');
        this.player1SpeedDisplay = document.getElementById('player1Speed');
        this.player1ScoreDisplay = document.getElementById('player1Score');
        this.player2SpeedDisplay = document.getElementById('player2Speed');
        this.player2ScoreDisplay = document.getElementById('player2Score');

        // Создание игроков и мяча
        this.player1 = new Player(50, 50, 'red', 5);
        this.player2 = new Player(100, 100, 'blue', 5);
        this.ball = new Ball(this.gameArea);

        // Настройка обработчиков событий
        this.setupEventListeners();

        // Параметры игрового цикла
        this.gameLoopInterval = null;
        this.gameLoopIntervalFps = 60;
        this.gameLoopIntervalMs = 1000 / this.gameLoopIntervalFps;

        this.isPaused = false;
        // this.pauseButton = new PauseButton(this);
        this.pauseButton = document.getElementById('pauseButton');
        this.setupPauseButton();
    }

    setupPauseButton() {
        this.pauseButton.addEventListener('click', () => {
            this.togglePause();
        });
    }

    start() {
        this.ball.initializeSpeed();
        this.startGameLoop();
        // this.pauseButton.show(); // Показываем кнопку при старте игры
    }

    startGameLoop() {
        // Не запускаем, если игра на паузе
        if (this.isPaused) return;

        // Останавливаем предыдущий цикл, если он был
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }

        // Запускаем новый игровой цикл с фиксированным интервалом
        this.gameLoopInterval = setInterval(() => {
            // Проверяем паузу перед каждой итерацией
            if (this.isPaused) {
                this.stopGameLoop();
                return;
            }

            this.ball.move(this.gameArea);
            
            // Проверка столкновений
            if (this.checkCollision(this.player1, this.ball)) {
                this.ball.bounceFromPlayer(this.player1);
            }
            if (this.checkCollision(this.player2, this.ball)) {
                this.ball.bounceFromPlayer(this.player2);
            }

            // Проверка гола
            this.checkGoal();

            // Перерисовка
            this.drawPlayers();
        }, this.gameLoopIntervalMs);
    }

    stopGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
    }

    showPauseOverlay() {
        // Создаем overlay для паузы
        const overlay = document.createElement('div');
        overlay.id = 'pauseOverlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';

        const pauseText = document.createElement('div');
        pauseText.textContent = 'ПАУЗА';
        pauseText.style.color = 'white';
        pauseText.style.fontSize = '48px';
        pauseText.style.fontWeight = 'bold';

        overlay.appendChild(pauseText);
        this.gameArea.appendChild(overlay);
    }

    removePauseOverlay() {
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            this.gameArea.removeChild(overlay);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseGame();
            this.pauseButton.textContent = 'Продолжить';
            this.showPauseOverlay();
        } else {
            this.resumeGame();
            this.pauseButton.textContent = 'Пауза';
            this.removePauseOverlay();
        }
    }

    pauseGame() {
        this.stopGameLoop();
    }

    resumeGame() {
        this.startGameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    handleKeyPress(event) {
        event.preventDefault();
        const keyActions = {
            'KeyW': () => this.player1.move('up'),
            'KeyS': () => this.player1.move('down'),
            'KeyA': () => this.player1.move('left'),
            'KeyD': () => this.player1.move('right'),
            'ArrowUp': () => this.player2.move('up'),
            'ArrowDown': () => this.player2.move('down'),
            'ArrowLeft': () => this.player2.move('left'),
            'ArrowRight': () => this.player2.move('right')
        };

        const action = keyActions[event.code];
        if (action) {
            action();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.drawPlayers();
        this.updateStats();
    }

    drawPlayers() {
        this.gameArea.innerHTML = ''; // Очистка области игры
        this.player1.draw(this.gameArea);
        this.player2.draw(this.gameArea);
        this.ball.draw(this.gameArea);
    }

    updateStats() {
        this.player1SpeedDisplay.textContent = this.player1.speed;
        this.player1ScoreDisplay.textContent = this.player1.score;
        this.player2SpeedDisplay.textContent = this.player2.speed;
        this.player2ScoreDisplay.textContent = this.player2.score;
    }

    showGoalMessage(player) {
        // Удаляем предыдущее сообщение, если оно есть
        const existingMessage = this.gameArea.querySelector('.goal-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('goal-message'); // Добавляем класс для идентификации
        messageDiv.textContent = `Гол! Очки игрока ${player === this.player1 ? '1' : '2'}`;
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.fontSize = '24px';
        messageDiv.style.color = 'red';
        messageDiv.style.zIndex = '100';
        messageDiv.style.animation = 'fadeInOut 2s ease-in-out';

        document.body.appendChild(messageDiv);

        // Используем стрелочную функцию для сохранения контекста
        const removeMessage = () => {
            const currentMessage = this.gameArea.querySelector('.goal-message');
            if (currentMessage) {
                currentMessage.remove();
            }
        };

        // Используем setTimeout с привязкой к текущему сообщению
        setTimeout(removeMessage, 2000);
    }

    checkGoal() {
        const gameAreaWidth = this.gameArea.clientWidth;
        const gameAreaHeight = this.gameArea.clientHeight;
        
        // Гол для второго игрока (мяч слева)
        if (this.ball.x <= 0) {
            this.player2.score++;
            this.showGoalMessage(this.player2);
            this.resetGame();
        }
        
        // Гол для первого игрока (мяч справа)
        if (this.ball.x + this.ball.size >= gameAreaWidth) {
            this.player1.score++;
            this.showGoalMessage(this.player1);
            this.resetGame();
        }
    }

    gameLoop() {
        this.ball.move(this.gameArea);
        
        // Проверка столкновений
        if (this.checkCollision(this.player1, this.ball)) {
            this.ball.bounceFromPlayer(this.player1);
        }
        if (this.checkCollision(this.player2, this.ball)) {
            this.ball.bounceFromPlayer(this.player2);
        }

        // Проверка гола
        this.checkGoal();

        this.drawPlayers();
        requestAnimationFrame(() => this.gameLoop());
    }

    checkCollision(player, ball) {
        const playerCenterX = player.x + player.size / 2;
        const playerCenterY = player.y + player.size / 2;
        const ballCenterX = ball.x + ball.size / 2;
        const ballCenterY = ball.y + ball.size / 2;

        const distanceX = Math.abs(playerCenterX - ballCenterX);
        const distanceY = Math.abs(playerCenterY - ballCenterY);

        const collisionThreshold = (player.size + ball.size) / 2;

        return (
            distanceX < collisionThreshold &&
            distanceY < collisionThreshold
        );
    }

    resetGame() {
        // Сброс позиций игроков
        this.player1.x = 50;
        this.player1.y = 50;
        this.player2.x = this.gameArea.clientWidth - 70;
        this.player2.y = this.gameArea.clientHeight - 70;

        // Сброс мяча
        this.ball.x = this.gameArea.clientWidth / 2;
        this.ball.y = this.gameArea.clientHeight / 2;
        this.ball.initializeSpeed();

        this.updateDisplay();
    }
}

class Player {
    constructor(x, y, color, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.score = 0;
        this.size = 20;
    }

    move(direction) {
        const gameArea = document.getElementById('gameArea');
        const gameAreaWidth = gameArea.clientWidth;
        const gameAreaHeight = gameArea.clientHeight;

        switch (direction) {
            case 'up':
                this.y = Math.max(0, this.y - this.speed);
                break;
            case 'down':
                this.y = Math.min(gameAreaHeight - this.size, this.y + this.speed);
                break;
            case 'left':
                this.x = Math.max(0, this.x - this.speed);
                break;
            case 'right':
                this.x = Math.min(gameAreaWidth - this.size, this.x + this.speed);
                break;
        }
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

class Ball {
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

        // Отскок от стен
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
        // Логика отскока мяча от игрока
        this.speedX = player.x < this.x ? Math.abs(this.speedX) : -Math.abs(this.speedX);
    }
}

// Создание и запуск игры
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
});
