export function initGame() {
    const cells = document.querySelectorAll('.cell');
    const statusElement = document.querySelector('.status');
    const resetBtn = document.querySelector('.reset-btn');
    const humanModeBtn = document.getElementById('mode-human');
    const botModeBtn = document.getElementById('mode-bot');

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let isGameActive = true;
    let gameMode = "human";
    let botTimeoutId = null; // ADDED: Tracks the active bot delay process

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function handleCellClick(e) {
        // Safety lock: if the section is hidden, ignore accidental interactions
        const tictactoeSection = document.getElementById("tictactoe-page");
        if (tictactoeSection && tictactoeSection.offsetParent === null) return;

        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (board[clickedCellIndex] !== "" || !isGameActive) return;
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

            if (gameMode === "bot" && currentPlayer === "O") {
                // Save the timeout ID so we can cancel it if needed
                botTimeoutId = setTimeout(executeBotMove, 500);
            }
        }
    }

    function executeBotMove() {
        if (!isGameActive) return;

        let botMoveIndex = findStrategicMove("O"); // Attack
        if (botMoveIndex === null) botMoveIndex = findStrategicMove("X"); // Defend
        if (botMoveIndex === null && board[4] === "") botMoveIndex = 4; // Center

        if (botMoveIndex === null) {
            const availableCells = [];
            board.forEach((val, idx) => { if (val === "") availableCells.push(idx); });
            if (availableCells.length > 0) {
                botMoveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
            }
        }

        if (botMoveIndex !== null) {
            const targetCell = document.querySelector(`.cell[data-index="${botMoveIndex}"]`);
            makeMove(botMoveIndex, targetCell);
        }
    }

    function findStrategicMove(playerSymbol) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const values = [board[a], board[b], board[c]];
            if (values.filter(val => val === playerSymbol).length === 2 && values.filter(val => val === "").length === 1) {
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
        if (botTimeoutId) clearTimeout(botTimeoutId); // Cancel any waiting bot calculations
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        isGameActive = true;
        statusElement.textContent = "Player X's turn";
        cells.forEach(cell => cell.textContent = "");
    }

    // --- ADDED: TAB WATCHER FOR TIC-TAC-TOE ---
    const tictactoeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                if (botTimeoutId) {
                    clearTimeout(botTimeoutId); // Clear any pending bot moves if the user leaves the tab
                }
            }
        });
    }, { threshold: 0 });

    const tictactoeSection = document.getElementById("tictactoe-page");
    if (tictactoeSection) {
        tictactoeObserver.observe(tictactoeSection);
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
    humanModeBtn.addEventListener('click', () => changeMode("human"));
    botModeBtn.addEventListener('click', () => changeMode("bot"));

    resetGame();
}
