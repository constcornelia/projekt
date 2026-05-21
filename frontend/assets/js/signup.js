let form = document.querySelector("#signup");
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let data = JSON.stringify({
        username: form.elements.username.value,
        password: form.elements.password.value
    });

    let options = {
        method: "POST",
        body: body, 
        headers: { 
            "Content-Type": "application/json" 
        },
    };

    let response = await fetch("/signup", options);

    const errorAlert = document.querySelector(".error-note");
    if (response.status == 401) errorAlert.innerHTML = "Username is already taken";
    if (response.status == 400) errorAlert.innerHTML = "Please enter a username AND a password";
    if (response.status === 303 || response.ok) window.location.href = "/";
});