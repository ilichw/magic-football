export function detectCollision(first, second, delta) {
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

    if (leftSideCollision) {
        if (topSideCollision || bottomSideCollision) {
            return { isCollision: true, collisionType: 'corner' };
        }
        return { isCollision: true, collisionType: 'left' };
    }

    if (rightSideCollision) {
        if (topSideCollision || bottomSideCollision) {
            return { isCollision: true, collisionType: 'corner' };
        }
        return { isCollision: true, collisionType: 'right' };
    }

    if (topSideCollision) {
        if (leftSideCollision || rightSideCollision) {
            return { isCollision: true, collisionType: 'corner' };
        }
        return { isCollision: true, collisionType: 'top' };
    }

    if (bottomSideCollision) {
        if (leftSideCollision || rightSideCollision) {
            return { isCollision: true, collisionType: 'corner' };
        }
        return { isCollision: true, collisionType: 'bottom' };
    }

    return {
        isCollision: false,
        collisionType: undefined,
    };
}

// currently `first` is the ball and `second` a player
// TODO: it mb useful to refactor it for bigger-smaller rather than second-first logic
export function detectOverlap_(first, second) {
    let [top, bottom, left, right] = new Array(4).fill(0);
    let [topOverlap, bottomOverlap, leftOverlap, rightOverlap] = new Array(4).fill(false);

    if (first.bottom >= second.top && first.bottom < second.bottom) {
        topOverlap = true;
        top = second.top;
        bottom = first.bottom - second.top;
    }

    if (first.top <= second.bottom && first.top > second.top) {
        bottomOverlap = true;
        top = second.bottom - first.top;
        bottom = second.bottom;
    }

    if (first.right >= second.left && first.right < second.right) {
        leftOverlap = true;
        left = second.left;
        right = first.right - second.left;
    }

    if (first.left <= second.left && first.left > second.left) {
        rightOverlap = true;
        left = second.right - first.left;
        right = second.right;
    }

    if (
        (leftOverlap && (topOverlap || bottomOverlap)) || // collision on second's left side
        (rightOverlap && (topOverlap || bottomOverlap)) || // collision on second's right side
        (topOverlap && (leftOverlap || rightOverlap)) ||
        (bottomOverlap && (leftOverlap || rightOverlap))
    ) {
        return {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
        };
    }

    return null;
}

export function detectOverlap(left1, sizeX1, left2, sizeX2, top1, sizeY1, top2, sizeY2) {
    // console.log(left1, sizeX1, left2, sizeX2, top1, sizeY1, top2, sizeY2);
    // left overlap check
    const hyinya1 = left1 + sizeX1 - left2;
    if (hyinya1 <= 0) return null;
    const hyinya2 = left1 - left2 - sizeX2;
    if (hyinya2 >= 0) return null;

    // top overlap check
    const hyinya3 = top1 + sizeY1 - top2;
    if (hyinya3 <= 0) return null;
    const hyinya4 = top1 - top2 - sizeY2;
    if (hyinya4 >= 0) return null;

    return {
        left: Math.max(left1, left2),
        sizeX: Math.min(Math.abs(hyinya1), Math.abs(hyinya2)),
        top: Math.max(top1, top2),
        sizeY: Math.min(Math.abs(hyinya3), Math.abs(hyinya4)),
    };
}
