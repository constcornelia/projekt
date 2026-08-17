const form = document.querySelector("#signup");
const errorAlert = document.querySelector(".error-note");
form.addEventListener("submit", async function(event) {
    event.preventDefault();
    errorAlert.textContent = "";
    const data = new FormData(form);

    let options = {
        method: "POST",
        body: data, 
    };

    let response = await fetch("/signup", options);

    if (response.status == 400) {
        const result = await response.json();
        if (result.message === "Profile picture is missing.") {
            errorAlert.textContent = "Please choose a profile picture.";
        } else if (result.message === "Not acceptable input data.") {
            errorAlert.textContent = "Username or password is invalid, or username is already taken.";
        }
        return;
    }
    if (response.status === 303 || response.ok) window.location.href = "/";
});