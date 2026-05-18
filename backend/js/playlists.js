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

export function sortPlaylistsByLikes() {}
export function getPlaylistBySearch() {}

export function getPlaylistById(playlists, id) {
    for (let playlist of playlists) {
        if (playlist.id == id) {
            return playlist;
        }
    }
    return null;
}


export function getTags(playlists) {
    const tags = [];
    for (let playlist of playlists) {
        for (let tag of playlist.tags) {
            tags.push(tag);
        }
    }

    return tags;
}