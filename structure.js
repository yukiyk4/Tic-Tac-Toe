const boardElement = document.querySelector('.board');
const cells = document.querySelectorAll('.cell');
const statusElement = document.querySelector('.status');
const resetBtn = document.querySelector('.reset-btn');

// Game state variables
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

// The 8 possible winning combinations on a 3x3 grid
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Handles when a user clicks a square
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Ignore click if the cell is already taken or game is over
    if (board[clickedCellIndex] !== "" || !isGameActive) {
        return;
    }

    // Update internal state and the UI
    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    // Give X and O slightly different text colors for clarity
    clickedCell.style.color = currentPlayer === "X" ? "#243b53" : "#9fb3c8";

    checkForWinner();
}

function checkForWinner() {
    let roundWon = false;

    // Loop through the winning patterns to see if anyone matches
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === "" || board[b] === "" || board[c] === "") {
            continue; // Skip if any of the three squares are empty
        }
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

    // If there are no empty strings left, it's a draw
    if (!board.includes("")) {
        statusElement.textContent = "It's a Draw! 🤝";
        isGameActive = false;
        return;
    }

    // Switch player turn if no win or draw happened
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusElement.textContent = `Player ${currentPlayer}'s turn`;
}

// Resets everything back to default values
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusElement.textContent = "Player X's turn";
    cells.forEach(cell => {
        cell.textContent = "";
    });
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
