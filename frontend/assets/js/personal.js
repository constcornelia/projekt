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

const form = document.querySelector(".FilterForm");
const searchBar = document.querySelector("#SearchPaylistForm");
const clear = document.querySelector("#FiltersReset");
const tagInput = document.querySelector("#SelectGenre");
const sortInput = document.querySelector("#Sort-Liked-playlists");
const searchInput = document.querySelector("#SearchInput");

const api = new API();
const ui = new UI();

form.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();
    let tag = tagInput.value;
    let sort = sortInput.checked;
    let endpoint = "/api/profile/playlists/liked";
    const params = new URLSearchParams();
    if (tag && tag !== "ShowAll") {
        params.append("tag", tag);
    }
    if (sort) {
        params.append("sort", "likes");
    }
    let finalPoint = endpoint;
    if (params.toString()) {
        finalPoint += "?" + params.toString();
    }
    let playlists = await api.getRequest(finalPoint);
    let position = document.querySelector("#PersonalPlaylistsCollection");
    if (playlists.length === 0) {
        position.innerHTML = "No playlists found for your selection.";
    } else {
        ui.renderPersonalPlaylists(playlists, position);
    }
});


searchBar.addEventListener("submit", async function searchSubmit(event) {
    event.preventDefault();
    let section = document.querySelector("#PersonalPlaylistsCollection");
    let searchValue = searchInput.value;
    let playlists = await api.getRequest("/api/playlists/search?q=" + searchValue);
    if (playlists && playlists.length > 0) {
        ui.renderPersonalPlaylists(playlists, section);
    } else {
        section.innerHTML = `
            <p>
                No playlists matched your search on:
                <span>${searchValue}</span>
            </p>
        `;
    }
});

clear.addEventListener("click", async function clearFilters(event) {
    event.preventDefault();
    let playlists = await api.getRequest("/api/profile/playlists/liked");
    let position = document.querySelector("#PersonalPlaylistsCollection");
    ui.renderPersonalPlaylists(playlists, position);
    form.reset();
    searchBar.reset();
});


async function showLikedPlaylists() {
    let playlists = await api.getRequest("/api/profile/playlists?type=liked");
    let section = document.querySelector("#PersonalPlaylistsCollection");
    ui.renderPersonalPlaylists(playlists, section);
}
ui.showProfile();
showLikedPlaylists();
ui.dropDownsTags(tagInput);