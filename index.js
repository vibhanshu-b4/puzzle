let gridRows = 3; //number of rows in grid

let ansGrid = answerGrid(gridRows); //the solution grid

let grid = randomGrid(gridRows); //random current grid which will be displayed

// Game statistics variables
let moveCount = 0;
let startTime = null;
let timerInterval = null;
let gameStarted = false;

// Background music functionality
let backgroundMusic = document.getElementById("background-music");
let dropdown = document.querySelector(".dropdown");
let select = document.querySelector(".select");
let caret = document.querySelector(".caret");
let menu = document.querySelector(".menu");
let options = document.querySelectorAll(".menu li");
let selected = document.querySelector(".selected");

// Music files array
const musicFiles = {
  "None": "",
  "Audio1": "sounds/bgm/1.mp3",
  "Audio2": "sounds/bgm/2.mp3", 
  "Audio3": "sounds/bgm/3.mp3",
  "Audio4": "sounds/bgm/4.mp3",
  "Audio5": "sounds/bgm/5.mp3"
};

// Initialize game
makeHTMLGrid(gridRows);
updateHTMLGrid(gridRows);
document.querySelector(".goal-image").setAttribute("src", "images/goal" + (gridRows * gridRows - 1) + ".png");

// Function to create answer grid (solved state)
function answerGrid(rows) {
  let ans = [];
  for (let i = 0; i < rows * rows; i++) {
    ans.push(i + 1);
  }
  ans[rows * rows - 1] = 0; // Last position is empty
  return ans;
}

// Function to create random solvable grid
function randomGrid(rows) {
  let numbers = [];
  for (let i = 0; i < rows * rows; i++) {
    numbers.push(i + 1);
  }
  numbers[rows * rows - 1] = 0; // Last position is empty
  
  // Shuffle the array to create random configuration
  // Make sure it's solvable by doing valid moves from solved state
  let shuffled = [...numbers];
  let emptyIndex = rows * rows - 1;
  
  // Perform random valid moves to ensure solvability
  for (let i = 0; i < 1000; i++) {
    let possibleMoves = [];
    let emptyRow = Math.floor(emptyIndex / rows);
    let emptyCol = emptyIndex % rows;
    
    // Check all possible moves
    if (emptyRow > 0) possibleMoves.push(emptyIndex - rows); // Up
    if (emptyRow < rows - 1) possibleMoves.push(emptyIndex + rows); // Down
    if (emptyCol > 0) possibleMoves.push(emptyIndex - 1); // Left
    if (emptyCol < rows - 1) possibleMoves.push(emptyIndex + 1); // Right
    
    // Pick random move
    let randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    // Swap empty space with selected tile
    [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
    emptyIndex = randomMove;
  }
  
  return shuffled;
}

// Function to create HTML grid
function makeHTMLGrid(rows) {
  let gridContainer = document.querySelector(".grid");
  gridContainer.innerHTML = ""; // Clear existing grid
  
  // Remove all grid classes
  gridContainer.classList.remove("grid-8", "grid-15", "grid-24");
  
  // Add appropriate grid class based on rows
  if (rows == 3) gridContainer.classList.add("grid-8");
  else if (rows == 4) gridContainer.classList.add("grid-15");
  else if (rows == 5) gridContainer.classList.add("grid-24");
  
  // Show the grid
  gridContainer.style.display = "grid";
  
  // Create boxes
  for (let i = 0; i < rows * rows; i++) {
    let box = document.createElement("div");
    box.classList.add("box");
    box.id = "box-" + i;
    gridContainer.appendChild(box);
  }
}

// Function to update HTML grid display
function updateHTMLGrid(rows) {
  for (let i = 0; i < rows * rows; i++) {
    let box = document.getElementById("box-" + i);
    if (grid[i] === 0) {
      box.textContent = "";
      box.style.visibility = "hidden"; // Keep the space but make it invisible
    } else {
      box.textContent = grid[i];
      box.style.visibility = "visible";
      box.classList.remove("box-hidden");
    }
  }
}

// Function to find empty box position
function findEmptyBox() {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0) {
      return i;
    }
  }
  return -1;
}

// Movement functions - Arrow keys move the EMPTY BOX in that direction
function upKey() {
  let emptyIndex = findEmptyBox();
  let rows = gridRows;
  
  // Up arrow moves empty box UP (swap with tile above it)
  // Check if empty box can move up (not in top row)
  if (emptyIndex >= rows) {
    // Swap empty box with tile above it
    [grid[emptyIndex], grid[emptyIndex - rows]] = [grid[emptyIndex - rows], grid[emptyIndex]];
    return true;
  }
  return false;
}

function downKey() {
  let emptyIndex = findEmptyBox();
  let rows = gridRows;
  
  // Down arrow moves empty box DOWN (swap with tile below it)
  // Check if empty box can move down (not in bottom row)
  if (emptyIndex < rows * (rows - 1)) {
    // Swap empty box with tile below it
    [grid[emptyIndex], grid[emptyIndex + rows]] = [grid[emptyIndex + rows], grid[emptyIndex]];
    return true;
  }
  return false;
}

function leftKey() {
  let emptyIndex = findEmptyBox();
  let rows = gridRows;
  
  // Left arrow moves empty box LEFT (swap with tile to its left)
  // Check if empty box can move left (not in leftmost column)
  if (emptyIndex % rows !== 0) {
    // Swap empty box with tile to its left
    [grid[emptyIndex], grid[emptyIndex - 1]] = [grid[emptyIndex - 1], grid[emptyIndex]];
    return true;
  }
  return false;
}

function rightKey() {
  let emptyIndex = findEmptyBox();
  let rows = gridRows;
  
  // Right arrow moves empty box RIGHT (swap with tile to its right)
  // Check if empty box can move right (not in rightmost column)
  if ((emptyIndex + 1) % rows !== 0) {
    // Swap empty box with tile to its right
    [grid[emptyIndex], grid[emptyIndex + 1]] = [grid[emptyIndex + 1], grid[emptyIndex]];
    return true;
  }
  return false;
}

// Function to check victory condition
function isVictory() {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== ansGrid[i]) {
      return false;
    }
  }
  return true;
}

// Function to start the timer
function startTimer() {
  if (!gameStarted) {
    gameStarted = true;
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// Function to update timer display
function updateTimer() {
  if (startTime) {
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    document.getElementById('timer').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Function to stop timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Function to reset game statistics
function resetStats() {
  moveCount = 0;
  gameStarted = false;
  startTime = null;
  stopTimer();
  document.getElementById('move-count').textContent = '0';
  document.getElementById('timer').textContent = '00:00';
  document.getElementById('victory-overlay').classList.remove('show');
}

// Function to increment move count
function incrementMoveCount() {
  moveCount++;
  document.getElementById('move-count').textContent = moveCount.toString();
}

// Function to show victory screen
function showVictoryScreen() {
  stopTimer();
  const finalTime = document.getElementById('timer').textContent;
  document.getElementById('final-time').textContent = finalTime;
  document.getElementById('final-moves').textContent = moveCount.toString();
  
  // Show victory overlay
  document.getElementById('victory-overlay').classList.add('show');
  
  // Hide victory overlay after 4 seconds and reset game
  setTimeout(() => {
    document.getElementById('victory-overlay').classList.remove('show');
    resetStats();
    grid = randomGrid(gridRows);
    updateHTMLGrid(gridRows);
  }, 4000);
}

// Keyboard event listener
document.addEventListener("keydown", function (event) {
  event.preventDefault();
  let sound = new Audio("sounds/m2.mp3");
  let keyPressed = event.key;
  let moved = false;
  
  switch (keyPressed) {
    case "ArrowDown":
      moved = downKey();
      if (moved) sound.play();
      break;
    case "ArrowUp":
      moved = upKey();
      if (moved) sound.play();
      break;
    case "ArrowLeft":
      moved = leftKey();
      if (moved) sound.play();
      break;
    case "ArrowRight":
      moved = rightKey();
      if (moved) sound.play();
      break;
  }

  if (moved) {
    startTimer();
    incrementMoveCount();
    updateHTMLGrid(gridRows);
    
    //check if you won and act accordingly.
    if (isVictory()) {
      let soundVictory = new Audio("sounds/victory.mp3");
      soundVictory.play();
      showVictoryScreen();
    }
  }
});

//Add swipe functionality for mobiles
{
  let sound = new Audio("sounds/m2.mp3");

  let startX, startY, endX, endY;
  function handleTouchStart(event) {
    event.preventDefault();
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }
  function handleTouchMove(event) {
    event.preventDefault();
    endX = event.touches[0].clientX;
    endY = event.touches[0].clientY;
  }

  function handleTouchEnd() {
    let diffX = endX - startX;
    let diffY = endY - startY;
    let moved = false;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 0) {
        // Swipe right
        moved = leftKey();
        if (moved) sound.play();
      } else {
        // Swipe left
        moved = rightKey();
        if (moved) sound.play();
      }
    } else {
      // Vertical swipe
      if (diffY > 0) {
        // Swipe down
        moved = upKey();
        if (moved) sound.play();
      } else {
        // Swipe up
        moved = downKey();
        if (moved) sound.play();
      }
    }
    
    if (moved) {
      startTimer();
      incrementMoveCount();
      updateHTMLGrid(gridRows);
      
      if (isVictory()) {
        let soundVictory = new Audio("sounds/victory.mp3");
        soundVictory.play();
        showVictoryScreen();
      }
    }
  }

  let gridElement = document.querySelector(".grid");

  gridElement.addEventListener("touchstart", handleTouchStart, false);
  gridElement.addEventListener("touchmove", handleTouchMove, false);
  gridElement.addEventListener("touchend", handleTouchEnd, false);
}

// Change the grid rows and the grid displays when clicked on a mode.
let modeButton = document.querySelectorAll(".mode *");
modeButton.forEach((mode) => {
  mode.addEventListener("click", () => {
    let soundReset = new Audio("sounds/m1.mp3");
    soundReset.play();
    modeButton.forEach((m) => m.classList.remove("active"));
    mode.classList.add("active");
    gridRows = parseInt(document.querySelector(".mode .active").classList[0]);
    
    // Reset game when changing modes
    resetStats();
    ansGrid = answerGrid(gridRows);
    grid = randomGrid(gridRows);

    makeHTMLGrid(gridRows);
    updateHTMLGrid(gridRows);
    
    // Update goal image
    document.querySelector(".goal-image").setAttribute("src", "images/goal" + (gridRows * gridRows - 1) + ".png");
  });
});
