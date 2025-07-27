// collisions.js

export class CollisionDetector {
    constructor() {}
}

export function d() {}

export function detectOverlap_(first, second) {
    const x = Math.max();
}

export function detectOverlap(first, second) {
    const dx = first.x + first.width - second.x;
    if (dx < 0 || first.x > second.x + second.width) return null;

    const dy = first.y + first.height - second.y;
    if (dy < 0 || first.y > second.y + second.height) return null;

    return {
        x: Math.max(first.x, second.x),
        y: Math.max(first.y, second.y),
        width: Math.min(dx, first.width),
        height: Math.min(dy, first.height),
    };
}
