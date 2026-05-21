const form = document.querySelector("#FilterForm");
const searchBar = document.querySelector("#filters");
const clear = document.querySelector("#FiltersReset");

let api = new API();
let ui = new UI();

ui.getPlaylists();

async function showPlaylists() {
    let playlists = await api.getRequest("/api/playlists");
    ui.renderPlaylists(playlists);
}

async function showDropDowns () {
    let tags = await api.getRequest("/api/tags");
    console.log(tags);
    ui.dropDownsTags(tags);
}

form.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();

    const main = document.querySelector("#PublicPlaylistsCollection");

    let tag = form.elements.genre.value;

    let endpoint = "api/playlists";

    const params = new URLSearchParams();

    if (tag && tag !== "all") {
        params.append("tag", tag);
    }

    let finalPoint = endpoint;

    if (params.toString()) {
        finalPoint += "?" + params.toString();
    }

    let playlists = await api.getRequest(finalPoint);

    if (playlists.length === 0) {
        main.innerHTML = "No playlists found for your selection."
    } else {
        ui.renderPlaylists(playlists); 
    }
});

searchBar.addEventListener("submit", async function searchSubmit(event) {
    event.preventDefault();

    let searchInput = searchBar.elements.searchInput.value;

    let playlists = await api.getRequest("/api/playlists/search?q=" + searchInput);

    if (playlists && playlists.length > 0) {
        ui.renderPlaylists(playlists);
    } else {
        main.innerHTML = `<p>No playlists matched your search on: <span>${searchInput}</span></p>`;
    }
});

clear.addEventListener("submit", async function clearFilters(event) {
    event.preventDefault();

    form.reset();
    searchBar.reset();
});

showDropDowns();