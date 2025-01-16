const grid = document.querySelector('.wordle-grid');
const keyboard = document.getElementById('keyboard');
const playAgainButton = document.getElementById('playAgainButton');


const correct = 'rgb(106, 170, 100)';
const present = 'rgb(201, 180, 88)';
const absent = 'rgb(120, 124, 126)';
const blank = 'rgb(255, 255, 255)';
const border = 'rgb(211, 214, 218)';

function getLetterDictionary(){
    const dic = {};
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of letters) {
        dic[letter] = false;
    }
    return dic;
}

let currentGuess = '';
let currentBox = 1;
let gameOver = false;
let currentAttempt = 0;
let randomWord = "";
let guessed_letters = getLetterDictionary();
let start_game = false;
let isAnimating = false;

async function loadWordlist() {
    await fetch('/static/wordleWords.txt')
    // converts words.txt to a string 
    .then(response => response.text())

    // processing the file as a text
    .then(text => {
        // Split the text by new line to create an array
        wordsArray = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        // console.log("Words loaded from file:", wordsArray);
        for(let i = 0; i < wordsArray.length; i++){
            wordsArray[i] = wordsArray[i].toUpperCase();
        }
        possibleWords = wordsArray.map(item => item);
        possibleWords = possibleWords.filter(word => !(word in guessed_words));
    })
    .catch(err => {
        console.error('Problem reading the file:', err);
    });
}

// Creates the boxes
for (let i = 0; i < 29; i++) {
    console.log("aa")
    const box = document.createElement('div');
    box.className = 'wordle-box';

    const front = document.createElement('div');
    front.className = 'front';

    const back = document.createElement('div');
    back.className = 'back';

    box.appendChild(front);
    box.appendChild(back);
    grid.appendChild(box);
}

function handleKeyPress(key) {
    if (isAnimating) return;
    if (key === 'Delete') {
        if (currentGuess.length !== 0) {
            currentGuess = currentGuess.slice(0, -1);
            removeLetterOnGrid();
        }
    } else if (key === 'Enter') {
        window.submitGuess();
    } else if (currentGuess.length < 5) {
        currentGuess += key;
        displayLetterOnGrid(key);
    }
}

const layout = ["QWERTYUIOP", "ASDFGHJKL", "EZXCVBNM←"];
    layout.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.split('').forEach(key => {
            if (key === "E" && index === 2) {
                const enterBtn = document.createElement('button');
                enterBtn.textContent = 'Enter';
                enterBtn.className = 'key enter-key';
                enterBtn.style.backgroundColor = border;
                enterBtn.addEventListener('click', () => handleKeyPress('Enter'));
                rowDiv.appendChild(enterBtn);
            } else if (key === "←") {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '&#x232B;'; // Unicode for Delete (Backspace) symbol
                deleteBtn.className = 'key delete-key';
                deleteBtn.style.backgroundColor = border;
                deleteBtn.addEventListener('click', () => handleKeyPress('Delete'));
                rowDiv.appendChild(deleteBtn);
            } else {
                const btn = document.createElement('button');
                btn.textContent = key;
                btn.className = 'key';
                btn.style.backgroundColor = border;
                btn.addEventListener('click', () => handleKeyPress(key));
                rowDiv.appendChild(btn);
            }
        });
        keyboard.appendChild(rowDiv);
    });

function generateRandomWord(){
    const randomIndex = Math.floor(Math.random() * wordsArray.length);
    return wordsArray[randomIndex];
} 


// Clears and resets everything
function newGame(){
    // clears boxes 
    const boxes = document.querySelectorAll('.wordle-box');
    boxes.forEach((box) => {
        const front = box.querySelector('.front');
        front.style.backgroundColor = blank;
        front.textContent = "";
        front.style.borderColor = border;
        const back = box.querySelector('.back');
        back.style.backgroundColor = blank;
        back.textContent = "";
        back.style.borderColor = border;
    });
    for (let i = 0; i < letters.length; i++){
        getKeyButton(letters[i]).style.backgroundColor = border;
    }
    // Updates letter frequency dictionary
    for (const letter in guessed_letters){
        if (guessed_letters[letter] === true){
            letter_frequency[letter] += 1;
        }
    }
    numberOfAttempts = 0;
    console.log(letter_frequency);
    if (start_game === true){
        if (games > 1){
            updateRandomWord();
        } else if (games === 1) {
            updateRandomWord();
        } else randomWord = generateRandomWord();
    }
    console.log(randomWord);
    currentBox = 0;
    currentGuess = '';
    currentAttempt = 0;
    gameOver = false;
    guessed_letters = getDictionary();
    enableKeyboard();
}



function shake(){
    const boxes = document.querySelectorAll('.wordle-box');
    const startIdx = currentAttempt * 5;
    for (let i = startIdx; i < startIdx + 5; i++){
        boxes[i].classList.add('shake');
    }
    isAnimating = true
    setTimeout(() => {
        for (let i = startIdx; i < startIdx + 5; i++){
            boxes[i].classList.remove('shake');
        }
        isAnimating = false;
    }, 500);
}


newGame();
start_game = true;