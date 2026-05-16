import { serveFile, serveDir } from "jsr:@std/http/file-server";
import { filterPlaylistsByTag, getPlaylistBySearch, getPlaylistById, getTags } from "./playlists.js";

const data = JSON.parse(Deno.readTextFileSync("../data/database.json"));
const userData = JSON.parse(Deno.readTextFileSync("../data/users.json"));

const cookies = []; // Alla aktiva cookies ska sparas här

function createRandomCookie () { 
    return crypto.randomUUID(); 
}

function handleResponse(body, options) {
    return new Response(body, {
        status: options.status,
        headers: options.headers
    });
}
 
async function handler(request) {
    let url = new URL(request.url);

    let songs = data.songs;
    let playlists = data.playlists;
    let users = userData.users;

    if (url.pathname == "/" && request.method == "GET") {
        let userCookie = request.headers.get("cookie");
        let session = false;

        if (userCookie != null) {
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i];

                let cookieStr = "session_id=" + cookie.cookie;

                if (userCookie.includes(cookieStr)) {
                    session = true;
                    break;

                }
            }

        }
        
        // Kolla om det finns en aktiv cookie, isf kommer man till start...
        //     console.log(cookie)
            
        //     if (userCookie != null && userCookie.includes(cookie.cookie)) {
        //     }
        // }

        if (session) {
            return serveFile(request, "../../frontend/main.html");
        } 
        // else {
        //     // ... annars kommer man till intro
        //     if (!userCookie) {
        //         let options = {
        //             status: 303,
        //             headers: { "Location": "/welcome" }
        //         };
        
        //         return new Response(null, options);

        return new Response(null, {
            status: 303,
            headers: { "Location": "/welcome"}
        });

    }

    if (url.pathname == "/welcome" && request.method == "GET") {
        return serveFile(request, "../../frontend/intro.html");
    }
    
    // Logga in
    if (url.pathname == "/login") {

        if (request.method == "GET") {
            return serveFile(request, "../../frontend/login.html")
        }

        if (request.method == "POST") {
            let loginReq = await request.json();
            let cookieId = createRandomCookie();

            let headers = null;
            // Kollar om den om det är rätt user och lösen, isf skapas en cookie
            for (let user of users) {
                if (user.username == loginReq.username && user.password == loginReq.password) {
                    let cookie = { username: user.username, cookie: cookieId };
                    cookies.push(cookie);

                    headers = {
                        "Set-Cookie": "session_id=" + cookieId + "; Max-Age=10080; path=/",
                        "Location": "/"
                    };
                    // cookies[username] = user.username;
                    break;
                }
            }

            if (headers != null) {
                return new Response(null, {
                    status: 303, 
                    headers: headers
                });
            }
            return new Response("Invalid login", { status: 401 });
        }
    }

    if (url.pathname == "/logout" && request.method == "GET") {
        let options = {
            status: 303,
            headers: {
                "Set-Cookie": "session_id=deleted; Max-Age=0;",
                "Location": "/welcome"
            }
        };
        return new Response(null, options);
    }

    if (request.method == "GET") {
        let headers = { "Content-Type": "application/json" };

        // Get all playlists
        if (url.pathname == "/api/playlists") {
            playlists = JSON.stringify(playlists);
            return new Response(playlists, { 
                status: 200, 
                headers: headers 
            });
        }

        // Get all users
        if (url.pathname == "/api/users") {
            let users = JSON.stringify(users);
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
        }

        // Search for a song by artist or title to add to a playlist
        if (url.pathname == "/api/songs/search") {
            let phrase = url.searchParams.get("q");
            if (phrase) songs = getSongsBySearch(songs, phrase);
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


        // Get active user
            // Get owned playlists
            // Get liked playlists

        // Get playlist by id
        let route = new URLPattern({ pathname: "/api/products/:id" });
        if (route.test(request.url)) {
            let match = route.exec(request.url);
            let id = match.pathname.groups.id;

            let playlist = getPlaylistById(playlists, id);

            let body = JSON.stringify(playlist);
            return new Response(body, {
                status: 200,
                headers: headers
            });
        }

    }

    if (request.method == "POST") {}
    if (request.method == "PATCH") {}
    if (request.method == "DELETE") {}

    return serveDir(request, { fsRoot: "../../frontend" });
}

Deno.serve(handler);