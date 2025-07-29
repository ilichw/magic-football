import { Rect } from './rect.js';

export class ScoreManager {
    constructor(game) {
        this.score1 = 0; // Счет игрока 1
        this.score2 = 0; // Счет игрока 2
        this.game = game;

        const stWidth = this.game.gameField.width;
        const stHeight = this.game.settings.ball.size;
        const stX = this.game.gameField.width / 2 - stWidth / 2;
        const stY = this.game.gameField.x;
        const stColor = 'white';

        this.scoreTable = new ScoreTable(stX, stY, stWidth, stHeight, stColor, this);
    }

    // Метод для увеличения счета игрока
    increaseScore(player) {
        if (player.name === 'player 1') {
            this.score1++;
        } else if (player.name === 'player 2') {
            this.score2++;
        }
    }

    // Метод для получения текущего счета
    getScore() {
        return { player1: this.score1, player2: this.score2 };
    }

    get scoreText() {
        let scoreText = `Score: ${this.score1} - ${this.score2}`;
        if (this.game.isPaused) scoreText += ' (paused)';
        return scoreText;
    }

    // Метод для сброса счета (например, при начале новой игры)
    resetScore() {
        this.score1 = 0;
        this.score2 = 0;
    }
}

class ScoreTable extends Rect {
    constructor(x, y, width, height, color, scoreManager) {
        super(x, y, width, height, color);
        this.scoreManager = scoreManager;
    }

    draw(ctx) {
        const scoreText = this.scoreManager.scoreText;
        ctx.fillStyle = this.color;
        ctx.fillText(scoreText, this.width / 2 - 30, 12);
    }
}
