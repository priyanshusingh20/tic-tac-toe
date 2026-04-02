const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart');
const resetBtn = document.getElementById('resetScore');

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

let board = Array(9).fill(null);
let human = 'X';
let ai = 'O';

let score = JSON.parse(localStorage.getItem("ttt-score")) || {
  X: 0,
  O: 0,
  draw: 0
};

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
  combo.forEach(i => cells[i].classList.add('win'));
}

function minimax(b, player) {
  let result = checkWinner(b);

  if (result?.winner === ai) return 1;
  if (result?.winner === human) return -1;
  if (result?.winner === 'Draw') return 0;

  let bestScore = (player === ai) ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = player;
      let score = minimax(b, player === ai ? human : ai);
      b[i] = null;

      bestScore = (player === ai)
        ? Math.max(score, bestScore)
        : Math.min(score, bestScore);
    }
  }
  return bestScore;
}

function bestMove() {

  if (difficulty === "easy") {
    let empty = board.map((v,i)=> v===null?i:null).filter(v=>v!==null);
    let move = empty[Math.floor(Math.random()*empty.length)];
    board[move]=ai;
    cells[move].textContent=ai;
    return;
  }

  if (difficulty === "medium" && Math.random()<0.5) {
    let empty = board.map((v,i)=> v===null?i:null).filter(v=>v!==null);
    let move = empty[Math.floor(Math.random()*empty.length)];
    board[move]=ai;
    cells[move].textContent=ai;
    return;
  }

  let bestScore = -Infinity;
  let move = -1;

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

  if (move === -1) return;

  board[move] = ai;
  cells[move].textContent = ai;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;

  if (board[index] || checkWinner(board)) return;

  board[index] = human;
  e.target.textContent = human;

  let result = checkWinner(board);
  if (result) return endGame(result);

  message.textContent = "AI is thinking...";

  setTimeout(() => {
    bestMove();
    let result = checkWinner(board);
    if (result) endGame(result);
    else message.textContent = "";
  }, 500);
}

function endGame(result) {
  if (result.winner === 'Draw') {
    message.textContent = "It's a Draw!";
    score.draw++;
  } else {
    message.textContent = `${result.winner} Wins!`;
    highlightWin(result.combo);

    if (result.winner === 'X') score.X++;
    if (result.winner === 'O') score.O++;
  }

  localStorage.setItem("ttt-score", JSON.stringify(score));
  updateScoreUI();
}

function restartGame() {
  board.fill(null);
  cells.forEach(c => {
    c.textContent = '';
    c.classList.remove('win');
  });
  message.textContent = "";
}

cells.forEach(c => c.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);