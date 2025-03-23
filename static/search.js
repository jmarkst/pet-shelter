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
        button.classList.add("button", "is-primary", "is-large");
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

  
    fetch("/pred", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        want_pet: pet,
        want_age: age,
        want_sex: sex,
        want_size: size,
        want_color: color
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
              candidates.innerHTML = ""

              let indices = data.selected_indices;
              let keys = ["pet", "age", "sex", "size", "color"]
              for (let i = 0; i < Object.keys(data.selected_indices).length; i++) {
                const levelDiv = document.createElement('div');
                levelDiv.className = 'card has-background-white';
                console.log(indices[i])
                console.log(db[indices[i]])
                let pet = db[indices[i]]

                const cardImage = document.createElement("div");
                cardImage.classList.add("card-image");

                const figure = document.createElement("figure");
                figure.classList.add("image", "is-4by3");

                const img = document.createElement("img");
                img.src = `/pics/${indices[i]}` || "https://bulma.io/assets/images/placeholders/1280x960.png";
                img.alt = `Image of ${pet.name || "Unknown"}`;

                // Append image to figure, then to cardImage
                figure.appendChild(img);
                cardImage.appendChild(figure);

                const cardContent = document.createElement("div");
                cardContent.classList.add("card-content");

                // Create media section
                const media = document.createElement("div");
                media.classList.add("media");

                const mediaContent = document.createElement("div");
                mediaContent.classList.add("media-content");

                const title = document.createElement("p");
                title.classList.add("title", "is-4");
                title.textContent = `Candidate #${i + 1}`;

                const subtitle = document.createElement("p");
                subtitle.classList.add("subtitle", "is-6");
                subtitle.textContent = `${pet.pet || "Unknown"} | ${pet.color || ""} | ${pet.age || "Unknown"} | ${pet.sex || ""} | ${pet.size || ""}`;

                // Append title and subtitle to media content
                mediaContent.appendChild(title);
                mediaContent.appendChild(subtitle);
                media.appendChild(mediaContent);

                // Create button section
                const content = document.createElement("div");
                content.classList.add("content");

                const button = document.createElement("a");
                button.classList.add("button", "is-large", "is-primary");
                button.href = `/info?id=${indices[i]}`;
                button.textContent = `Check ${pet.sex == "male" ? "him": "her"}`;

                // Append button to content
                content.appendChild(button);

                // Assemble card components
                cardContent.appendChild(media);
                cardContent.appendChild(content);

                levelDiv.appendChild(cardImage)
                levelDiv.appendChild(cardContent)

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