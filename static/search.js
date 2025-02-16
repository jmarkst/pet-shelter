// Example JSON containing questions
const questionsJSON = `[
    {"cat": "Pet", "question": "Select a pet", "choices": ["dog", "cat"]},
    {"cat": "Age", "question": "Select an age", "choices": ["1 months", "2 months", "3 months", "6 months", "1 years", "2 years", "3 years", "4 years", "5 years"]},
    {"cat": "Sex", "question": "Select a sex", "choices": ["male", "female"]},
    {"cat": "Size", "question": "Select a size", "choices": ["small", "medium", "large"]},
    {"cat": "Color", "question": "Select a color", "choices": ["Brown and white", "Brown", "White", "Black", "Mocha", "Black and white"]},
    {"cat": "Color", "question": "Select a color", "choices": ["Tri-color", "Black and white", "White and orange", "White and gray", "White", "Brown and gray"]}
]`;

const questions = JSON.parse(questionsJSON); // Convert JSON string to object
let currentIndex = 0;
let userAnswers = [];

// UI Elements
const readyScreen = document.getElementById("ready");
const quizScreen = document.getElementById("quiz");
const startBtn = document.getElementById("start-btn");
const questionCat = document.getElementById("question-cat");
const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choicescontent");
const mainCard = document.getElementById("card");

const resultsDiv = document.getElementById("results");
const noresultsDiv = document.getElementById("noresults");
const skeleton = document.getElementById("skeleton");
const candidates = document.getElementById("candidates");

let db = {}

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

    let petChoice = userAnswers[0]?.answer == "dog" ? "dog" : "cat"

    const currentQuestion = currentIndex >= 4 ? (petChoice == "dog" ? questions[4] : questions[5]) : questions[currentIndex];
    questionCat.textContent = currentQuestion.cat;
    questionText.textContent = currentQuestion.question;
    choicesContainer.innerHTML = ""; // Clear previous choices

    currentQuestion.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.classList.add("button", "is-dark");
        button.addEventListener("click", () => {
          userAnswers.push({ question: currentQuestion.question, answer: choice });
          if (currentIndex == 4) {
            currentIndex += 2
          } else {
            currentIndex++;
          }
          showQuestion();
        });
        choicesContainer.appendChild(button);
    });
}

// Function to submit answers to API
function submitAnswers() {
    // Lowercase all user answers
    let pet = userAnswers[0].answer
    let age = userAnswers[1].answer
    let sex = userAnswers[2].answer
    let size = userAnswers[3].answer
    let color = userAnswers[4].answer

    let answers = {}
    answers["pet"] = pet
    answers["age"] = age
    answers["sex"] = sex
    answers["size"] = size
    answers["color"] = color

    console.log(JSON.stringify(answers))

  quizScreen.classList.add("is-hidden");
  resultsDiv.classList.remove("is-hidden");
  skeleton.classList.add("skeleton");
  let children = skeleton.querySelectorAll("*");
  children.forEach((child) => {
    child.classList.add("is-skeleton")
  })

  
    fetch("/pet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        want_pet: pet,
        want_age: age,
        want_sex: sex,
        want_size: size,
        want_color: color,
        number: 10
      })
    })
      .then(response => response.json())
      .then(data => {
        let indices = {}
        if (data.selected_indices.length == 0) {
          indices = data.selected_indices
          noresultsDiv.classList.remove("is-hidden");
        } else {
          indices = data.selected_indices
          fetch("/db")
            .then(response => response.json())
            .then(text => {
              console.log(text)
              db = text
              skeleton.classList.add("is-hidden")

              let indices = data.selected_indices;
              let keys = ["pet", "age", "sex", "size", "color"]
              for (let i = 0; i < Object.keys(data.selected_indices).length; i++) {
                const levelDiv = document.createElement('div');
                levelDiv.className = 'level';
                console.log(indices[i])
                console.log(db[indices[i]])

                for (let j = 0; j < Object.keys(db[indices[i]]).length; j++) {
                  let items = db[ indices[ i ] ]
                  console.log(items)
                  const levelItemDiv = document.createElement('div');
                  levelItemDiv.className = 'level-item has-text-centered';

                  const innerDiv = document.createElement('div');

                  const headingP = document.createElement('p');
                  headingP.className = 'heading';
                  headingP.textContent = keys[j]

                  const subtitleP = document.createElement('p');
                  subtitleP.className = 'subtitle';
                  subtitleP.textContent = items[keys[j]];

                  innerDiv.appendChild(headingP);
                  innerDiv.appendChild(subtitleP);
                  levelItemDiv.appendChild(innerDiv);
                  levelDiv.appendChild(levelItemDiv);
                }

                candidates.appendChild(levelDiv);
              }
          })
        }

          
      })
      .catch(error => {
        console.error("Error:", error);
        resultText.textContent = "Something went wrong.";
      })
      .finally(() => {
        quizScreen.classList.add("is-hidden");
        resultsDiv.classList.remove("is-hidden");
        
      });
  }