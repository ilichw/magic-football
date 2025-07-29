// spell.js
// spells logic

import { Rect } from './rect.js';

export class Spell extends Rect {
    constructor(x, y, height, width, color, type, speed) {
        super(x, y, height, width, color);
        this.type = type;
        this.speed = speed;
        this.id = Date.now();
    }

    update() {
        this.x += this.speed;
    }
}

export class Attack {
    constructor(name, type, cooldown) {
        this.name = name;
        this.type = type;
        this.cooldown = cooldown;
        this.lastCastTime = 0;
    }

    canCast(currentTime) {
        return currentTime - this.lastCastTime >= this.cooldown;
    }

    cast(caster, direction) {
        if (this.canCast(Date.now())) {
            const spellSize = 8;
            const spellSpeed = 10;

            this.lastCastTime = Date.now();

            const spellX = direction === 'left' ? caster.left - spellSize : caster.right;
            const spellY = caster.y + caster.height / 2;
            const speed = direction === 'left' ? -spellSpeed : spellSpeed;

            return new Spell(spellX, spellY, spellSize, spellSize, 'red', this.type, speed);
        }

        return null;
    }
}
