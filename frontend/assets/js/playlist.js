import { getSongsByPlaylist } from "./songs.js";

async function loadPlaylist() {

    const api = new API();
    const ui = new UI();

    const params = new URLSearchParams(window.location.search);

    const playlistId = params.get("id");

    let playlist = await api.getRequest(`/api/playlists/${playlistId}`);

    let songs = await api.getRequest("/api/songs");

    let playlistSongs = getSongsByPlaylist(playlist, songs);

    ui.renderSongs(playlistSongs);
}

loadPlaylist();