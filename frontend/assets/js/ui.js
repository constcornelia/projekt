
// Product   =   Playlist
// Brand     =   Song
// Category  =   Tags


const main = document.querySelector("main");


let api = new api();


class UI {
  async getPlaylists() {
      let playlists = await api.getRequest("/api/playlists");
      this.renderPlaylists(playlists);
  }


  async getSongs() {
      let songs = await api.getRequest("/")
      this.renderSongs(songs);
  }


  async renderPlaylists (playlists) {
      main.innerHTML = "";


      let users = await api.getRequest("/");


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
          <p><span>Likes</span>: ${playlist.likes}</p>
          <img src="${playlist.coverImgUrl}"></img>
          <h2>${playlist.name}</h2>
          <p><span>Owner</span>: ${ownerName}</p>
          <p><span>Tags</span>: #${playlist.tags}</p>
          <p>${playlist.description}</p>
          `;


          main.append(a);
      }
  }


  async renderSongs (songs) {
      main.innerHTML = "";


      for (let song of songs) {
          let div = document.createElement("div");


          div.innerHTML = `
          <img src="${song.coverImgUrl}"></img>
          <p>${song.name}</p>
          <p>${song.artist}</p>
          `;


          main.appendChild(div);
      }
  }


  async dropDownsPlaylist (playlistElement) {
      let playlists = await api.getRequest("/")


      for (let playlist of playlists) {
          const option = document.createElement("option");
          option.value = playlist.id;
          option.textContent = playlist.name;
          playlistElement.append(option);
      }
  }
}


