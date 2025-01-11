const numRows = 8;
const numCols = 8;
const numMines = 10;

let board = [];
let isGameOver = false;
let isFirstMove = true;
let resetBtn, gameBoard;

function createEmptyBoard() {
  board = [];
  for (let i = 0; i < numRows; i++) {
    board[i] = [];
    for (let j = 0; j < numCols; j++) {
      board[i][j] = {
        isMine: false,
        revealed: false,
        flagged: false,
        count: 0
      };
    }
  }
}

// Here we exclude the cell the user clicked (firstRow, firstCol)
// from having a mine, guaranteeing the first click is safe.
function placeMines(firstRow, firstCol) {
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * numRows);
    const col = Math.floor(Math.random() * numCols);
    // Ensure we don't place a mine on the first-clicked cell
    if (!board[row][col].isMine && !(row === firstRow && col === firstCol)) {
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
}

// The reveal function
// 1. If it's the very first click => place mines anywhere *except* this cell
// 2. If flagged or out of bounds or revealed, ignore
// 3. Reveal the cell; if mine => game over; if count=0 => reveal neighbors
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
  }
  board[row][col].revealed = true;
  if (board[row][col].isMine) {
    alert("Game Over! You stepped on a mine.");
    isGameOver = true;
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

// Toggle flagged state on right-click
function toggleFlag(row, col) {
  if (isGameOver) return;
  if (board[row][col].revealed) return;
  board[row][col].flagged = !board[row][col].flagged;
  renderBoard();
}

// Win detection: if all non-mine cells are revealed
function checkWin() {
  let revealedCount = 0;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (!board[i][j].isMine && board[i][j].revealed) {
        revealedCount++;
      }
    }
  }
  const totalNonMines = numRows * numCols - numMines;
  if (revealedCount === totalNonMines) {
    launchConfetti(); // Optional if you want a win animation
    alert("You win!");
    isGameOver = true;
    revealAll();
  }
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
      cellDiv.addEventListener("contextmenu", e => {
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

// Optional confetti for a win
function launchConfetti() {
  const end = Date.now() + 2500;
  (function frame() {
    confetti({
      particleCount: 5,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      }
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

document.addEventListener("DOMContentLoaded", () => {
  resetBtn = document.getElementById("resetBtn");
  gameBoard = document.getElementById("gameBoard");
  initializeBoard();
  renderBoard();
  resetBtn.addEventListener("click", () => {
    initializeBoard();
    renderBoard();
  });
});
