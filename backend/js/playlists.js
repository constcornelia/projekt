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
        // Kollar om användarens username finns i likes arrayen
        if(playlist.likes.includes(user.username)) {
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
    let filteredPlaylists = [];
    for (let playlist of playlists) {
        for (let playlistTag of playlist.tags) {
            let tags = playlistTag.split(",");
            for (let oneTag of tags) {
                if (oneTag == tag) {
                    filteredPlaylists.push(playlist);
                }
            }
        }
    }
    return filteredPlaylists;
}

export function getPlaylistBySearch(playlists, query) {
    let filteredPlaylists = [];

    let q = query.toLowerCase();

    for (let playlist of playlists) {
        if (playlist.name.toLowerCase().includes(q) || playlist.tags.includes(q) || playlist.description.toLowerCase().includes(q)) {
            filteredPlaylists.push(playlist);
        }
    }
    return filteredPlaylists;
}

// Hämtar en specifik spellista och alla låtar som tillhör den
export function getPlaylistById(playlists, songs, id) {
    // Sparar spellistan som matchar id:t
    let foundPlaylist = null;
    for (let playlist of playlists) {
        if (playlist.id == id) {
            foundPlaylist = playlist;
        }
    }
    if (!foundPlaylist) return null;
    // Array som ska innehålla alla fullständiga låt-objekt
    let playlistSongs = [];
    for (let song of songs) {
        for (let playlistSong of foundPlaylist.songs) {
            // Om låtens id matchar songId i spellistan
            if (song.id === playlistSong.songId) {
                // Lägg till hela låt-objektet i arrayen
                playlistSongs.push(song);
            }
        }
    }
    return {
        playlist: foundPlaylist,
        songs: playlistSongs
    };
}

// export function getPlaylistById(playlists, songs, id) {
//     let playlist;
//     for (let playlist of playlists) {
//         if (playlist.id == id) {
//             playlist = playlist;
//         }
//     }

//     let playlistSongs = [];
//     for (let song of songs) {
//         for (let playlistSong of playlist.songs) {
//             if (song.id == playlistSong.songId) {
//                 playlistSongs.push(song);
//             }
//         }
//     }

//     let playlistData = { playlist: playlist, songs: playlistSongs};
//     return playlistData;
// }

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
    for (let i = 0; i < database.playlists.length; i++) {
        if (database.playlists[i].id == playlistId) {
            database.playlists.splice(i, 1);
            return true;
        }
    }
    return false;
}

export function removeSongFromPlaylist(playlists, playlistId, songId) {
    for (let playlist of playlists) {
        if (playlist.id == playlistId) {
            for (let i = 0; i < playlist.songs.length; i++) {
                if (playlist.songs[i].songId == songId) {
                    playlist.songs.splice(i, 1);
                    return true;
                }
            }
        }
    }
    return false;
}

// export function editPlaylistById(database, playlistId, body) {
//     let found = false;

//     for (let playlist of database.playlists) {
//         if (playlist.id === playlistId) {

//             found = true;

//             if (body.name) {
//                 playlist.name = body.name;
//             }

//             if (body.tags) {
//                 playlist.tags = body.tags;
//             }

//             if (body.songs) {
//                 playlist.songs = body.songs;
//             }

//             if (body.imgUrl) {
//                 playlist.imgUrl = body.imgUrl;
//             }

//             if (body.description) {
//                 playlist.description = body.description;
//             }
//         }
//     }

//     return true;
// }

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
    let sortedPlaylists = [];
    for (let playlist of playlists) {
        sortedPlaylists.push(playlist);
    }
    sortedPlaylists.sort(function (a,b) {
        return b.likes.length - a.likes.length;
    });
    return sortedPlaylists;
}


export function getNewPlaylistId(playlists) {
    let highest = 0;
    for (let playlist of playlists) {
        let idNr = playlist.id.substring(2);
        idNr = parseInt(idNr);

        if (highest < idNr) {
            highest = idNr;
        }
    }
    let newNr = highest + 1;
    return "p-" + newNr;
}


export function createPlaylist(playlists, file, title, description) {
    let id = getNewPlaylistId(playlists);
    let newPlaylist = {
        id: id,
        ownerId: "",
        name: title,
        description: description,
        imgUrl: file,
        likes: [],
        tags: "",
        songs: []
    };
}