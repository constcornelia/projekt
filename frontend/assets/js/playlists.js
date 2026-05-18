let api = new API();
let ui = new UI();

ui.getPlaylists();
ui.dropDownsTags(SelectGenre);

async function showPlaylists() {
    let playlists = await api.getRequest("/api/playlists");
    ui.renderPlaylists(playlists);
}