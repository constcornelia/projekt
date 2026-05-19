const main = document.querySelector("main");

async function loadPlaylist() {
    const api = new API();

    const params = new URLSearchParams(window.location.search);

    const playlistId = params.get("id");

    let playlist = await api.getRequest(`api/playlists/${playlistId}`);
    
    main.innerHTML = `
     <a href="/">← Go back</a>
    <div class="playlist">
        <img src="${playlist.imgUrl}">
        <div id="playlist-info">
        <h2>${playlist.name}</h1>
        <p>${playlist.owenrId}</p>
        <p>${playlist.description}</p>
        <p>${playlist.tags}</p>
        <p>${playlist.songs}</p>
        <p>${playlist.likes}</p>
        </div>
    </div>
    `;
}
loadPlaylist();