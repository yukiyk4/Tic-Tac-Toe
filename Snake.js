export function initSnakeGame() {
    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");
    const scoreElement = document.getElementById("snake-score");
    const resetBtn = document.getElementById("snake-reset-btn");

    const gridSize = 20; // Size of each grid square
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let food = { x: 5, y: 5 };
    let dx = 1; // Moving right horizontally by default
    let dy = 0; // Vertically stationary
    let score = 0;
    let gameInterval;
    let isGameActive = true;

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        // Runs the game loop every 100ms (adjust for speed)
        gameInterval = setInterval(update, 100);
    }

    function update() {
        if (!isGameActive) return;

        moveSnake();

        if (checkGameOver()) {
            isGameActive = false;
            scoreElement.textContent = `Game Over! Final Score: ${score} 😵`;
            clearInterval(gameInterval);
            return;
        }

        checkFoodCollision();
        draw();
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Snake (Using your deep blue palette theme)
        ctx.fillStyle = "#243b53";
        snake.forEach(part => {
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Draw Food (Using a nice contrasting color)
        ctx.fillStyle = "#9fb3c8";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function moveSnake() {
        // Create new head based on direction
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head); // Add new head to front
        snake.pop(); // Remove tail
    }

    function checkFoodCollision() {
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            scoreElement.textContent = `Score: ${score}`;

            // Grow snake by duplicating the last part
            snake.push({ ...snake[snake.length - 1] });

            generateFood();
        }
    }

    function generateFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);

        // Ensure food doesn't spawn on top of the snake
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) {
                generateFood();
            }
        });
    }

    function checkGameOver() {
        const head = snake[0];

        // Wall collisions
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return true;
        }

        // Self collisions
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

        // Arrow keys & WASD support + preventing turning directly backward into yourself
        if ((keyPressed === 'ArrowLeft' || keyPressed === 'a') && !goingRight) {
            dx = -1; dy = 0;
        }
        if ((keyPressed === 'ArrowUp' || keyPressed === 'w') && !goingDown) {
            dx = 0; dy = -1;
        }
        if ((keyPressed === 'ArrowRight' || keyPressed === 'd') && !goingLeft) {
            dx = 1; dy = 0;
        }
        if ((keyPressed === 'ArrowDown' || keyPressed === 's') && !goingUp) {
            dx = 0; dy = 1;
        }
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

    // Listeners
    window.addEventListener('keydown', changeDirection);
    resetBtn.addEventListener('click', resetGame);

    // Initial trigger
    startGame();
}
