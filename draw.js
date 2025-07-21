// draw.js
export function draw(
    ctx,
    ball,
    player1,
    player2,
    score1,
    score2,
    goalAreaLeftX,
    goalAreaTopY,
    goalAreaWidth,
    goalAreaHeight
) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw goal areas
    ctx.fillStyle = 'yellow'; // Color for the goal areas
    ctx.fillRect(goalAreaLeftX, goalAreaTopY, goalAreaWidth, goalAreaHeight); // Left goal area
    ctx.fillRect(ctx.canvas.width - goalAreaWidth, goalAreaTopY, goalAreaWidth, goalAreaHeight); // Right goal area

    // Draw players
    ctx.fillStyle = 'white'; // Reset color for players
    ctx.fillRect(player1.x, player1.y, player1.size, player1.size);
    ctx.fillRect(player2.x, player2.y, player2.size, player2.size);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw score
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score1} - ${score2}`, ctx.canvas.width / 2 - 30, 20);
}
