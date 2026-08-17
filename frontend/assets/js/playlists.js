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

    let endpoint = "/api/playlists";

    const params = new URLSearchParams();

    if (tag && tag !== "all") {
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
    let position = document.querySelector("#PublicPlaylistsCollection");

    if (playlists.length === 0) {
        position.innerHTML = "No playlists found for your selection.";
    } else {
        ui.renderPlaylists(playlists, position);
    }
});

searchBar.addEventListener("submit", async function searchSubmit(event) {
    event.preventDefault();

    let section = document.querySelector("#PublicPlaylistsCollection");

    let searchValue =  searchInput.value;

    let playlists = await api.getRequest("/api/playlists/search?q=" + searchValue);
    if (playlists && playlists.length > 0) {
        ui.renderPlaylists(playlists, section);
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

    let playlists = await api.getRequest("/api/playlists");
    let position = document.querySelector("#PublicPlaylistsCollection");
    ui.renderPlaylists(playlists, position);
    
    form.reset();
    searchBar.reset();
});

ui.showProfile();
ui.getPlaylists();
ui.dropDownsTags(tagInput);