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

function placeMines(firstRow, firstCol) {
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * numRows);
    const col = Math.floor(Math.random() * numCols);
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

function launchConfetti() {
  const end = Date.now() + 5000; 
  (function frame() {
    confetti({
      particleCount: 7,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function resetGameMessage() {
  const gameMessage = document.getElementById("gameMessage");
  gameMessage.textContent = "";
  gameMessage.classList.add("hidden");
}

function checkWin() {
  let revealedNonMines = 0;
  let correctFlags = 0;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cell = board[i][j];
      if (!cell.isMine && cell.revealed) {
        revealedNonMines++;
      }
      if (cell.isMine && cell.flagged) {
        correctFlags++;
      }
    }
  }
  const totalNonMines = numRows * numCols - numMines;
  if (revealedNonMines === totalNonMines || correctFlags === numMines) {
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
