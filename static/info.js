console.log(isAdmin)
const petColors = {
    dog: ["Brown and white", "Brown", "White", "Black", "Mocha", "Black and white"],
    cat: ["Tri-color", "Black and white", "White and orange", "White and gray", "White", "Brown and gray"]
}

const ages = ["1 months", "2 months", "3 months", "6 months", "1 years", "2 years", "3 years", "4 years", "5 years"]

if (isAdmin != "None") {
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
        e.preventDefault(); // Prevent default form behavior
    
        const fileInput = document.getElementById("imageInput");
        const file = fileInput.files[0];
        const petId = pet;  // Replace or render from Flask if templating
    
        if (!file) {
            alert("Please select a PNG image.");
            return;
        }
    
        const formData = new FormData();
        formData.append("image", file);
    
        fetch(`/pet/pic/upload/${petId}`, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            window.location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("Image upload failed.");
        });
    });
    
    function uploadPetImage(petId) {
        const fileInput = document.getElementById("imageInput");
        const file = fileInput.files[0];
    
        if (!file) {
            alert("Please select an image file.");
            return;
        }
    
        const formData = new FormData();
        formData.append("image", file);
    
        fetch(`/pet/${petId}/upload`, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Image upload failed");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
        })
        .catch(err => {
            console.error(err);
            alert("An error occurred during upload.");
        });
    }
    
    function updatePetInfo(petId) {
        const payload = {
            pet: document.getElementById("petchoice").value,
            color: document.getElementById("colorchoice").value,
            sex: document.getElementById("sexchoice").value,
            age: document.getElementById("agechoice").value,
            size: document.getElementById("sizechoice").value
        };
    
        fetch(`/pet/edit/${petId+1}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update pet info");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);  // success message
            window.location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("An error occurred while updating the pet");
        });
        
    }
    
}


document.addEventListener('DOMContentLoaded', () => {

    

    const params = new URLSearchParams(window.location.search);
    const value = params.get('id');

    fetch(`/row?id=${value}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    const db = data[0]; // access the first (and only) object

    const petName = document.getElementById("petName").textContent = `Pet #${value + 1}`;
    const petInfo = document.getElementById("petInfo");
    petInfo.innerHTML = ""; // Clear previous content

    const attrs = ["pet", "color", "sex", "age", "size"];

    attrs.forEach((attr) => {
      const div = document.createElement("div");
      div.className = "d-flex flex-column text-align-center";
      petInfo.style.backgroundColor = "rgba(1,1,1,0.4)";
      petInfo.style.borderRadius = "20px";
      petInfo.style.padding = "20px";

      div.innerHTML = `
        <h1 class="text-white text-center fw-bold fs-3">${attr.toUpperCase()}</h1>
        <p class="text-white text-center fs-4">${db[attr]}</p>
      `;

      petInfo.appendChild(div);
    });
  });


})


const errordiv = document.getElementById("error-card")
const divcomms = document.getElementById("comments")
console.log(divcomms)

async function getComments () {

    const params = new URLSearchParams(window.location.search)
    petId = params.get("id")
    errordiv.classList.add("skeleton-block");
    errordiv.innerHTML = "No comments yet. Be the first one!"

    try {
        const response = await fetch(`/comments/${petId}`);

        if (!response.ok) {
            // TODO: ipakita error card
            
        } else {
            const comments = await response.json();
            document.getElementById("commentBtn").disabled = false
            drawComments(comments)
        }
    } catch (e) {
        console.log(e)
    }

}

function drawComments (comments) {
    console.log("drawing comments");
    console.log(comments);

    errordiv.classList.add("hidden");
    divcomms.innerHTML = "";

    if (comments.length === 0) {
        errordiv.classList.remove("hidden");
        errordiv.innerHTML = "No comments yet. Be the first one!";
    } else {
        comments.forEach(comm => {
            const card = document.createElement("div");
            card.className = "card";
            const cardbody = document.createElement("div");
            cardbody.className = "card-body w-100 d-flex flex-column";

            let createdate = new Date(comm.created_at);
            const timestamp = createdate.toLocaleString('en-US', { timeZone: 'Asia/Manila' });

            cardbody.innerHTML = `
                <blockquote class="blockquote">
                    <p>${comm.content}</p>
                    <figcaption class="blockquote-footer text-secondary">
                        ${comm.user} ${timestamp}
                    </figcaption>
                </blockquote>
            `;

            console.log(isAdmin)
            // ✅ Conditionally add delete button for admin
            if (isAdmin === true || isAdmin === "True") {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-large btn-warning fw-bold w-100";
                deleteBtn.textContent = "Delete";

                deleteBtn.onclick = () => {
                    deleteComment(comm.id); // implement this function to make a DELETE request
                };

                cardbody.appendChild(deleteBtn);
            }

            card.appendChild(cardbody);
            divcomms.appendChild(card);
        });
    }
}

function deleteComment(commentId) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    fetch(`/comment/${commentId}`, {
        method: "DELETE"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to delete comment");
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
        // Optionally, refetch or update the comment list
        getComments(); // replace with your actual comment refresh logic
    })
    .catch(err => {
        console.error(err);
        alert("An error occurred while deleting the comment.");
    });
}

async function postComment () {
    const content = document.getElementById("commentContent")
    const params = new URLSearchParams(window.location.search);
    petId = params.get("id")

    document.getElementById("commentBtn").disabled = true

    if (content.value.length != 0 || !content.value.trim()) {
        try {
            const comment = await fetch("/comment", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ post_id: petId, content: content.value, user_id: user})
            })

            if (!comment.ok) {
                alert("Can't post comment")
            }

            getComments()

        } catch (e) {
            console.log(e)
        }
    } else {
        alert("Please input something")
    }
    document.getElementById("commentBtn").disabled = false;
    content.value = "";
}


getComments()