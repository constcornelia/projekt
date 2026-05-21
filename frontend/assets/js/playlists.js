const form = document.querySelector(".FilterForm");
const searchBar = document.querySelector("#SearchPaylistForm");
const clear = document.querySelector("#FiltersReset");

const api = new API();
const ui = new UI();
ui.getPlaylists();
ui.dropDownsTags(SelectGenre);

form.addEventListener("submit", async function onSubmit(event) {
    event.preventDefault();

    let tag = form.elements.genre.value;

    let endpoint = "/api/playlists";

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
        section.innerHTML = "No playlists found for your selection."
    } else {
        ui.renderPlaylists(playlists); 
    }
});

searchBar.addEventListener("submit", async function searchSubmit(event) {
    event.preventDefault();

    let searchInput = searchBar.elements.SearchInput.value;
   
    let playlists = await api.getRequest("/api/playlists/search?q=" + searchInput);

    if (playlists && playlists.length > 0) {
        ui.renderPlaylists(playlists);
    } else {
        section.innerHTML = `<p>No playlists matched your search on: <span>${searchInput}</span></p>`;
    }
});

clear.addEventListener("click", async function clearFilters(event) {
    event.preventDefault();

    form.reset();
    searchBar.reset();
});