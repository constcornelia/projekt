import { serveFile, serveDir } from "jsr:@std/http/file-server";
import { filterPlaylistsByTag, getPlaylistBySearch } from "./playlists.js";

const data = JSON.parse(Deno.readTextFileSync("../data/database.json"));
const userData = JSON.parse(Deno.readTextFileSync("../data/users.json"));

const cookies = []; // Alla aktiva cookies ska sparas här

// Skapar ett random cookieId
function createRandomCookie () { 
    return crypto.randomUUID(); 
}
 
async function handler(request) {
    let url = new URL(request.url);

    let songs = data.songs;
    let playlists = data.playlists;
    let users = userData.users;

    if (url.pathname == "/" && request.method == "GET") {
        let userCookie = request.headers.get("cookie");
        let session = false;
        
        // Kolla om det finns en aktiv cookie, isf kommer man till start...
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            
            if (userCookie != null && userCookie.includes(cookie.cookie)) {
                session = true;
                break;
            }
        }
        
        if (session) {
            return serveFile(request, "../../frontend/main.html");
        } else {
            // ... annars kommer man till intro
            if (!userCookie) {
                let options = {
                    status: 303,
                    headers: { "Location": "/welcome" }
                };
        
                return new Response(null, options);
            }
        }
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

            let headers;
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
                }
            }

            return new Response(null, { 
                status: 303,
                headers: headers 
            });
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

        // Get all playlists
        if (url.pathname == "/api/playlists") {
            playlists = JSON.stringify(playlists);
            let headers = { "Accept": "application/json" };
            return new Response(playlists, { 
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
    }

    if (request.method == "POST") {}


    return serveDir(request, { fsRoot: "../../frontend" });
}

Deno.serve(handler);