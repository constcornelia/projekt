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
    return { playlist: foundPlaylist, songs: playlistSongs };
}

export function getSpecifiedPlaylists(playlists, user, specification) {
    let specifiedPlaylists = [];

    for (let playlist of playlists) {
        if (specification == "liked") {
            for (let like of playlist.likes) {
                if (like == user.id) {
                    specifiedPlaylists.push(playlist);
                }
            }
        }

        if (specification == "owned") {
            if (playlist.ownerId == user.id) {
                specifiedPlaylists.push(playlist);
            }
        }

        if (specification == "edited") {
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
    console.log(playlist);
    console.log(playlist.likes);
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
    console.log('req:',req);
    let name = req.get("name");
    let description = req.get("description");
    let tags = req.getAll("tag"); // Dubbelkolla
    // let songs = req.getAll("songs"); // Dubbelkolla

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
    console.log('newplaylist:',newPlaylist);
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




export function deletePlaylistById(database, playlistId) {
    // Ny array som ska innehålla alla spellistor
    // förutom den som ska tas bort
    let updatedPlaylists = [];

    let found = false;
    for (let playlist of database.playlists) {
        if (playlist.id === playlistId) {
            found = true;
        } else {
            // Alla andra spellistor sparas kvar
            updatedPlaylists.push(playlist);
        }
    } 
    if (!found) return false;

    // Ersätter gamla playlist-arrayen med den uppdaterade
    database.playlists = updatedPlaylists;
    // Returnerar true om spellistan togs bort
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

// // export function deleteSongFromPlaylist (playlists, playlistId, songId) {
// //     for (let playlist of playlists) {

// //         if (playlist.id === playlistId) {
// //             let updatedSongs = [];

// //             for (let song of playlist.songs) {

// //                 if (song.songId !== songId) {
// //                     updatedSongs.push(song);
// //                 }

// //             }
// //             playlist.songs = updatedSongs;
// //         }
// //     }
// //     return playlists;
// // }

// // export function editPlaylistById(database, playlistId, body) {
// //     let found = false;

// //     for (let playlist of database.playlists) {
// //         if (playlist.id === playlistId) {

// //             found = true;

// //             if (body.name) {
// //                 playlist.name = body.name;
// //             }

// //             if (body.tags) {
// //                 playlist.tags = body.tags;
// //             }

// //             if (body.songs) {
// //                 playlist.songs = body.songs;
// //             }

// //             if (body.imgUrl) {
// //                 playlist.imgUrl = body.imgUrl;
// //             }

// //             if (body.description) {
// //                 playlist.description = body.description;
// //             }
// //         }
// //     }

// //     return true;
// // }

