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

    errordiv.classList.add("is-hidden")
    divcomms.innerHTML = ""

    if (comments.length == 0) {
        errordiv.classList.remove("skeleton-block");
        errordiv.innerHTML = "No comments yet. Be the first one!"
    } else {
        comments.forEach(comm => {
            const cardxx = document.createElement("div");
            cardxx.classList.add("container", "is-fluid", "card", "p-3");

            const comment = document.createElement("p");
            comment.innerHTML = comm.content;

            const postdate = document.createElement("small");
            postdate.innerHTML = comm.created_at;

            cardxx.appendChild(comment);
            cardxx.appendChild(postdate);

            divcomms.appendChild(cardxx)
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
}


getComments()