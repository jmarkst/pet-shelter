// Function to Show Error Messages
function showError(message) {
    const errorCard = document.getElementById("errorCard");
    errorCard.innerText = message;
    errorCard.classList.remove("d-none");
}

// Function to Hide Error Messages
function hideError() {
    document.getElementById("errorCard").classList.add("d-none");
}

// Handle Register Button Click
function handleRegister() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const repeat = document.getElementById("registerRepeatPassword").value;

    if (!username || !password) {
        showError("All fields are required.");
        return;
    }

    if (password.length < 8) {
        showError("Password must be at least 8 characters long.");
        return;
    }

    if (password != repeat) {
        showError("Passwords does not match.");
        return;
    }

    register(username, password);
}

// Handle Login Button Click
function handleLogin() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        showError("All fields are required.");
        return;
    }

    login(username, password);
}

// Login Function
function login(username, password) {
    fetch('/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("authToken", data.token);
            alert("Login successful!");
            window.location.href = "/";
        } else {
            alert("Incorrect credentials");
        }
    });
}

// Check if User is Logged In
function checkLogin() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.log("User not logged in");
        return;
    }

    fetch('/protected', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(() => console.error("Invalid token"));
}

// Logout Function
function logout() {
    localStorage.removeItem("authToken");
    console.log("User logged out");
}

function register(username, password) {
    fetch('/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "User registered successfully") {
            console.log("Registration successful!");
            alert("Registration successful! You can now log in.");
            window.location.href = "/login";
        } else {
            console.error("Registration failed:", data.message);
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}
