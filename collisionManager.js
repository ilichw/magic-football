import { AnimatedObject } from './animatedObject.js';

export class CollisionManager {
    constructor(game) {
        this.game = game;
    }

    checkCollisions() {
        const collisions = [];
        const { ball, gameField, players, spells } = this.game;

        const ballWallCollisions = this.checkBallWallCollision(ball, gameField);
        collisions.push(...ballWallCollisions);

        spells.forEach((spell) => {
            const spellWallCollisions = this.checkSpellWallCollision(spell, gameField);
            collisions.push(...spellWallCollisions);
        });

        players.forEach((player) => {
            const ballPlayerCollisions = this.checkBallPlayerCollision(ball, player);
            const spellPlayerCollisions = this.checkSpellPlayerCollision(spells, player);
            collisions.push(...ballPlayerCollisions);
            collisions.push(...spellPlayerCollisions);
        });

        return collisions;
    }

    checkBallWallCollision(ball, gameField) {
        const collisions = [];

        if (ball.top <= 0) {
            collisions.push({ type: 'ball x top wall' });
        } else if (ball.right >= gameField.width) {
            collisions.push({ type: 'ball x right wall' });
        } else if (ball.bottom >= gameField.height) {
            collisions.push({ type: 'ball x bottom wall' });
        } else if (ball.left <= 0) {
            collisions.push({ type: 'ball x left wall' });
        }

        return collisions;
    }

    checkBallPlayerCollision(ball, player) {
        const collisions = [];

        // Проверка коллизий по вертикали
        if (player.left <= ball.x && ball.x <= player.right) {
            if (ball.bottom >= player.top && ball.bottom < player.bottom && ball.dy > 0) {
                collisions.push({ type: 'ball x player top', player });
            } else if (ball.top <= player.bottom && ball.top > player.top && ball.dy < 0) {
                collisions.push({ type: 'ball x player bottom', player });
            }
        }

        // Проверка коллизий по горизонтали
        if (player.top <= ball.y && ball.y <= player.bottom) {
            if (ball.right >= player.left && ball.right < player.right && ball.dx > 0) {
                collisions.push({ type: 'ball x player left', player });
            } else if (ball.left <= player.right && ball.left > player.left && ball.dx < 0) {
                collisions.push({ type: 'ball x player right', player });
            }
        }

        return collisions;
    }

    checkSpellWallCollision(spell, gameField) {
        const collisions = [];

        if (
            spell.top <= 0 ||
            spell.right >= gameField.width ||
            spell.bottom >= gameField.height ||
            spell.left <= 0
        ) {
            collisions.push({ type: 'spell x wall', spell });
        }

        return collisions;
    }

    checkSpellPlayerCollision(spells, player) {
        const collisions = [];

        spells.forEach((spell) => {
            if (spell.isColliding(player)) {
                collisions.push({ type: 'spell x player', player, spell });
            }
        });

        return collisions;
    }

    collisionResolving(collisions) {
        collisions.forEach((collision) => {
            const { ball, gameField, spells, visibleObjects } = this.game;

            switch (collision.type) {
                // ball x walls
                case 'ball x top wall':
                    ball.y = ball.radius + 1;
                    ball.dy = -ball.dy;
                    break;

                case 'ball x right wall':
                    ball.x = gameField.width - ball.radius - 1;
                    ball.dx = -ball.dx;
                    break;

                case 'ball x bottom wall':
                    ball.y = gameField.height - ball.radius - 1;
                    ball.dy = -ball.dy;
                    break;

                case 'ball x left wall':
                    ball.x = ball.radius + 1;
                    ball.dx = -ball.dx;
                    break;

                // ball x players
                case 'ball x player top':
                    ball.y = collision.player.top - ball.radius - 1;
                    ball.dy = -ball.dy;
                    break;

                case 'ball x player right':
                    ball.x = collision.player.right + ball.radius + 1;
                    ball.dx = -ball.dx;
                    break;

                case 'ball x player bottom':
                    ball.y = collision.player.bottom + ball.radius + 1;
                    ball.dy = -ball.dy;
                    break;

                case 'ball x player left':
                    ball.x = collision.player.left - ball.radius - 1;
                    ball.dx = -ball.dx;
                    break;

                case 'spell x wall':
                    // remove spell
                    this.game.spells = spells.filter(
                        (spell) => spell.id !== collision.spell.id
                    );
                    this.game.visibleObjects = visibleObjects.filter(
                        (spell) => spell.id !== collision.spell.id
                    );

                    break;

                // spell x player
                case 'spell x player':
                    // process player's damage
                    collision.player.getDamaged(collision.spell.type);

                    // start animation of blowing up
                    const newAnimation = new AnimatedObject(
                        this.game.hitAnimationFrames,
                        collision.spell.left,
                        collision.spell.top,
                        20,
                        20
                    );

                    this.game.animations.push(newAnimation);
                    this.game.visibleObjects.push(newAnimation);

                    // remove spell
                    this.game.spells = spells.filter(
                        (spell) => spell.id !== collision.spell.id
                    );
                    this.game.visibleObjects = visibleObjects.filter(
                        (spell) => spell.id !== collision.spell.id
                    );
                    break;
            }
        });
    }
}
