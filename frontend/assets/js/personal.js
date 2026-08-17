const likedPosition = document.querySelector("#LikedPlaylistsCollection");
const ownedPosition = document.querySelector("#OwnedPlaylistsCollection");
const editedPosition = document.querySelector("#EditedPlaylistsCollection");

const title = document.querySelector("#profile-header .title-UI");
const profilePicture = document.querySelector("#ProfilePicture");

const api = new API();
const ui = new UI();

async function showProfileTitle () {
    let profile = await api.getRequest("/api/profile/info");
    title.textContent = profile.username + "'s sound";
    profilePicture.src = "../../../backend/uploads/" + profile.profilePicUrl;
}

async function showProfilePlaylists () {
    let currentUser = await api.getRequest("/api/profile/info");
    if (!currentUser) {
        return;
    }

    let playlists = await api.getRequest("/api/playlists");

    let likedPlaylists = [];
    let ownedPlaylists = [];
    let editedPlaylists = [];

    for (let playlist of playlists) {
        if (playlist.ownerId === currentUser.id) {
            ownedPlaylists.push(playlist);
        }
        if (playlist.likes.includes(currentUser.id)) {
            likedPlaylists.push(playlist);
        }
        for (let song of playlist.songs) {
            if (song.editorId === currentUser.id) {
                editedPlaylists.push(playlist);
                break;
            }
        }
    }

    ui.renderPersonalPlaylists(likedPlaylists, likedPosition);
    ui.renderPersonalPlaylists(ownedPlaylists, ownedPosition);
    ui.renderPersonalPlaylists(editedPlaylists, editedPosition);
}

ui.showProfile();
showProfileTitle();
showProfilePlaylists();