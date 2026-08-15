// const createPlaylist = document.querySelector("#CreatePlaylist");

// const createPlaylistButton = document.querySelector(".CreatePlaylist-Button");
// createPlaylistButton.addEventListener("click", function onClick(event) {
//     createPlaylist.style.display = "block";
// });

// const cancel = document.querySelector("#CancelCreateButton");
// cancel.addEventListener("click", function onClick(event) {
//     createPlaylist.style.display = "none";
// });

// const createPlaylistForm = document.querySelector("#CreatePlaylistForm");
// createPlaylistForm.addEventListener("submit", async function onSubmit(event) {
//     event.preventDefault();

//     const data = new FormData(createPlaylistForm);

//     let options = {
//         method: "POST",
//         body: data
//     };

//     let response = await fetch("", options);
// });

const position = document.querySelector("#PersonalPlaylistsCollection");
const title = document.querySelector("#filters .title-UI");
const profilePicture = document.querySelector("#ProfilePicture");

const api = new API();
const ui = new UI();

async function showProfileTitle () {
    let profile = await api.getRequest("/api/profile/info");
    title.textContent = profile.username + "'s sound";
    profilePicture.src = "../../../backend/uploads/" + profile.profilePicUrl;
}

async function showLikedPlaylists() {
    let playlists = await api.getRequest("/api/profile/playlists?type=liked");
    ui.renderPersonalPlaylists(playlists, position);
}

async function showContributedPlaylists () {
    let playlists = await api.getRequest("/api/profile/playlists?type=edited");
    let section = document.querySelector("#PersonalPlaylistsCollection");
    ui.renderPersonalPlaylists(playlists, position);
}

async function showOwnedPlaylists () {
    let playlists = await api.getRequest("/api/profile/playlists?type=owned");
    let section = document.querySelector("#PersonalPlaylistsCollection");
    ui.renderPersonalPlaylists(playlists, position);
}

ui.showProfile();
showProfileTitle();
showLikedPlaylists();
showContributedPlaylists();
showOwnedPlaylists();