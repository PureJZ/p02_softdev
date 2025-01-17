const BOARD_SIZE = 8;
let gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
let score = 0;
let selectedBlock = null;
let selectedBlockIndex = null;
let currentBlocks = [];
let usedBlocks = new Set();

const blocks = [
    [[1, 1], [1, 1]], // 2x2
    [[1, 1, 1]], // 1x3
    [[1], [1], [1]], // 3x1
    [[1, 1, 1], [0, 1, 0]], // T shape
    [[1, 1], [0, 1], [0, 1]], // L shape
    [[1]], // 1x1
    [[1, 1, 1, 1]], // 1x4
    [[1], [1], [1], [1]], // 4x1
];

function getRandomBlocks() {
    let available = [...Array(blocks.length).keys()];
    let selected = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        selected.push(available[randomIndex]);
        available.splice(randomIndex, 1);
    }
    return selected;
}

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => tryPlaceBlock(i, j));
            cell.addEventListener('mouseover', () => showBlockPreview(i, j));
            cell.addEventListener('mouseout', clearPreviews);
            board.appendChild(cell);
        }
    }
}

function createBlockOptions() {
    const container = document.getElementById('block-options');
    container.innerHTML = '';
    currentBlocks.forEach((blockIndex, i) => {
        const option = document.createElement('div');
        option.className = 'block-option';
        if (usedBlocks.has(i)) option.classList.add('used');
        option.addEventListener('click', () => {
            if (!usedBlocks.has(i)) selectBlock(blockIndex, i);
        });
        const block = blocks[blockIndex];
        block.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'block-row';
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.className = cell ? 'block-cell' : 'empty-cell';
                rowDiv.appendChild(cellDiv);
            });
            option.appendChild(rowDiv);
        });
        container.appendChild(option);
    });
    checkGameOver();
}

function countBlockCells(block) {
    return block.reduce((sum, row) =>
        sum + row.reduce((rowSum, cell) => rowSum + cell, 0), 0);
}

function selectBlock(index, optionIndex) {
    selectedBlock = blocks[index];
    selectedBlockIndex = optionIndex;
    clearPreviews();
}

function showBlockPreview(row, col) {
    if (!selectedBlock) return;
    clearPreviews();
    if (canPlaceBlock(row, col, selectedBlock)) {
        for (let i = 0; i < selectedBlock.length; i++) {
            for (let j = 0; j < selectedBlock[0].length; j++) {
                if (selectedBlock[i][j]) {
                    const cell = document.querySelector(
                        `[data-row="${row + i}"][data-col="${col + j}"]`
                    );
                    if (cell) cell.classList.add('preview');
                }
            }
        }
    }
}

function clearPreviews() {
    document.querySelectorAll('.preview').forEach(cell => {
        cell.classList.remove('preview');
    });
}

function canPlaceBlock(row, col, block) {
    if (!block) return false;
    for (let i = 0; i < block.length; i++) {
        for (let j = 0; j < block[0].length; j++) {
            if (block[i][j]) {
                if (row + i >= BOARD_SIZE || col + j >= BOARD_SIZE) return false;
                if (gameBoard[row + i][col + j]) return false;
            }
        }
    }
    return true;
}

function checkCanPlaceAnyBlock(block) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (canPlaceBlock(i, j, block)) {
                return true;
            }
        }
    }
    return false;
}

function saveScoreToServer() {
    fetch('/save_blockblast_score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: score }),
    }).catch((err) => console.error('Failed to save Block Blast score:', err));
  }

function checkGameOver() {
    const remainingBlocks = currentBlocks.filter((_, i) => !usedBlocks.has(i));
    for (const blockIndex of remainingBlocks) {
      if (checkCanPlaceAnyBlock(blocks[blockIndex])) {
        return false;
      }
    }
    document.getElementById('game-over').style.display = 'block';
    saveScoreToServer();
    return true;
  }

function tryPlaceBlock(row, col) {
    if (!selectedBlock || usedBlocks.has(selectedBlockIndex)) return;
    if (canPlaceBlock(row, col, selectedBlock)) {
        let cellsPlaced = 0;
        for (let i = 0; i < selectedBlock.length; i++) {
            for (let j = 0; j < selectedBlock[0].length; j++) {
                if (selectedBlock[i][j]) {
                    gameBoard[row + i][col + j] = 1;
                    const cell = document.querySelector(
                        `[data-row="${row + i}"][data-col="${col + j}"]`
                    );
                    cell.classList.add('filled');
                    cellsPlaced++;
                }
            }
        }
        score += cellsPlaced * 10;
        document.getElementById('score').textContent = `Score: ${score}`;
        checkLines();
        usedBlocks.add(selectedBlockIndex);
        selectedBlock = null;
        selectedBlockIndex = null;
        clearPreviews();
        if (usedBlocks.size === 3) {
            usedBlocks.clear();
            currentBlocks = getRandomBlocks();
        }
        createBlockOptions();
    }
}

function checkLines() {
    let rowsCleared = 0;
    let colsCleared = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        if (gameBoard[i].every(cell => cell === 1)) {
            clearRow(i);
            rowsCleared++;
        }
    }
    for (let j = 0; j < BOARD_SIZE; j++) {
        if (gameBoard.every(row => row[j] === 1)) {
            clearColumn(j);
            colsCleared++;
        }
    }
    if (rowsCleared > 0 || colsCleared > 0) {
        score += (rowsCleared + colsCleared) * 100;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
}

function clearRow(row) {
    for (let j = 0; j < BOARD_SIZE; j++) {
        gameBoard[row][j] = 0;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
        cell.classList.remove('filled');
    }
}

function clearColumn(col) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        gameBoard[i][col] = 0;
        const cell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
        cell.classList.remove('filled');
    }
}

function restartGame() {
    gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    score = 0;
    selectedBlock = null;
    selectedBlockIndex = null;
    usedBlocks.clear();
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('game-over').style.display = 'none';
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('filled', 'preview');
    });
    currentBlocks = getRandomBlocks();
    createBlockOptions();
}

document.addEventListener("DOMContentLoaded", () => {
    currentBlocks = getRandomBlocks();
    createBoard();
    createBlockOptions();
  });
