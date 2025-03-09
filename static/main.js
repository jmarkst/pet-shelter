const questionsJSON = `[
  {"cat": "Income", "question": "Describe your income", "choices": ["low", "mid", "high"]},
  {"cat": "Cleanliness", "question": "Can you provide a clean environment?", "choices": ["yes", "no"]},
  {"cat": "Adoption", "question": "To whom will the pet be?", "choices": ["me", "others"]},
  {"cat": "Pets", "question": "Do you have pets?", "choices": ["yes", "no"]},
  {"cat": "Pets", "question": "How many?", "choices": ["one", "two", "many", "none"]},
  {"cat": "Place", "question": "Do you have the place for the pet?", "choices": ["yes", "no"]},
  {"cat": "Restrictions", "question": "Does your place have restrictions for pets?", "choices": ["yes", "no"]}
]`;

const questionsJSONPets = `[
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

document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  
    // Add a click event on each of them
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {
  
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);
  
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
  
      });
    });

    document.querySelectorAll('.fade-in').forEach(e => {
      e.classList.add('active');
    });

  });

  function test() {
    const card = document.getElementById("test-card");
    const cardHead = document.getElementById("test-card-header");
    const cardBody = document.getElementById("test-card-body");
    card.classList.remove("circularcard");
    card.classList.add("boxcard");
    cardHead.style.display = "none";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
    cardBody.classList.toggle("hidden");
    showQuestion()
  }

  function findAi() {
    const card = document.getElementById("test-card");
    const cardHead = document.getElementById("test-card-header");
    const cardBody = document.getElementById("test-card-body");
    card.classList.remove("circularcard");
    card.classList.add("boxcard");
    cardHead.style.display = "none";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
    cardBody.classList.toggle("hidden");
    showQuestionPets()
  }

  function showQuestionPets() {
    questions = JSON.parse(questionsJSONPets)
    if (currentIndex >= questions.length) {
        submitAnswersPets();
        return;
    }
    
    const questionCat = document.getElementById("question-cat");
    const questionText = document.getElementById("question-ask");
    const choicesContainer = document.getElementById("test-choices");

    const currentQuestion = questions[currentIndex];
    questionCat.textContent = currentQuestion.cat;
    questionText.textContent = currentQuestion.question;
    choicesContainer.innerHTML = ""; // Clear previous choices

    currentQuestion.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.classList.add("btn", "btn-warning", "fade-in", "fw-bold", "p-3", "w-100");
        button.addEventListener("click", () => {
            userAnswers.push({ question: currentQuestion.question, answer: choice });
            currentIndex++;
            showQuestionPets();
        });
        choicesContainer.appendChild(button);
        button.classList.add("active");
    });
}

  function showQuestion() {
    if (currentIndex >= questions.length) {
        submitAnswers();
        return;
    }

    const questionCat = document.getElementById("question-cat");
    const questionText = document.getElementById("question-ask");
    const choicesContainer = document.getElementById("test-choices");

    const currentQuestion = questions[currentIndex];
    questionCat.textContent = currentQuestion.cat;
    questionText.textContent = currentQuestion.question;
    choicesContainer.innerHTML = ""; // Clear previous choices

    currentQuestion.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.classList.add("btn", "btn-warning", "fade-in", "fw-bold", "p-3", "w-100");
        button.addEventListener("click", () => {
            userAnswers.push({ question: currentQuestion.question, answer: choice });
            currentIndex++;
            showQuestion();
        });
        choicesContainer.appendChild(button);
        button.classList.add("active");
    });
}

function submitAnswers() {
  const card = document.getElementById("test-card");
  const choicesContainer = document.getElementById("test-choices");
  const questionCat = document.getElementById("question-cat");
  const questionText = document.getElementById("question-ask");
  const proceed = document.getElementById("proceedBtn");
  
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
      
      card.classList.remove("circularcard");
      choicesContainer.classList.toggle("hidden");

      console.log(data.verdict)
      switch (data.verdict) {
        case "yes":
          card.style.border = "5px green solid";
          card.style.borderRadius = "20px";
          card.classList.add('circularcardsuccess');
          questionCat.textContent = "Congratulations";
          questionCat.style.fontSize = "30px";
          questionText.textContent = "You are eligible for pet adoption!";
          proceed.classList.toggle("hidden");
          break;
        case "maybe":
          card.style.border = "5px gold solid";
          card.style.borderRadius = "20px";
          card.classList.add('circularcard');
          questionCat.textContent = "Hmm...";
          questionCat.style.fontSize = "30px";
          questionText.textContent = "Ask our staff for additional checks, and input the code below to proceed";
          proceed.classList.toggle("hidden");
          break;
        case "no":
          card.style.border = "5px red solid";
          card.style.borderRadius = "20px";
          card.classList.add('circularcardfailed');
          questionCat.textContent = "Sorry";
          questionCat.style.fontSize = "30px";
          questionText.textContent = "It seems that you are not eligible for now.";
          break;
      }

    })
    .catch(error => {
      console.error("Error:", error);
      resultText.textContent = "Something went wrong.";
    })
}

function submitAnswersPets() {
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
  const questionCat = document.getElementById("question-cat");
  const questionText = document.getElementById("question-ask");
  const choicesContainer = document.getElementById("test-choices");
  const card = document.getElementById("test-card-body");
  card.classList.toggle("hidden");


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