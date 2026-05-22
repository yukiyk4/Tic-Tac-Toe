export function initGame() {
    const cells = document.querySelectorAll('.cell');
    const statusElement = document.querySelector('.status');
    const resetBtn = document.querySelector('.reset-btn');

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let isGameActive = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (board[clickedCellIndex] !== "" || !isGameActive) return;

        board[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.style.color = currentPlayer === "X" ? "#243b53" : "#9fb3c8";

        checkForWinner();
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
            return;
        }

        if (!board.includes("")) {
            statusElement.textContent = "It's a Draw! 🤝";
            isGameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusElement.textContent = `Player ${currentPlayer}'s turn`;
    }

    function resetGame() {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        isGameActive = true;
        statusElement.textContent = "Player X's turn";
        cells.forEach(cell => cell.textContent = "");
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
}
