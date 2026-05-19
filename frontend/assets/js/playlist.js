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

loadPlaylist();