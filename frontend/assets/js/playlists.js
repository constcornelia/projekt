let api = new API();
let ui = new UI();

async function showPlaylists() {
    let playlists = await api.getRequest("/api/playlists");
    ui.renderPlaylists(playlists);
}