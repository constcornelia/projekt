// Product   =   Playlist
// Brand     =   Song
// Category  =   Tags
const section = document.querySelector("#PlaylistsCollection");

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

          let ownerName;

        for (let user of users) {
            if (user.id == playlist.ownerId) {
                ownerName = user.username;
            }
        }
        a.innerHTML = `
        <div class="song-card">
        <p><span>Likes</span>: ${playlist.likes.length}</p>
        <img src="${playlist.coverImgUrl}">
        <h2>${playlist.name}</h2>
        <p><span>Owner</span>: ${ownerName}</p>
        <p><span>Tags</span>: #${playlist.tags}</p>
        <p>${playlist.description}</p>
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
}

const ui = new UI();
ui.getPlaylists();
