(function() {
    const canvas = document.getElementById('pacmanCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('pacmanScore');
    const startBtn = document.getElementById('startPacmanBtn');
    const overlay = document.getElementById('gameOverlay');
    const overlayText = document.getElementById('overlayText');

    const tileSize = 20;
    const rows = 19;
    const cols = 19;
    let score = 0;
    let gameLoopId = null;
    let isGameOver = false;

    // Mapa simplificado: 1 = Pared, 0 = Punto/Comida, 2 = Vacío
    const mapTemplate = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
        [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
        [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
        [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
        [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
        [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let map = [];

    // Pacman State
    let pacman = { x: 9, y: 14, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0, mouth: 0.2 };
    
    // Ghosts State
    let ghosts = [
        { x: 9, y: 8, color: '#ff0000', dirX: 1, dirY: 0 },
        { x: 9, y: 9, color: '#ffb8ff', dirX: -1, dirY: 0 }
    ];

    function initGame() {
        score = 0;
        scoreEl.textContent = score;
        map = JSON.parse(JSON.stringify(mapTemplate));
        pacman = { x: 9, y: 14, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0, mouth: 0.2 };
        ghosts = [
            { x: 8, y: 9, color: '#ff0000', dirX: 1, dirY: 0 },
            { x: 10, y: 9, color: '#ffb8ff', dirX: -1, dirY: 0 }
        ];
        isGameOver = false;
        overlay.style.display = 'none';
        if (gameLoopId) clearInterval(gameLoopId);
        gameLoopId = setInterval(update, 200);
    }

    function setDirection(dx, dy) {
        pacman.nextDirX = dx;
        pacman.nextDirY = dy;
    }

    function canMove(x, y, dx, dy) {
        let newX = x + dx;
        let newY = y + dy;
        if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return true; // Teletransporte simple
        return map[newY] && map[newY][newX] !== 1;
    }

    function update() {
        if (isGameOver) return;

        // Intentar cambiar de dirección Pacman
        if (canMove(pacman.x, pacman.y, pacman.nextDirX, pacman.nextDirY)) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
        }

        // Mover Pacman
        if (canMove(pacman.x, pacman.y, pacman.dirX, pacman.dirY)) {
            pacman.x += pacman.dirX;
            pacman.y += pacman.dirY;

            // Manejo de túnel lateral
            if (pacman.x < 0) pacman.x = cols - 1;
            else if (pacman.x >= cols) pacman.x = 0;
        }

        // Comer Puntos
        if (map[pacman.y][pacman.x] === 0) {
            map[pacman.y][pacman.x] = 2;
            score += 10;
            scoreEl.textContent = score;
        }

        // Mover Fantasmas
        ghosts.forEach(ghost => {
            const possibleMoves = [];
            const dirs = [{x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0}];
            dirs.forEach(d => {
                if (canMove(ghost.x, ghost.y, d.x, d.y)) {
                    possibleMoves.push(d);
                }
            });
            if (possibleMoves.length > 0) {
                const randomDir = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                ghost.x += randomDir.x;
                ghost.y += randomDir.y;
            }

            // Colisión Pacman - Fantasma
            if (ghost.x === pacman.x && ghost.y === pacman.y) {
                endGame(false);
            }
        });

        draw();
    }

    function draw() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar Mapa
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (map[r][c] === 1) {
                    ctx.fillStyle = '#1919a6';
                    ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                } else if (map[r][c] === 0) {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.beginPath();
                    ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Dibujar Pacman
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        let angle = 0;
        if (pacman.dirX === 1) angle = 0;
        if (pacman.dirX === -1) angle = Math.PI;
        if (pacman.dirY === 1) angle = Math.PI / 2;
        if (pacman.dirY === -1) angle = (Math.PI * 3) / 2;

        ctx.arc(
            pacman.x * tileSize + tileSize / 2,
            pacman.y * tileSize + tileSize / 2,
            tileSize / 2 - 2,
            angle + 0.2,
            angle + Math.PI * 2 - 0.2
        );
        ctx.lineTo(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2);
        ctx.fill();

        // Dibujar Fantasmas
        ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.color;
            ctx.beginPath();
            ctx.arc(
                ghost.x * tileSize + tileSize / 2,
                ghost.y * tileSize + tileSize / 2,
                tileSize / 2 - 2,
                Math.PI,
                0,
                false
            );
            ctx.lineTo(ghost.x * tileSize + tileSize, ghost.y * tileSize + tileSize);
            ctx.lineTo(ghost.x * tileSize, ghost.y * tileSize + tileSize);
            ctx.fill();
        });
    }

    function endGame(win) {
        isGameOver = true;
        clearInterval(gameLoopId);
        overlayText.textContent = win ? '¡VICTORIA!' : '¡GAME OVER!';
        overlay.style.display = 'flex';
    }

    // Controles por teclado
    window.addEventListener('keydown', e => {
        if (['ArrowUp', 'KeyW'].includes(e.code)) setDirection(0, -1);
        if (['ArrowDown', 'KeyS'].includes(e.code)) setDirection(0, 1);
        if (['ArrowLeft', 'KeyA'].includes(e.code)) setDirection(-1, 0);
        if (['ArrowRight', 'KeyD'].includes(e.code)) setDirection(1, 0);
    });

    // Controles táctiles por Botones
    document.getElementById('btnUp').addEventListener('click', () => setDirection(0, -1));
    document.getElementById('btnDown').addEventListener('click', () => setDirection(0, 1));
    document.getElementById('btnLeft').addEventListener('click', () => setDirection(-1, 0));
    document.getElementById('btnRight').addEventListener('click', () => setDirection(1, 0));

    startBtn.addEventListener('click', initGame);
})();