// const createPlaylist = document.querySelector("#CreatePlaylist");

// const createPlaylistButton = document.querySelector(".CreatePlaylist-Button");
// createPlaylistButton.addEventListener("click", function onClick(event) {
//     createPlaylist.style.display = "block";
// });

// const cancel = document.querySelector("#CancelCreateButton");
// cancel.addEventListener("click", function onClick(event) {
//     createPlaylist.style.display = "none";
// });

// const createPlaylistForm = document.querySelector("#CreatePlaylistForm");
// createPlaylistForm.addEventListener("submit", async function onSubmit(event) {
//     event.preventDefault();

//     const data = new FormData(createPlaylistForm);

//     let options = {
//         method: "POST",
//         body: data
//     };

//     let response = await fetch("", options);
// });

const search = document.querySelector()

const form = document.querySelector("#CreatePlaylistForm");
form.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();
});

// Få userId
// Sök på låtar
// Lägg till låtar
// Flytta renderade låtar till added songs
// Lägg in allt i databasen
// Uppdatera och rendera om sina egna låtar
// Alerta usern om något går fel eller om spellistan lyckades skapas