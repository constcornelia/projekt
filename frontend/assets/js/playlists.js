export function filterByTags(playlists, tag) {
    let filteredPlaylists = [];

    for (let playlist of playlists) {
        for (let t of playlist.tags) {
            if (t == tag) {
                filteredPlaylists.push(playlist);
            }
        }
    }
    return filteredPlaylists;
}

export function sortByLikes(playlists, descending) {
    let copy = Array.from(playlists);

    let aLikes = a.likes;
    let bLikes = b.likes;

    function compare(a, b) {
        if (descending) {
            if (aLikes.length < bLikes.length) {
                return 1;
            } else if (bLikes.length < aLikes.length) {
                return -1;
            } else {
                return 0;
            }
        }
    }
    copy.sort(compare);
    return copy;
}