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
