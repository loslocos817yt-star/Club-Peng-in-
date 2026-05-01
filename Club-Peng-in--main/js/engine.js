fetch('assets/maps/map.json')
    .then(r => r.json())
    .then(data => worldData = data);

function checkPortals(px, py) {
    if (!worldData[mapaActual]) return;
    const portales = worldData[mapaActual].portales || [];
    portalActivo = null; 

    for (let p of portales) {
        const cX = (p.x1 + p.x2) / 2;
        const cY = (p.y1 + p.y2) / 2;
        // Radio de 120px para que aparezca el icono de ubicación
        if (Math.hypot(px - cX, py - cY) < 120) {
            portalActivo = p;
            return;
        }
    }
}

function interactuarPortal() {
    if (!portalActivo) return;
    let destino = portalActivo.destino;
    let data = worldData[destino];
    
    // Cambiamos el mapa
    mapaActual = destino;
    images['map'].src = 'assets/maps/' + destino;
    images['mapCol'].src = 'assets/maps/colisión/' + data.archivo_col;
    
    // Buscamos el portal de salida en el nuevo mapa
    let pSalida = data.portales ? data.portales[0] : null;
    let targetX = canvas.width / 2;
    let targetY = canvas.height / 2;

    if (pSalida) {
        targetX = (pSalida.x1 + pSalida.x2) / 2;
        targetY = (pSalida.y1 + pSalida.y2) / 2;
    }

    // Esperamos a que cargue la colisión y buscamos sitio seguro
    setTimeout(() => {
        let offsets = [0, 30, -30, 60, -60, 90, -90];
        let encontrado = false;
        
        for (let oy of offsets) {
            for (let ox of offsets) {
                if (isWalkable(targetX + ox, targetY + oy)) {
                    player.x = targetX + ox - (player.w / 2);
                    player.y = targetY + oy - (player.h - 10);
                    encontrado = true;
                    break;
                }
            }
            if (encontrado) break;
        }
        portalActivo = null;
    }, 150);
}
