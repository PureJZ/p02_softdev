const grid = document.querySelector('.wordle-grid');
const keyboard = document.getElementById('keyboard');
const playAgainButton = document.getElementById('playAgainButton');
const chatBox = document.getElementById('chatBox')


const correct = 'rgb(106, 170, 100)';
const present = 'rgb(201, 180, 88)';
const absent = 'rgb(120, 124, 126)';
const blank = 'rgb(255, 255, 255)';
const border = 'rgb(211, 214, 218)';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let currentGuess = '';
let currentBox = 1;
let gameOver = false;
let currentAttempt = 0;
let randomWord = "";
let isAnimating = false;

let wordsArray = [];

function loadWordlist() {
    return fetch('/static/wordleWords.txt')
        .then(response => response.text())
        .then(text => {
            wordsArray = text.split('\n')
                .map(word => word.trim())
                .filter(word => word.length > 0)
                .map(word => word.toUpperCase());
        })
        .catch(err => {
            console.error('Problem reading the file:', err);
        });
}


// Creates the boxes
for (let i = 0; i < 29; i++) {
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
async function newGame(){
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

    randomWord = generateRandomWord();
    currentBox = 0;
    currentGuess = '';
    currentAttempt = 0;
    gameOver = false;
    enableKeyboard();
}

document.getElementById('playAgainButton').addEventListener('click', () => {
    newGame();
    playAgainButton.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    // Check if the game is over or if the focus is on an input field
    if (isAnimating || gameOver || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT') {
        return; // Ignore the event if the game is over or the focus is on input, textarea, or select
    }

    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
        if (currentGuess.length < 5) {
            currentGuess += key;
            displayLetterOnGrid(key);
        }
    } else if (key === 'BACKSPACE' || e.key === 'Delete') {
        if(currentGuess.length !== 0){
            currentGuess = currentGuess.slice(0, -1);
            removeLetterOnGrid();
        }
    } else if (key === 'ENTER') {
        window.submitGuess();
    }
});

function displayLetterOnGrid(letter){
    const boxes = document.querySelectorAll('.wordle-box');
    const front = boxes[currentBox].querySelector('.front');
    front.textContent = letter;
    front.style.color = '';
    front.style.borderColor = absent;
    currentBox++;
}

function removeLetterOnGrid(){
    const boxes = document.querySelectorAll('.wordle-box');
    currentBox--;
    const front = boxes[currentBox].querySelector('.front');
    front.textContent = "";
    front.style.borderColor = border;
}

window.submitGuess = () => {
    if (currentGuess.length !== 5) {
        chatBox.textContent = "Please enter a 5-letter word.";
        shake();
        return; 
    }

    if (wordsArray.indexOf(currentGuess) === -1) {
        chatBox.textContent = "Not a valid 5-letter word!";
        shake();
        return; 
    }
    

    if (currentGuess === randomWord) {
        updateColors(currentGuess);
        chatBox.textContent = "You Win!";
        currentAttempt++;
        disableKeyboard();
        gameOver = true;
        setTimeout(() => {
            playAgainButton.style.display = 'inline-block';
        }, 3000);
        currentGuess = '';
    } else {
        chatBox.textContent = "";
        updateColors(currentGuess);
        currentAttempt++;
        if (currentAttempt >= 6) {
            chatBox.textContent = "Game over! The word was: " + randomWord;
            disableKeyboard(); 
            gameOver = true;
            playAgainButton.style.display = 'inline-block';
        }
        currentGuess = '';
    }
};


function disableKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.disabled = true; 
    });
}

function enableKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.disabled = false;
    });
}


function updateColors(guess) {
    const startIdx = currentAttempt * 5; // Assuming currentAttempt is zero-based
    const boxes = document.querySelectorAll('.wordle-box');
    let dictionary = createLetterCountDictionary(randomWord);
    let guessState = ['absent', 'absent', 'absent', 'absent', 'absent']
    console.log(randomWord);

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === randomWord[i]) {
            guessState[i] = 'correct';
            getKeyButton(guess[i]).style.backgroundColor = correct;
            dictionary[guess[i]] -= 1;

        }
    }
    for (let i = 0; i < guess.length; i++) {
        if (randomWord.includes(guess[i])) {
            if (dictionary[guess[i]] > 0 && guessState[i] != 'correct') {
                guessState[i] = 'present';
                dictionary[guess[i]] -= 1;
                if (getKeyButton(guess[i]).style.backgroundColor != correct){
                    getKeyButton(guess[i]).style.backgroundColor = present;
                }
            } else if (guessState[i] != 'correct'){
                guessState[i] = 'absent';
                if (getKeyButton(guess[i]).style.backgroundColor != present && getKeyButton(guess[i]).style.backgroundColor != correct){
                    getKeyButton(guess[i]).style.backgroundColor = absent;
                }
            }
        } else {
            guessState[i] = 'absent';
            getKeyButton(guess[i]).style.backgroundColor = absent;
        }
    }
    
    isAnimating = true;
    for (let i = 0; i < guess.length; i++){
        setTimeout(() => {
            flipBox(boxes[startIdx + i], guess[i], guessState[i]);
        }, i * 400);
        setTimeout(() => {
            isAnimating = false; // End animation
        }, 400);
    }

    // Check if win
    if (guess === randomWord) {
        setTimeout(() => {
            for (let i = startIdx; i < startIdx + 5; i++) {
                setTimeout(() => {
                    boxes[i].classList.add('win');
                }, (i - startIdx) * 100);
            }

            // Set a timeout to remove the 'win' class and change color to 'present'
            setTimeout(() => {
                for (let i = startIdx; i < startIdx + 5; i++) {
                    boxes[i].classList.remove('win');
                }
            }, 2000); // Delay in milliseconds
        }, guess.length * 400); // Ensure this runs after all boxes have flipped
    }
}

function getKeyButton(letter) {
    // Select all buttons with class 'key'
    const buttons = document.querySelectorAll('.key');

    // Iterate over the buttons to find the one that matches the letter
    for (const btn of buttons) {
      if (btn.textContent === letter) {
        return btn; // Return the button that matches the letter
      }
    }

    return null; // If no button matches the letter, return null
  }

function createLetterCountDictionary(word) {
    let letterCount = {};

    if (typeof word === 'string') {
        word = word.toUpperCase();

        // Convert the word to an array of characters and iterate over it
        word.split('').forEach(char => {
            // If the character is already in the dictionary, increment its count
            if (letterCount[char]) {
                letterCount[char]++;
            } else {
                // Otherwise, add the character to the dictionary with a count of 1
                letterCount[char] = 1;
            }
        });
    } else {
        console.error('Expected a string for word, received:', word);
        console.error(typeof word);
    }

    return letterCount;
}

// Function to flip the boxes
function flipBox(box, letter, state) {
    const front = box.querySelector('.front');
    const back = box.querySelector('.back');

    if (!front || !back) {
        console.error("Missing .front or .back element in .wordle-box", box);
        return;
    }
    // Update front face
    front.textContent = letter;
    // Update back face with state-specific styles
    back.textContent = letter;
    front.style.color = 'white';
    back.style.color = 'white';
    if (state === 'correct') {
        back.style.backgroundColor = correct;
        back.style.borderColor = correct;
    } else if (state === 'present') {
        back.style.backgroundColor = present;
        back.style.borderColor = present;
    } else if (state === 'absent') {
        back.style.backgroundColor = absent;
        back.style.borderColor = absent;
    }

    // Add the flipped class to trigger the animation
    box.classList.add('flipped');
        setTimeout(() => {
        box.classList.add('no-transition'); // Disable transition
        box.classList.remove('flipped');
        front.style.backgroundColor = back.style.backgroundColor;
        front.style.borderColor = back.style.borderColor;

        // Force reflow to apply the no-transition class immediately
        void box.offsetWidth;

        // Remove the no-transition class to re-enable transition
        box.classList.remove('no-transition');
    }, 400);
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


document.addEventListener('DOMContentLoaded', async () => {
    await loadWordlist(); // Load once on startup
    newGame();
});



