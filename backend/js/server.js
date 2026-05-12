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
    
    if (url.pathname == "/") {
        const activeCookie = request.headers.get("cookie");
    
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
            return serveFile(request, "frontend/main.html");
        }
        
        // ... annars kommer man till login
        let options = {
            status: 303,
            headers: { "Location": "/login" }
        }
        return new Response("Unauthorized", options);
    }
    
    // Logga in
    if (url.pathname == "/login") {

        if (request.method == "GET") {
            return serveFile(request, "../../test.html")
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
                "Set-Cookie": "sessionId=" + cookieId + "; Max-Age=10080" 
            };

            return new Response("Welcome!", { headers: headers });
        }
    }

    if (url.pathname == "/logout" && request.method == "GET") {
        let options = {
            status: 303,
            headers: {
                "Location": "/login",
                "Set-Cookie": "session_id=deleted; Max-Age=0"
            }
        };
        return new Response(null, options);
    }




    if (request.method == "GET") {

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


    return serveDir(request, { fsRoot: "frontend" });

    // if (request.method == "OPTIONS") {
    //     return new Response(null, {
    //         headers: headers
    //     });
    // }

}

// tar hand om cookies
async function handleCookies (request) {
    let url = new URL (request.url);
    let cookies = [];

    
    // går till startsidan
    if (request.method == "GET" && url.pathname == "/") {
        return serveFile(request, "../../test.html");
    }
    
    // går till login
    if (request.method == "GET" && url.pathname == "/login") {
        return serveFile(request, "../../test.html");
    }

    // loggar in 
    if (request.method == "POST" && url.pathname == "/login") {

        let body = await request.json(); // users input - funkar

        let users = JSON.parse(Deno.readTextFileSync("../data/user.json")); // läser in från json - funkar
        users = users.users;

        // let loggedInUser = null;
        for (let user of users) {
            if (user.username == body.username && user.password == body.password) {
                // loggedInUser = user; 
                cookies.push(user)
                let cookie = createRandomCookie();
                console.log(cookies);
                let headers = { 
                    "Content-Type": "text/html",
                    "Set-Cookie": "sessionId=" + cookie + "; Max-Age=10080" 
                }
                return new Response("Hello", headers);
            }
        }
        console.log(cookies);

        if (url.pathname == "/" && request.method == "GET") {
            const activeCookie = request.headers.get("cookie");

            for (let cookie of cookies) {

            }
        }



        // om användaren inte är utloggad
/*         if (loggedInUser != null) {

            // loggedInUser.cookie = cookie;
            // console.log(loggedInUser.cookie);

            // Deno.writeTextFileSync("../data/users.json", JSON.stringify(users, null, 2));

            return new Response(await Deno.readTextFileSync("../../test.html"), {
                headers: { 
                    "Content-Type": "text/html",
                    "Set-Cookie": "sessionId=" + cookie + "; Max-Age=10080" // 7hours, rework to 1 week? in seconds.
                }
            });
        }
        cookies.push(loggedInUser);

        // cookies[username] = loggedInUser.username;

        return new Response("Unauhorized", { status: 401 }); */
    }

}




//     let playlists = data.playlists;
//     let songs = data.songs;
    
//     if (request.method == "GET") {
        
//         // Get all playlists
//         if (url.pathname == "/") {
//             return serveFile(request, "../../test.html");
//             // Kolla först att det finns en aktiv cookie - annars skicka till login

//             // Filter playlist (by tags)
//             // let tag = url.searchParams.get("tag");
//             // if (tag) playlists = filterByTags(playlists, tags);

//             // Sort by amount of tags, descending or ascending
//             // let likesDesc = url.searchParams.get("likesDesc"); 
//             // if (likesDesc == true) playlists = sortByLikes(playlists, true);
//             // if (likesDesc == false) playlists = sortByLikes(playlists, false);
//         }
//         // Get playlists by search (through name and description)
//         // Get one specific playlist by id
//         // Get song by search (title or artist)
//         // Get your own user info
//     }

//     if (request.method == "POST") {
//         // Logging in or joining
//         // Post your own playlist
//     }

//     if (request.method == "PATCH") {
//         // Edit your own playlist (basic info such as name, description of tags) by id
//         // Add songs to others playlists by playlist id and song id
//     }

//     if (request.method == "DELETE") {
//         // Delete playlist by id (detta sker från ens profil)
//     }
// }

Deno.serve(handler);

// 1. loop igenom arrayen "cookies"

// 2. kolla om något av objekten har användarnamnet == username

// 3. om inget objekt finns med användarnamnet, 
// skapa det som { username: ..., cookie: ... } 
// och pusha det till cookie arrayen

// 4. om det finns - då har dom loggat in igen, 
// uppdatera cookien? dvs objektet.cookie = den nya 
// cookien
