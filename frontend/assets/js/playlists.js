const form = document.querySelector("#FilterForm");
const searchBar = document.querySelector("#filters");

let api = new API();
let ui = new UI();

getPlaylists();
dropDownsTags(SelectGenre);

async function showPlaylists() {
    let playlists = await api.getRequest("/api/playlists");
    ui.renderPlaylists(playlists);
}

form.addEvenetListener("submit", async function onSubmit(event) {
    event.preventDefault();

    const main = document.querySelector("#PlaylistsCollection");

    let tag = form.elements.genre.value;

    let endpoint = "api/playlists";

    const params = new URLSearchParams();

    if (tag && tag !== "all") {
        params.append("tag", genre);
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

    form.reset();
    searchBar.reset();
});

searchBar.addEventListener("submit", async function searchSubmit(event) {
    event.preventDefault();

    let searchInput = searchBar.elements.search.value;

    let playlists = await api.getReuqest("/api/playlists/search?q=" + searchInput);

    if (playlists && playlists.length > 0) {
        ui.renderPlaylists(playlists);
    } else {
        main.innerHTML = `<p>No playlists matched your search on: <span>${searchInput}</span></p>`;
    }
});