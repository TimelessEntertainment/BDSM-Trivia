// Game data
let gameData = [];
let currentRoundIndex = 0;
let currentQuestionIndex = 0;

// Elements
const roundNameEl = document.getElementById('roundName');
const currentQuestionEl = document.getElementById('currentQuestion');
const currentAnswerEl = document.getElementById('currentAnswer');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const questionSetSelect = document.getElementById('questionSetSelect');

// Teams
const teamNameInput = document.getElementById('teamNameInput');
const teamPlayersInput = document.getElementById('teamPlayersInput');
const addTeamBtn = document.getElementById('addTeamBtn');
const teamsList = document.getElementById('teamsList');

// Score Tracker
const scoreContainer = document.getElementById('scores');
const nextScoreBtn = document.getElementById('nextScoreBtn');

const launchGameBtn = document.getElementById('launchGameBtn');

let teams = [];
let playerWindow = null;

// Load questions from JSON
function loadQuestions(file) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      gameData = data;
      localStorage.setItem('gameData', JSON.stringify(gameData)); // for player screen
      currentRoundIndex = 0;
      currentQuestionIndex = 0;
      localStorage.setItem('currentRound', currentRoundIndex);
      localStorage.setItem('currentQuestion', currentQuestionIndex);
      localStorage.setItem('showAnswer', 'false');
      updateHost();
      launchGameBtn.disabled = false; // enable launch
    })
    .catch(err => console.error("Error loading questions:", err));
}

// Question Set Change
questionSetSelect.addEventListener('change', () => {
  loadQuestions(questionSetSelect.value);
});

// Launch Game
launchGameBtn.addEventListener('click', () => {
  if (!playerWindow || playerWindow.closed) {
    playerWindow = window.open('index.html', 'PlayerScreen', 'width=1280,height=720');
  } else {
    playerWindow.focus();
  }
});

// Update host screen
function updateHost() {
  if (!gameData[currentRoundIndex]) return;

  const round = gameData[currentRoundIndex];
  const questionObj = round.questions[currentQuestionIndex];

  roundNameEl.textContent = `${round.round} Question ${currentQuestionIndex + 1}`;
  currentQuestionEl.textContent = questionObj.question;
  currentAnswerEl.textContent = questionObj.answer;
  currentAnswerEl.classList.add('hidden');

  // Save state to localStorage for players
  localStorage.setItem('currentRound', currentRoundIndex);
  localStorage.setItem('currentQuestion', currentQuestionIndex);
  localStorage.setItem('showAnswer', 'false');

  renderTeams();
  renderScores();
}

// Show/hide answer
showAnswerBtn.addEventListener('click', () => {
  currentAnswerEl.classList.toggle('hidden');
  const show = !currentAnswerEl.classList.contains('hidden');
  localStorage.setItem('showAnswer', show ? 'true' : 'false');
});

// Teams
addTeamBtn.addEventListener('click', () => {
  const name = teamNameInput.value.trim();
  const players = parseInt(teamPlayersInput.value);
  if (!name || !players) return;

  teams.push({ name, players, score: 0 });
  teamNameInput.value = '';
  teamPlayersInput.value = '';
  renderTeams();
  renderScores();
});

function renderTeams() {
  teamsList.innerHTML = '';
  teams.forEach((team, index) => {
    const div = document.createElement('div');
    div.classList.add('teamItem');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${team.name} (${team.players})`;
    div.appendChild(nameSpan);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('removeTeamBtn');
    removeBtn.addEventListener('click', () => {
      teams.splice(index,1);
      renderTeams();
      renderScores();
    });
    div.appendChild(removeBtn);

    teamsList.appendChild(div);
  });
}

// Score Tracker
function renderScores() {
  scoreContainer.innerHTML = '';
  teams.forEach((team, tIndex) => {
    const div = document.createElement('div');
    div.classList.add('teamScore');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = team.name;
    div.appendChild(nameSpan);

    [5,3,1].forEach(points => {
      const greenBtn = document.createElement('button');
      greenBtn.textContent = points;
      greenBtn.classList.add('scoreBtn','greenBtn');
      greenBtn.addEventListener('click', () => addScore(tIndex, points));
      div.appendChild(greenBtn);

      const redBtn = document.createElement('button');
      redBtn.textContent = points;
      redBtn.classList.add('scoreBtn','redBtn');
      redBtn.addEventListener('click', () => addScore(tIndex, -points));
      div.appendChild(redBtn);
    });

    scoreContainer.appendChild(div);
  });
}

function addScore(teamIndex, points) {
  teams[teamIndex].score += points;
  renderScores();
}

// Next question
nextScoreBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex >= gameData[currentRoundIndex].questions.length) {
    currentQuestionIndex = 0;
    currentRoundIndex++;
    if (currentRoundIndex >= gameData.length) currentRoundIndex = 0; // loop
  }
  updateHost();
});

// Initial load
loadQuestions(questionSetSelect.value);

