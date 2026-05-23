// Keep track of the active keydown handler globally so we can clean it up
let current2048KeyHandler = null;

export function init2048() {
    const gridElement = document.getElementById("grid-2048");
    const scoreElement = document.getElementById("score");
    const resetBtn = document.getElementById("reset-2048-btn");

    let board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    let score = 0;

    // Separate arrays to track coordinates that need explicit animation triggers
    let freshSpawns = [];
    let mergedCells = [];

    function startGame() {
        board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        score = 0;
        scoreElement.textContent = score;
        gridElement.innerHTML = "";

        // Generate the 16 empty cell boxes visually
        for (let i = 0; i < 16; i++) {
            let tile = document.createElement("div");
            tile.className = "tile-2048";
            gridElement.appendChild(tile);
        }

        freshSpawns = [];
        mergedCells = [];

        generateTile();
        generateTile();
        updateDisplay();
    }

    function generateTile() {
        let emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length > 0) {
            let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            let val = Math.random() < 0.9 ? 2 : 4;
            board[randomCell.r][randomCell.c] = val;

            // Track precisely where the new tile spawned
            freshSpawns.push(`${randomCell.r}-${randomCell.c}`);
        }
    }

    function updateDisplay() {
        const tiles = gridElement.querySelectorAll(".tile-2048");
        let index = 0;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let value = board[r][c];
                let tile = tiles[index];
                let coordKey = `${r}-${c}`;

                tile.textContent = value > 0 ? value : "";
                tile.className = "tile-2048"; // Reset styling baseline

                if (value > 0) {
                    tile.classList.add(`tile-${value}`);

                    // Apply the correct precise animation class
                    if (mergedCells.includes(coordKey)) {
                        tile.classList.add("tile-merge");
                    } else if (freshSpawns.includes(coordKey)) {
                        tile.classList.add("tile-new");
                    }
                }
                index++;
            }
        }
        scoreElement.textContent = score;

        // Clear tracking buffers immediately for the next turn
        freshSpawns = [];
        mergedCells = [];
    }

    // Mathematical row shifting and merging mechanism with position tracking
    function slide(row, rowIndex, isReversed, isVertical, colIndex) {
        let filteredRow = row.filter((val) => val !== 0);

        for (let i = 0; i < filteredRow.length - 1; i++) {
            if (filteredRow[i] === filteredRow[i + 1]) {
                filteredRow[i] *= 2;
                score += filteredRow[i];
                filteredRow[i + 1] = 0;

                // Calculate where the visual bounce belongs on the 4x4 matrix
                let absoluteCol = i;
                if (isReversed) absoluteCol = 3 - i;

                if (isVertical) {
                    mergedCells.push(`${absoluteCol}-${colIndex}`);
                } else {
                    mergedCells.push(`${rowIndex}-${absoluteCol}`);
                }
            }
        }

        filteredRow = filteredRow.filter((val) => val !== 0);
        while (filteredRow.length < 4) {
            filteredRow.push(0);
        }
        return filteredRow;
    }

    function moveLeft() {
        for (let r = 0; r < 4; r++) {
            board[r] = slide(board[r], r, false, false);
        }
    }

    function moveRight() {
        for (let r = 0; r < 4; r++) {
            let row = [...board[r]].reverse();
            row = slide(row, r, true, false);
            board[r] = row.reverse();
        }
    }

    function moveUp() {
        for (let c = 0; c < 4; c++) {
            let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
            row = slide(row, 0, false, true, c);
            for (let r = 0; r < 4; r++) {
                board[r][c] = row[r];
            }
        }
    }

    function moveDown() {
        for (let c = 0; c < 4; c++) {
            let row = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
            row = slide(row, 0, true, true, c);
            row.reverse();
            for (let r = 0; r < 4; r++) {
                board[r][c] = row[r];
            }
        }
    }

    function handleKeyDown(e) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }

        const gameSection = document.getElementById("game-2048-page");
        if (!gameSection || !gameSection.classList.contains("active")) return;

        let boardStringBefore = JSON.stringify(board);

        if (e.key === "ArrowLeft") moveLeft();
        else if (e.key === "ArrowRight") moveRight();
        else if (e.key === "ArrowUp") moveUp();
        else if (e.key === "ArrowDown") moveDown();
        else return;

        if (boardStringBefore !== JSON.stringify(board)) {
            generateTile();
            updateDisplay();
        }
    }

    // FIX: Remove any old keydown listener before attaching a new one to prevent stacking
    if (current2048KeyHandler) {
        window.removeEventListener("keydown", current2048KeyHandler);
    }
    current2048KeyHandler = handleKeyDown;
    window.addEventListener("keydown", current2048KeyHandler);

    // FIX: Prevent reset buttons from duplicating click triggers
    resetBtn.replaceWith(resetBtn.cloneNode(true));
    document.getElementById("reset-2048-btn").addEventListener("click", startGame);

    startGame();
}
