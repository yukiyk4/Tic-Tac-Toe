let globalTetrisKeyHandler = null;
let tetrisInterval = null;

export function initTetrisGame() {
    const canvas = document.getElementById("tetrisCanvas");
    const previewCanvas = document.getElementById("tetrisPreviewCanvas");
    if (!canvas || !previewCanvas) return;

    const ctx = canvas.getContext("2d");
    const previewCtx = previewCanvas.getContext("2d");
    const scoreElement = document.getElementById("tetris-score");
    const resetBtn = document.getElementById("tetris-reset-btn");

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 24;
    const PREVIEW_BLOCK_SIZE = 20;

    let score = 0;
    let isGameOver = false;
    let arena = createMatrix(COLS, ROWS);

    const SHAPES = {
        'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        'J': [[2,0,0], [2,2,2], [0,0,0]],
        'L': [[0,0,3], [3,3,3], [0,0,0]],
        'O': [[4,4], [4,4]],
        'S': [[0,5,5], [5,5,0], [0,0,0]],
        'T': [[0,6,0], [6,6,6], [0,0,0]],
        'Z': [[7,7,0], [0,7,7], [0,0,0]]
    };

    const COLORS = [
        null,
        '#06b6d4', // I - Cyan
        '#3b82f6', // J - Blue
        '#f97316', // L - Orange
        '#eab308', // O - Yellow
        '#22c55e', // S - Green
        '#a855f7', // T - Purple
        '#ef4444'  // Z - Red
    ];

    let player = {
        pos: {x: 0, y: 0},
        matrix: null
    };

    let nextPieceMatrix = null;

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    function getRandomPiece() {
        const pieces = 'IJLOSTZ';
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return SHAPES[randomPiece];
    }

    function playerReset() {
        if (nextPieceMatrix === null) {
            player.matrix = getRandomPiece();
            nextPieceMatrix = getRandomPiece();
        } else {
            player.matrix = nextPieceMatrix;
            nextPieceMatrix = getRandomPiece();
        }

        player.pos.y = 0;
        player.pos.x = Math.floor((COLS - player.matrix[0].length) / 2);

        if (collide(arena, player)) {
            isGameOver = true;
            scoreElement.textContent = `Game Over! Score: ${score} 👾`;
            clearInterval(tetrisInterval);
        }

        drawPreview();
    }

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (arena[y + o.y] === undefined ||
                    arena[y + o.y][x + o.x] === undefined ||
                    arena[y + o.y][x + o.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Forces the loop to halt calculation immediately
    function stopTetrisLoop() {
        if (tetrisInterval) {
            clearInterval(tetrisInterval);
            tetrisInterval = null;
        }
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function playerDrop() {
        if (isGameOver) return;
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            arenaSweep();
            playerReset();
        }
        draw();
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
        draw();
    }

    function rotate(matrix) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        matrix.forEach(row => row.reverse());
    }

    function playerRotate() {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix);
                player.pos.x = pos;
                return;
            }
        }
        draw();
    }

    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;

            score += rowCount * 10;
            rowCount *= 2;
        }
        scoreElement.textContent = `Score: ${score}`;
    }

    function draw() {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--card-bg").trim() || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(arena, {x: 0, y: 0}, ctx, BLOCK_SIZE);
        drawMatrix(player.matrix, player.pos, ctx, BLOCK_SIZE);
    }

    function drawPreview() {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        if (!nextPieceMatrix) return;

        const matrixW = nextPieceMatrix[0].length;
        const matrixH = nextPieceMatrix.length;

        const offsetX = (previewCanvas.width - (matrixW * PREVIEW_BLOCK_SIZE)) / 2 / PREVIEW_BLOCK_SIZE;
        const offsetY = (previewCanvas.height - (matrixH * PREVIEW_BLOCK_SIZE)) / 2 / PREVIEW_BLOCK_SIZE;

        drawMatrix(nextPieceMatrix, {x: offsetX, y: offsetY}, previewCtx, PREVIEW_BLOCK_SIZE);
    }

    function drawMatrix(matrix, offset, targetContext, size) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    targetContext.fillStyle = COLORS[value];
                    targetContext.fillRect((x + offset.x) * size,
                                           (y + offset.y) * size,
                                           size - 1, size - 1);
                }
            });
        });
    }

    function handleInput(e) {
        // Double-check visibility before accepting inputs
        if (canvas.offsetParent === null || isGameOver) return;

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === 'ArrowLeft' || e.key === 'a') playerMove(-1);
        if (e.key === 'ArrowRight' || e.key === 'd') playerMove(1);
        if (e.key === 'ArrowDown' || e.key === 's') playerDrop();
        if (e.key === 'ArrowUp' || e.key === 'w') playerRotate();
    }

    function startTetris() {
        arena = createMatrix(COLS, ROWS);
        score = 0;
        isGameOver = false;
        scoreElement.textContent = "Score: 0";
        nextPieceMatrix = null;
        playerReset();
        if (tetrisInterval) clearInterval(tetrisInterval);
        tetrisInterval = setInterval(playerDrop, 1000);
        draw();
    }

    // --- NEW: THE TAB WATCHER (INTERSECTION OBSERVER) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the section becomes hidden (isIntersecting is false), freeze the game loop!
            if (!entry.isIntersecting) {
                stopTetrisLoop();
            }
        });
    }, { threshold: 0 }); // 0 means trigger as soon as it goes completely hidden

    // Start tracking the parent game section layout block
    const parentSection = document.getElementById("tetris-page");
    if (parentSection) {
        observer.disconnect(); // Clear old tracking references if re-run
        observer.observe(parentSection);
    }

    // Clean keyboard event pipes
    if (globalTetrisKeyHandler) window.removeEventListener('keydown', globalTetrisKeyHandler);
    globalTetrisKeyHandler = handleInput;
    window.addEventListener('keydown', globalTetrisKeyHandler);

    resetBtn.replaceWith(resetBtn.cloneNode(true));
    document.getElementById("tetris-reset-btn").addEventListener("click", startTetris);
}
