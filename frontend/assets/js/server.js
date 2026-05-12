import { serveFile } from "jsr:@std/http/file-server";
import { filterByTags, sortByLikes } from "./playlists.js";
const data = JSON.parse(Deno.readTextFileSync("../data/database.json"));

let headers = {}

// till för att lägga till aktiva och ta bort inaktiva users

// Glöm inte att lägga in user.json på gitignore

// ger ut random cookie
function createRandomCookie () {
    return crypto.randomUUID(); // Ska denna kanske flyttas till ui eller api... hmmmmm
}

// tar hand om cookies
async function handleCookies (request) {
    let cookies = [];
    let url = new URL (request.url);
    
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
                let headers = { 
                    "Content-Type": "text/html",
                    "Set-Cookie": "sessionId=" + cookie + "; Max-Age=10080" 
                }
                return new Response("Hello", headers);
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

async function handler(request) {
    const url = new URL(request.url);

    let playlists = data.playlists;
    let songs = data.songs;
    // Lägger till if-satser bara för att skissa upp vad som behöver göras, kan ändras/läggas till mer senare
    
    if (request.method == "GET") {
        
        // Get all playlists
        if (url.pathname == "/") {
            // Kolla först att det finns en aktiv cookie - annars skicka till login

            // Filter playlist (by tags)
            let tag = url.searchParams.get("tag");
            if (tag) playlists = filterByTags(playlists, tags);

            // Sort by amount of tags, descending or ascending
            let likesDesc = url.searchParams.get("likesDesc"); 
            if (likesDesc == true) playlists = sortByLikes(playlists, true);
            if (likesDesc == false) playlists = sortByLikes(playlists, false);
        }
        // Get playlists by search (through name and description)
        // Get one specific playlist by id
        // Get song by search (title or artist)
        // Get your own user info
    }

    if (request.method == "POST") {
        // Logging in or joining
        // Post your own playlist
    }

    if (request.method == "PATCH") {
        // Edit your own playlist (basic info such as name, description of tags) by id
        // Add songs to others playlists by playlist id and song id
    }

    if (request.method == "DELETE") {
        // Delete playlist by id (detta sker från ens profil)
    }
}

Deno.serve(handler);
// Deno.serve(handleCookies); Lägger denna i en kommentar temporärt

// 1. loop igenom arrayen "cookies"

// 2. kolla om något av objekten har användarnamnet == username

// 3. om inget objekt finns med användarnamnet, 
// skapa det som { username: ..., cookie: ... } 
// och pusha det till cookie arrayen

// 4. om det finns - då har dom loggat in igen, 
// uppdatera cookien? dvs objektet.cookie = den nya 
// cookien
