const api = new API();
const ui = new UI();

// Sparar låtar som användaren lägger till
let addedSongs = [];

// Formuläret för att skapa spellista
const createPlaylistForm = document.querySelector("#CreatePlaylistForm");

createPlaylistForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    let formData = new FormData();

    formData.append(
        "name",
        createPlaylistForm.elements["playlist-name"].value
    );

    formData.append(
        "description",
        createPlaylistForm.elements["playlist-description"].value
    );

    formData.append(
        "tag",
        createPlaylistForm.elements["playlist-tag"].value
    );

    formData.append(
        "cover",
        createPlaylistForm.elements["add-cover"].files[0]
    );

    formData.append(
        "songs",
        JSON.stringify(addedSongs)
    );

    await fetch("/api/playlists", {
        method: "POST",
        body: formData
    });

    window.location.href = "/";
});


const cancelButton = document.querySelector("#CancelCreateButton");
cancelButton.addEventListener("click", async function () {
    let user = await api.getRequest("/api/profile/info");
    if (!user) return;
    window.location.href =  `/profile/${user.username}`;
});


const searchSongButton =
    document.querySelector(".ButtonSearchSong");

searchSongButton.addEventListener("click", async function (event) {
    event.preventDefault();
    // Hämtar söktexten
    let input =
        document.querySelector("#SearchSongInput").value;

    // Hämtar matchande låtar från servern
    let songs =
        await api.getRequest("/api/songs/search?q=" + input);

    // Position där låtarna ska visas
    let position =
        document.querySelector("#SearchResultSongs ul");

    // Renderar sökresultatet
    ui.renderSongs(songs, position, true);
});


const searchInput = document.querySelector("#SearchSongInput");

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchSongButton.click();

    }

});

