const form = document.querySelector("#signup");
form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const data = new FormData(form);

    let options = {
        method: "POST",
        body: data, 
    };

    let response = await fetch("/signup", options);
});