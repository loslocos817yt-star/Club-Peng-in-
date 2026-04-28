var canvas, ctx, cCanvas, cCtx;
var userData = JSON.parse(localStorage.getItem("pinguino_actual")) || { posicion: { x: 400, y: 300 } };

var player = { x: window.innerWidth/2 - 35, y: window.innerHeight/2 - 35, speed: 6, w: 70, h: 70, frame: 0, timer: 0, dir: 'sur', moving: false, sitting: false };
var ball = { x: 300, y: 300, dx: 0, dy: 0, size: 35, friction: 0.985 };
var inputs = { up: false, down: false, left: false, right: false };

var bgMusic = new Audio('assets/maps/song/mapa1.mp3');
bgMusic.loop = true;

var images = {};
var worldData = {};
var mapaActual = 'mapa1.png';
var portalActivo = null; // Guardará el portal que tengas cerca

var sprites = {
    map: 'assets/maps/mapa1.png',
    mapCol: 'assets/maps/colisión/map1.png',
    norte: 'assets/pingüino/caminar&iddle_norte.png',
    sur_iddle: 'assets/pingüino/iddle_sur.png',
    sur_w1: 'assets/pingüino/caminar1_sur.png',
    sur_w2: 'assets/pingüino/caminar2_sur.png',
    der1: 'assets/pingüino/caminar_der1.png',
    der2: 'assets/pingüino/caminar_der2.png',
    izq1: 'assets/pingüino/caminar_izq1.png',
    izq2: 'assets/pingüino/caminar_izq2.png',
    sit: 'assets/pingüino/centado.png',
    shadow: 'assets/etc/sombra.png',
    ball: 'assets/etc/pelota.png',
    ubicacion: 'assets/etc/ui&gui/ubicación.png' // Nuevo icono
};
