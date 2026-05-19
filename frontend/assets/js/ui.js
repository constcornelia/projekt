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
const section = document.querySelector("#PublicPlaylistsCollection");

let api = new API();

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

    section.innerHTML = "";

    let users = await api.getRequest("/api/users");
    console.log(users);

      for (let playlist of playlists) {

          let a = document.createElement("a");

          a.href = `personal.html?id=${playlist.id}`;
          a.classList.add('clear-link');

          let ownerName;

        for (let user of users) {
            if (user.id == playlist.ownerId) {
                ownerName = user.username;
            }
        }
        a.innerHTML = `
        <div class="playlist-card">
          <h1 class="title-UI">${playlist.name}
          </h1>
          <div class="playlist-actions">
            <button class="LikePlaylist-Button system-UI"><span>${playlist.likes.length}</span></button>
            <button class="Play StopPlaying"></button>
          </div>
          <p class="system-UI-accent"><span>Tags</span>:#${playlist.tags}</p>
          <img src="${playlist.imgUrl}">
        </div>
        `;
          section.appendChild(a);
      }
  }

  async renderSongs (songs) {
      section.innerHTML = "";

      for (let song of songs) {
          let div = document.createElement("div");

        div.innerHTML = `
        //   <img src="${song.coverImgUrl}"></img>
          <p>${song.name}</p>
          <p>${song.artist}</p>
          `;

          section.appendChild(div);
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
  
  async dropDownsTags (tagsElement) {
    let tags = await api.getRequest("/api/tags");

      for (let tag of tags) {
          const option = document.createElement("option");
          option.value = tag;
          option.textContent = tag;
          tagsElement.append(option);
      }
  }
}