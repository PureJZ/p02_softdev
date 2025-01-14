const numRows = 6; 
const numCols = 6;
let wordList = [];
let board = [];
let selectedWord = "";
let selectedCells = [];
let foundWords = [];
let resetBtn, gameBoard, foundWordsDiv, gameMessage;

function getRandomLetter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

async function fetchWordList() {
  try {
    const response = await fetch("https://random-word-api.herokuapp.com/all");
    if (!response.ok) {
      throw new Error(`Error fetching word list: ${response.status}`);
    }
    const data = await response.json();
    wordList = data.filter(word => word.length <= numCols && /^[a-zA-Z]+$/.test(word));
    console.log("Word list fetched:", wordList);
  } catch (error) {
    console.error("Failed to fetch word list:", error);
    // Use a default word list if fetching fails
    wordList = ["cat", "dog", "code", "game", "hunt", "word"];
  }
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

async function checkWord() {
  const isValid = await validateWord(selectedWord.toLowerCase());
  if (isValid && !foundWords.includes(selectedWord)) {
    foundWords.push(selectedWord);
    updateFoundWords();
    gameMessage.textContent = "Good job! Word found.";
  } else {
    gameMessage.textContent = "Not a valid word. Try again!";
  }
  resetSelection();
}

async function validateWord(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.ok; // Word exists if the API response is OK
  } catch {
    return false; // Treat as invalid if there's an error
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  resetBtn = document.getElementById("resetBtn");
  gameBoard = document.getElementById("gameBoard");
  foundWordsDiv = document.getElementById("foundWords");
  gameMessage = document.getElementById("gameMessage");

  await fetchWordList(); // Fetch the word list first
  createBoard();
  renderBoard();
  
  resetBtn.addEventListener("click", resetGame);
  document.getElementById("submitWord").addEventListener("click", checkWord);
});
