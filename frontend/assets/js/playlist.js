const api = new API();
const ui = new UI();

async function loadPlaylist() {

    const playlistId =
        window.location.pathname.split("/")[2];

    let playlistData =
        await api.getRequest(`/api/playlists/${playlistId}`);

    const positionSong =
        document.querySelector(".songs ul");

    ui.renderSongs(
        playlistData.songs,
        positionSong,
        false
    );

    const positionInfo =
        document.querySelector(".info");

    ui.renderPlaylistInfo(
        playlistData.playlist,
        positionInfo
    );
}

const showAddSong =
    document.querySelector(".SongToPlaylist-Button");

if (showAddSong) {

    showAddSong.addEventListener("click", function (event) {

        event.preventDefault();

        const addSong =
            document.querySelector("#AddSong");

        addSong.style.display = "block";
    });
}

const addSongForm =
    document.querySelector("#AddSongForm");

if (addSongForm) {

    addSongForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const input =
            addSongForm.elements.SearchSongInput.value;

        const songs =
            await api.getRequest("/api/songs/search?q=" + input);

        const position =
            document.querySelector("#SearchResultSongs ul");

        ui.renderSongs(songs, position, true);
    });
}

loadPlaylist();