const api = new API();
const ui = new UI();

let tagSelect = document.querySelector("#playlist-tag");

if (tagSelect) {
    ui.dropDownsTags(tagSelect);
}

let addedSongs = [];
let selectedTags = [];

const createPlaylistForm = document.querySelector("#CreatePlaylistForm");
createPlaylistForm.addEventListener("submit", async function (event) {
    event.preventDefault();
   
    let nameInput = document.querySelector("#playlist-name");
    let descriptionInput = document.querySelector("#playlist-description");
    let tagInput = document.querySelector("#playlist-tag");
    let coverInput = document.querySelector("#add-cover");

    let formData = new FormData();
    // Lägger till spellistans namn
    formData.append("name", nameInput.value);
    // Lägger till spellistans beskrivning
    formData.append("description", descriptionInput.value);
    
    // Gör om alla valda tags till en sträng
    let tagString = "";
    for (let tag of selectedTags) {
        if (tagString != "") {
            tagString += ",";
        }
        tagString += tag;
    }

    // Lägger till vald tag
    formData.append("tag", tagString);
    // Lägger till omslagsbild
    formData.append("cover", coverInput.files[0]);
    // Lägger till alla sparade låtar
    // JSON.stringify gör arrayen till text så att den kan skickas
    formData.append("songs", JSON.stringify(addedSongs));

    // Skickar spellistan till servern
    await fetch("/api/playlists", {
        method: "POST",
        body: formData
    });
    // Skickar användaren tillbaka till startsidan
    window.location.href = "/";
});


const cancelButton = document.querySelector("#CancelCreateButton");
cancelButton.addEventListener("click", async function () {
    // Hämtar den inloggade användaren
    let user = await api.getRequest("/api/profile/info");
    // Om ingen användare finns, så avbryts det
    if (!user) return;
    // Skickar användaren tillbaka till sin profilsida
    window.location.href =  `/profile/${user.username}`;
});


const searchInput = document.querySelector("#SearchSongInput");
async function searchSongs() {
    // Hämtar texten 
    let input = searchInput.value;
    // Hämtar matchande låtar
    let songs = await api.getRequest("/api/songs/search?q=" + input);
    // Position där låtarna ska visas
    let position = document.querySelector("#SearchResultSongs ul");
    // Renderar sökresultatet
    ui.renderSongs(songs, position, true);
}

// När användaren klickar i sökfältet
searchInput.addEventListener("click", async function (event) {
    event.preventDefault();
    await searchSongs();
});
// När användaren trycker Enter
searchInput.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        // Förhindrar att hela CreatePlaylistForm skickas
        event.preventDefault();
        await searchSongs();
    }
});

const addTagButton = document.querySelector("#AddTagButton");
if (addTagButton) {
    addTagButton.addEventListener("click", function () {
        let selectedTag = tagSelect.value;
        if (selectedTag == "") return;
        //ny
        // förslåg att kolla att tag är unik
        if(selectedTags.includes(selectedTag)) return;
        selectedTags.push(selectedTag);
        let tagList = document.querySelector("#SelectedTags");
        let tag = document.createElement("p");
        tag.textContent = selectedTag;
        tagList.append(tag);
        //ny
        // div id="SearchResultSongs" bli synlig
        let wrapper = document.getElementById("wrapperForSelectedTags");        
        wrapper.classList.remove("hidden")
        wrapper.classList.add("input")
    });
}