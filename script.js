const startScreen = document.getElementById("startScreen");
const quizContainer = document.getElementById("quizContainer");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");

const currentQuestionElement = document.getElementById("currentQuestion");
const totalQuestionsElement = document.getElementById("totalQuestions");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");

const finalScoreElement = document.getElementById("finalScore");
const progressBar = document.getElementById("progressBar");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let selectedCategory = 18;

/* =========================
   CATEGORY SELECTION
========================= */

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".category-card")
      .forEach((c) => c.classList.remove("active"));

    card.classList.add("active");

    selectedCategory = card.dataset.category;
  });
});

/* =========================
   START QUIZ
========================= */

startBtn.addEventListener("click", async () => {
  startBtn.textContent = "Loading...";

  try {
    await loadQuestions();

    startScreen.style.display = "none";
    quizContainer.style.display = "block";

    showQuestion();
  } catch (error) {
    alert("Unable to load questions.");
    console.error(error);
  }

  startBtn.textContent = "Start Quiz";
});

/* =========================
   FETCH QUESTIONS
========================= */

async function loadQuestions() {
  const response = await fetch(
    `https://opentdb.com/api.php?amount=10&category=${selectedCategory}&type=multiple`
  );

  const data = await response.json();

  questions = data.results;
  totalQuestionsElement.textContent = questions.length;
}

/* =========================
   SHOW QUESTION
========================= */

function showQuestion() {
  resetState();

  const currentQuestion = questions[currentQuestionIndex];

  currentQuestionElement.textContent = currentQuestionIndex + 1;

  questionElement.innerHTML = decodeHTML(currentQuestion.question);

  const answers = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ].sort(() => Math.random() - 0.5);

  answers.forEach((answer) => {
    const button = document.createElement("button");

    button.classList.add("option");

    button.innerHTML = decodeHTML(answer);

    if (answer === currentQuestion.correct_answer) {
      button.dataset.correct = "true";
    }

    button.addEventListener("click", selectAnswer);

    optionsElement.appendChild(button);
  });

  updateProgress();
  startTimer();
}

/* =========================
   ANSWER SELECTION
========================= */

function selectAnswer(event) {
  clearInterval(timer);

  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  if (isCorrect) {
    score++;
    scoreElement.textContent = score;
  }

  Array.from(optionsElement.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else {
      button.classList.add("wrong");
    }

    button.disabled = true;
  });

  nextBtn.style.display = "block";
}

/* =========================
   NEXT QUESTION
========================= */

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

/* =========================
   RESULT SCREEN
========================= */

function showResults() {
  quizContainer.style.display = "none";
  resultScreen.style.display = "block";

  finalScoreElement.textContent =
    `${score}/${questions.length}`;

  localStorage.setItem("quizHighScore", score);

  const resultMessage = document.getElementById("resultMessage");

  if (score >= 8) {
    resultMessage.textContent =
      "Excellent performance! 🎉";
  } else if (score >= 5) {
    resultMessage.textContent =
      "Good job! Keep practicing 🚀";
  } else {
    resultMessage.textContent =
      "Nice try. Practice and come back stronger 💪";
  }
}

/* =========================
   RESTART QUIZ
========================= */

restartBtn.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;

  scoreElement.textContent = "0";

  resultScreen.style.display = "none";
  startScreen.style.display = "block";
});

/* =========================
   TIMER
========================= */

function startTimer() {
  clearInterval(timer);

  timeLeft = 15;
  timerElement.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;

    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);

      Array.from(optionsElement.children).forEach((button) => {
        button.disabled = true;

        if (button.dataset.correct === "true") {
          button.classList.add("correct");
        }
      });

      nextBtn.style.display = "block";
    }
  }, 1000);
}

/* =========================
   HELPERS
========================= */

function resetState() {
  nextBtn.style.display = "none";

  optionsElement.innerHTML = "";
}

function updateProgress() {
  const progress =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  progressBar.style.width = `${progress}%`;
}

function decodeHTML(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/* =========================
   HIGH SCORE
========================= */

window.addEventListener("load", () => {
  const highScore =
    localStorage.getItem("quizHighScore") || 0;

  const highScoreElement =
    document.getElementById("highScore");

  if (highScoreElement) {
    highScoreElement.textContent = highScore;
  }
});
