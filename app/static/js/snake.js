const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


const boxSize = 20;
let snake, direction, food, score, game;
let isGameOver = false;

function initializeGame() {
  snake = [{ x: 9 * boxSize, y: 9 * boxSize }];
  direction = null;
  food = {
    x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
    y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize,
  };
  score = 0;
  isGameOver = false;
  document.getElementById("gameMessage").classList.add("hidden");
  document.getElementById("scoreDisplay").textContent = `Score: ${score}`;
  clearInterval(game);
  game = setInterval(() => {
    moveSnake();
    draw();
  }, 100);
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

function drawSnake() {
  ctx.fillStyle = "green";
  snake.forEach((segment) => ctx.fillRect(segment.x, segment.y, boxSize, boxSize));
}

function moveSnake() {
    if (isGameOver) return;
  
    const head = { ...snake[0] };
  
    switch (direction) {
      case "LEFT":
        head.x -= boxSize;
        break;
      case "UP":
        head.y -= boxSize;
        break;
      case "RIGHT":
        head.x += boxSize;
        break;
      case "DOWN":
        head.y += boxSize;
        break;
      default:
        return;
    }
  
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= canvas.width ||
      head.y >= canvas.height ||
      snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      document.getElementById("gameMessage").classList.remove("hidden");
      clearInterval(game);
      isGameOver = true;
  

      fetch('/save_snake_score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });
  
      return;
    }
  
    if (head.x === food.x && head.y === food.y) {
      score++;
      document.getElementById("scoreDisplay").textContent = `Score: ${score}`;
      food = {
        x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
        y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize,
      };
    } else {
      snake.pop();
    }
  
    snake.unshift(head);
  }

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  drawSnake();
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      if (direction !== "RIGHT") direction = "LEFT";
      break;
    case "ArrowUp":
      if (direction !== "DOWN") direction = "UP";
      break;
    case "ArrowRight":
      if (direction !== "LEFT") direction = "RIGHT";
      break;
    case "ArrowDown":
      if (direction !== "UP") direction = "DOWN";
      break;
  }
});


document.getElementById("restartBtn").addEventListener("click", () => {
  initializeGame();
});


initializeGame();
