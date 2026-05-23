export function initMinesweeperGame() {
    const boardElement = document.getElementById("minesweeper-board");
    const statusElement = document.getElementById("minesweeper-status");
    const resetBtn = document.getElementById("minesweeper-reset-btn");

    if (!boardElement) return;

    const ROWS = 9;
    const COLS = 9;
    const MINE_COUNT = 10;

    let board = [];
    let isGameOver = false;
    let minesLeft = MINE_COUNT;
    let tilesRevealedCount = 0;

    // --- MOVE 1: DECLARED FIRST SO REVEALTILE CAN ACCESS IT ---
    function revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let tile = board[r][c];
                if (tile.isMine) {
                    tile.element.classList.add("revealed", "mine");
                    tile.element.textContent = "💣";
                }
            }
        }
    }

    // --- MOVE 2: DECLARED EARLY FOR ACCESS ---
    function endGame(won) {
        isGameOver = true;
        if (won) {
            statusElement.textContent = "Victory! Safe Zone Cleared 😎🎉";
        } else {
            statusElement.textContent = "Boom! Game Over 💥👾";
            revealAllMines();
        }
    }

    // --- MOVE 3: DECLARED EARLY FOR RECURSIVE CALCULATIONS ---
    function revealEmptyNeighbors(row, col) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = row + dr;
                let nc = col + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    revealTile(board[nr][nc]);
                }
            }
        }
    }

    // --- MOVE 4: REVEALTILE PLACED IN PLAIN SIGHT FOR CREATEBOARD ---
    function revealTile(tile) {
        if (isGameOver || tile.isRevealed || tile.isFlagged || boardElement.offsetParent === null) return;

        tile.isRevealed = true;
        tilesRevealedCount++;
        tile.element.classList.add("revealed");

        if (tile.isMine) {
            endGame(false);
            tile.element.classList.add("mine");
            tile.element.textContent = "💣";
            return;
        }

        if (tile.neighborMines > 0) {
            tile.element.textContent = tile.neighborMines;
            tile.element.setAttribute("data-count", tile.neighborMines);
        } else {
            revealEmptyNeighbors(tile.r, tile.c);
        }

        if (tilesRevealedCount === ROWS * COLS - MINE_COUNT) {
            endGame(true);
        }
    }

    // --- MOVE 5: TOGGLEFLAG PLACED IN PLAIN SIGHT FOR CREATEBOARD ---
    function toggleFlag(tile) {
        if (isGameOver || tile.isRevealed || boardElement.offsetParent === null) return;

        if (!tile.isFlagged) {
            tile.isFlagged = true;
            tile.element.classList.add("flagged");
            tile.element.textContent = "🚩";
            minesLeft--;
        } else {
            tile.isFlagged = false;
            tile.element.classList.remove("flagged");
            tile.element.textContent = "";
            minesLeft++;
        }
        statusElement.textContent = `Mines Left: ${minesLeft}`;
    }

    // --- MOVE 6: NEIGHBOR DETECTOR DECLARED ---
    function countNeighbors(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = row + dr;
                let nc = col + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    if (board[nr][nc].isMine) count++;
                }
            }
        }
        return count;
    }

    // --- MOVE 7: PLACED AT THE BOTTOM SO IT SEES EVERYTHING ABOVE IT ---
    function createBoard() {
        boardElement.innerHTML = "";
        board = [];
        isGameOver = false;
        minesLeft = MINE_COUNT;
        tilesRevealedCount = 0;
        statusElement.textContent = `Mines Left: ${minesLeft}`;

        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                let tile = {
                    r: r,
                    c: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                    element: document.createElement("div")
                };

                tile.element.classList.add("mine-tile");

                // Works perfectly now because revealTile and toggleFlag are already built!
                tile.element.addEventListener("click", () => revealTile(tile));

                tile.element.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    toggleFlag(tile);
                });

                boardElement.appendChild(tile.element);
                row.push(tile);
            }
            board.push(row);
        }

        let minesPlanted = 0;
        while (minesPlanted < MINE_COUNT) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);

            if (!board[r][c].isMine) {
                board[r][c].isMine = true;
                minesPlanted++;
            }
        }

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!board[r][c].isMine) {
                    board[r][c].neighborMines = countNeighbors(r, c);
                }
            }
        }
    }

    resetBtn.replaceWith(resetBtn.cloneNode(true));
    document.getElementById("minesweeper-reset-btn").addEventListener("click", createBoard);

    createBoard();
}
