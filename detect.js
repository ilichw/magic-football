// detect.js

export function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export function getCollisionSide(rect1, rect2) {
    if (!isColliding(rect1, rect2)) {
        return null; // Нет столкновения
    }

    const dx = rect1.x + rect1.width / 2 - (rect2.x + rect2.width / 2);
    const dy = rect1.y + rect1.height / 2 - (rect2.y + rect2.height / 2);

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
        return dx > 0 ? 'left' : 'right'; // Столкновение с левой или правой стороны
    } else {
        return dy > 0 ? 'bottom' : 'top'; // Столкновение с верхней или нижней стороны
    }
}

export function isCollidingCircleSquare(circle, square) {
    // Определяем ближайшую точку на квадрате
    const nearestX = Math.max(square.x, Math.min(circle.x, square.x + square.size));
    const nearestY = Math.max(square.y, Math.min(circle.y, square.y + square.size));

    // Вычисляем расстояние между центром круга и ближайшей точкой
    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;
    const distanceSquared = dx * dx + dy * dy;

    // Проверяем на столкновение
    if (distanceSquared < circle.radius * circle.radius) {
        return true; // Столкновение произошло
    } else {
        return false; // Столкновения нет
    }
}

export function getCollisionSideCircleSquare(circle, square) {
    // Проверяем на столкновение
    if (!isCollidingCircleSquare(circle, square)) {
        return null; // Нет столкновения
    }

    // Определяем ближайшую точку на квадрате
    const nearestX = Math.max(square.x, Math.min(circle.x, square.x + square.size));
    const nearestY = Math.max(square.y, Math.min(circle.y, square.y + square.size));

    // Вычисляем вектор столкновения
    const collisionVectorX = circle.x - nearestX;
    const collisionVectorY = circle.y - nearestY;

    // Определяем сторону столкновения
    if (Math.abs(collisionVectorX) > Math.abs(collisionVectorY)) {
        return collisionVectorX > 0 ? 'left' : 'right';
    } else {
        return collisionVectorY > 0 ? 'top' : 'bottom';
    }
}
