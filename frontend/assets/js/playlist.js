const api = new API();
const ui = new UI();

async function loadPlaylist() {

    // Hämtar playlist id från URL:en
    const playlistId = window.location.pathname.split("/")[2];

    // hämtar playlistens data från API:t
    let playlistData = await api.getRequest(`/api/playlists/${playlistId}`);

    // och renderar alla songs på sidan
    const position = document.querySelector(".songs ul");
    ui.renderSongs(playlistData.songs, position, false);
}

const showAddSong = document.querySelector(".SongToPlaylist-Button");
showAddSong.addEventListener("click", function onClick(event) {
    const addSong = document.querySelector("#AddSong");
    addSong.style.display = "block";
});

const addSongForm = document.querySelector("#AddSongForm");
addSongForm.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();

    const input = addSongForm.elements.SearchSongInput.value;
    const songs = await api.getRequest("/api/songs/search?q=" + input);

    const position = document.querySelector("#SearchResultSongs ul");
    ui.renderSongs(songs, position, true);
});

const addSongButton = document.querySelector(".AddSongButton");
addSongButton.addEventListener("click", function onClick(event) {

    let data = JSON.stringify({
        songId: "",
        playlistId: "",
        userId: ""
    });
});

loadPlaylist();