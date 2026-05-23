const api = new API();
const ui = new UI();

async function loadPlaylist() {
    // const playlistId = new URLSearchParams(window.location.search);
    const playlistId = window.location.pathname.split("/")[2];

    let playlist = await api.getRequest(`/api/playlists/${playlistId}`);
    ui.renderPlaylist(playlist.playlist)
    
    const position = document.querySelector(".songs ul");
    ui.renderSongs(playlist.songs, position, false);
}

const showAddSong = document.querySelector(".SongToPlaylist-Button");
showAddSong.addEventListener("click", function onClick(event) {
    console.log(showAddSong);
    const addSong = document.querySelector("#AddSong");
    console.log(addSong);
    addSong.style.display = "block";
});

// const addSongForm = document.querySelector("#AddSongForm");
// addSongForm.addEventListener("submit", async function onSubmit(event) {
//     event.preventDefault();

//     const input = addSongForm.elements.SearchSongInput.value;
//     const songs = await api.getRequest("/api/songs/search?q=" + input);

//     const position = document.querySelector("#SearchResultSongs ul");
//     ui.renderSongs(songs, position, true);
// });

// const addSongButton = document.querySelector(".AddSongButton");
// addSongButton.addEventListener("click", function onClick(event) {

//     let data = JSON.stringify({
//         songId: "",
//         playlistId: "",
//         userId: ""
//     });
// });

loadPlaylist();