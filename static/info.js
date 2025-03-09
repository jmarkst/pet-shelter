document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const value = params.get('id');

    fetch(`/row?id=${value}`)
          .then(response => response.json())
          .then(text => {
            console.log(text)
            db = text

            console.log(db)

            const petName = document.getElementById("petName").textContent = `Pet #${eval(value + 1)}`
            const petInfo = document.getElementById("petInfo");

            const attrs = ["pet", "color", "sex", "age", "size"]

            db.forEach((item, index) => {
                const div = document.createElement("div");
                div.className = "d-flex flex-column text-align-center";
            
                div.innerHTML = `
                    <h1 class="text-white text-center fw-bold fs-3">${attrs[index]}</h1>
                    <p class="text-white text-center fs-4">${item}</p>
                `;
            
                petInfo.appendChild(div);
            });
            
        })

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
    console.log("drawing comments")
    console.log(comments)

    errordiv.classList.add("hidden")
    divcomms.innerHTML = ""

    if (comments.length == 0) {
        errordiv.classList.remove("hidden");
        errordiv.innerHTML = "No comments yet. Be the first one!"
    } else {
        comments.forEach(comm => {
            const card = document.createElement("div")
            card.className = "card"
            const cardbody = document.createElement("div")
            cardbody.className = "card-body w-100 d-flex flex-column"

            cardbody.innerHTML = `
                <blockquote class="blockquote">
                    <p>${comm.content}</p>
                    <figcaption class="blockquote-footer text-secondary">
                        ${comm.created_at}
                    </figcaption>
                </blockquote>
            `

            card.appendChild(cardbody)
            divcomms.appendChild(card)
        });
        
    }
        
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
                body: JSON.stringify({ post_id: petId, content: content.value})
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