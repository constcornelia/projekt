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
    const section = document.querySelector("#PublicPlaylistsCollection");

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

  renderSongs(songs) {

      const songList = document.querySelector(".songs ul");

      if (!songList) return;

      songList.innerHTML = "";

      for (let song of songs) {

          let li = document.createElement("li");

          li.innerHTML = `
              ${song.name} - ${song.artist}
              <button class="Play StopPlaying"></button>
          `;

          songList.appendChild(li);
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
  
  async dropDownsTags() {

      const selectTag = document.querySelector("#SelectGenre");

      if (!selectTag) return;

      let tags = await api.getRequest("/api/tags");

      for (let tag of tags) {
          const option = document.createElement("option");

          option.value = tag;
          option.textContent = tag;

          selectTag.append(option);
      }
  }
}

const ui = new UI();
ui.getPlaylists();
ui.dropDownsTags();