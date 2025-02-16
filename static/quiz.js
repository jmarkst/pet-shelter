// Example JSON containing questions
const questionsJSON = `[
    {"cat": "Income", "question": "Describe your income", "choices": ["low", "mid", "high"]},
    {"cat": "Cleanliness", "question": "Can you provide a clean environment?", "choices": ["yes", "no"]},
    {"cat": "Adoption", "question": "To whom will the pet be?", "choices": ["me", "others"]},
    {"cat": "Pets", "question": "Do you have pets?", "choices": ["yes", "no"]},
    {"cat": "Pets", "question": "How many?", "choices": ["one", "two", "many", "none"]},
    {"cat": "Place", "question": "Do you have the place for the pet?", "choices": ["yes", "no"]},
    {"cat": "Restrictions", "question": "Does your place have restrictions for pets?", "choices": ["yes", "no"]}
]`;

const questions = JSON.parse(questionsJSON); // Convert JSON string to object
let currentIndex = 0;
let userAnswers = [];

// UI Elements
const readyScreen = document.getElementById("ready");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");
const startBtn = document.getElementById("start-btn");
const questionCat = document.getElementById("question-cat");
const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choicescontent");
const resultText = document.getElementById("result-text");
const resultTextDesc = document.getElementById("result-text-desc");
const codeInput = document.getElementById("code");
const mainCard = document.getElementById("card");
const continueBtn = document.getElementById("continue-btn");

// Start Quiz
startBtn.addEventListener("click", function () {
    readyScreen.classList.add("is-hidden");
    quizScreen.classList.remove("is-hidden");
    showQuestion();
});

// Function to show a question
function showQuestion() {
    if (currentIndex >= questions.length) {
        submitAnswers();
        return;
    }

    const currentQuestion = questions[currentIndex];
    questionCat.textContent = currentQuestion.cat;
    questionText.textContent = currentQuestion.question;
    choicesContainer.innerHTML = ""; // Clear previous choices

    currentQuestion.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.classList.add("button", "is-dark");
        button.addEventListener("click", () => {
            userAnswers.push({ question: currentQuestion.question, answer: choice });
            currentIndex++;
            showQuestion();
        });
        choicesContainer.appendChild(button);
    });
}

// Function to submit answers to API
function submitAnswers() {
    // Lowercase all user answers
    let finance = userAnswers[0].answer
    let clean = userAnswers[1].answer
    let adopt = userAnswers[2].answer
    let has_pets = userAnswers[3].answer
    let pets = userAnswers[4].answer
    let environment = userAnswers[5].answer
    let restrictions = userAnswers[6].answer

    let answers = {}
    answers["finance"] = finance
    answers["clean"] = clean
    answers["adopt"] = adopt
    answers["has_pets"] = has_pets
    answers["pets"] = pets
    answers["environment"] = environment
    answers["restrictions"] = restrictions

    console.log(JSON.stringify(answers))

  
    fetch("/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finance: finance,
        clean: clean,
        adopt: adopt,
        has_pets: has_pets,
        pets: pets,
        environment: environment,
        restrictions: restrictions
      })
    })
      .then(response => response.json())
      .then(data => {
        resultScreen.classList.remove("is-hidden");
        quizScreen.classList.add("is-hidden");
        console.log(data.verdict)
        switch (data.verdict) {
          case "yes":
            resultText.textContent = "Congratulations!";
            resultTextDesc.textContent = "Click the button to proceed.";
            mainCard.classList.add("has-background-success");
            break;
          case "maybe":
            resultText.textContent = "Hmm...";
            resultTextDesc.innerHTML = "We need a second opinion for you.<br>Type the code to continue.";
            code.classList.remove("is-hidden");
            mainCard.classList.add("has-background-warning");
            code.classList.remove("is-hidden");
            break;
          case "no":
            resultText.textContent = "Sorry.";
            resultTextDesc.textContent = "It looks like you're not eligible for now.";
            continueBtn.classList.add('is-hidden');
            mainCard.classList.add("has-background-danger");
            break;
        }
          
      })
      .catch(error => {
        console.error("Error:", error);
        resultText.textContent = "Something went wrong.";
      })
      .finally(() => {
        quizScreen.classList.add("hidden");
        resultScreen.classList.remove("hidden");
        
      });
  }