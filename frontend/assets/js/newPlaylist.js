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
    let coverInput = document.querySelector("#add-cover");
    let errorMessage = document.querySelector("#CreatePlaylistError");
    
    let formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("description", descriptionInput.value);
    
    for (let tag of selectedTags) {
        formData.append("tag", tag);
    }
    
    formData.append("cover", coverInput.files[0]);
    formData.append("songs", JSON.stringify(addedSongs));
    
    try {
        const response = await fetch("/new-playlist", {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            const data = await response.json();
            errorMessage.textContent = data.message;
            return;
        }
        window.location.href = "/";
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});


const cancelButton = document.querySelector("#CancelCreateButton");
cancelButton.addEventListener("click", async function () {
    let user = await api.getRequest("/api/profile/info");
    if (!user) return;
    window.location.href =  `/profile/${user.username}`;
});


const searchInput = document.querySelector("#SearchSongInput");
async function searchSongs() {
    let input = searchInput.value;
    let songs = await api.getRequest("/api/songs/search?q=" + input);
    let position = document.querySelector("#SearchResultSongs ul");
    ui.renderSongs(songs, position, true);
}

searchInput.addEventListener("click", async function (event) {
    event.preventDefault();
    await searchSongs();
});

searchInput.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        await searchSongs();
    }
});

const addTagButton = document.querySelector("#AddTagButton");
if (addTagButton) {
    addTagButton.addEventListener("click", function () {
        let selectedTag = tagSelect.value;
        if (selectedTag == "") {
            return;
        }

        if (selectedTags.includes(selectedTag)) {
            return;
        }
        selectedTags.push(selectedTag);

        let tagList = document.querySelector("#SelectedTags");
        let tag = document.createElement("p");
        tag.textContent = "#" + selectedTag;
        tagList.append(tag);

        let wrapper = document.getElementById("wrapperForSelectedTags");        
        wrapper.classList.remove("hidden")
        wrapper.classList.add("input")
    });
}