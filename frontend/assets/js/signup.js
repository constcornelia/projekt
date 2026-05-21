let form = document.querySelector("#signup");
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

    let response = await fetch("/signup", options);
});

const upload = document.querySelector("#image-upload");
upload.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();

    const data = new FormData(upload);
    const options = { method: "POST", body: data };
    const response = await fetch("/upload", options);
});