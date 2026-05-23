// Keep track of our global listeners and loop across tab switches
let globalKeyDownHandler = null;
let globalSpeedChangeHandler = null;
let gameInterval = null;

export function initSnakeGame() {
    const canvas = document.getElementById("snakeCanvas");

    // Safety check: if the element isn't visible or on screen, don't execute
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scoreElement = document.getElementById("snake-score");
    const resetBtn = document.getElementById("snake-reset-btn");
    const speedSelect = document.getElementById("snakeSpeed");

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let food = { x: 5, y: 5 };
    let dx = 1;
    let dy = 0;
    let score = 0;
    let isGameActive = true;

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        const currentSpeed = parseInt(speedSelect.value);
        gameInterval = setInterval(update, currentSpeed);
    }

    // HELPER: Added to stop the interval loop cleanly when requested by the observer
    function stopSnakeLoop() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }

    function update() {
        // Stop calculating if the user switched tabs and hid the element
        if (canvas.offsetParent === null) {
            stopSnakeLoop();
            return;
        }

        if (!isGameActive) return;

        moveSnake();

        if (checkGameOver()) {
            isGameActive = false;
            scoreElement.textContent = `Game Over! Final Score: ${score} 😵`;
            stopSnakeLoop();
            return;
        }

        checkFoodCollision();
        draw();
    }

    function draw() {
        const computedStyles = getComputedStyle(document.documentElement);
        const canvasBg = computedStyles.getPropertyValue("--card-bg").trim() || "#ffffff";

        const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
        const snakeHeadColor = "#10b981";
        const snakeBodyColor = isDarkMode ? "#047857" : "#059669";

        ctx.fillStyle = canvasBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- DRAW FRUIT SKIN ---
        const foodX = food.x * gridSize + gridSize / 2;
        const foodY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2 - 1;

        let appleGradient = ctx.createRadialGradient(foodX - 2, foodY - 2, 1, foodX, foodY, radius);
        appleGradient.addColorStop(0, "#ff8787");
        appleGradient.addColorStop(0.4, "#fa5252");
        appleGradient.addColorStop(1, "#c92a2a");

        ctx.beginPath();
        ctx.arc(foodX, foodY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = appleGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(foodX, foodY - radius + 2);
        ctx.quadraticCurveTo(foodX + 2, foodY - radius - 4, foodX + 4, foodY - radius - 5);
        ctx.strokeStyle = "#868e96";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(foodX + 4, foodY - radius - 4, 3, 1.5, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#40c057";
        ctx.fill();

        // --- DRAW SNAKE SKIN ---
        snake.forEach((part, index) => {
            const partX = part.x * gridSize;
            const partY = part.y * gridSize;
            const centerX = partX + gridSize / 2;
            const centerY = partY + gridSize / 2;

            if (index === 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, gridSize / 2, 0, 2 * Math.PI);
                ctx.fillStyle = snakeHeadColor;
                ctx.fill();

                ctx.fillStyle = "#ffffff";
                let eyeSize = 3;
                let pupilSize = 1.5;
                let eyeOffset = 4;

                let eye1 = { x: 0, y: 0 };
                let eye2 = { x: 0, y: 0 };

                if (dx === 1) {
                    eye1 = { x: centerX + eyeOffset, y: centerY - eyeOffset };
                    eye2 = { x: centerX + eyeOffset, y: centerY + eyeOffset };
                } else if (dx === -1) {
                    eye1 = { x: centerX - eyeOffset, y: centerY - eyeOffset };
                    eye2 = { x: centerX - eyeOffset, y: centerY + eyeOffset };
                } else if (dy === -1) {
                    eye1 = { x: centerX - eyeOffset, y: centerY - eyeOffset };
                    eye2 = { x: centerX + eyeOffset, y: centerY - eyeOffset };
                } else if (dy === 1) {
                    eye1 = { x: centerX - eyeOffset, y: centerY + eyeOffset };
                    eye2 = { x: centerX + eyeOffset, y: centerY + eyeOffset };
                }

                ctx.beginPath();
                ctx.arc(eye1.x, eye1.y, eyeSize, 0, 2 * Math.PI);
                ctx.arc(eye2.x, eye2.y, eyeSize, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.arc(eye1.x + dx * 0.5, eye1.y + dy * 0.5, pupilSize, 0, 2 * Math.PI);
                ctx.arc(eye2.x + dx * 0.5, eye2.y + dy * 0.5, pupilSize, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                let segmentRadius = gridSize / 2 - (index / snake.length) * 2;
                if (segmentRadius < 4) segmentRadius = 4;

                ctx.beginPath();
                ctx.arc(centerX, centerY, segmentRadius, 0, 2 * Math.PI);
                ctx.fillStyle = snakeBodyColor;
                ctx.fill();

                if (index % 2 === 0) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, segmentRadius * 0.5, 0, 2 * Math.PI);
                    ctx.fillStyle = "#34d399";
                    ctx.fill();
                }
            }
        });
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
        snake.pop();
    }

    function checkFoodCollision() {
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            snake.push({ ...snake[snake.length - 1] });
            generateFood();
        }
    }

    function generateFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        snake.forEach((part) => {
            if (part.x === food.x && part.y === food.y) {
                generateFood();
            }
        });
    }

    function checkGameOver() {
        const head = snake[0];
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return true;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function changeDirection(e) {
        const keyPressed = e.key;
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;

        if (canvas.offsetParent === null) return; // Block input tracking if hidden

        // Prevent space and arrow keys from layout jumping/scrolling the window
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(keyPressed)) {
            e.preventDefault();
        }

        if (["ArrowLeft", "a"].includes(keyPressed) && !goingRight) { dx = -1; dy = 0; }
        if (["ArrowUp", "w"].includes(keyPressed) && !goingDown) { dx = 0; dy = -1; }
        if (["ArrowRight", "d"].includes(keyPressed) && !goingLeft) { dx = 1; dy = 0; }
        if (["ArrowDown", "s"].includes(keyPressed) && !goingUp) { dx = 0; dy = 1; }
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        generateFood();
        dx = 1;
        dy = 0;
        score = 0;
        isGameActive = true;
        scoreElement.textContent = "Score: 0";
        startGame();
    }

    // --- CLEANUP LOGIC FOR MODULAR HUB ROUTING ---
    if (globalKeyDownHandler) {
        window.removeEventListener("keydown", globalKeyDownHandler);
    }
    if (globalSpeedChangeHandler) {
        speedSelect.removeEventListener("change", globalSpeedChangeHandler);
    }

    globalKeyDownHandler = changeDirection;
    globalSpeedChangeHandler = () => {
        if (isGameActive) startGame();
    };

    window.addEventListener("keydown", globalKeyDownHandler);
    speedSelect.addEventListener("change", globalSpeedChangeHandler);

    // --- TAB WATCHER INTERSECTION OBSERVER ---
    const snakeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                stopSnakeLoop(); // Freeze snake loop instantly when leaving tab
            }
        });
    }, { threshold: 0 });

    const snakeSection = document.getElementById("snake-page");
    if (snakeSection) {
        snakeObserver.observe(snakeSection);
    }

    // Button Reset Setup
    resetBtn.replaceWith(resetBtn.cloneNode(true));
    document.getElementById("snake-reset-btn").addEventListener("click", resetGame);

    startGame();
} // MAIN CLOSING BRACKET REMOVED FROM MIDDLE AND FIXED DOWN HERE!
