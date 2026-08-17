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
        errorAlert.textContent = result.message;
        return;
    }
    if (response.status === 303 || response.ok) window.location.href = "/";
});