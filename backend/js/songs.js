export function getSongsByPlaylist(playlists, songs) {
    let playlistSongs = getSongsByPlaylist(playlist, songs);

    for (let playlistSong of playlists.songs) {

        let foundSong = null;

        for (let song of songs) {

            if (song.id == playlistSong.songId) {
                foundSong = song;
            }
        }

        if (foundSong) {
            playlistSongs.push(foundSong);
        }
    }
    return playlistSongs;
}