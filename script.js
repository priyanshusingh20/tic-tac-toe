const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart');
let board = Array(9).fill(null);
let human = 'X';
let ai = 'O';

// Winning combinations
const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(b) {
  for (let [a, bIndex, c] of winConditions) {
    if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
      return b[a];
    }
  }
  return b.includes(null) ? null : 'Draw';
}

function minimax(b, player) {
  let winner = checkWinner(b);
  if (winner === ai) return 1;
  if (winner === human) return -1;
  if (winner === 'Draw') return 0;

  let bestScore = (player === ai) ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = player;
      let score = minimax(b, player === ai ? human : ai);
      b[i] = null;
      if (player === ai) {
        bestScore = Math.max(score, bestScore);
      } else {
        bestScore = Math.min(score, bestScore);
      }
    }
  }
  return bestScore;
}

function bestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = ai;
      let score = minimax(board, human);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  board[move] = ai;
  cells[move].textContent = ai;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (board[index] || checkWinner(board)) return;

  // Human move
  board[index] = human;
  e.target.textContent = human;

  let winner = checkWinner(board);
  if (winner) {
    endGame(winner);
    return;
  }

  // AI move
  bestMove();
  winner = checkWinner(board);
  if (winner) {
    endGame(winner);
  }
}

function endGame(winner) {
  if (winner === 'Draw') {
    message.textContent = "It's a Draw!";
  } else {
    message.textContent = `${winner} Wins!`;
  }
}

function restartGame() {
  board.fill(null);
  cells.forEach(cell => cell.textContent = '');
  message.textContent = '';
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
