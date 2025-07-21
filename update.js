import { detectBallCollisionWithWalls, detectBallCollisionWithPlayers } from './collision.js';
import { movePlayer1 } from './player.js';
import { resetBall } from './ball.js';
import { detectGoal } from './goal.js';

// Update the update function to include pauseGame
export function update(
    ball,
    player1,
    player2,
    score1,
    score2,
    gamePaused,
    pauseGame,
    goalAreaLeftX,
    goalAreaTopY,
    goalAreaWidth,
    goalAreaHeight
) {
    if (!gamePaused) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        detectBallCollisionWithWalls(ball);
        detectBallCollisionWithPlayers(ball, player1, player2);
        detectGoal(ball, score1, score2, goalAreaLeftX, goalAreaTopY, goalAreaWidth, goalAreaHeight, pauseGame);
        movePlayer1(ball, player1);
    }
}

// Update the gameLoop function to include pauseGame and goal area parameters
export function gameLoop(
    ctx,
    ball,
    player1,
    player2,
    score1,
    score2,
    goalAreaLeftX,
    goalAreaTopY,
    goalAreaWidth,
    goalAreaHeight,
    gamePaused,
    pauseGame
) {
    update(
        ball,
        player1,
        player2,
        score1,
        score2,
        gamePaused,
        pauseGame,
        goalAreaLeftX,
        goalAreaTopY,
        goalAreaWidth,
        goalAreaHeight
    );
    draw(ctx, ball, player1, player2, score1, score2, goalAreaLeftX, goalAreaTopY, goalAreaWidth, goalAreaHeight);
    requestAnimationFrame(() =>
        gameLoop(
            ctx,
            ball,
            player1,
            player2,
            score1,
            score2,
            goalAreaLeftX,
            goalAreaTopY,
            goalAreaWidth,
            goalAreaHeight,
            gamePaused,
            pauseGame
        )
    );
}
