let baseUrl = `https://opentdb.com/api.php?amount=15&category=`;

let randomQuizBtn = document.getElementById("random-quiz-btn");

let categoryQuiz = document.querySelectorAll(".category");

let startQuizSection = document.getElementById("start-quiz-section");

let quizSection = document.getElementById("quiz-page");

let quizPageTitle = document.getElementById("quiz-page-question");

let questionDiv = document.getElementById("question-div");

let nextQuestionBtn = document.getElementById("next-btn");

let options = document.getElementById("options");

let currQuestionDiv = document.getElementById("curr-question-count-div");

let quiz = document.querySelector(".quiz");

let resPage = document.querySelector(".res-page");

let themeToggler = document.querySelector("#theme-toggle");

// making other sections hidden
quizSection.style.display = "none";
resPage.style.display = "none";

//Making required variables
let currentQuestionIndex = 0;
let questionSet;
let score = 0;
let lastScore = localStorage.getItem("last-score");

let countDown = 20;
let slideInterval;
let countDownInterval;
let reveledAnswer = false;
let answer_optios_array;
let currQuesCorrAns;

//soundeffects
const sounds = {
  start: new Audio("./audio_effects/start.mp3"),
  correct: new Audio("./audio_effects/correct.mp3"),
  wrong: new Audio("./audio_effects/wrong.mp3"),
  clockCountdown: new Audio("./audio_effects/clockcountdown.mp3"),
  timeout: new Audio("./audio_effects/timeout.mp3"),
  fail: new Audio("./audio_effects/fail.mp3"),
  wow: new Audio("./audio_effects/wow.mp3"),
  happy: new Audio("./audio_effects/happyhappy.mp3"),
};

function playSound(sound) {
  sounds[sound]?.play();
}
function pauseSound(sound) {
  sounds[sound]?.pause();
  sounds[sound] ? (sounds[sound].currentTime = 0) : null;
}

themeToggler.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  if (document.documentElement.classList.contains("dark")) {
    themeToggler.textContent = "Switch to Light Mode";
  } else {
    themeToggler.textContent = "Switch to Dark Mode";
  }
});

//fetching data
async function fetchQuestions(value) {
  let url = baseUrl + value;
  let data = await fetch(url);
  let result = await data.json();
  questionSet = result.results;
  startingQuiz(questionSet);
}

//Quiz functions
function startingQuiz(questionSet) {
  quizSection.style.display = "block";
  populateQuestions(questionSet);
}

function populateQuestions(questionSet) {
  if (currentQuestionIndex < questionSet.length) {
    const { question, correct_answer, incorrect_answers } =
      questionSet[currentQuestionIndex];
    currQuesCorrAns = correct_answer;
    // console.log(correct_answer);
    // Update question, score, and timer displays
    updateQuestionUI(questionSet.length, question);
    startCountDown();

    // Generate options
    answer_optios_array = [...incorrect_answers, correct_answer].sort(
      () => Math.random() - 0.5
    );
    options.innerHTML = generateOptionsMarkup(answer_optios_array);
    setupAnswerListeners(answer_optios_array, correct_answer);
  } else {
    showResult();
  }
}

function updateQuestionUI(totalQuestions, question) {
  currQuestionDiv.innerHTML = `
    <p class="text-xl"> ${
      currentQuestionIndex + 1
    } / <span class="text-red-500">${totalQuestions}</span> Questions</p>
    <p class="text-xl" id="timer-tag"></p>
    <p class="text-xl" id="score"> Score: ${score} / 15 </p>
  `;
  quizPageTitle.innerHTML = `
    <h2 class="text-xl font-bold mb-4 text-center tracking-wider dark:text-white text-black">${question}</h2>
  `;
}

function generateOptionsMarkup(options) {
  return options
    .map(
      (answer, idx) => `
      <div class="flex mx-10 flex-col bg-slate-200 hover:bg-slate-950 rounded-md transition duration-300 hover:scale-x-105">
        <p class="ans ans-${idx} h-max p-4 text-xl font-semibold text-black hover:text-white transition duration-300" val="${idx}">${answer}</p>
      </div>
    `
    )
    .join("");
}

function setupAnswerListeners(options, correct_answer) {
  const answerElements = document.querySelectorAll(".ans");
  let isAnswerRevealed = false;

  answerElements.forEach((ans) => {
    ans.addEventListener("click", () => {
      if (!isAnswerRevealed) {
        isAnswerRevealed = true;
        const index = parseInt(ans.getAttribute("val"), 10);
        const isCorrect = options[index] === correct_answer;
        isCorrect ? (score += 1) : (score += 0);
        ans.parentNode.style.backgroundColor = isCorrect ? "green" : "red";
        ans.style.color = "white";
        playSound(isCorrect ? "correct" : "wrong");
        stopCountDown();

        if (!isCorrect) highlightCorrectAnswer(options, correct_answer);

        setTimeout(goToNextQuestion, 1000);
      }
    });
  });
}

function highlightCorrectAnswer(options, correct_answer) {
  const correctIndex = options.indexOf(correct_answer);
  const correctAnswerDiv = document.querySelector(`.ans-${correctIndex}`);
  correctAnswerDiv.parentNode.style.backgroundColor = "green";
  correctAnswerDiv.style.color = "white";
}

function showResult() {
  resPage.innerHTML = `
    <div class="flex flex-col items-center justify-center h-[80vh] dark:bg-gray-800 bg-white">
      <p class="dark:text-white text-black text-3xl mb-4">Your Score is</p>
      <div class="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-8">
        <span class="${
          score >= 5 ? "text-green-500" : "text-red-500"
        }">${score}</span>
        <span class="ml-2">/ 15</span>
      </div>
      <div class="dark:bg-gray-900 bg-gray-400 p-4 rounded-lg shadow-md">
        <button class="text-white font-bold py-2 px-4 border border-white rounded hover:bg-gray-700" id="back-to-home">Back to Home</button>
      </div>
    </div> 
  `;

  playSound(score < 5 ? "fail" : score < 11 ? "wow" : "happy");
  quizSection.style.display = "none";
  resPage.style.display = "block";

  document.getElementById("back-to-home").addEventListener("click", resetQuiz);
}

function resetQuiz() {
  localStorage.setItem("last-score", score);
  updateLastScore(score);
  score = 0;
  currentQuestionIndex = 0;
  quizSection.style.display = "none";
  resPage.style.display = "none";
  startQuizSection.style.display = "block";
}

function revelAnswer() {
  reveledAnswer = true;
  let correctIndex = answer_optios_array.findIndex((elem) => {
    return elem == currQuesCorrAns;
  });
  let elem = "ans-" + correctIndex;
  let correctAnswerDivs = document.querySelectorAll(`.${elem}`);
  correctAnswerDivs.forEach((div) => {
    div.parentNode.style.backgroundColor = "green";
    div.style.color = "white";
  });
}

function startCountDown() {
  updateTimerDisplay(countDown);
  slideInterval = setInterval(goToNextQuestion, 23000);
  countDownInterval = setInterval(() => {
    countDown -= 1;
    if (countDown === 0) {
      pauseSound("clockCountdown");
      playSound("timeout");
    }
    if (countDown < 0) {
      revelAnswer();
    }
    updateTimerDisplay(countDown);
  }, 1000);
}

function stopCountDown() {
  pauseSound("clockCountdown");
  slideInterval !== undefined ? clearInterval(slideInterval) : null;
  if (countDownInterval !== undefined) {
    clearInterval(countDownInterval);
    countDown = 20;
  }
}

function updateTimerDisplay(timeLeft) {
  if (timeLeft >= 0) {
    let timerTag = document.getElementById("timer-tag");
    timerTag.innerHTML = `
      <span class="text-xl ${
        timeLeft < 10 ? "text-red-500" : "text-green-500"
      }">${timeLeft} Sec</span>
    `;
    if (timeLeft === 10) {
      // clockcountdown.loop = true;
      sounds["clockCountdown"].loop = true;
      playSound("clockCountdown");
    }
  }
}

//Event Listener Section
randomQuizBtn.addEventListener("click", () => {
  let value = randomQuizBtn.getAttribute("val");
  startQuizSection.style.display = "none";
  fetchQuestions(value);
  playSound("start");
});

categoryQuiz.forEach((category) => {
  category.addEventListener("click", () => {
    let value = category.getAttribute("val");
    startQuizSection.style.display = "none";
    fetchQuestions(value);
    playSound("start");
  });
});

nextQuestionBtn.addEventListener("click", () => {
  stopCountDown();
  goToNextQuestion();
});
function goToNextQuestion() {
  stopCountDown();
  currentQuestionIndex++;
  reveledAnswer = false;
  populateQuestions(questionSet);
}

function updateLastScore(lastScore) {
  if (lastScore) {
    document.getElementById("last-score-div").innerHTML = `
    <p class="dark:text-white text-black text-xl text-center py-4 tracking-wider">Last Score: ${lastScore}/15</p>
    `;
  }
}
updateLastScore(lastScore);