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

let teams = [];
let currentScoreTeamIndex = 0;

// Load questions
function loadQuestions(file) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      gameData = data;
      currentRoundIndex = 0;
      currentQuestionIndex = 0;
      updateHost();
    })
    .catch(err => console.error("Error loading questions:", err));
}

// Dropdown change
questionSetSelect.addEventListener('change', function() {
  loadQuestions(this.value);
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

  localStorage.setItem('currentRound', currentRoundIndex);
  localStorage.setItem('currentQuestion', currentQuestionIndex);
  localStorage.setItem('showAnswer', 'false');

  renderScores();
}

// Show answer button
showAnswerBtn.addEventListener('click', () => {
  currentAnswerEl.classList.toggle('hidden');
});

// Add team
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

// Render teams list with delete button
function renderTeams() {
  teamsList.innerHTML = '';
  teams.forEach((team, index) => {
    const div = document.createElement('div');
    div.classList.add('teamItem');
    div.textContent = `${team.name} (${team.players} players)`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('removeTeamBtn');
    removeBtn.addEventListener('click', () => {
      teams.splice(index, 1);
      renderTeams();
      renderScores();
    });
    div.appendChild(removeBtn);
    teamsList.appendChild(div);
  });
}

// Render score buttons
function renderScores() {
  scoreContainer.innerHTML = '';
  teams.forEach((team, teamIndex) => {
    const div = document.createElement('div');
    div.classList.add('teamScore');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = team.name;
    div.appendChild(nameSpan);

    [5,3,1].forEach(points => {
      const greenBtn = document.createElement('button');
      greenBtn.className = 'scoreBtn greenBtn';
      greenBtn.textContent = points;
      greenBtn.addEventListener('click', () => {
        team.score += points;
        renderScores();
      });
      div.appendChild(greenBtn);

      const redBtn = document.createElement('button');
      redBtn.className = 'scoreBtn redBtn';
      redBtn.textContent = points;
      redBtn.addEventListener('click', () => {
        team.score -= points;
        renderScores();
      });
      div.appendChild(redBtn);
    });

    scoreContainer.appendChild(div);
  });
}

// Next question
nextScoreBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex >= gameData[currentRoundIndex].questions.length) {
    currentQuestionIndex = 0;
    currentRoundIndex++;
    if (currentRoundIndex >= gameData.length) {
      alert('Game Over!');
      return;
    }
  }
  updateHost();
});

// Initial load
loadQuestions(questionSetSelect.value);
