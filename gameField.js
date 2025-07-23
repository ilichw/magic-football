// gamefield.js

export class GameField {
    constructor(height, width, color) {
        this.height = height;
        this.width = width;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);
    }
}
