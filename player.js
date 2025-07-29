// player.js

import { Rect } from './rect.js';

export class Player extends Rect {
    constructor(x, y, height, width, speed, name, color, attacks) {
        super(x, y, height, width, color);
        this.speed = speed;
        this.name = name;
        this.attacks = attacks;
    }

    get isControlledByAI() {
        return false;
    }

    draw(ctx) {
        // draw player's name
        ctx.fillStyle = 'white';
        ctx.fillText(this.name, this.x, this.y - 10);

        // draw skin
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    fire(attackId, direction) {
        const attack = this.attacks[attackId]; // Например, первое заклинание
        return attack.cast(this, direction);
    }

    getDamaged(attackType) {
        const originalColor = this.color;
        this.color = 'red'; // Изменение цвета на красный при попадании

        setTimeout(() => {
            this.color = originalColor; // Возврат к оригинальному цвету
        }, 200); // Время эффекта в миллисекундах

        switch (attackType) {
            case 'slowdown':
                const originalSpeed = this.speed;
                this.speed *= 0.25; // speed -50%
                setTimeout(() => {
                    this.speed = originalSpeed; // Возврат к оригинальному цвету
                }, 2000); // Время эффекта в миллисекундах
                break;
        }
    }
}

export class PlayerAI extends Player {
    constructor(x, y, height, width, speed, name, color, attacks, difficulty) {
        super(x, y, height, width, speed, name, color, attacks);
        this.difficulty = difficulty;
    }

    get isControlledByAI() {
        return true;
    }

    draw(ctx) {
        // draw player's name
        ctx.fillStyle = 'white';
        const text = `${this.name} (${this.difficulty})`;
        ctx.fillText(text, this.x, this.y - 10);

        // draw skin
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    follow(target) {
        const newPosition = { x: this.x, y: this.y };

        let moveTowards;

        switch (this.difficulty) {
            case 'easy':
                moveTowards = Math.random() < 0.2; // 20% chance to move towards the ball
                break;
            case 'normal':
                moveTowards = Math.random() < 0.5; // 50% chance to move towards the ball
                break;
            case 'hard':
                moveTowards = Math.random() < 0.8; // 80% chance to move towards the ball
                break;
        }

        if (!moveTowards) return newPosition;

        // Рассчитываем направление к цели
        const dx = target.x - this.x;
        const dy = target.y - this.y;

        // Вычисляем угол для нормализации
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // Нормализуем вектор направления
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;

            // Обновляем позицию игрока
            newPosition.x += normalizedDx * this.speed;
            newPosition.y += normalizedDy * this.speed;
        }

        return newPosition;
    }

    escape(target) {}

    keepNear(target) {}

    followY(target) {
        let moveTowards;

        switch (this.difficulty) {
            case 'easy':
                moveTowards = Math.random() < 0.2; // 20% chance to move towards the ball
                break;
            case 'normal':
                moveTowards = Math.random() < 0.5; // 50% chance to move towards the ball
                break;
            case 'hard':
                moveTowards = Math.random() < 0.8; // 80% chance to move towards the ball
                break;
        }

        if (moveTowards) {
            if (target.y < this.y) {
                return this.y - this.speed; // Move up
            } else if (target.y > this.y + this.height) {
                return this.y + this.speed; // Move down
            }
        }

        return this.y;
    }
}
