// 2. Класс для анимируемого объекта
export class AnimatedObject {
    constructor(frames, x, y, width, height, playOnce = true, stopped = false) {
        this.frames = frames;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.playOnce = playOnce;
        this.stopped = stopped;

        this.currentFrame = 0; // Текущий кадр анимации
        this.frameCount = 0; // Счетчик кадров

        this.id = Date.now();
    }

    // 3. Метод для отрисовки анимации
    draw(ctx) {
        if (this.stopped) return;
        ctx.drawImage(this.frames[this.currentFrame], this.x, this.y, this.width, this.height);
    }

    // 4. Метод для обновления анимации
    update() {
        if (this.stopped) return;

        this.frameCount++;
        if (this.frameCount >= 10) {
            // Измените значение для регулировки скорости анимации
            const newCurrentFrame = (this.currentFrame + 1) % this.frames.length;
            if (newCurrentFrame === 0 && this.playOnce) {
                this.stopped = true;
            }
            this.currentFrame = newCurrentFrame; // Переключение на следующий кадр
            this.frameCount = 0; // Сброс счетчика
        }
    }
}
