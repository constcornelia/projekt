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
    // Om användaren valt en specifik tag
    if (tag && tag !== "all") {
        // Lägger till tag i URL
        params.append("tag", tag);
    }
    // Om användaren valt sortering
    if (sort) {
        // Lägger till sortering i URL
        params.append("sort", "likes");
    }
    // Startvärde för endpointen
    let finalPoint = endpoint;
    // Om parametrar finns
    if (params.toString()) {
        // Bygger färdig URL
        finalPoint += "?" + params.toString();
    }
    // Hämtar spellistor från servern
    let playlists = await api.getRequest(finalPoint);
    // Position där spellistorna ska visas
    let position = document.querySelector("#PublicPlaylistsCollection");
    // Om inga spellistor hittades
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
    // Om spellistor hittades
    if (playlists && playlists.length > 0) {
        ui.renderPlaylists(playlists, section);
    } else {
        // Visar felmeddelande
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

ui.getPlaylists();
ui.dropDownsTags(tagInput);