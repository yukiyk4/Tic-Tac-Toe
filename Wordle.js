let globalWordleKeyHandler = null;
let globalWordleResetHandler = null;

export function initWordle() {
    const gridContainer = document.getElementById("wordle-grid");
    const msgDisplay = document.getElementById("wordle-msg");
    const resetBtn = document.getElementById("wordle-reset-btn");

    const rowIds = ["kb-row-1", "kb-row-2", "kb-row-3"];
    const kbRows = rowIds.map(id => document.getElementById(id));

    // FIXED: All words are strictly curated to exactly 5 letters long!
    const dictionary = [
        "APPLE", "BEACH", "CHIPS", "DRIVE", "EARTH",
        "FLAME", "GUIDE", "HOUSE", "INDEX", "JUICE",
        "KNIFE", "LIGHT", "MOUNT", "NIGHT", "PLANT",
        "QUEEN", "ROUND", "SNAKE", "TRAIN", "UNDER",
        "WATER", "YOUTH", "SMART", "PIXEL", "WORDS",
        "BRICK", "BOARD", "MATCH", "STAGE", "CHESS"
    ];

    let secretWord = "";
    let currentRow = 0;
    let currentCol = 0;
    let guessBuffer = ["", "", "", "", ""];
    let isGameOver = false;

    const keyboardLayout = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
    ];

    function setupGame() {
        gridContainer.innerHTML = "";
        kbRows.forEach(row => row.innerHTML = "");

        secretWord = dictionary[Math.floor(Math.random() * dictionary.length)];
        currentRow = 0;
        currentCol = 0;
        guessBuffer = ["", "", "", "", ""];
        isGameOver = false;

        msgDisplay.textContent = "Type a 5-letter word to begin!";

        // Generate Grid Elements
        for (let r = 0; r < 6; r++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "wordle-row";
            for (let c = 0; c < 5; c++) {
                const tileDiv = document.createElement("div");
                tileDiv.className = "wordle-tile";
                tileDiv.id = `tile-${r}-${c}`;
                rowDiv.appendChild(tileDiv);
            }
            gridContainer.appendChild(rowDiv);
        }

        // Generate Virtual Keyboard Keys
        keyboardLayout.forEach((row, rowIndex) => {
            row.forEach(key => {
                const btn = document.createElement("button");
                btn.textContent = key;
                btn.className = "key-btn";
                btn.setAttribute("data-key", key);

                if (key === "ENTER" || key === "BACK") {
                    btn.classList.add("wide-key");
                }

                btn.addEventListener("click", () => handleInput(key));
                kbRows[rowIndex].appendChild(btn);
            });
        });
    }

    function handleInput(key) {
        // TAB VISIBILITY SAFEGUARD: Ignore input if game over or if Wordle tab is hidden
        const wordlePage = document.getElementById("wordle-page");
        if (isGameOver) return;
        if (wordlePage && !wordlePage.classList.contains("active")) return;

        const dynamicKey = key.toUpperCase();

        if (dynamicKey === "BACK" || dynamicKey === "BACKSPACE") {
            if (currentCol > 0) {
                currentCol--;
                guessBuffer[currentCol] = "";
                const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
                tile.textContent = "";
                tile.classList.remove("pop");
            }
        } else if (dynamicKey === "ENTER") {
            if (currentCol === 5) {
                submitGuess();
            } else {
                msgDisplay.textContent = "Not enough letters!";
            }
        } else if (/^[A-Z]$/.test(dynamicKey)) {
            if (currentCol < 5) {
                guessBuffer[currentCol] = dynamicKey;
                const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
                tile.textContent = dynamicKey;
                tile.classList.add("pop");
                currentCol++;
            }
        }
    }

    function submitGuess() {
        const guess = guessBuffer.join("");
        let targetWordLetters = secretWord.split("");

        // Pass 1: Mark Exact Matches (Green / Correct)
        for (let i = 0; i < 5; i++) {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            const letter = guess[i];

            if (letter === secretWord[i]) {
                tile.classList.add("correct");
                colorKey(letter, "correct");
                targetWordLetters[i] = null;
            }
        }

        // Pass 2: Mark Partial Matches (Yellow / Present) or Misplaced (Gray / Absent)
        for (let i = 0; i < 5; i++) {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            const letter = guess[i];

            if (tile.classList.contains("correct")) continue;

            const targetIndex = targetWordLetters.indexOf(letter);
            if (targetIndex > -1) {
                tile.classList.add("present");
                colorKey(letter, "present");
                targetWordLetters[targetIndex] = null;
            } else {
                tile.classList.add("absent");
                colorKey(letter, "absent");
            }
        }

        if (guess === secretWord) {
            msgDisplay.textContent = "🎉 Brilliant! You guessed it!";
            isGameOver = true;
            return;
        }

        currentRow++;
        currentCol = 0;
        guessBuffer = ["", "", "", "", ""];

        if (currentRow === 6) {
            msgDisplay.textContent = `💥 Game Over! Word was: ${secretWord}`;
            isGameOver = true;
        } else {
            msgDisplay.textContent = "Keep guessing!";
        }
    }

    function colorKey(letter, statusClass) {
        const btn = document.querySelector(`.key-btn[data-key="${letter}"]`);
        if (!btn) return;

        if (btn.classList.contains("correct")) return;
        if (btn.classList.contains("present") && statusClass === "absent") return;

        btn.classList.remove("present", "absent");
        btn.classList.add(statusClass);
    }

    // Connect hardware keyboard routing natively with tab active filters
    if (globalWordleKeyHandler) window.removeEventListener("keydown", globalWordleKeyHandler);
    globalWordleKeyHandler = (e) => {
        const wordlePage = document.getElementById("wordle-page");
        if (wordlePage && !wordlePage.classList.contains("active")) return;

        if (e.key === "Backspace") handleInput("BACK");
        else handleInput(e.key);
    };
    window.addEventListener("keydown", globalWordleKeyHandler);

    // Setup clean listener pipeline routing for the restart button
    resetBtn.replaceWith(resetBtn.cloneNode(true));
    const newResetBtn = document.getElementById("wordle-reset-btn");
    globalWordleResetHandler = setupGame;
    newResetBtn.addEventListener("click", globalWordleResetHandler);

    setupGame();
}
