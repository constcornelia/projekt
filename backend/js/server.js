import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { extname } from "jsr:@std/path";
import { checkSession, checkLogin, checkSignup, getActiveUser, getUserByUsername, updateUser } from "./users.js";
import { getTags, filterPlaylistsByTag, sortPlaylistsByLikes, getPlaylistsBySearch, getPlaylistById, likePlaylist, addSongToPlaylist, getPlaylistDataById, createPlaylist, deletePlaylistById, deleteSongFromPlaylist, getSpecifiedPlaylists } from "./playlists.js";
import { getSongsBySearch } from "./songs.js";

const data = JSON.parse(Deno.readTextFileSync("../data/database.json"));
const userData = JSON.parse(Deno.readTextFileSync("../data/users.json"));

const cookies = [];

function handleResponse(body, status, headers) {
    return new Response(body, {
        status: status,
        headers: headers
    });
}

function generateId(type, array) {
    let highest = array[0].id;
    highest = parseInt(highest.split("-")[1]);

    for (let element of array) {
        element = parseInt(element.id.split("-")[1]);
        if (element > highest) {
            highest = element;
        }
    }

    let newId = highest + 1;
    return type + "-" + newId;
}

async function handler(request) {
    let url = new URL(request.url);
    
    let users = userData.users;
    let playlists = data.playlists;
    let songs = data.songs;
    
    let headers = { "Content-Type": "application/json" };
    if (request.method == "GET") headers = { "Accept": "application/json" };

    if (url.pathname == "/welcome" && request.method == "GET") return serveFile(request, "../../frontend/intro.html");

    let authorizedPages = ["edit.html", "main.html", "new-playlist.html", "personal.html", "public-playlist.html"];
    if (url.pathname.includes(authorizedPages) && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) return serveFile(request, "../../frontend/intro.html");
    }

    if (url.pathname == "/" && request.method == "GET") {
        let cookie = request.headers.get("cookie");

        let session = checkSession(cookie, cookies);
        if (session) return serveFile(request, "../../frontend/main.html");
        else {
            let headers = { "Location": "/welcome" };
            return handleResponse(null, 303, headers);
        }
    }

    // Sign up
    if (url.pathname == "/signup") {
        if (request.method == "GET") return serveFile(request, "../../frontend/signup.html");

        if (request.method == "POST") {
            let signupReq = await request.formData();
            
            const file = signupReq.get("profile");
            if (!file) {
                let body = JSON.stringify({ message: "Profile picture is missing." });
                return handleResponse(body, 400);
            } 
            
            const bytes = await file.bytes();
            if (bytes.length > 1000000) {
                let body = JSON.stringify({ message: "File is too large" });
                return handleResponse(body, 400);
            }
            
            const fileStr = crypto.randomUUID();
            const extension = extname(file.name);
            const filename = fileStr + extension;
            
            let cookieId = crypto.randomUUID();
            let headers = {
                "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
                "Location": "/"
            }
            
            let id = generateId("u", users);
            let newUser = checkSignup(users, signupReq, filename, cookieId, cookies, id);
            if (!newUser) {
                let body = JSON.stringify({ message: "Input missing or username taken" });
                return handleResponse(body, 400);
            }

            Deno.writeFileSync(`../uploads/${filename}`, bytes);

            Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            return handleResponse(null, 303, headers);
        }
    }

    // Log in
    if (url.pathname == "/login") {
        if (request.method == "GET") return serveFile(request, "../../frontend/login.html");

        if (request.method == "POST") {
            let loginReq = await request.json();
            let cookieId = crypto.randomUUID();

            let correctLogin = checkLogin(users, loginReq, cookieId, cookies);
            if (correctLogin) {
                let headers = {
                    "Set-Cookie": "session_id=" + cookieId + "; Max-Age=604800; path=/",
                    "Location": "/",
                    "Content-Type": "application/json"
                }
                return handleResponse(null, 303, headers);
            }

            let body = JSON.stringify({ message: "Invalid login" })
            return handleResponse(body, 400);
        }
    }

    // Log out
    if (url.pathname == "/logout" && request.method == "GET") {
        let headers = {
            "Location": "/welcome",
            "Set-Cookie": "session_id=deleted; Max-Age=0; Path=/"
        }
        return handleResponse(null, 303, headers);
    }

    // Get all tags (for dropdowns)
    if (url.pathname == "/api/tags" && request.method == "GET") {
        let tags = getTags(playlists);

        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }

        if (!tags) {
            let body = JSON.stringify({ message: "No tags found" });
            return handleResponse(body, 404, headers);
        }
            
        let body = JSON.stringify(tags);
        return handleResponse(body, 200, headers);
    }

    // Sort playlists
    if (url.pathname == "/api/playlists" && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }

        let tag = url.searchParams.get("tag");
        if (tag) playlists = filterPlaylistsByTag(playlists, tag);

        let sort = url.searchParams.get("sort");
        if (sort === "likes") playlists = sortPlaylistsByLikes(playlists);
        
        if (!playlists) {
            let body = JSON.stringify({ message: "No playlists found" });
            return handleResponse(body, 404, headers);
        }

        let body = JSON.stringify(playlists);
        return handleResponse(body, 200, headers);
    }

    // Search for a playlist by name and description
    if (url.pathname == "/api/playlists/search" && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }

        let phrase = url.searchParams.get("q");
        if (phrase) playlists = getPlaylistsBySearch(playlists, phrase);

        if (!playlists) {
            let body = JSON.stringify({ message: "No playlists found" });
            return handleResponse(body, 404, headers);
        }
            
        let body = JSON.stringify(playlists);
        return handleResponse(body, 200, headers);
    }

    // Get all users 
    if (url.pathname == "/api/users" && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }

        if (!users) {
            let body = JSON.stringify({ message: "No users found" });
            return handleResponse(body, 404, headers);
        }
        
        let body = JSON.stringify(users);
        return handleResponse(body, 200, headers);
    }

    // Get logged in user's info + edit user info **
    if (url.pathname == "/api/profile/info" && request.method == "GET") {
        if (request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }

            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);

            if (!user) {
                let body = JSON.stringify({ message: "Not logged in" });
                return handleResponse(body, 401, headers);
            }

            let body = JSON.stringify(user);
            return handleResponse(body, 200, headers);
        }
    }

    // Search for a song by artist or title to add to a playlist
    if (url.pathname == "/api/songs/search" && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }

        let phrase = url.searchParams.get("q");
        if (phrase) songs = getSongsBySearch(songs, phrase);

        if (!songs) {
            let body = JSON.stringify({ message: "No songs found" });
            return handleResponse(body, 404, headers);
        }
        
        let body = JSON.stringify(songs);
        return handleResponse(body, 200, headers);
    }

    // Show page for one playlist (by id)
    let playlistPage = new URLPattern({ pathname: "/playlists/:id" });
    if (playlistPage.test(request.url)) return serveFile(request, "../../frontend/public-playlist.html");

    // Get playlist info by id + add songs to it as a logged in user
    let playlistRoute = new URLPattern({ pathname: "/api/playlists/:id" });
    if (playlistRoute.test(request.url)) {
        let match = playlistRoute.exec(request.url);
        let id = match.pathname.groups.id;

        if (request.method == "GET") {
            let cookie = request.headers.get("cookie");
            let session = checkSession(cookie, cookies);
            if (!session) {
                let body = JSON.stringify({ message: "No access" });
                return handleResponse(body, 401, headers);
            }

            let playlist = getPlaylistById(playlists, songs, id);

            if (!playlist) {
                let body = JSON.stringify({ message: "No playlist found with id" });
                return handleResponse(body, 404, headers);
            }
            // Felhantera
            let body = JSON.stringify(playlist);
            return handleResponse(body, 200, headers); 
        }

        if (request.method == "PATCH") {
            let songReq = await request.json();

            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);
            if (!user) {
                let body = JSON.stringify({ message: "Not logged in" });
                return handleResponse(body, 401, headers);
            }

            let playlist = addSongToPlaylist(playlists, id, user, songReq);
            if (!playlist) {
                let body = JSON.stringify({ message: "No playlist found" });
                return handleResponse(body, 404, headers);
            }

            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));

            let body = JSON.stringify(playlist);
            return handleResponse(body, 200, headers);
        }
    }

    // Get all songs
    if (url.pathname == "/api/songs" && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (!session) {
            let body = JSON.stringify({ message: "No access" });
            return handleResponse(body, 401, headers);
        }
        
        if (!songs) {
            let body = JSON.stringify({ message: "No songs found" });
            handleResponse(body, 404, headers);
        }

        let body = JSON.stringify(songs);
        return handleResponse(body, 200, headers);
    }




    // -------------------------- FORTSÄTT MED FINSLIPNING HÄR --------------------------

    if (url.pathname == "/api/profile/playlists" && request.method == "GET") {
        const activeCookie = request.headers.get("cookie");
        let user = getActiveUser(activeCookie, cookies, users);

        let specification = null;

        let type = url.searchParams.get("type");
        if (type == "liked") specification = "liked";
        if (type == "edited") specification = "edited";
        if (type == "owned") specification = "owned";

        let specifiedPlaylists = getSpecifiedPlaylists(playlists, user, specification);
        // if (!specifiedPlaylists) {
        //     let body = JSON.stringify({ error: "Not Found "});
        //     return handleResponse(body, 404, headers);
        // }

        let body = JSON.stringify(specifiedPlaylists)
        return handleResponse(body, 200, headers);
    }

    // Get profile page of logged in user
    let profilePage = new URLPattern({ pathname: "/profile/:username" });
    if (profilePage.test(request.url)) return serveFile(request, "../../frontend/personal.html");

    // Get profile info of logged in user
    let profileRoute = new URLPattern({ pathname: "/api/profile/:username" });
    if (profileRoute.test(request.url)) {
        let match = profileRoute.exec(request.url);
        let username = match.pathname.groups.username;

        if (request.method == "GET") {
            let user = getUserByUsername(users, username);
            let body = JSON.stringify(user);
            return handleResponse(body, 200, headers); 
        }
    }

    if (url.pathname == "/edit") {
        if (request.method == "GET") return serveFile(request, "../../frontend/edit.html");
        
        if (request.method == "PATCH") {
            let userReq = await request.formData();

            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);
            if (!user) {
                let body = JSON.stringify({ message: "Not logged in" });
                return handleResponse(body, 401, headers);
            }

            let newFile = false
            let file = userReq.get("profile");
            if (file) {
                const fileStr = crypto.randomUUID();
                const extension = extname(file.name);
                const filename = fileStr + extension;

                const bytes = await file.bytes();
                if (bytes.length > 1000000) {
                    let body = JSON.stringify({ message: "File is too large" });
                    return handleResponse(body, 400, headers);
                }
                newFile = filename;
                Deno.writeFileSync(`../uploads/${filename}`, bytes);

            }
            
            let updatedUser = updateUser(user, users, userReq, newFile);
            if (!updatedUser) {
                let body = JSON.stringify({ message: "Username already taken" });
                return handleResponse(body, 400, headers);
            }
            
            Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            return handleResponse(null, 204, headers);
        }
    }

    // Like playlists
    let likeRoute = new URLPattern({ pathname: "/api/playlists/:id/like" });
    if (likeRoute.test(request.url)) {
        let match = likeRoute.exec(request.url);
        let id = match.pathname.groups.id;

        if (request.method == "PATCH") {
            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);
            let playlist = getPlaylistDataById(playlists, id);

            if (!playlist) {
                let body = JSON.stringify({ error: "Playlist Not Found" });
                return handleResponse(body, 404, null);
            }

            let likedPlaylist = likePlaylist(playlist, user);
            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));

            let body = JSON.stringify(likedPlaylist);
            return handleResponse(body, 200, headers);
        }

        // let body = JSON.stringify({ error: "Method not allowed" });
        // return handleResponse(body, 405, null);
    }

    // Create new playlist
    if (url.pathname == "/new-playlist") { 
        if (request.method == "GET") return serveFile(request, "../../frontend/new-playlist.html");

        if (request.method == "POST") {
            let playlistReq = await request.formData();
            console.log('req:', playlistReq);

            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);

            const file = playlistReq.get("cover");
            if (!file || file == "undefined") {
                console.log('file:',file);
                let body = JSON.stringify({ message: "Cover is missing" });
                return handleResponse(body, 400, headers);
            } 

            const fileStr = crypto.randomUUID();
            const extension = extname(file.name);
            const filename = fileStr + extension;

            const bytes = await file.bytes();
            if (bytes.length > 1000000) {
                let body = JSON.stringify({ message: "File is too large" });
                return handleResponse(body, 400, headers);
            }
            Deno.writeFileSync(`../uploads/${filename}`, bytes);

            let songs = JSON.parse(playlistReq.get("songs"));
            if (!songs) {
                let body = JSON.stringify({ message: "Songs missing" });
                return handleResponse(body, 400, headers);
            }

            let id = generateId("p", playlists);
            let newPlaylist = createPlaylist(playlistReq, user, playlists, filename, id, songs);
            console.log('newplaylist:',newPlaylist);
            if (!newPlaylist) {
                let body = JSON.stringify({ message: "Input data missing" });
                return handleResponse(body, 404, headers);
            }

            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
            let body = JSON.stringify(newPlaylist);
            return handleResponse(null, 303, headers);
        }
    }

    // Get page for owned playlist by id
    let personalPlaylistPage = new URLPattern({ pathname: "/profile/playlist/:id" });
    if (personalPlaylistPage.test(request.url)) return serveFile(request, "../../frontend/personal-playlist.html");

    // Get info for owned playlist, edit it or delete it as owner (by id)
    let personalPlaylistRoute = new URLPattern({ pathname: "/api/profile/playlist/:id" });
    if (personalPlaylistRoute.test(request.url)) {
        let match = personalPlaylistRoute.exec(request.url);
        let id = match.pathname.groups.id;

        const activeCookie = request.headers.get("cookie");
        let user = getActiveUser(activeCookie, cookies, users);

        if (!user) {
            let body = JSON.stringify({ error: "Unauthorized" });
            return handleResponse(body, 401, headers);
        }

        if (request.method == "GET") {
            let playlist = getPlaylistById(playlists, songs, id);

            // Felhantera

            let body = JSON.stringify(playlist);
            return handleResponse(body, 200, headers);
            // Get personal playlist by id
        }
        
        if (request.method == "DELETE") {
            let deletedPlaylist = deletePlaylistById(playlists, id, user);

            if (!deletedPlaylist) {
                let body = JSON.stringify({ error: "Playlist not found" });
                return handleResponse(body, 404, headers);
            }

            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
            return handleResponse(null, 204, null);        }
    }
    
    // Delete song from playlist if owner
    let songRoute = new URLPattern({ pathname: "/api/playlists/:id/songs/:songId" });
    if (songRoute.test(request.url)) {
        let match = songRoute.exec(request.url);

        if (request.method == "DELETE") {
            let playlistId = match.pathname.groups.id;
            let songId = match.pathname.groups.songId;

            let removed = deleteSongFromPlaylist(playlists, playlistId, songId);
            if (!removed) {
                let body = JSON.stringify({ message: "Song not found" });
                return handleResponse(body, 404, headers);
            }

            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
            return handleResponse( JSON.stringify({ message: "Song removed" }), 200, { "Content-Type": "application/json" });
        }
    }
        
    let uploadRoute = new URLPattern({ pathname: "/backend/uploads/:filename" }); 
    if (uploadRoute.exec(request.url)) {
        let match = uploadRoute.exec(request.url);
        let filename = match.pathname.groups.filename;

        return serveFile(request, `../uploads/${filename}`);
    }

    return serveDir(request, { fsRoot: "../../frontend" });
}

Deno.serve(handler);