// Function to handle change password logic
function handleChangePassword(user) {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const repeatNewPassword = document.getElementById("repeatNewPassword").value;
    const errorCard = document.getElementById("errorCard");
  
    // Basic validation for empty fields
    if (!currentPassword || !newPassword || !repeatNewPassword) {
      errorCard.classList.remove("d-none");
      errorCard.textContent = "Please fill in all fields.";
      return;
    }
  
    // Check if new password and repeat new password match
    if (newPassword !== repeatNewPassword) {
      errorCard.classList.remove("d-none");
      errorCard.textContent = "New passwords do not match.";
      return;
    }
  
    // Send data to Flask backend
    fetch("/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
        user: user
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success message
        errorCard.classList.remove("d-none");
        errorCard.classList.add("alert-success");
        errorCard.textContent = "Password successfully changed!";
      } else {
        // Show error message
        errorCard.classList.remove("d-none");
        errorCard.classList.add("alert-danger");
        errorCard.textContent = data.message;
      }
    })
    .catch(error => {
      console.error("Error:", error);
      errorCard.classList.remove("d-none");
      errorCard.classList.add("alert-danger");
      errorCard.textContent = "Something went wrong. Please try again.";
    });
  }
  