const numRows = 8;
const numCols = 8;
const numMines = 10;

let board = [];
let isGameOver = false;
let isFirstMove = true;
let resetBtn, gameBoard, timer, timerInterval, bestTime;

function createEmptyBoard() {
  board = [];
  for (let i = 0; i < numRows; i++) {
    board[i] = [];
    for (let j = 0; j < numCols; j++) {
      board[i][j] = {
        isMine: false,
        revealed: false,
        flagged: false,
        count: 0,
      };
    }
  }
}

function placeMines(firstRow, firstCol) {
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * numRows);
    const col = Math.floor(Math.random() * numCols);
    if (
      !board[row][col].isMine &&
      (Math.abs(row - firstRow) > 1 || Math.abs(col - firstCol) > 1)
    ) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }
}

function calculateAdjacentCounts() {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (!board[i][j].isMine) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const ni = i + dx;
            const nj = j + dy;
            if (
              ni >= 0 &&
              ni < numRows &&
              nj >= 0 &&
              nj < numCols &&
              board[ni][nj].isMine
            ) {
              count++;
            }
          }
        }
        board[i][j].count = count;
      }
    }
  }
}

function initializeBoard() {
  isGameOver = false;
  isFirstMove = true;
  createEmptyBoard();
  resetTimer();
  renderBestTime();
}

function revealCell(row, col) {
  if (isGameOver) return;
  if (
    row < 0 ||
    row >= numRows ||
    col < 0 ||
    col >= numCols ||
    board[row][col].revealed ||
    board[row][col].flagged
  ) {
    return;
  }

  if (isFirstMove) {
    placeMines(row, col);
    calculateAdjacentCounts();
    isFirstMove = false;
    startTimer();
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        revealCell(row + dx, col + dy);
      }
    }
  }

  board[row][col].revealed = true;

  if (board[row][col].isMine) {
    alert("Game Over! You stepped on a mine.");
    isGameOver = true;
    stopTimer();
    revealAll();
    return;
  }

  if (board[row][col].count === 0) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        revealCell(row + dx, col + dy);
      }
    }
  }

  renderBoard();
  checkWin();
}

function toggleFlag(row, col) {
  if (isGameOver) return;
  if (board[row][col].revealed) return;
  board[row][col].flagged = !board[row][col].flagged;
  renderBoard();
  checkWin();
}

function renderBoard() {
  gameBoard.innerHTML = "";
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      if (board[i][j].revealed) {
        cellDiv.classList.add("revealed");
        if (board[i][j].isMine) {
          cellDiv.classList.add("mine");
          cellDiv.textContent = "💣";
        } else if (board[i][j].count > 0) {
          cellDiv.textContent = board[i][j].count;
        }
      } else if (board[i][j].flagged) {
        cellDiv.textContent = "🚩";
      }
      cellDiv.addEventListener("click", () => revealCell(i, j));
      cellDiv.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(i, j);
      });
      gameBoard.appendChild(cellDiv);
    }
  }
}

function revealAll() {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      board[i][j].revealed = true;
    }
  }
  renderBoard();
}

function startTimer() {
  timer = 0;
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = `Time: ${timer}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  timer = 0;
  document.getElementById("timer").textContent = `Time: 0s`;
}

function renderBestTime() {
  bestTime = localStorage.getItem("bestMinesweeperTime") || null;
  document.getElementById("bestTime").textContent = bestTime
    ? `Best Time: ${bestTime}s`
    : "Best Time: None";
}

function saveBestTime() {
  if (!bestTime || timer < bestTime) {
    bestTime = timer;
    localStorage.setItem("bestMinesweeperTime", bestTime);
    renderBestTime();
  }
}

function checkWin() {
  let revealedNonMines = 0;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (!board[i][j].isMine && board[i][j].revealed) {
        revealedNonMines++;
      }
    }
  }

  const totalNonMines = numRows * numCols - numMines;

  if (revealedNonMines === totalNonMines) {
    stopTimer();
    saveBestTime();
    launchConfetti();
    document.getElementById("gameMessage").textContent = "You Win! 🎉";
    document.getElementById("gameMessage").classList.remove("hidden");
    isGameOver = true;
    revealAll();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  resetBtn = document.getElementById("resetBtn");
  gameBoard = document.getElementById("gameBoard");
  initializeBoard();
  renderBoard();
  resetBtn.addEventListener("click", () => {
    initializeBoard();
    renderBoard();
    resetGameMessage();
  });
});
