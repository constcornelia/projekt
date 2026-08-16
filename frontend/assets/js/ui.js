//det verkar att search funkar inte utan submit
// så  gjorde jag två former for search och sortering
//for main.html
/*
let FilterForm = document.getElementById("FilterForm");
FilterForm.addEventListener("change", function (event) {
    console.log("new value!", event.target);

})

let AddSongForm = document.getElementById("AddSongForm");
AddSongForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let SearchInput = SearchForm.SearchInput.value;
    console.log("new value!", SearchForm.SearchInput);

})*/

// Product   =   Playlist
// Brand     =   Song 
// Category  =   Tags

let sections = [
    document.querySelector("#PublicPlaylistsCollection"),
    document.querySelector("#PersonalPlaylistsCollection")
];

function formatTags(tags) {
    let result = "";
    for (let tag of tags) {
        if (result != "") {
            result += " ";
        }
        result += "#" + tag;
    }
    return result;
}

class UI {
  async getPlaylists() {
      let playlists = await api.getRequest("/api/playlists");
      this.renderPlaylists(playlists);
  }

  async getSongs() {
      let songs = await api.getRequest("/api/songs")
      this.renderSongs(songs);
  }

  async renderPlaylists(playlists) {
    const section = sections[0];
    if (!section) return;
    section.innerHTML = "";
    
    let users = await api.getRequest("/api/users");
      for (let playlist of playlists) {
          let a = document.createElement("a");
          a.href = `/playlists/${playlist.id}`;
          a.classList.add('clear-link');

          let ownerName;
        for (let user of users) {
            if (user.id == playlist.ownerId) {
                ownerName = user.username;
            }
        }

        a.innerHTML = `
        <div class="playlist-card">
          <h1 class="title-UI">${playlist.name} </h1>
          <p>${ownerName}</p>
          <div class="playlist-actions">
            <button class="LikePlaylist-Button WhiteLike system-UI"><span>${playlist.likes.length}</span></button>
            <button class="Play"></button>
          </div>
          <p class="system-UI-accent">${formatTags(playlist.tags)}</p>
          <img src="backend/uploads/${playlist.imgUrl}">
        </div>
        `;
        section.appendChild(a);

        let likeButton = a.querySelector(".LikePlaylist-Button");
        likeButton.addEventListener("click", async function (event) {
            event.preventDefault();
            // Skickar PATCH-request till servern och lägger till eller tar bort användarens like
            await api.patchRequest(`/api/playlists/${playlist.id}/like`);
            // Hämtar den uppdaterade spellistan från servern
            let updatedPlaylist = await api.getRequest(`/api/playlists/${playlist.id}`);
            // Uppdaterar siffran i like-knappen så att rätt antal likes visas direkt på sidan
            likeButton.querySelector("span").textContent = updatedPlaylist.playlist.likes.length;
        });
        let playButton = a.querySelector(".Play")
        playButton.addEventListener("click", async function (event) {
            event.preventDefault();
            if (playButton.classList.contains("StopPlaying")) {
                playButton.classList.remove("StopPlaying");
            } else {
                playButton.classList.add("StopPlaying");
            }
        });
      }
  }

  async renderPersonalPlaylists(playlists, section) {
    if (!section) return;
    // Behåller create-playlist kortet
    section.innerHTML = "";
    let currentUser = await api.getRequest("/api/profile/info");
    let users = await api.getRequest("/api/users");
    if (!playlists || playlists.length === 0) {
        section.innerHTML = `
            <p class="system-UI-accent">
                No playlists found.
            </p>
        `;
        return;
    }
    for (let playlist of playlists) {
        let a = document.createElement("a");
        a.href = `/playlists/${playlist.id}`;
        a.classList.add("clear-link");

        let ownerName;
        for (let user of users) {
            if (user.id == playlist.ownerId) {
                ownerName = user.username;
            }
        }

        a.innerHTML = `
        <div class="playlist-card">
          <h1 class="title-UI">${playlist.name}</h1>
          <p>${ownerName}</p>
          <div class="playlist-actions">
            <button class="LikePlaylist-Button WhiteLike system-UI">
              <span>${playlist.likes.length}</span>
            </button>
            <button class="Play"></button>
          </div>
          <p class="system-UI-accent">${formatTags(playlist.tags)}</p>
        <img src="backend/uploads/${playlist.imgUrl}">
        </div>
        `;
        section.appendChild(a);

        let likeButton = a.querySelector(".LikePlaylist-Button");
        likeButton.addEventListener("click", async function (event) {
            event.preventDefault();

            // Skickar PATCH-request som togglar like/unlike
            await api.patchRequest(`/api/playlists/${playlist.id}/like`);
            // Hämtar den uppdaterade spellistan
            let updatedPlaylist = await api.getRequest(`/api/playlists/${playlist.id}`);

            // Uppdaterar like-siffran direkt i knappen
            likeButton.querySelector("span").textContent = updatedPlaylist.playlist.likes.length;

            // Om användaren tog bort sin like så tas spellistan bort från "My Collection"
            if (!updatedPlaylist.playlist.likes.includes(currentUser.id)) {
                a.remove();
            }
        });
        let playButton = a.querySelector(".Play");
        playButton.addEventListener("click", async function (event) {
            event.preventDefault();
            if (playButton.classList.contains("StopPlaying")) {
                playButton.classList.remove("StopPlaying");
            } else {
                playButton.classList.add("StopPlaying");
            }
        });
    }
}

   async renderSongs(songs, position, add, playlist) {
        // Om ingen position skickats in, så stoppas funktionen
        if (!position) return;
        position.innerHTML = "";

        for (let song of songs) {
            let li = document.createElement("li");
            // Om låtarna ska kunna läggas till i en spellista
            if (add) { //true, låtar ska läggas till 
                li.innerHTML = `
                    ${song.name} - ${song.artist}
                    <button type="button" class="AddSongButton WhiteButton">
                        Add song
                    </button>
                `;
                let addButton = li.querySelector(".AddSongButton");
                addButton.addEventListener("click", async function (event) {
                    event.preventDefault();
                    let currentUser = await api.getRequest("/api/profile/info");
                    if (!currentUser) {
                        alert("Ingen inloggad användare");
                        return;
                    }

                    let playlistId = window.location.pathname.split("/")[2];
                    if (playlistId) { // låtar ska läggas till i ett befintligt playlist, ex add songs i playlist.js 
                        let playlistData = await api.getRequest(`/api/playlists/${playlistId}`);
                        let alreadyAdded = false;
                        for (let playlistSong of playlistData.playlist.songs) {
                            if (playlistSong.songId === song.id) {
                                alreadyAdded = true;
                                break;
                            }
                        }
                        if (alreadyAdded) {
                            alert("Den låten är redan tillagd!");
                            return;
                        }
                        await api.patchRequest(`/api/playlists/${playlistId}`, {
                            songId: song.id,
                            editorId: currentUser.id
                        });
                    } else { // låtar ska läggas till i ett nytt playlist, ex add songs i newPlaylist.js 
                        let alreadyAdded = false;
                        for (let addedSong of addedSongs) {
                            if (addedSong.songId === song.id) {
                                alreadyAdded = true;
                                break;
                            }
                        }
                        if (alreadyAdded) {
                            alert("Den låten är redan tillagd!");
                            return;
                        }
                        addedSongs.push({
                            songId: song.id,
                            editorId: currentUser.id
                        });
                    }
                    let wrapper = document.getElementById("wrapperForAddedSongsList")
                    if(wrapper){
                        wrapper.classList.remove("hidden")
                        wrapper.classList.add("input")
                    }
                    const addedSongsList = document.querySelector("#addedSongsList");
                    let addedLi = document.createElement("li");
                    addedLi.innerHTML = `
                    ${song.name} - ${song.artist}
                    <button type="button" class="Play StopPlaying"></button>
                    <button type="button" class="RemoveSongButton WhiteButton">Remove Song</button>
                    `;
                    let removeButton = addedLi.querySelector(".RemoveSongButton");
                    removeButton.addEventListener("click", function () {
                        for (let i = 0; i < addedSongs.length; i++) {
                            if (addedSongs[i].songId === song.id) {
                                addedSongs.splice(i, 1);
                                break;
                            }
                        }
                        addedLi.remove();
                    });
                    if (addedSongsList) {
                        addedSongsList.appendChild(addedLi);
                    }
                });
            } else {
                // vanlig rendering av befintliga låtar
                let currentUser = await api.getRequest("/api/profile/info");
                li.innerHTML = `
                    ${song.name} - ${song.artist}
                    <button class="Play StopPlaying"></button>
                `;
                if (currentUser && currentUser.id == playlist.ownerId) {
                    // måste använda += för att behålla det som redan finns och lägg till det också
                    li.innerHTML += ` 
                    <button class="RemoveSongButton WhiteButton">Remove Song</button>
                    `;
                    let removeButton = li.querySelector(".RemoveSongButton");
                    removeButton.addEventListener("click", async function () {
                        let playlistId = window.location.pathname.split("/")[2];
                        await api.deleteRequest(`/api/playlists/${playlistId}/songs/${song.id}`);
                        li.remove();
                    });
                }
            }
            position.appendChild(li);
        }
        let container = document.querySelector("#SearchResultSongs");
        container.classList.remove("hidden")
        container.classList.add("input")
        if(!position.innerHTML){
            position.innerHTML = "no song found"
        };
    }
    
    async renderPlaylistInfo(playlist, position) {
        if (!position) return;
        // hämtar den inloggade användaren
        let currentUser = await api.getRequest("/api/profile/info");
        // skapar delete knappen bara om användaren äger spellistan
        let deleteButton = "";
        if (currentUser && currentUser.id == playlist.ownerId) {
            deleteButton = `
                <button class="DeletePlaylistButton OrangeButton">
                    Delete playlist
                </button>
            `;
            let deletePlaceholder = document.querySelector("div.edit-actions")
            deletePlaceholder.innerHTML = `${deleteButton}`
        }

        // profilePicture.src = "../../../backend/uploads/" + currentUser.profilePicUrl
        position.innerHTML = `
            <h1 id="PlaylistName" class="title">${playlist.name}</h1>
            <p id="PlaylistDescription" class="system-UI">${playlist.description}</p>
            <p id="PlaylistTag" class="system-UI-accent">${formatTags(playlist.tags)}</p>
            <img src="backend/uploads/${playlist.imgUrl}">
        `;
        // delete knappen finns bara för ägaren
        let deleteButtonElement = document.querySelector(".DeletePlaylistButton");
        
        if (deleteButtonElement) {
            deleteButtonElement.addEventListener("click", async function () {
                let playlistId = playlist.id;
                let response = await api.deleteRequest(`/api/profile/playlist/${playlistId}`);
                alert("Successfully deleted!");
                window.location.href = "/main.html";
            });
        }

        let likeButton = document.querySelector(".LikePlaylist-Button");
        if (likeButton) {
            likeButton.querySelector("span").textContent = playlist.likes.length;
            likeButton.addEventListener("click", async function(event) {
                event.preventDefault();
                let playlistId = window.location.pathname.split("/")[2];
                await api.patchRequest(`/api/playlists/${playlistId}/like`); //patch lägger till och tar bort användarens like
                let updatedPlaylist =  await api.getRequest( `/api/playlists/${playlistId}`); //hämtar den upptaderade spellistan
                likeButton.querySelector("span").textContent = updatedPlaylist.playlist.likes.length; //så att den nya antalet likes kan visas direkt i knappen
            });
        }
    }

  async dropDownsPlaylist (playlistElement) {
    let playlists = await api.getRequest("/api/playlists");
      for (let playlist of playlists) {
            const option = document.createElement("option");
            option.value = playlist.id;
            option.textContent = playlist.name;
            playlistElement.append(option);
      }
  }
  
  async dropDownsTags(tagElement) {
      let tags = await api.getRequest("/api/tags");
      for (let tag of tags) {
          const option = document.createElement("option");
          option.value = tag;
          option.textContent = tag;
          tagElement.append(option);
      }
  }

  async showProfile() {
    const toProfile = document.querySelector("#toPersonal");
    if (!toProfile) return; //undvika andra sidor att få error 
    let user = await api.getRequest("/api/profile/info");
    if (!user) return; //om server inte gav en user så stoppas funktionen och ändrar inte länken
    // Om user finns så ändrar länken till profile/username
    toProfile.href = `/profile/${user.username}`;
}
}
