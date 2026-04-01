const resetBtn = document.getElementById("resetScore");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

// Load from localStorage
let score = JSON.parse(localStorage.getItem("ttt-score")) || {
  X: 0,
  O: 0,
  draw: 0
};

// Display scores
updateScoreUI();

function updateScoreUI() {
  scoreX.textContent = score.X;
  scoreO.textContent = score.O;
  scoreDraw.textContent = score.draw;
}

resetBtn.addEventListener("click", () => {
  score = { X: 0, O: 0, draw: 0 };
  localStorage.setItem("ttt-score", JSON.stringify(score));
  updateScoreUI();
});

const difficultySelect = document.getElementById('difficulty');
let difficulty = difficultySelect.value;

difficultySelect.addEventListener('change', () => {
  difficulty = difficultySelect.value;
});
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
  for (let combo of winConditions) {
    const [a, bIndex, c] = combo;
    if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
      return { winner: b[a], combo };
    }
  }
  return b.includes(null) ? null : { winner: 'Draw' };
}

function highlightWin(combo) {
  combo.forEach(index => {
    cells[index].classList.add('win');
  });
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

  // 🟢 EASY → Random Move
  if (difficulty === "easy") {
    let emptyCells = board
      .map((val, idx) => val === null ? idx : null)
      .filter(v => v !== null);

    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomIndex] = ai;
    cells[randomIndex].textContent = ai;
    return;
  }

  // 🟡 MEDIUM → 50% Random, 50% Minimax
  if (difficulty === "medium" && Math.random() < 0.5) {
    let emptyCells = board
      .map((val, idx) => val === null ? idx : null)
      .filter(v => v !== null);

    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomIndex] = ai;
    cells[randomIndex].textContent = ai;
    return;
  }

  // 🔴 HARD → Minimax (your original logic)
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

  let result = checkWinner(board);
  if (result) {
    endGame(result);
    return;
  }

  // 🤖 AI Thinking...
  message.textContent = "AI is thinking";
  animateDots();

  setTimeout(() => {
    bestMove();

    let result = checkWinner(board);
    if (result) {
      endGame(result);
    } else {
      message.textContent = "";
    }
  }, 600); // delay (you can tweak 400–1000ms)
}

let dotInterval;

function animateDots() {
  let dots = 0;

  clearInterval(dotInterval);

  dotInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    message.textContent = "AI is thinking" + ".".repeat(dots);
  }, 300);
}

function endGame(result) {
  clearInterval(dotInterval);

  if (result.winner === 'Draw') {
    message.textContent = "It's a Draw!";
    score.draw++;
  } else {
    message.textContent = `${result.winner} Wins!`;
    highlightWin(result.combo);

    if (result.winner === 'X') score.X++;
    if (result.winner === 'O') score.O++;
  }

  // Save + Update UI
  localStorage.setItem("ttt-score", JSON.stringify(score));
  updateScoreUI();
}

function restartGame() {
  board.fill(null);

  clearInterval(dotInterval);

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
  });

  message.textContent = '';
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
