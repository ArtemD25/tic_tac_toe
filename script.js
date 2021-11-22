'use strict';

const gameStates = ['notStartedYet', 'crossTurn', 'circleTurn'];
let currentState = gameStates[0];
const board = document.querySelector('#board');
const restartBtn = document.querySelector('#restartBtn');
const nullBtn = document.querySelector("#nullBtn");
let numOfTurns = 0;
const crossFilledCells = [];
const circleFilledCells = [];
const crossWonMessage = 'Player 1 won this round! 😍';
const circleWonMessage = 'Player 2 won this round! 😎';
const drawMessage = 'Nobody won, it\'s a draw 😐';
const zeroScoreMessage = 'Nothing to reset! The score is 0 : 0. 😤';
const modal = document.querySelector('#modal');
const modalTextContainer = document.querySelector('#modal__text');

saveScoreToStorage();
displayScore();

board.addEventListener('click', (evt) => {
  if (numOfTurns < 8 && isClickEligible(evt)) {
    numOfTurns++;
    pasteFigureToCell(evt);
    isThereAWinner();
  } else if (numOfTurns === 8  && isClickEligible(evt)) {
    pasteFigureToCell(evt);
    if (!isThereAWinner()) {
      displayMessage(drawMessage);
      setTimeout(restartGame, 2000);
    }
  }
});

nullBtn.addEventListener('click', () => {
  if (!localStorage.getItem('gameScore')
  || (JSON.parse(localStorage.getItem('gameScore')).cross === 0
  && JSON.parse(localStorage.getItem('gameScore')).circle === 0)) {
    displayMessage(zeroScoreMessage);
  } else {
    localStorage.setItem('gameScore', JSON.stringify({cross: 0,circle: 0}));
    displayScore();
    restartGame();
  }
  
});

restartBtn.addEventListener('click', restartGame);

/**
 * Restarts the game by setting all game variables to zero
 * and removing all figures from the cells.
 */
function restartGame() {
  const allCells = [...document.querySelectorAll('.cell')];
  allCells.forEach(item => {
    if (item.classList.contains('winningCell')) {
      item.classList.remove('winningCell');
    }
    if (item.classList.contains('circleCell')) {
      item.classList.remove('circleCell');
    } else if (item.classList.contains('crossCell')) {
      item.classList.remove('crossCell');
    }
  })
  numOfTurns = 0;
  currentState = gameStates[0];
  crossFilledCells.splice(0);
  circleFilledCells.splice(0);
}

/**
 * Checks whether the click happened on the empty cell.
 * @param {event object} evt is the event object with
 * information in praticular on the event.target.
 * @returns true if the click is eligible.
 */
function isClickEligible(evt) {
  if (!evt.target.classList.contains('circle')
  && !evt.target.classList.contains('cross')
  && evt.target.tagName === 'LI') {
    return true;
  }
  return false;
}

/**
 * Renders the cross or the circle figure in a cell
 * based on the previous move.
 * @param {event object} evt is the event object with
 * information in praticular on the event.target.
 */
function pasteFigureToCell(evt) {
  if (currentState === 'notStartedYet' || currentState === 'circleTurn') {
    currentState = 'crossTurn';
    evt.target.classList.add('crossCell');
    crossFilledCells.push(+evt.target.getAttribute('data-cell'));
  } else {
    currentState = 'circleTurn';
    evt.target.classList.add('circleCell');
    circleFilledCells.push(+evt.target.getAttribute('data-cell'));
  }
}

/**
 * Checks all cells for winning combination of crosses
 * and circles. If found any, paints backgrounds of those cells,
 * saves score update to localstorage, displays new score, shows
 * modal window with a message and restarts game.
 * @returns true if there is a winner in this round and
 * false if there is none.
 */
function isThereAWinner() {
  const winningCombinations = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];

  for (let j = 0; j < winningCombinations.length; j++) {
    const combination = winningCombinations[j];

    if (crossFilledCells.length > 2 && doesArrayIncludesSubarray(crossFilledCells, combination)) {
      paintWinningCells(combination);
      saveScoreToStorage('cross');
      displayScore();
      displayMessage(crossWonMessage);
      setTimeout(restartGame, 2000);
      return true;
    }

    if (circleFilledCells.length > 2 && doesArrayIncludesSubarray(circleFilledCells, combination)) {
      paintWinningCells(combination);
      saveScoreToStorage('circle');
      displayScore();
      displayMessage(circleWonMessage);
      setTimeout(restartGame, 2000);
      return true;
    }
  }
  return false;
}

/**
 * Paints background of the provided cells
 * to make them visually distinguish from the rest.
 * @param {array} cells is the array with cells
 * that shall be painted since they are winning cells.
 */
function paintWinningCells(cells) {
  const winningCells = [
    document.querySelector(`[data-cell='${cells[0]}']`),
    document.querySelector(`[data-cell='${cells[1]}']`),
    document.querySelector(`[data-cell='${cells[2]}']`)
  ];
  winningCells.forEach(cell => cell.classList.add('winningCell'));
}

/**
 * Saves score update to the localstorage
 * @param {string} figure is the name of the figure that has just won 
 */
function saveScoreToStorage(figure) {
  if (localStorage.getItem('gameScore')) {
    let scoreObject = JSON.parse(localStorage.getItem('gameScore'));
    if (figure) {
      scoreObject[figure]++;
    }
    localStorage.setItem('gameScore', JSON.stringify(scoreObject));
  } else {
    let scoreObject = {cross: 0,circle: 0};
    if (figure) {
      scoreObject[figure]++;
    }
    localStorage.setItem('gameScore', JSON.stringify(scoreObject));
  }
}

/**
 * Displays current score to the user
 */
function displayScore() {
  const crossScore = document.querySelector('#crossScore');
  const circleScore = document.querySelector('#circleScore');

  if (localStorage.getItem('gameScore')) {
    let scoreObject = JSON.parse(localStorage.getItem('gameScore'));
    crossScore.innerText = scoreObject.cross;
    circleScore.innerText = scoreObject.circle;
  } else {
    crossScore.innerText = 0;
    circleScore.innerText = 0;
  }
}

/**
 * Displays message to the user in form of a modal window
 * @param {string} message is the information to be provided to the user
 */
function displayMessage(message) {
  modalTextContainer.innerText = message;
  modal.classList.add('modal-show');
  setTimeout(() => {
    modal.classList.remove('modal-show');
  }, 2000);
}

/**
 * Checks whether master-array has all the numbers from the search-array
 * @param {array} master is the array with numbers
 * that shall be compared to the numbers in the serach-array
 * @param {array} search is the array with numbers
 * that shall be checked in the master array
 * @returns true if master-array includes all
 * numbers from the search array
 */
function doesArrayIncludesSubarray(master, search) {
  for (let i = 0; i < search.length; i++) {
    if (!master.includes(search[i])) {
      return false;
    }
  }
  return true;
}

const color1 = document.querySelector('#color1');
const color2 = document.querySelector('#color2');
document.querySelector('#body').style.background = 'linear-gradient(90deg, #1dfcfd 0%, #459ffc 100%)';

color1.addEventListener('input', changeColor);
color2.addEventListener('input', changeColor);

function changeColor() {
  const body = document.querySelector('#body');
  let currentGradient = body.style.background;
  if (+this.getAttribute('data-color') === 1) {
    console.log(`Value: ${this.value}`);
    body.style.background = currentGradient.replace(/rgb\(\d{1,3},\s\d{1,3},\s\d{1,3}\)/, this.value);
    console.log(body.style.background);
  } else if (+this.getAttribute('data-color') === 2) {
    console.log(`Value: ${this.value}`);
    body.style.background = currentGradient.replace(/(rgb\(\d{1,3},\s\d{1,3},\s\d{1,3}\))(\s100%\))$/, `${this.value} $2`);
    console.log(body.style.background);
  }
  document.querySelector(`.colorLabel${this.getAttribute('data-color')}`).style.backgroundColor = this.value;
}