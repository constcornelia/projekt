export function getOwnedPlaylists(playlists, user) {
    let ownedPlaylists = [];

    for (let playlist of playlists) {
        if(playlist.ownerId == user.id) {
            ownedPlaylists.push(playlist)
        }
    }
    return ownedPlaylists;
}

export function getLikedPlaylists(playlists, user) {
    let likedPlaylists = [];

    for (let playlist of playlists) {
        if(playlist.likes.includes(user.id)) {
            likedPlaylists.push(playlist);
        }
    }
    return likedPlaylists;
}

export function getContributedPlaylists(playlists, user) {
    let contributedPlaylists = [];

    for (let playlist of playlists) {
        for (let song of playlist.songs) {
            if (song.editorId == user.id) {
                contributedPlaylists.push(playlist);
                break;
            }
        }
    }
    return contributedPlaylists;
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

export function getPlaylistBySearch(database, query) {
    let filteredPlaylists = [];
    let q = query.toLowerCase();

    for (let playlist of database.playlists) {
        if (playlist.name.toLowerCase().includes(q) || playlist.tags.includes(q) || playlist.description.toLowerCase().includes(q)) {
            filteredPlaylists.push(playlist);
        }
    }
    return filteredPlaylists;
}

export function getPlaylistById(playlists, songs, id) {
    let playlist;
    for (let playlist of playlists) {
        if (playlist.id == id) {
            playlist = playlist;
        }
    }

    let playlistSongs = [];
    for (let song of songs) {
        for (let playlistSong of playlist.songs) {
            if (song.id == playlistSong.songId) {
                playlistSongs.push(song);
            }
        }
    }

    let playlistData = { playlist: playlist, songs: playlistSongs};
    return playlistData;
}

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

export function deletePlaylistById(database, playlistId) {
    let updatedPlaylists = [];

    let found = false;

    for (let playlist of database.playlists) {
        if (playlist.id === playlistId) {
            found = true;
        } else {
            updatedPlaylists.push(playlist);
        }
    } 

    if (!found) {
        return false;
    }

    database.playlists = updatedPlaylists;

    Deno.writeTextFileSync("database.json", JSON.stringify(database));

    return true;
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

export function editPlaylistById(database, playlistId, body) {
    let found = false;

    for (let playlist of database.playlists) {
        if (playlist.id === playlistId) {

            found = true;

            if (body.name) {
                playlist.name = body.name;
            }

            if (body.tags) {
                playlist.tags = body.tags;
            }

            if (body.songs) {
                playlist.songs = body.songs;
            }

            if (body.imgUrl) {
                playlist.imgUrl = body.imgUrl;
            }

            if (body.description) {
                playlist.description = body.description;
            }
        }
    }

    return true;
}

export function createPlaylistId (database) {
    let highestId = 0;

    for (let playlist of database.playlists) {
        let id = parseInt(playlist.id.split("-")[1]);

        if (id > highestId) {
            highestId = id;
        }
    }
    return `p-${highestId + 1}`;
}

export function createPlaylistById (database, body) {
    let playlists = database.playlists;

    let newId = createPlaylistId(database);

    let newPlaylist = {
        id: newId,
        // ownerId: "u-1", måste fixa getUser??
        name: body.name,
        description: body.description,
        imgUrl: body.imgUrl,
        tags: body.tags,
        songs: body.songs
    };
    playlists.push(newPlaylist);

    Deno.writeTextFileSync("database.json", JSON.stringify(database));

    return newPlaylist;
}

export function sortPlaylistsByLikes(playlists) {
    return playlists.sort(function (a,b) {
        return b.likes.length - a.likes.length;
    });
}

export function removeSongFromPlaylist() {}
