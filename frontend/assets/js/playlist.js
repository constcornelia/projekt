const api = new API();
const ui = new UI();

async function loadPlaylist() {
    // Hämtar spellistans id från URL:en
    // Exempel: /playlists/p-1 -> "p-1"
    const playlistId = window.location.pathname.split("/")[2];
    // Hämtar spellistans data från servern
    let playlistData = await api.getRequest(`/api/playlists/${playlistId}`);
    // Hämtar positionen där låtarna ska visas
    const positionSong = document.querySelector(".songs ul");
    // Renderar spellistans låtar
    ui.renderSongs(playlistData.songs, positionSong, false, playlistData.playlist);
    // Hämtar positionen där spellistans info ska visas
    const positionInfo = document.querySelector(".info");
    // Renderar spellistans information
    ui.renderPlaylistInfo(playlistData.playlist, positionInfo);
}

const showAddSong = document.querySelector(".SongToPlaylist-Button");
// Kör bara om knappen finns på sidan
if (showAddSong) {
    showAddSong.addEventListener("click", async function (event) {
    event.preventDefault();
    const addSong = document.querySelector("#AddSong");
    addSong.style.display = "block";
    let songs = await api.getRequest("/api/songs");
    const position = document.querySelector("#SearchResultSongs ul");
    ui.renderSongs(songs, position, true);
});
}

const addSongForm = document.querySelector("#AddSongForm");
// Kör bara om formuläret finns
if (addSongForm) {
    addSongForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        // Hämtar texten användaren sökt på
        const input = addSongForm.elements.SearchSongInput.value;
        // Hämtar matchande låtar från servern
        const songs = await api.getRequest("/api/songs/search?q=" + input);
        // Hämtar positionen där sökresultatet ska visas
        const position = document.querySelector("#SearchResultSongs ul");
        ui.renderSongs(songs, position, true);
    });
}
loadPlaylist();