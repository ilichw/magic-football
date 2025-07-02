// script.js
const gameArea = document.getElementById('gameArea');
const player1SpeedDisplay = document.getElementById('player1Speed');
const player1ScoreDisplay = document.getElementById('player1Score');
const player2SpeedDisplay = document.getElementById('player2Speed');
const player2ScoreDisplay = document.getElementById('player2Score');

// Пример создания простого объекта игрока
const player1 = {
    x: 50,
    y: 50,
    color: 'red',
    speed: 5,
    score: 0
};

const player2 = {
    x: 100,
    y: 100,
    color: 'blue',
    speed: 5,
    score: 0
};

// Функция для отрисовки игроков
function drawPlayers() {
    gameArea.innerHTML = ''; // Очистка области игры
    const player1Div = document.createElement('div');
    player1Div.style.position = 'absolute';
    player1Div.style.left = player1.x + 'px';
    player1Div.style.top = player1.y + 'px';
    player1Div.style.width = '20px';
    player1Div.style.height = '20px';
    player1Div.style.backgroundColor = player1.color;

    const player2Div = document.createElement('div');
    player2Div.style.position = 'absolute';
    player2Div.style.left = player2.x + 'px';
    player2Div.style.top = player2.y + 'px';
    player2Div.style.width = '20px';
    player2Div.style.height = '20px';
    player2Div.style.backgroundColor = player2.color;

    gameArea.appendChild(player1Div);
    gameArea.appendChild(player2Div);
}

// Функция для управления игроками
function movePlayer(player, direction) {
    switch (direction) {
        case 'up':
            player.y -= player.speed;
            break;
        case 'down':
            player.y += player.speed;
            break;
        case 'left':
            player.x -= player.speed;
            break;
        case 'right':
            player.x += player.speed;
            break;
    }
}

// Функция для обновления статов игроков
function updateStats() {
    player1SpeedDisplay.textContent = player1.speed;
    player1ScoreDisplay.textContent = player1.score;
    player2SpeedDisplay.textContent = player2.speed;
    player2ScoreDisplay.textContent = player2.score;
}

// Обработчик событий для клавиатуры
document.addEventListener('keydown', (event) => {
    event.preventDefault();

    switch (event.code) {
        // Управление игроком 1 (W, A, S, D)
        case 'KeyW':
            movePlayer(player1, 'up');
            break;
        case 'KeyS':
            movePlayer(player1, 'down');
            break;
        case 'KeyA':
            movePlayer(player1, 'left');
            break;
        case 'KeyD':
            movePlayer(player1, 'right');
            break;

        // Управление игроком 2 (стрелки)
        case 'ArrowUp':
            movePlayer(player2, 'up');
            break;
        case 'ArrowDown':
            movePlayer(player2, 'down');
            break;
        case 'ArrowLeft':
            movePlayer(player2, 'left');
            break;
        case 'ArrowRight':
            movePlayer(player2, 'right');
            break;
    }
    drawPlayers(); // Перерисовка игроков после перемещения
    updateStats(); // Обновление статов после перемещения
});

// Инициализация игры
drawPlayers();
updateStats(); // Обновление статов при инициализации
