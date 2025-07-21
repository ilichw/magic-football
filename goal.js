// goal.js
export function detectGoal(
    ball,
    score1,
    score2,
    goalAreaLeftX,
    goalAreaTopY,
    goalAreaWidth,
    goalAreaHeight,
    pauseGame
) {
    // Check for goal in the left goal area
    if (
        ball.x - ball.radius < goalAreaLeftX + goalAreaWidth &&
        ball.y > goalAreaTopY &&
        ball.y < goalAreaTopY + goalAreaHeight
    ) {
        score2++;
        pauseGame();
    }
    // Check for goal in the right goal area
    else if (
        ball.x + ball.radius > goalAreaLeftX + goalAreaWidth &&
        ball.y > goalAreaTopY &&
        ball.y < goalAreaTopY + goalAreaHeight
    ) {
        score1++;
        pauseGame();
    }
}
