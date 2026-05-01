window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    cCanvas = document.createElement('canvas'); 
    cCtx = cCanvas.getContext('2d', { willReadFrequently: true });

    // Preload
    for (let key in sprites) {
        images[key] = new Image();
        images[key].src = sprites[key];
        if (key === 'mapCol') images[key].onload = resize;
    }

    window.addEventListener('resize', resize);
    
    // Configurar botones
    function setupBtn(id, key) {
        const el = document.getElementById(id);
        if(!el) return;
        const start = (e) => { e.preventDefault(); if(key === 'sit') player.sitting = !player.sitting; else { inputs[key] = true; player.sitting = false; } };
        const end = (e) => { e.preventDefault(); if(key !== 'sit') inputs[key] = false; };
        el.addEventListener('touchstart', start); el.addEventListener('touchend', end);
        el.addEventListener('mousedown', start); el.addEventListener('mouseup', end);
    }
    setupBtn('btnUp', 'up'); setupBtn('btnDown', 'down'); setupBtn('btnLeft', 'left'); setupBtn('btnRight', 'right'); setupBtn('btnCenter', 'sit');
    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'w') inputs.up = true;
        if (k === 's') inputs.down = true;
        if (k === 'a') inputs.left = true;
        if (k === 'd') inputs.right = true;
    });
    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'w') inputs.up = false;
        if (k === 's') inputs.down = false;
        if (k === 'a') inputs.left = false;
        if (k === 'd') inputs.right = false;
    });

    // Botón Fullscreen
    document.getElementById('fs-btn').onclick = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
            bgMusic.play().catch(e => console.log('Audio bloqueado aún:', e));
            this.style.display = 'none';
            resize();
        }
    };

    // Tocar el portal en la pantalla
    canvas.addEventListener('touchstart', (e) => {
        if (portalActivo) {
            const tx = e.touches[0].clientX;
            const ty = e.touches[0].clientY;
            const cX = (portalActivo.x1 + portalActivo.x2) / 2;
            const cY = (portalActivo.y1 + portalActivo.y2) / 2;
            // Si tocas a menos de 60px del icono flotante, ¡Boom! Viajas.
            if (Math.hypot(tx - cX, ty - cY) < 100) interactuarPortal();
        }
    });

    setInterval(update, 1000/60);
    draw();
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cCanvas.width = canvas.width;
    cCanvas.height = canvas.height;
    if(images['mapCol'] && images['mapCol'].complete) cCtx.drawImage(images['mapCol'], 0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (images['map'].complete) ctx.drawImage(images['map'], 0, 0, canvas.width, canvas.height);

    if (images['shadow'].complete) {
        ctx.drawImage(images['shadow'], player.x + 10, player.y + player.h - 15, player.w - 20, 15);
        ctx.drawImage(images['shadow'], ball.x + 2, ball.y + ball.size - 8, ball.size - 4, 10);
    }

    const objects = [
        { type: 'ball', y: ball.y + ball.size, f: () => ctx.drawImage(images['ball'], ball.x, ball.y, ball.size, ball.size) },
        { type: 'player', y: player.y + player.h, f: () => {
            let pImg;
            if (player.sitting) pImg = images['sit'];
            else if (player.moving) {
                if (player.dir === 'sur') pImg = player.frame === 0 ? images['sur_w1'] : images['sur_w2'];
                else if (player.dir === 'norte') pImg = images['norte'];
                else if (player.dir === 'der') pImg = player.frame === 0 ? images['der1'] : images['der2'];
                else if (player.dir === 'izq') pImg = player.frame === 0 ? images['izq1'] : images['izq2'];
            } else {
                pImg = player.dir === 'sur' ? images['sur_iddle'] : (player.dir === 'norte' ? images['norte'] : (player.dir === 'der' ? images['der1'] : images['izq1']));
            }
            if (pImg && pImg.complete) ctx.drawImage(pImg, player.x, player.y, player.w, player.h);
        }}
    ].sort((a, b) => a.y - b.y).forEach(obj => obj.f());

    // DIBUJAR EL ICONO DE UBICACIÓN (Flotando chido)
    if (portalActivo && images['ubicacion'].complete) {
        const cX = (portalActivo.x1 + portalActivo.x2) / 2;
        const cY = (portalActivo.y1 + portalActivo.y2) / 2;
        const animFlote = Math.sin(Date.now() / 150) * 8; // Sube y baja 8 pixeles
        ctx.drawImage(images['ubicacion'], cX - 25, cY - 40 + animFlote, 80, 80);
    }

    requestAnimationFrame(draw);
}
