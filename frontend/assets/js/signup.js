let form = document.querySelector("form");
form.addEventListener("submit", async function (event) {

event.preventDefault();

let data = JSON.stringify({
    username: form.elements.username.value,
    password: form.elements.password.value
});

let options = {
    method: "POST",
    body: data, 
    headers: { 
        "Content-Type": "application/json" 
    },
};

let response = await fetch("/login", options);
});