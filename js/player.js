function isWalkable(x, y) {
    // Escaneamos portales cercanos (No detiene el movimiento, solo activa icono)
    checkPortals(x + player.w / 2, y + player.h - 10);

    const cx = Math.floor(x + player.w / 2);
    const cy = Math.floor(y + player.h - 10);
    if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) return false;
    const p = cCtx.getImageData(cx, cy, 1, 1).data;
    return p[3] < 120; // Caminable si es transparente
}

function update() {
    player.moving = false;
    if (player.sitting) return;
    let nx = player.x, ny = player.y;
    
    let moveX = 0, moveY = 0;
    if (inputs.up) moveY -= 1; if (inputs.down) moveY += 1;
    if (inputs.left) moveX -= 1; if (inputs.right) moveX += 1;
    
    if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY);
        nx += (moveX / length) * player.speed;
        ny += (moveY / length) * player.speed;
        player.moving = true;
        if (moveY < 0) player.dir = 'norte'; else if (moveY > 0) player.dir = 'sur';
        if (moveX < 0) player.dir = 'izq'; else if (moveX > 0) player.dir = 'der';
    }

    if (isWalkable(nx, ny)) { player.x = nx; player.y = ny; }

    if (player.moving) {
        player.timer++;
        if (player.timer > 8) { player.frame = player.frame === 0 ? 1 : 0; player.timer = 0; }
    }

    ball.x += ball.dx; ball.y += ball.dy;
    ball.dx *= ball.friction; ball.dy *= ball.friction;
    if (ball.x < 150 || ball.x > canvas.width - 250) ball.dx *= -0.8;
    if (ball.y < 250 || ball.y > canvas.height - 150) ball.dy *= -0.8;
    if (Math.abs(ball.dx) < 0.1) ball.dx = 0;
    if (Math.abs(ball.dy) < 0.1) ball.dy = 0;

    const dist = Math.hypot((player.x + player.w/2) - (ball.x + ball.size/2), (player.y + player.h - 15) - (ball.y + ball.size - 5));
    if (dist < 30) {
        ball.dx = ((ball.x + ball.size/2) - (player.x + player.w/2)) * 0.5;
        ball.dy = ((ball.y + ball.size - 5) - (player.y + player.h - 15)) * 0.5;
    }
}
