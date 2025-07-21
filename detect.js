// xxx.js

export function detectCollision(first, second, delta) {
    // console.log(delta);
    const leftSideCollisionBox = {
        left: second.left,
        right: second.left + delta,
        top: second.top,
        bottom: second.bottom,
    };
    const rightSideCollisionBox = {
        left: second.right - delta,
        right: second.right,
        top: second.top,
        bottom: second.bottom,
    };
    const topSideCollisionBox = {
        left: second.left,
        right: second.right,
        top: second.top,
        bottom: second.top + delta,
    };
    const bottomSideCollisionBox = {
        left: second.left,
        right: second.right,
        top: second.bottom - delta,
        bottom: second.bottom,
    };

    const boxCollision = (object, box) => {
        // console.log(object, box);
        return (
            ((box.top <= object.top && object.top <= box.bottom) ||
                (box.top <= object.bottom && object.bottom <= box.bottom)) &&
            ((box.left <= object.left && object.left <= box.right) ||
                (box.left <= object.right && object.right <= box.right))
        );
    };

    const leftSideCollision = boxCollision(first, leftSideCollisionBox);
    const rightSideCollision = boxCollision(first, rightSideCollisionBox);
    const topSideCollision = boxCollision(first, topSideCollisionBox);
    const bottomSideCollision = boxCollision(first, bottomSideCollisionBox);

    if (leftSideCollision) return { isCollision: true, collisionType: 'left' };
    if (rightSideCollision) return { isCollision: true, collisionType: 'right' };
    if (topSideCollision) return { isCollision: true, collisionType: 'top' };
    if (bottomSideCollision) return { isCollision: true, collisionType: 'bottom' };

    // if (
    //     ((second.top <= first.top && first.top <= second.bottom) ||
    //         (second.top <= first.bottom && first.bottom <= second.bottom)) &&
    //     ((second.left <= first.left && first.left <= second.right) ||
    //         (second.left <= first.right && first.right <= second.right))
    // ) {
    //     return { isCollision: true, collisionType: 'all' };
    // }

    return {
        isCollision: false,
        collisionType: undefined,
    };
}
