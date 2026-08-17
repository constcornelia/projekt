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
                <img src="/backend/uploads/${playlist.imgUrl}">
            </div>
            `;

            section.appendChild(a);

            let likeButton = a.querySelector(".LikePlaylist-Button");
            likeButton.addEventListener("click", async function (event) {
                event.preventDefault();
                await api.patchRequest(`/api/playlists/${playlist.id}/like`);
                let updatedPlaylist = await api.getRequest(`/api/playlists/${playlist.id}`);
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
                <img src="/backend/uploads/${playlist.imgUrl}">
            </div>
            `;
            
            section.appendChild(a);
            
            let likeButton = a.querySelector(".LikePlaylist-Button");
            likeButton.addEventListener("click", async function (event) {
                event.preventDefault();

                await api.patchRequest(`/api/playlists/${playlist.id}/like`);
                let updatedPlaylist = await api.getRequest(`/api/playlists/${playlist.id}`);

                likeButton.querySelector("span").textContent = updatedPlaylist.playlist.likes.length;

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
        if (!position) return;

        position.innerHTML = "";

        let currentUser = await api.getRequest("/api/profile/info");

        for (let song of songs) {
            let li = document.createElement("li");
            if (add) { 
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
                    if (playlistId) { 
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

                        let playlistOwnerId = playlistData.playlist.ownerId;
                        await api.patchRequest(`/api/playlists/${playlistId}`, {
                            songId: song.id,
                            editorId: currentUser.id
                        });

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
                        `;

                        if (currentUser.id === playlistOwnerId) {
                            addedLi.innerHTML += `
                                <button type="button" class="RemoveSongButton WhiteButton">Remove Song</button>
                            `;
                            let removeButton = addedLi.querySelector(".RemoveSongButton");
                            removeButton.addEventListener("click", async function () {
                                await api.deleteRequest(`/api/playlists/${playlistId}/songs/${song.id}`);
                                addedLi.remove();
                            });
                        }

                        if (addedSongsList) {
                            addedSongsList.appendChild(addedLi);
                        }
                    } else { 
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
                    }
                });
            } else {
                let currentUser = await api.getRequest("/api/profile/info");

                li.innerHTML = `
                    ${song.name} - ${song.artist}
                    <button class="Play StopPlaying"></button>
                `;

                if (currentUser && currentUser.id == playlist.ownerId) {
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

        let currentUser = await api.getRequest("/api/profile/info");

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

        position.innerHTML = `
            <h1 id="PlaylistName" class="title">${playlist.name}</h1>
            <p id="PlaylistDescription" class="system-UI">${playlist.description}</p>
            <p id="PlaylistTag" class="system-UI-accent">${formatTags(playlist.tags)}</p>
            <img src="/backend/uploads/${playlist.imgUrl}">
        `;

        let deleteButtonElement = document.querySelector(".DeletePlaylistButton");
        if (deleteButtonElement) {
            deleteButtonElement.addEventListener("click", async function () {
                let playlistId = playlist.id;
                let response = await api.deleteRequest(`/api/profile/playlist/${playlistId}`);
                alert("Successfully deleted!");
                window.location.href = "/";
            });
        }

        let likeButton = document.querySelector(".LikePlaylist-Button");
        if (likeButton) {
            likeButton.querySelector("span").textContent = playlist.likes.length;
            likeButton.addEventListener("click", async function(event) {
                event.preventDefault();

                let playlistId = window.location.pathname.split("/")[2];
                await api.patchRequest(`/api/playlists/${playlistId}/like`);

                let updatedPlaylist =  await api.getRequest( `/api/playlists/${playlistId}`); 
                likeButton.querySelector("span").textContent = updatedPlaylist.playlist.likes.length; 
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
        if (!toProfile) return; 

        let user = await api.getRequest("/api/profile/info");
        if (!user) return;

        toProfile.href = `/profile/${user.username}`;
    }
}