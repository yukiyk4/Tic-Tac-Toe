export function initGame() {
    const cells = document.querySelectorAll('.cell');
    const statusElement = document.querySelector('.status');
    const resetBtn = document.querySelector('.reset-btn');

    // Mode Selectors
    const humanModeBtn = document.getElementById('mode-human');
    const botModeBtn = document.getElementById('mode-bot');

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let isGameActive = true;
    let gameMode = "human"; // Default mode: "human" or "bot"

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (board[clickedCellIndex] !== "" || !isGameActive) return;

        // Block player clicking during Bot's thinking time
        if (gameMode === "bot" && currentPlayer === "O") return;

        makeMove(clickedCellIndex, clickedCell);
    }

    function makeMove(index, cellElement) {
        board[index] = currentPlayer;
        cellElement.textContent = currentPlayer;
        cellElement.style.color = currentPlayer === "X" ? "#38bdf8" : "#fbbf24";

        const gameEnded = checkForWinner();

        if (!gameEnded) {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            statusElement.textContent = `Player ${currentPlayer}'s turn`;

            // If it's Bot mode and O's turn, trigger the bot move
            if (gameMode === "bot" && currentPlayer === "O") {
                setTimeout(executeBotMove, 500); // 500ms delay for natural game feel
            }
        }
    }

    function executeBotMove() {
        if (!isGameActive) return;

        // 1. Attack: Check if Bot (O) can win in this turn
        let botMoveIndex = findStrategicMove("O");

        // 2. Defend: If no win, check if Player (X) needs to be blocked
        if (botMoveIndex === null) {
            botMoveIndex = findStrategicMove("X");
        }

        // 3. Center Position Strategy: Take the center square if open
        if (botMoveIndex === null && board[4] === "") {
            botMoveIndex = 4;
        }

        // 4. Fallback: Pick a random remaining available cell
        if (botMoveIndex === null) {
            const availableCells = [];
            board.forEach((val, idx) => {
                if (val === "") availableCells.push(idx);
            });
            if (availableCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableCells.length);
                botMoveIndex = availableCells[randomIndex];
            }
        }

        // Render Bot's decision
        if (botMoveIndex !== null) {
            const targetCell = document.querySelector(`.cell[data-index="${botMoveIndex}"]`);
            makeMove(botMoveIndex, targetCell);
        }
    }

    // Helper to find a cell that completes a winning line of three
    function findStrategicMove(playerSymbol) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const values = [board[a], board[b], board[c]];

            // Count matching symbols and empty slots in this line
            const matches = values.filter(val => val === playerSymbol).length;
            const emptyCount = values.filter(val => val === "").length;

            if (matches === 2 && emptyCount === 1) {
                if (board[a] === "") return a;
                if (board[b] === "") return b;
                if (board[c] === "") return c;
            }
        }
        return null;
    }

    function checkForWinner() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] === "" || board[b] === "" || board[c] === "") continue;
            if (board[a] === board[b] && board[b] === board[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusElement.textContent = `Player ${currentPlayer} Wins! 🎉`;
            isGameActive = false;
            return true;
        }

        if (!board.includes("")) {
            statusElement.textContent = "It's a Draw! 🤝";
            isGameActive = false;
            return true;
        }

        return false;
    }

    function changeMode(mode) {
        gameMode = mode;
        if (mode === "human") {
            humanModeBtn.classList.add('active');
            botModeBtn.classList.remove('active');
        } else {
            botModeBtn.classList.add('active');
            humanModeBtn.classList.remove('active');
        }
        resetGame();
    }

    function resetGame() {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        isGameActive = true;
        statusElement.textContent = "Player X's turn";
        cells.forEach(cell => cell.textContent = "");
    }

    // Event Hook Listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);

    humanModeBtn.addEventListener('click', () => changeMode("human"));
    botModeBtn.addEventListener('click', () => changeMode("bot"));

    // Reset board cleanly on initial structural call
    resetGame();
}
