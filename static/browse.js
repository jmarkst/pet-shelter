function dogs() {
  const candidates = document.getElementById("dogs");

fetch("/db")
  .then((response) => response.json())
  .then((db) => {
    console.log(db);

    // Create a row container for the grid
    const gridContainer = document.createElement("div");
    gridContainer.classList.add("row", "g-3"); // "g-3" adds spacing between columns

    // Loop through the entire database and create a card for each pet
    db.forEach((petData, i) => {
      if (petData.pet == "dog") {
        // Create a column for each pet card (using col-sm-4 for a 3-column layout on small screens)
        const colDiv = document.createElement("div");
        colDiv.classList.add("col-sm-4", "col-md-3", "col-lg-2"); // Adjust column size on different screens

        // Create the card for each pet
        const levelDiv = document.createElement("div");
        levelDiv.classList.add("card", "h-100"); // Make the card take the full height within the column

        // Ensure image fallback if not found
        const img = document.createElement("img");
        img.src = `/pics/${i}` || "https://bulma.io/assets/images/placeholders/1280x960.png";
        img.alt = `Image of ${petData.name || "Unknown"}`;
        img.classList.add("card-img-top");

        const cardbody = document.createElement("div");
        cardbody.classList.add("card-body");

        const cardtitle = document.createElement("div");
        cardtitle.classList.add("card-title", "fw-bold", "fs-5");
        cardtitle.textContent = `Candidate #${i + 1}`;

        const cardtext = document.createElement("div");
        cardtext.classList.add("card-text");
        cardtext.textContent = `${petData.pet || "Unknown"} | ${
          petData.color || "Unknown"
        } | ${petData.age || "Unknown"} | ${petData.sex || "Unknown"} | ${petData.size || "Unknown"}`;

        cardbody.appendChild(cardtitle);
        cardbody.appendChild(cardtext);

        // Link to detailed info
        const button = document.createElement("a");
        button.classList.add("btn", "btn-lg", "btn-warning", "fw-bold");
        button.href = `/info?id=${i}`;
        button.textContent = `Check ${petData.sex == "male" ? "him" : "her"}`;

        levelDiv.appendChild(img);
        levelDiv.appendChild(cardbody);
        levelDiv.appendChild(button);
        colDiv.appendChild(levelDiv);

        // Append the column to the grid container
        gridContainer.appendChild(colDiv);
      }
    });

    // Append the grid container to the results container
    candidates.appendChild(gridContainer);
  })
  .catch((error) => {
    console.error("Error:", error);
    resultText.textContent = "Something went wrong.";
  });
}
 function cats() {
  const candidates = document.getElementById("cats");

fetch("/db")
  .then((response) => response.json())
  .then((db) => {
    console.log(db);

    // Create a row container for the grid
    const gridContainer = document.createElement("div");
    gridContainer.classList.add("row", "g-3"); // "g-3" adds spacing between columns

    // Loop through the entire database and create a card for each pet
    db.forEach((petData, i) => {
      if (petData.pet == "cat") {
        // Create a column for each pet card (using col-sm-4 for a 3-column layout on small screens)
        const colDiv = document.createElement("div");
        colDiv.classList.add("col-sm-4", "col-md-3", "col-lg-2"); // Adjust column size on different screens

        // Create the card for each pet
        const levelDiv = document.createElement("div");
        levelDiv.classList.add("card", "h-100"); // Make the card take the full height within the column

        // Ensure image fallback if not found
        const img = document.createElement("img");
        img.src = `/pics/${i}` || "https://bulma.io/assets/images/placeholders/1280x960.png";
        img.alt = `Image of ${petData.name || "Unknown"}`;
        img.classList.add("card-img-top");

        const cardbody = document.createElement("div");
        cardbody.classList.add("card-body");

        const cardtitle = document.createElement("div");
        cardtitle.classList.add("card-title", "fw-bold", "fs-5");
        cardtitle.textContent = `Candidate #${i + 1}`;

        const cardtext = document.createElement("div");
        cardtext.classList.add("card-text");
        cardtext.textContent = `${petData.pet || "Unknown"} | ${
          petData.color || "Unknown"
        } | ${petData.age || "Unknown"} | ${petData.sex || "Unknown"} | ${petData.size || "Unknown"}`;

        cardbody.appendChild(cardtitle);
        cardbody.appendChild(cardtext);

        // Link to detailed info
        const button = document.createElement("a");
        button.classList.add("btn", "btn-lg", "btn-warning", "fw-bold");
        button.href = `/info?id=${i}`;
        button.textContent = `Check ${petData.sex == "male" ? "him" : "her"}`;

        levelDiv.appendChild(img);
        levelDiv.appendChild(cardbody);
        levelDiv.appendChild(button);
        colDiv.appendChild(levelDiv);

        // Append the column to the grid container
        gridContainer.appendChild(colDiv);
      }
    });

    // Append the grid container to the results container
    candidates.appendChild(gridContainer);
  })
  .catch((error) => {
    console.error("Error:", error);
    resultText.textContent = "Something went wrong.";
  });
 }

 dogs()
 cats()