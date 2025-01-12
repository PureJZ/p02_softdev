const numRows = 4; 
const numCols = 4;
const wordList = ["cat", "dog", "code", "game", "hunt", "word"]; 
let board = [];
let selectedWord = "";
let selectedCells = [];
let foundWords = [];
let resetBtn, gameBoard, foundWordsDiv, gameMessage;

function getRandomLetter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function createBoard() {
  board = [];
  for (let i = 0; i < numRows; i++) {
    board[i] = [];
    for (let j = 0; j < numCols; j++) {
      board[i][j] = {
        letter: getRandomLetter(),
        selected: false,
      };
    }
  }
}

function renderBoard() {
  gameBoard.innerHTML = "";
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.textContent = board[i][j].letter;
      if (board[i][j].selected) {
        cellDiv.classList.add("selected");
      }
      cellDiv.addEventListener("mousedown", () => selectCell(i, j));
      cellDiv.addEventListener("mouseover", (e) => {
        if (e.buttons === 1) selectCell(i, j);
      });
      gameBoard.appendChild(cellDiv);
    }
  }
}

function selectCell(row, col) {
  const cell = board[row][col];
  if (cell.selected || isGameOver()) return;

  selectedCells.push({ row, col });
  selectedWord += cell.letter;
  cell.selected = true;
  renderBoard();
}

function checkWord() {
  if (wordList.includes(selectedWord.toLowerCase()) && !foundWords.includes(selectedWord)) {
    foundWords.push(selectedWord);
    updateFoundWords();
    gameMessage.textContent = "Good job! Word found.";
  } else {
    gameMessage.textContent = "Not a valid word. Try again!";
  }
  resetSelection();
}

function resetSelection() {
  selectedCells.forEach(({ row, col }) => {
    board[row][col].selected = false;
  });
  selectedWord = "";
  selectedCells = [];
  renderBoard();
}

function updateFoundWords() {
  foundWordsDiv.innerHTML = "";
  foundWords.forEach((word) => {
    const wordDiv = document.createElement("div");
    wordDiv.textContent = word;
    wordDiv.classList.add("found-word");
    foundWordsDiv.appendChild(wordDiv);
  });
}

function resetGame() {
  createBoard();
  renderBoard();
  foundWords = [];
  selectedWord = "";
  selectedCells = [];
  gameMessage.textContent = "";
  updateFoundWords();
}

function isGameOver() {
  return foundWords.length === wordList.length;
}

document.addEventListener("DOMContentLoaded", () => {
  resetBtn = document.getElementById("resetBtn");
  gameBoard = document.getElementById("gameBoard");
  foundWordsDiv = document.getElementById("foundWords");
  gameMessage = document.getElementById("gameMessage");

  createBoard();
  renderBoard();
  resetBtn.addEventListener("click", resetGame);
  document.getElementById("submitWord").addEventListener("click", checkWord);
});
