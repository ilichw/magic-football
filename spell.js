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
            // Логика применения заклинания
            // Например, нанести урон
            // target.takeDamage(this.damage);

            this.lastCastTime = Date.now();

            const spellX = direction === 'left' ? caster.left - 8 : caster.right;
            const spellY = caster.y + caster.height / 2;
            const speed = direction === 'left' ? -10 : 10;

            return new Spell(spellX, spellY, 8, 8, 'red', this.type, speed);
        }

        return null;
    }
}
