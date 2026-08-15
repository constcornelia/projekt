import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { extname } from "jsr:@std/path";
import { checkSession, checkLogin, checkSignup, getActiveUser, getUserByUsername } from "./login.js";
import { getTags, filterPlaylistsByTag, sortPlaylistsByLikes, getPlaylistsBySearch, getPlaylistById, likePlaylist, addSongToPlaylist, getPlaylistDataById, createPlaylist, deletePlaylistById, deleteSongFromPlaylist, getSpecifiedPlaylists /* deletePlaylistById, removeSongFromPlaylist, getOwnedPlaylists, getLikedPlaylists, getContributedPlaylists */ } from "./playlists.js";
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
                return handleResponse(body, 400, headers);
            } 
            
            const fileStr = crypto.randomUUID();
            const extension = extname(file.name);
            const filename = fileStr + extension;
    
            const bytes = await file.bytes();
            if (bytes > 100000) {
                let body = JSON.stringify({ message: "File is too large" });
                return handleResponse(body, 400, headers);
            }
            Deno.writeFileSync(`../uploads/${filename}`, bytes);

            let cookieId = crypto.randomUUID();
            let headers = {
                "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
                "Location": "/"
            }

            let id = generateId("u", users);
            let newUser = checkSignup(users, signupReq, filename, cookieId, cookies, id);
            if (!newUser) {
                let body = JSON.stringify({ message: "Not acceptable input data." });
                return handleResponse(body, 400, null);
            }

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
            return handleResponse(body, 400, null);
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

        if (request.method == "PATCH") {
            // Redigera profil?
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




    // Get playlists liked, edited and owned by logged in user

    // if (url.pathname == "/api/profile/playlists/liked" && request.method == "GET") {
    //     const activeCookie = request.headers.get("cookie");
    //     let user = getActiveUser(activeCookie, cookies, users);

    //     let likedPlaylists = getLikedPlaylists(playlists, user);
    //     if (!likedPlaylists) {
    //         let body = JSON.stringify({ message: "No playlists found" });
    //         return handleResponse(body, 404, headers);
    //     }

    //     let body = JSON.stringify(likedPlaylists);
    //     return handleResponse(body, 200, headers);
    // }
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

        if (request.method == "PATCH") {}

        // Felhantera

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
        if (request.method == "GET") return serveFile(request, "../../frontend/new-playlist.html"); // AUTHORIZE

        if (request.method == "POST") {
            let playlistReq = await request.formData();
            console.log('playlistreq:',playlistReq);

            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);

            const file = playlistReq.get("cover");
            console.log('file:', file);
            if (!file) {
                console.log("error inte file");
                let body = JSON.stringify({ error: "Cover is missing" });
                return handleResponse(body, 400, headers);
            } 

            const fileStr = crypto.randomUUID();
            const extension = extname(file.name);
            const filename = fileStr + extension;

            console.log('filename:',filename)

            const bytes = await file.bytes();
            if (bytes > 100000) {
                console.log("error för stor fil")
                let body = JSON.stringify({ error: "File is too large" });
                return handleResponse(body, 400, headers);
            }
            console.log('bytes:',bytes);
            Deno.writeFileSync(`../uploads/${filename}`, bytes);

            let songs = JSON.parse(playlistReq.get("songs"));

            let id = generateId("p", playlists);
            let newPlaylist = createPlaylist(playlistReq, user, playlists, filename, id, songs);
            console.log('newplaylist nu i server:', newPlaylist);
            if (!newPlaylist) {}

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
        console.log('cookie',activeCookie);
        let user = getActiveUser(activeCookie, cookies, users);
        console.log('user',user);

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

        if (request.method == "PATCH") {
            // Patch personal playlist by id
        }
        
        if (request.method == "DELETE") {
            let deletedPlaylist = deletePlaylistById(playlists, id, user);

            if (!deletedPlaylist) {
                let body = JSON.stringify({ error: "Playlist not found" });
                return handleResponse(body, 404, headers);
            }

            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
            return handleResponse(null, 204, null);

            // Delete personal playlist by id
        }
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
        


    
//     if (request.method == "GET") {
//         let headers = { "Content-Type": "application/json" };
//         // Hämtar cookie från requesten
//         // Exempel: "session_id=abc123"
//         let cookie = request.headers.get("cookie");
//         // Sparar den inloggade användaren
//         let currentUser = null;
//         // Kör bara om en cookie finns
//         if (cookie) {
//             // Delar upp cookie-strängen vid "="
//             // Exempel:
//             // ["session_id", "abc123"]
//             let parts = cookie.split("=");
//             // Hämtar själva cookie-id:t
//             // Exempel:
//             // "abc123"
//             let cookieId = parts[1];
//             // Loopar igenom alla sparade sessions-cookies
//             for (let i = 0; i < cookies.length; i++) {
//                 // Om cookie-id:t matchar en sparad cookie
//                 if (cookies[i].cookie == cookieId) {
//                     // Sparar användaren som är inloggad
//                     // Exempel:
//                     // {
//                         //   username: "cornelia",
//                         //   cookie: "abc123"
//                         // }
//                         currentUser = cookies[i];
//                     }
//                 }
//             }
            



//         // const cookie = request.headers.get("cookie");
//         // let user = getUser(users, cookies, cookie); // Här ska man få usern genom att para username med den från json
//         // if (url.pathname == "/api/profile/info") {
//         //     let body = JSON.stringify(user);
//         //     return new Response(body, {
//         //         status: 200,
//         //         headers: headers
//         //     });
//         //     // Get users name + pfp
//         // }

//         if (url.pathname == "/api/profile/info") {
//             // Exempel: "session_id=abc123"
//             let cookie = request.headers.get("cookie");
//             // Om ingen cookie finns så är användaren är inte inloggad
//             if (!cookie) {
//                 return new Response(null, { status: 401 });
//             }
//             // Delar upp texten vid "="
//             // Exempel: ["session_id", "abc123"]
//             let parts = cookie.split("=");
//             let cookieId = parts[1]; // tar bara själva id:t ["abc123"]

//             // Sparar användaren om det hittar rätt cookie
//             let user = null;
//             for (let i = 0; i < cookies.length; i++) {  // Loopar igenom alla sparade cookies
//                 if (cookies[i].cookie == cookieId) {  // Kollar om cookie-id:t matchar
//                     let foundUser = null;
//                     for (let u of users) {
//                         if (u.username == cookies[i].username) {
//                             foundUser = u; //hittar user som lagt till en låt
//                         }
//                     }
//                     user = {
//                         id: foundUser.id,
//                         username: foundUser.username
//                     };
//                     break;
//                 }
//             }
//             if (!user) { // Om ingen användare
//                 return new Response(null, { status: 404 });
//             }
//             return new Response(JSON.stringify(user), {
//                 status: 200,
//                 headers: { "Content-Type": "application/json" }
//             });
//         }

//         if (url.pathname == "/api/profile/playlists/owned") {
//             let ownedPlaylists = getOwnedPlaylists(playlists, user);
//             let body = JSON.stringify(ownedPlaylists);
//             return new Response(body, {
//                 status: 200,
//                 headers: headers
//             });
//         }

//         // if (url.pathname == "/api/profile/playlists/liked") {
//         //     let likedPlaylists = getLikedPlaylists(playlists, user);
//         //     let body = JSON.stringify(likedPlaylists);
//         //     return new Response(body, {
//         //         status: 200,
//         //         headers: headers
//         //     });
//         // }

//         if (url.pathname == "/api/profile/playlists/liked") {
//             if (!currentUser) return handleResponse("Unauthorized", 401, null);
//             let foundUser = null;
//             for (let user of users) {
//                 if (user.username == currentUser.username) {
//                     foundUser = user;
//                 }
//             }
//             let likedPlaylists = getLikedPlaylists(playlists, foundUser);
//             let tag = url.searchParams.get("tag");
//             if (tag) {
//                 likedPlaylists = filterPlaylistsByTag(likedPlaylists, tag);
//             }
//             let sort = url.searchParams.get("sort");
//             if (sort === "likes") {
//                 likedPlaylists = sortPlaylistsByLikes(likedPlaylists);
//             }
//             let body = JSON.stringify(likedPlaylists);
//             return new Response(body, {
//                 status: 200,
//                 headers: headers
//             });
//         }
        
//         if (url.pathname == "/api/profile/playlists/contributed") {
//             let contributedPlaylist = getContributedPlaylists(playlists, user);
//             let body = JSON.stringify(contributedPlaylist);
//             return new Response(body, {
//                 status: 200,
//                 headers: headers
//             });
//         }

    return serveDir(request, { fsRoot: "../../frontend" });
    }
Deno.serve(handler);