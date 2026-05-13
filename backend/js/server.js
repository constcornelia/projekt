import { serveFile, serveDir } from "jsr:@std/http/file-server";
import { filterPlaylistsByTag, getPlaylistBySearch } from "./playlists.js";

const data = JSON.parse(Deno.readTextFileSync("../data/database.json"));
const userData = JSON.parse(Deno.readTextFileSync("../data/users.json"));

const cookies = []; // Alla aktiva cookies ska sparas här

// Skapar ett random cookieId
function createRandomCookie () { // Ska denna kanske flyttas till ui eller api eller något... hmmmmm
    return crypto.randomUUID(); 
}
 
async function handler(request) {
    let url = new URL(request.url);

    let songs = data.songs;
    let playlists = data.playlists;
    const users = userData.users;

    
    if (url.pathname == "/" && request.method == "GET") {
        let userCookie = request.headers.get("cookie");
        console.log(userCookie);

        for (let key in cookies) {
            console.log(cookies);
            let cookie = cookies[key];
            if (userCookie != null && userCookie.includes(cookie.cookie)) {
                return serveFile(request, "../../frontend/main.html");
            }
        }

        let options = {
            status: 303,
            headers: { "Location": "/welcome" }
        };

        return new Response(null, options);

/*         const activeCookie = request.headers.get("cookie"); // här får vi sessionId om det finns en, annars null

        // vi vill kolla om den aktiva cookien finns i arrayen "cookies"
            // om den finns det ska vi bli omdirigerade till main.html
            // annars ska vi komma till intro.html



        for (let cookie of cookies) {

        }

    
        // Kollar om det finns en aktiv cookie som matchar med en från minnet
        let session = null;
        for (let cookie of cookies) {
            if (activeCookie != null && activeCookie.includes(cookie.cookie)) {
                session = cookie;
                break;
            }
        }

        //  Om med finns någon kommer man till start...
        if (session) { 
            return serveFile(request, "../../frontend/main.html");
        }
        
        // ... annars kommer man till login
        let options = {
            "Location": "/welcome",
            status: 303
        }

        return new Response("Unauthorized", options); */
    }

    if (url.pathname == "/welcome" && request.method == "GET") {
        return serveFile(request, "../../frontend/intro.html");
    }

    // if (url.pathname == "/signup") {
    //     return serveFile(request, "../../frontend/signup.html")
    // }
    
    // Logga in
    if (url.pathname == "/login") {

        if (request.method == "GET") {
            return serveFile(request, "../../frontend/login.html")
        }

        if (request.method == "POST") {
            let loginReq = await request.json();

            // Kollar om den inloggade användaren finns i users.json
            let loggedInUser = null;
            for (let user of users) {
                if (user.username == loginReq.username && user.password == loginReq.password) {
                    loggedInUser = user;
                    break;
                }
            }

            if (!loggedInUser) {
                return new Response("Wrong login", { status: 401 });
            }

            // Kollar i den aktiva cookie-arrayen om usern finns det
            let existing = null;
            for (let cookie of cookies) {
                if (cookie.username == loggedInUser.username) {
                    existing = cookie;
                    break;
                }
            }
            
            // Skapar cookie-id och lägger in den i minnet
            let cookieId = createRandomCookie();
            if (existing) {
                existing.cookie = cookieId;
            } else {
                cookies.push({ 
                    username: loginReq.username,
                    cookie: cookieId
                });
            }

            // Skapar cookien
            let headers = {
                "Set-Cookie": "sessionId=" + cookieId + "; Max-Age=10080; path=/",
                "Location": "/"
            };

            // return serveFile(request, "../../frontend/main.html");

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
                "Set-Cookie": "session_id=deleted; Max-Age=0; Path=/"
            }
        };
        return new Response(null, options);
    }




    if (request.method == "GET") {

        if (url.pathname == "/api/playlists") {
            playlists = JSON.stringify(playlists);
            let headers = { "Accept": "application/json" };
            return new Response(playlists, { 
                status: 200, 
                headers: headers 
            });
        }

        // Search for a playlist by name, description, or tags
        if (url.pathname == "/search") {
            let phrase = url.searchParams.get("q");
            if (phrase) playlists = getPlaylistBySearch(playlists, phrase);
        }

        // Search for a song by artist or title to add to a playlist
        if (url.pathname == "/songs/search") {
            let phrase = url.searchParams.get("q");
            if (phrase) songs = getSongsBySearch(songs, phrase);
        }
    }

    if (request.method == "POST") {}


    return serveDir(request, { fsRoot: "../../frontend" });
}


Deno.serve(handler);

// 1. loop igenom arrayen "cookies"

// 2. kolla om något av objekten har användarnamnet == username

// 3. om inget objekt finns med användarnamnet, 
// skapa det som { username: ..., cookie: ... } 
// och pusha det till cookie arrayen

// 4. om det finns - då har dom loggat in igen, 
// uppdatera cookien? dvs objektet.cookie = den nya 
// cookien
