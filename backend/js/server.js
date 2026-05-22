import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { extname } from "jsr:@std/path";
import { checkSession, checkLogin, createRandomString, createUser, getUser, getUserByUsername } from "./login.js";
import { filterPlaylistsByTag, getPlaylistBySearch, getPlaylistById, getTags, deletePlaylistById, removeSongFromPlaylist, getOwnedPlaylists, getLikedPlaylists, sortPlaylistsByLikes, getContributedPlaylists } from "./playlists.js";
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

function showPage(request, path) {
    const cookie = request.headers.get("cookie");
    let session = checkSession(cookie, cookies);
    if (session) {
        return serveFile(request, path);
    }
    return handleResponse("Unauthorized", 401, null);
}

async function handler(request) {
    let url = new URL(request.url);

    let users = userData.users;
    let playlists = data.playlists;
    let songs = data.songs;

    // Shows pages that doesn't require authorization
    if (request.method == "GET") {
        if (url.pathname == "/welcome") return serveFile(request, "../../frontend/intro.html");
        if (url.pathname == "/login") return serveFile(request, "../../frontend/login.html");
        if (url.pathname == "/signup") return serveFile(request, "../../frontend/signup.html");
    }

    if (url.pathname == "/" && request.method == "GET") {
        let cookie = request.headers.get("cookie");
        let session = checkSession(cookie, cookies);
        if (session) return showPage(request, "../../frontend/main.html");

        let headers = { "Location": "/welcome" };
        return handleResponse(null, 303, headers);
    }

    if (url.pathname == "/logout" && request.method == "GET") {
        let headers = {
            "Location": "/welcome",
            "Set-Cookie": "session_id=deleted; Max-Age=0; Path=/"
        }
        return handleResponse(null, 303, headers);
    }

    if (request.method == "POST") {
        if (url.pathname == "/login") {
            let loginReq = await request.json();
            let cookieId = createRandomString();
        
            let correctLogin = checkLogin(users, loginReq, cookieId, cookies);
            if (correctLogin) {
                let headers = {
                    "Set-Cookie": "session_id=" + cookieId + "; Max-Age=10080; path=/",
                    "Location": "/"
                };
                return handleResponse(null, 303, headers);
            }
            return handleResponse("Invalid login", 401);
        }

        if (url.pathname == "/signup") {
            let signupReq = await request.formData();
        
            const file = signupReq.get("profile");
            const username = signupReq.get("username");
            const password = signupReq.get("password");
            
            const fileStr = createRandomString();
            const extension = extname(file.name);
            const filename = fileStr + extension;

            if (!file) return handleResponse("Profile picture is missing", 400);
            
            const bytes = await file.bytes();
            if (bytes > 100000) return handleResponse("File is too large", 400);
            Deno.writeFileSync(`../uploads/${filename}`, bytes);

            for (let user of users) {
                if (username == user.username) {
                    return handleResponse("Username is already taken", 401);
                }
            }
            
            if (!username || !password) {
                return handleResponse("Input data missing", 400);
            }
        
            createUser(users, file, username, password);
            Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            
            let cookieId = createRandomString();
            let cookie = { username: username, cookie: cookieId };
            cookies.push(cookie);
        
            let headers = {
                "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
                "Location": "/"
            };
            return handleResponse(null, 303, headers);
        }
    }

    if (request.method == "GET") {
        let headers = { "Content-Type": "application/json" };

        // Get all/filtered playlists
        if (url.pathname == "/api/playlists") {
            let tag = url.searchParams.get("tag");
            if (tag) playlists = filterPlaylistsByTag(playlists, tag);
            let sort = url.searchParams.get("sort");
            if (sort === "likes") playlists = sortPlaylistsByLikes(playlists);
            
            let body = JSON.stringify(playlists);
            return new Response(body, { 
                status: 200, 
                headers: headers 
            });
        }

        // Get all users
        if (url.pathname == "/api/users") {
            users = JSON.stringify(users);
            return new Response(users, {
                status: 200,
                headers: headers
            });
        }

        // Get all songs
        if (url.pathname == "/api/songs") {
            let songs = JSON.stringify(songs);
            return new Response(songs, {
                status: 200,
                headers: headers
            });
        }

        // Search for a playlist by name and description
        if (url.pathname == "/api/playlists/search") {
            let phrase = url.searchParams.get("q");
            if (phrase) playlists = getPlaylistBySearch(playlists, phrase);
            
            let body = JSON.stringify(playlists);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }

        // Search for a song by artist or title to add to a playlist
        if (url.pathname == "/api/songs/search") {
            let phrase = url.searchParams.get("q");
            if (phrase) songs = getSongsBySearch(songs, phrase);
            
            let body = JSON.stringify(songs);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }

        // Get all tags (for "select genre")
        if (url.pathname == "/api/tags") {
            let tags = getTags(playlists);
            
            let body = JSON.stringify(tags);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }

        // const cookie = request.headers.get("cookie");
        // let user = getUser(users, cookies, cookie); // Här ska man få usern genom att para username med den från json
        // if (url.pathname == "/api/profile/info") {
        //     let body = JSON.stringify(user);
        //     return new Response(body, {
        //         status: 200,
        //         headers: headers
        //     });
        //     // Get users name + pfp
        // }

        if (url.pathname == "/api/profile/info") {

            // Exempel: "session_id=abc123"
            let cookie = request.headers.get("cookie");

            // Om ingen cookie finns så är användaren är inte inloggad
            if (!cookie) {
                return new Response(null, { status: 401 });
            }

            // Delar upp texten vid "="
            // Exempel: ["session_id", "abc123"]
            let parts = cookie.split("=");

            let cookieId = parts[1]; // tar bara själva id:t ["abc123"]

            // Sparar användaren om det hittar rätt cookie
            let user = null;

            for (let i = 0; i < cookies.length; i++) {  // Loopar igenom alla sparade cookies
                if (cookies[i].cookie == cookieId) {  // Kollar om cookie-id:t matchar
                    user = { // Sparar användarens username
                        username: cookies[i].username
                    };
                    break; // Stoppar loopen när rätt user hittats
                }
            }

            if (!user) { // Om ingen användare
                return new Response(null, { status: 404 });
            }

            return new Response(JSON.stringify(user), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (url.pathname == "/api/profile/playlists/owned") {
            let ownedPlaylists = getOwnedPlaylists(playlists, user);
            let body = JSON.stringify(ownedPlaylists);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }

        if (url.pathname == "/api/profile/playlists/liked") {
            let likedPlaylists = getLikedPlaylists(playlists, user);
            let body = JSON.stringify(likedPlaylists);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }
        
        if (url.pathname == "/api/profile/playlists/contributed") {
            let contributedPlaylist = getContributedPlaylists(playlists, user);
            let body = JSON.stringify(contributedPlaylist);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }
        
        let profileRoute = new URLPattern({ pathname: "/profile/:username" }); 
        if (profileRoute.test(request.url)) return serveFile(request, "../../frontend/personal.html");


        let profileApiRoute = new URLPattern({ pathname: "/api/profile/:username" });
        if (profileApiRoute.test(request.url)) {
            let match = profileApiRoute.exec(request.url);
            let username = match.pathname.groups.username;

            let user = getUserByUsername(users, username);
            console.log(user);

            let body = JSON.stringify(user);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }

        // Get active user
            // Get owned playlists
            // Get liked playlists

        // Get playlist by id

        let playlistPageRoute = new URLPattern({ pathname: "/playlists/:id" });
        if (playlistPageRoute.test(request.url)) {
            return serveFile(request, "../../frontend/public-playlist.html");
        };

        let route = new URLPattern({ pathname: "/api/playlists/:id" });
        if (route.test(request.url)) {
            let match = route.exec(request.url);
            let id = match.pathname.groups.id;

            let playlist = getPlaylistById(playlists, songs, id);
            let body = JSON.stringify(playlist);

            return new Response(body, {
                status: 200,
                headers: headers,
            });
        }
        // PROBELM: Du försökte använda samma route för HTML och JSON API
        // let route = new URLPattern({ pathname: "/api/playlists/:id" });
        // if (route.test(request.url)) {
        //     let match = route.exec(request.url);
        //     let id = match.pathname.groups.id;

        //     let playlist = getPlaylistById(playlists, songs, id);
        //     if (playlist) return serveFile(request, "../../frontend/public-playlist.html");

        //     let body = JSON.stringify(playlist);
        //     return new Response(body, {
        //         status: 200,
        //         headers: headers,
        //     });
        // }
    }

    if (request.method == "POST") {

        // Lägg till spellista
        if (url.pathname == "/profile/new-playlist") {
            let playlistReq = await request.json();
        }

    }
    
    if (request.method == "PATCH") {

        // Ändra profil-bild
        // Som ägare av spellista ändra info i spellista + radera låtar

        // Lägg till låtar i andras och sina egna spellistor
    }

    if (request.method == "DELETE") {

        // Delete playlist if owner
        let route = new URLPattern({ pathname: "/user/playlists/:id" });
        if (route.test(request.url)) {
            let match = route.exec(request.url);
            let id = pathname.groups.id

            deletePlaylistById(playlists, id);

            return new Response(null, {});
        }

        // Delete song from playlist if owner FRÅGA OM DETTA SKA VA I PATCH ELLER DELETE
        let songRoute = new URLPattern({ pathname: "/user/playlists/:id/:songId" });
        if (route.test(request.url)) {
            let match = songRoute.exec(request.url);
            let playlistId = pathname.groups.id;
            let songId = pathname.groups.songId;

            removeSongFromPlaylist(playlists, playlistId, songId);

            return new Response(null, {});
        }
    }

    return serveDir(request, { fsRoot: "../../frontend" });
}

Deno.serve(handler);