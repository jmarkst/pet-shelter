const petColors = {
    dog: ["Brown and white", "Brown", "White", "Black", "Mocha", "Black and white"],
    cat: ["Tri-color", "Black and white", "White and orange", "White and gray", "White", "Brown and gray"]
}

const ages = ["1 months", "2 months", "3 months", "6 months", "1 years", "2 years", "3 years", "4 years", "5 years"]

const petTypeSelect = document.getElementById("petchoice");
    const petColorSelect = document.getElementById("colorchoice");

    function populateAgeSelect() {
        const options = [
            "1 months", "2 months", "3 months", "6 months",
            "1 years", "2 years", "3 years", "4 years", "5 years"
        ];
    
        const select = document.getElementById("agechoice");
        select.innerHTML = ""; // Clear existing options if any
    
        options.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    populateAgeSelect()

    function updateColorOptions(type) {
        const colors = petColors[type] || [];
        
        // Clear previous options
        petColorSelect.innerHTML = "";

        // Add new options
        colors.forEach(color => {
            const option = document.createElement("option");
            option.value = color
            option.textContent = color;
            petColorSelect.appendChild(option);
        });
    }

    // Initialize with current selection
    updateColorOptions(petTypeSelect.value);

    // Update when selection changes
    petTypeSelect.addEventListener("change", () => {
        updateColorOptions(petTypeSelect.value);
    });


document.getElementById("uploadForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = document.getElementById("uploadForm");
    const formData = new FormData(form);

    fetch("/pet/new", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error)
        } else {
            alert(`Pet added! ID: ${data.id}`);
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById("result").textContent = "An error occurred while uploading.";
    });
});