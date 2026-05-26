const api = new API();
const ui = new UI();

// Exempel:
// [
//   {
//     songId: "s-17",
//     editorId: "u-1"
//   }
// ]
let addedSongs = [];

const createPlaylistForm = document.querySelector("#CreatePlaylistForm");
createPlaylistForm.addEventListener("submit", async function (event) {
    event.preventDefault();
   
    let nameInput = document.querySelector("#playlist-name");
    let descriptionInput = document.querySelector("#playlist-description");
    let tagInput = document.querySelector("#playlist-tag");
    let coverInput = document.querySelector("#add-cover");

    let formData = new FormData();
    // Lägger till spellistans namn
    formData.append("name", nameInput.value);
    // Lägger till spellistans beskrivning
    formData.append("description", descriptionInput.value);
    // Lägger till vald tag
    formData.append("tag", tagInput.value);
    // Lägger till omslagsbild
    formData.append("cover", coverInput.files[0]);

    // Lägger till alla sparade låtar
    // JSON.stringify gör arrayen till text så att den kan skickas
    formData.append("songs", JSON.stringify(addedSongs));

    // Skickar spellistan till servern
    await fetch("/api/playlists", {
        method: "POST",
        body: formData
    });
    // Skickar användaren tillbaka till startsidan
    window.location.href = "/";
});


const cancelButton = document.querySelector("#CancelCreateButton");
cancelButton.addEventListener("click", async function () {
    // Hämtar den inloggade användaren
    let user = await api.getRequest("/api/profile/info");
    // Om ingen användare finns, så avbryts det
    if (!user) return;
    // Skickar användaren tillbaka till sin profilsida
    window.location.href =  `/profile/${user.username}`;
});


const searchSongButton = document.querySelector(".ButtonSearchSong");
searchSongButton.addEventListener("click", async function (event) {
    event.preventDefault();
    // Hämtar söktexten
    let input = document.querySelector("#SearchSongInput").value;
    // Hämtar matchande låtar från servern
    let songs = await api.getRequest("/api/songs/search?q=" + input);
    // Position där låtarna ska visas
    let position = document.querySelector("#SearchResultSongs ul");
    // Renderar sökresultatet
    ui.renderSongs(songs, position, true);
});


const searchInput = document.querySelector("#SearchSongInput");
searchInput.addEventListener("click", async function (event) {
    event.preventDefault();
    // Hämtar texten användaren skrev in
    let input = document.querySelector("#SearchSongInput").value;
    // Hämtar matchande låtar från servern
    let songs = await api.getRequest("/api/songs/search?q=" + input);
    // Position där låtarna ska visas
    let position = document.querySelector("#SearchResultSongs ul");
    // Renderar sökresultatet
    ui.renderSongs(songs, position, true);
});

