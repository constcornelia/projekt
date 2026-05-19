const songList = document.querySelector(".song ul");

async function loadPlaylist() {

    const api = new API();
    const ui = new UI();

    const params = new URLSearchParams(window.location.search);

    const playlistId = params.get("id");

    let playlist = await api.getRequest(`/api/playlists/${playlistId}`);

    let songs = await api.getRequest("/api/songs");

    ui.renderSongs(playlistSongs);
}

loadPlaylist();