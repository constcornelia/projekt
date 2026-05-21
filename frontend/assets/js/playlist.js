const api = new API();

async function loadPlaylist() {

    const api = new API();
    const ui = new UI();

    // Hämtar playlist id från URL:en
    const playlistId = window.location.pathname.split("/")[2];

    // hämtar playlistens data från API:t
    let playlistData = await api.getRequest(`/api/playlists/${playlistId}`);

    // och renderar alla songs på sidan
    ui.renderSongs(playlistData.songs);
}

const addSongButton = document.querySelector(".SongToPlaylist-Button");
addSongButton.addEventListener("click", async function onClick(event) {
    const addSong = document.querySelector("#AddSong");
    addSong.style.display = "block";
});

const addSongForm = document.querySelector("#AddSongForm");
addSongForm.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();

    const input = addSongForm.elements.SearchSongInput.value;
    const songs = await api.getRequest("/api/songs/search?q=" + input);
    console.log(songs);

    ui.renderSongs(songs);
});

loadPlaylist();