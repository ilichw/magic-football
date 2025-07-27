// gamefield.js

export class GameField {
    constructor(height, width, playerZoneOffset, color, playerZoneColor) {
        // dimensions
        this.height = height;
        this.width = width;

        // init player zone
        this.playerZone = new PlayerZone(
            playerZoneOffset,
            playerZoneOffset,
            height - playerZoneOffset * 2,
            width - playerZoneOffset * 2,
            playerZoneColor
        );

        // default color if skin drawing doesn't work right
        this.color = color;
    }

    draw(ctx) {
        // draw base
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);

        //
        this.playerZone.draw(ctx);
    }
}

export class PlayerZone {
    constructor(x, y, height, width, color) {
        // coordinates
        this.x = x;
        this.y = y;

        // dimensions
        this.height = height;
        this.width = width;

        // border color
        this.color = color;
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}
