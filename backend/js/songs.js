// export function getSongsByPlaylist(playlists, songs) {
//     let playlistSongs = getSongsByPlaylist(playlists, songs);

//     for (let playlistSong of playlists.songs) {

//         let foundSong = null;

//         for (let song of songs) {

//             if (song.id == playlistSong.songId) {
//                 foundSong = song;
//             }
//         }

//         if (foundSong) {
//             playlistSongs.push(foundSong);
//         }
//     }
//     return playlistSongs;
// }


export function getSongsBySearch(songs, phrase) {
    const filteredSongs = [];
    phrase = phrase.toLowerCase();

    for (let song of songs) {
        if (song.name.toLowerCase().includes(phrase) || song.artist.toLowerCase().includes(phrase)) {
            filteredSongs.push(song);
        }
    }
    return filteredSongs;
}
