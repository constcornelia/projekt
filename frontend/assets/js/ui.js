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
            <button class="LikePlaylist-Button system-UI"><span>${playlist.likes.length}</span></button>
            <button class="Play"></button>
          </div>
          <p class="system-UI-accent">#${playlist.tags}</p>
          <img src="${playlist.imgUrl}">
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
            console.log(updatedPlaylist);

            // Uppdaterar siffran i like-knappen så att rätt antal likes visas direkt på sidan
            likeButton.querySelector("span").textContent = updatedPlaylist.playlist.likes.length;
        });
        let playButton = a.querySelector(".Play")
        playButton.addEventListener("click", async function (event) {
            event.preventDefault();
            playButton.classList.toggle("StopPlaying");

        });

      }
  }

  renderSongs(songs, position, add) {

      if (!position) return;

      position.innerHTML = "";

      for (let song of songs) {

          let li = document.createElement("li");

          if (add) {
            li.innerHTML = `
                ${song.name} - ${song.artist}
                <button type="button" class="AddSongButton">Add song</button>
            `;
          } else {
          li.innerHTML = `
              ${song.name} - ${song.artist}
              <button class="Play StopPlaying"></button>
          `;
          }

          position.appendChild(li);
      }
  }
  renderPlaylistInfo(playlist, position){
    if (!position) return;
    position.innerHTML = `
    <h1 id="PlaylistName" class="title">${playlist.name}</h1>
    <p id="PlaylistDescription" class="system-UI">${playlist.description}</p>
    <p id="PlaylistTag" class="system-UI-accent">${playlist.tags}</p>
    <img src="${playlist.imgUrl}">
    `;
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
    console.log(user);

    if (!user) return; //om server inte gav en user så stoppas funktionen och ändrar inte länken

    // Om user finns så ändrar länken till profile/username
    toProfile.href = `/profile/${user.username}`;
  }
}