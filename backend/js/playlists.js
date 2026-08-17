export function getTags(playlists) {
    const tags = [];
    for (let playlist of playlists) {
        for (let tag of playlist.tags) {
            if (!tags.includes(tag)) {
                tags.push(tag);
            } else {
                continue;
            }
        }
    }
    return tags;
}

export function filterPlaylistsByTag(playlists, tag) {
    let playlistsByByTag = [];

    for (let playlist of playlists) {
        for (let playlistTag of playlist.tags) {
            if (playlistTag == tag) {
                playlistsByByTag.push(playlist);
            }
        }
    }
    return playlistsByByTag;
}

export function sortPlaylistsByLikes(playlists) {
    let copy = Array.from(playlists);

    function compare(a, b) {
        if (a.likes.length < b.likes.length) return 1;
        else if (a.likes.length > b.likes.length) return -1;
        else return 0;
    }
    copy.sort(compare);
    return copy;
}

export function getPlaylistsBySearch(playlists, phrase) {
    let playlistsBySearch = [];

    for (let playlist of playlists) {            
        phrase = phrase.toLowerCase();
        let name = playlist.name.toLowerCase();
        let description = playlist.description.toLowerCase();
        
        if (name.includes(phrase) || description.includes(phrase)) {
            playlistsBySearch.push(playlist);
        }
    }
    return playlistsBySearch;
}

export function getPlaylistById(playlists, songs, id) {
    let foundPlaylist = null;
    for (let playlist of playlists) {
        if (playlist.id == id) {
            foundPlaylist = playlist;
        }
    }

    if (!foundPlaylist) return null;
    let playlistSongs = [];
    for (let song of songs) {
        for (let playlistSong of foundPlaylist.songs) {
            if (song.id === playlistSong.songId) {
                playlistSongs.push(song);
            }
        }
    }
    return { playlist: foundPlaylist, songs: playlistSongs };
}

export function getSpecifiedPlaylists(playlists, user, specification) {
    let specifiedPlaylists = [];

    for (let playlist of playlists) {
        if (specification == "liked") {
            if (playlist.likes.includes(user.id)) {
                specifiedPlaylists.push(playlist);
            }
        } 

        else if (specification == "owned") {
            if (playlist.ownerId == user.id) {
                specifiedPlaylists.push(playlist);
            }
        }

        else if (specification == "edited") {
            for (let editor of playlist.songs) {
                if (editor.editorId == user.id) {
                    specifiedPlaylists.push(playlist);
                }
            }
        }
    }
    return specifiedPlaylists;
}

export function likePlaylist(playlist, user) {
    let liked = false;

    for (let i = 0; i < playlist.likes.length; i++) {
        if (playlist.likes[i] == user.id) {
            liked = true;
            playlist.likes.splice(i, 1);
            break;
        }
    }

    if (!liked) playlist.likes.push(user.id);
    return playlist;
}

export function addSongToPlaylist(playlists, id, user, song) {
    let foundPlaylist = null;
    for (let playlist of playlists) {
        if (playlist.id == id) {
            foundPlaylist = playlist; 
        }
    }

    let songAdded = { songId: song.songId, editorId: user.id };
    foundPlaylist.songs.push(songAdded);
    return foundPlaylist;
}


export function createPlaylist(req, user, playlists, filename, id, songs) {
    let name = req.get("name");
    let description = req.get("description");
    let tags = req.getAll("tag");

    if (!id || !name || !description || !filename || !tags || tags.length == 0) {
        return null;
    }

    let newPlaylist = {
        id: id, 
        ownerId: user.id,
        name: name,
        description: description,
        imgUrl: filename,
        likes: [],
        tags: tags,
        songs: songs,
    }

    playlists.push(newPlaylist);
    return newPlaylist;
}

export function deletePlaylistById(playlists, id, user) {
    for (let i = 0; i < playlists.length; i++) {
        if (playlists[i].id == id) {
            const playlist = playlists[i];

            if (playlist.ownerId != user.id) return null;

            playlists.splice(i, 1);
            return playlist;
        }
    }
    return null;
}

export function getPlaylistDataById(playlists, id) { 
    for (let playlist of playlists) {
        if (playlist.id == id) {
            return playlist;
        }
    }
    return null;
}

export function deleteSongFromPlaylist (playlists, playlistId, songId) {
    for (let playlist of playlists) {
        if (playlist.id === playlistId) {
            let updatedSongs = [];

            for (let song of playlist.songs) {
                if (song.songId !== songId) {
                    updatedSongs.push(song);
                }
            }
            playlist.songs = updatedSongs;
        }
    }
    return playlists;
}