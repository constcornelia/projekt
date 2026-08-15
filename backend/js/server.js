import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { extname } from "jsr:@std/path";
import { checkSession, checkLogin, checkSignup, getActiveUser, getUserByUsername } from "./login.js";
import { getTags, filterPlaylistsByTag, sortPlaylistsByLikes, getPlaylistsBySearch, getPlaylistById, getSpecifiedPlaylists, likePlaylist, addSongToPlaylist, getPlaylistDataById, createPlaylist /* deletePlaylistById, removeSongFromPlaylist, getOwnedPlaylists, getLikedPlaylists, getContributedPlaylists */ } from "./playlists.js";
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

    if (url.pathname == "/" && request.method == "GET") {
        let cookie = request.headers.get("cookie");

        let session = checkSession(cookie, cookies);
        if (session) return serveFile(request, "../../frontend/main.html");
        else return handleResponse(null, 303, { "Location": "/welcome" });
    }

    if (url.pathname == "/signup") {
        if (request.method == "GET") return serveFile(request, "../../frontend/signup.html");

        if (request.method == "POST") {
            let signupReq = await request.formData();
            const file = signupReq.get("profile");

            if (!file) return handleResponse("Profile picture is missing", 400);
            
            const fileStr = crypto.randomUUID();
            const extension = extname(file.name);
            const filename = fileStr + extension;
    
            const bytes = await file.bytes();
            if (bytes > 100000) return handleResponse("File is too large", 400);
            Deno.writeFileSync(`../uploads/${filename}`, bytes);

            let cookieId = crypto.randomUUID();
            let headers = {
                "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
                "Location": "/"
            }

            let id = generateId("u", users);
            let newUser = checkSignup(users, signupReq, filename, cookieId, cookies, id);
            if (!newUser) {
                let body = JSON.stringify({ error: "Missing data" });
                return handleResponse(body, 400, headers);
            }

            Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            return handleResponse(null, 303, headers);
        }
    }

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

            let body = JSON.stringify({ error: "Invalid login" })
            return handleResponse(body, 401, null);
        }
    }

    if (url.pathname == "/logout" && request.method == "GET") {
        let headers = {
            "Location": "/welcome",
            "Set-Cookie": "session_id=deleted; Max-Age=0; Path=/"
        }
        return handleResponse(null, 303, headers);
    }

    if (url.pathname == "/api/tags" && request.method == "GET") {
        let tags = getTags(playlists);

        if (!tags) {
            let body = JSON.stringify({ error: "Not Found" });
            return handleResponse(body, 404, headers);
        }
            
        let body = JSON.stringify(tags);
        return handleResponse(body, 200, headers);
    }

    // Sorted playlists
    if (url.pathname == "/api/playlists" && request.method == "GET") {
        let tag = url.searchParams.get("tag");
        if (tag) playlists = filterPlaylistsByTag(playlists, tag);

        let sort = url.searchParams.get("sort");
        if (sort === "likes") playlists = sortPlaylistsByLikes(playlists);
        
        if (!playlists) {
            let body = JSON.stringify({ error: "Not Found" });
            return handleResponse(body, 404, headers);
        }

        let body = JSON.stringify(playlists);
        return handleResponse(body, 200, headers);
    }

    // Search for a playlist by name and description
    if (url.pathname == "/api/playlists/search" && request.method == "GET") {
        let phrase = url.searchParams.get("q");
        if (phrase) playlists = getPlaylistsBySearch(playlists, phrase);

        if (!playlists) {
            let body = JSON.stringify({ error: "Not Found" });
            return handleResponse(body, 404, headers);
        }
            
        let body = JSON.stringify(playlists);
        return handleResponse(body, 200, headers);
    }

    if (url.pathname == "/api/users" && request.method == "GET") {
        users = JSON.stringify(users);
        return new Response(users, {
            status: 200,
            headers: headers
        });
    }

    if (url.pathname == "/api/profile/info") {
        if (request.method == "GET") {
            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);

            if (!user) {
                let body = JSON.stringify({ error: "Unauthorized" });
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
    if (url.pathname == "/api/songs/search") {
        let phrase = url.searchParams.get("q");
        if (phrase) songs = getSongsBySearch(songs, phrase);

        // Felhantera
        
        let body = JSON.stringify(songs);
        return handleResponse(body, 200, headers);
    }

    let playlistPage = new URLPattern({ pathname: "/playlists/:id" });
    if (playlistPage.test(request.url)) return serveFile(request, "../../frontend/public-playlist.html");

    let playlistRoute = new URLPattern({ pathname: "/api/playlists/:id" });
    if (playlistRoute.test(request.url)) {
        let match = playlistRoute.exec(request.url);
        let id = match.pathname.groups.id;

        // Felhantera
        if (request.method == "GET") {
            let playlist = getPlaylistById(playlists, songs, id);
            // Felhantera
            let body = JSON.stringify(playlist);
            return handleResponse(body, 200, headers); 
        }

        if (request.method == "PATCH") {
            let songReq = await request.json();
            const activeCookie = request.headers.get("cookie");
            let user = getActiveUser(activeCookie, cookies, users);

            let playlist = addSongToPlaylist(playlists, id, user, songReq);
            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));

            let body = JSON.stringify(playlist);
            return handleResponse(body, 200, headers);
        }
    }

    if (url.pathname == "/api/songs" && request.method == "GET") {
        let body = JSON.stringify(songs);
        return handleResponse(body, 200, headers);
    }

    if (url.pathname == "/api/profile/playlists" && request.method == "GET") {
        const activeCookie = request.headers.get("cookie");
        let user = getActiveUser(activeCookie, cookies, users);

        let specification = null;

        let type = url.searchParams.get("type");
        if (type == "liked") specification = "liked";
        if (type == "edited") specification = "edited";
        if (type == "owned") specification = "owned";

        let specifiedPlaylists = getSpecifiedPlaylists(playlists, user, specification);
        if (!specifiedPlaylists) {
            let body = JSON.stringify({ error: "Not Found "});
            return handleResponse(body, 404, headers);
        }

        let body = JSON.stringify(specifiedPlaylists)
        return handleResponse(body, 200, headers);
    }

    let profilePage = new URLPattern({ pathname: "/profile/:username" });
    if (profilePage.test(request.url)) return serveFile(request, "../../frontend/personal.html");

    let profileRoute = new URLPattern({ pathname: "/api/profile/:username" });
    if (profileRoute.test(request.url)) {
        let match = profileRoute.exec(request.url);
        let username = match.pathname.groups.username;

        // Felhantera

        let user = getUserByUsername(users, username);
        let body = JSON.stringify(user);
        return handleResponse(body, 200, headers); 
    }

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

    if (url.pathname == "/new-playlist") {
        if (request.method == "GET") return serveFile(request, "../../frontend/new-playlist.html");

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

            let id = generateId("p", playlists);
            let newPlaylist = createPlaylist(playlistReq, user, playlists, filename, id);
            console.log('newplaylist nu i server:', newPlaylist);
            if (!newPlaylist) {}

            Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
            return handleResponse(null, 303, headers);
        }
    }

/* 
    
            let id = generateId("u", users);
            let newUser = checkSignup(users, signupReq, filename, cookieId, cookies, id);
            if (!newUser) {
                let body = JSON.stringify({ error: "Missing data" });
                return handleResponse(body, 400, headers);
            }

            Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            return handleResponse(null, 303, headers);
*/

    
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
    

//     if (request.method == "POST") {
//          // Skapar ny spellista
//         if (url.pathname == "/api/playlists") {
//             // Hämtar all formdata från requesten
//             let formData = await request.formData();

//             // Variabler för datan från formuläret
//             let name;
//             let description;
//             let tag;
//             let songs;
//             let file;

//             // Loopar igenom all formdata
//             for (let data of formData) {
//                 // Första värdet är fältets namn
//                 // Exempel:
//                 // "name"
//                 let key = data[0];
//                 // Andra värdet är innehållet
//                 // Exempel:
//                 // "My playlist"
//                 let value = data[1];

//                 // Sparar spellistans data
//                 if (key == "name") name = value;
//                 if (key == "description") description = value;
//                 if (key == "tag") tag = value;
//                 // JSON.parse gör om texten tillbaka till en array
//                 if (key == "songs") songs = JSON.parse(value);
//                 if (key == "cover") file = value;
//             }
//             // Variabel för filnamnet
//             let filename = "";
//             // Kör bara om en fil finns
//             if (file && file.name) {
//                 // Skapar slumpmässigt filnamn
//                 const fileStr = crypto.randomUUID();;
//                 // Hämtar filens ändelse
//                 // Exempel:
//                 // ".png"
//                 const extension = extname(file.name);
//                 // Skapar komplett filnamn
//                 filename = fileStr + extension;
//                 // Hämtar filens innehåll
//                 const bytes = await file.bytes();
//                 // Sparar filen i uploads mappen
//                 Deno.writeFileSync(`../uploads/${filename}`, bytes);
//             }
//             let cookie = request.headers.get("cookie");
//             // Om ingen cookie finns, så är användaren är inte inloggad
//             if (!cookie) return handleResponse("Unauthorized", 401, null);
//             // Delar upp cookie-strängen vid "="
//             let parts = cookie.split("=");
//             // Hämtar själva cookie-id:t
//             let cookieId = parts[1];
//             // Variabel för inloggad användare
//             let currentUser = null;
//             // Loopar igenom alla sparade cookies
//             for (let i = 0; i < cookies.length; i++) {
//                 // Om cookie-id:t matchar
//                 if (cookies[i].cookie == cookieId) {
//                     // Sparar användaren
//                     currentUser = cookies[i];
//                 }
//             }
//             // Om ingen användare hittades
//             if (!currentUser) return handleResponse("Unauthorized", 401, null);
//             // Variabel för hela användarobjektet
//             let foundUser = null;
//             // Letar upp användaren i users-arrayen
//             for (let user of users) {
//                 if (user.username == currentUser.username) {
//                     foundUser = user;
//                 }
//             }
//             if (!foundUser) return handleResponse("Unauthorized", 401, null);
//             // Skapar nytt playlist-id
//             // Exempel:
//             // "p-9"
//             let newId = "p-" + (playlists.length + 1);
//             // Skapar den nya spellistan
//             let playlistTags = [];
//             let splitTags = tag.split(",");
//             for (let tag of splitTags) {
//                 playlistTags.push(tag);
//             }
//             let newPlaylist = {
//                 id: newId,
//                 ownerId: foundUser.id,
//                 name: name,
//                 description: description,
//                 imgUrl: `/uploads/${filename}`,
//                 likes: [],
//                 tags: playlistTags,
//                 songs: songs
//             };
//             playlists.push(newPlaylist);
//             Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
//             let headers = { "Content-Type": "application/json" };
//             return handleResponse(JSON.stringify(newPlaylist), 201, headers);
//         }
//     }
    
//     if (request.method == "PATCH") {
//         let likeRoute = new URLPattern({ pathname: "/api/playlists/:id/like" });
//         if (likeRoute.test(request.url)) {
//             let match = likeRoute.exec(request.url);
//             let playlistId = match.pathname.groups.id;
//             let cookie = request.headers.get("cookie");
//             // Om ingen cookie finns är användaren inte inloggad
//             if (!cookie) return handleResponse("Unauthorized", 401, null);

//             // Delar upp cookie strängen vid "="
//             let parts = cookie.split("=");
//             // Hämtar själva cookie-id:t
//             let cookieId = parts[1];

//             let currentUser = null;
//             // Loopar igenom sparade cookies för att hitta rätt användare
//             for (let i = 0; i < cookies.length; i++) {
//                 // Om cookie id:t matchar
//                 if (cookies[i].cookie == cookieId) {
//                     // Sparar användarens username
//                     currentUser = cookies[i].username;
//                 }
//             }
//             // Om ingen användare hittades
//             if (!currentUser) return handleResponse("Unauthorized", 401, null);
//             let playlist = null;
//             // Loopar igenom alla spellistor
//             for (let i = 0; i < playlists.length; i++) {
//                 // Om spellistans id matchar
//                 if (playlists[i].id == playlistId) {
//                     // Sparar rätt spellista
//                     playlist = playlists[i];
//                 }
//             }
//             // Om spellistan inte finns
//             if (!playlist) return handleResponse("Playlist not found", 404, null);
//             let alreadyLiked = false;
//             // Sparar vilken plats i arrayen användaren finns på och -1 betyder "inte hittad"
//             let likeIndex = -1;
//             // Loopar igenom alla användare som har likat spellistan
//             for (let i = 0; i < playlist.likes.length; i++) {
//                 // Kollar om användaren i arrayen är samma som den inloggade användaren
//                 if (playlist.likes[i] == currentUser) {
//                     // Om användaren hittas betyder det att den redan har likat
//                     alreadyLiked = true;
//                     // Sparar vilken position användaren finns på i arrayen
//                     // Exempel:
//                     // ["dilara", "cornelia", "elena"]
//                     // Om currentUser är "cornelia" blir likeIndex = 1
//                     likeIndex = i;
//                 }
//             }
//             if (alreadyLiked) {
//                 // Första värdet är positionen
//                 // Andra värdet är hur många element som ska tas bort

//                 // Exempel:
//                 // ["dilara", "cornelia", "elena"]
//                 // splice(1, 1)
//                 // Resultat:
//                 // ["dilara", "elena"]
//                 playlist.likes.splice(likeIndex, 1);
//             } else {
//                 // Om användaren INTE redan finns i likes-arrayen
//                 // läggs användaren till sist i arrayen

//                 // Exempel:
//                 // ["dilara", "cornelia"]
//                 // push("elena")
//                 // Resultat:
//                 // ["dilara", "cornelia", "elena"]
//                 playlist.likes.push(currentUser);

//             }
//             Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
//             let headers = { "Content-Type": "application/json"};
//             let body = JSON.stringify(playlist);
//             return handleResponse(body, 200, headers);
//         }
//         let songRoute = new URLPattern({ pathname: "/api/playlists/:id/songs" });
//         if (songRoute.test(request.url)) {
//             let match = songRoute.exec(request.url);
//             let playlistId = match.pathname.groups.id;
//             let body = await request.json();
//             let playlist = null;
//             for (let p of playlists) {
//                 if (p.id == playlistId) {
//                     playlist = p;
//                 }
//             }
//             if (!playlist) {
//                 return handleResponse("Playlist not found", 404, null);
//             }
//             playlist.songs.push({
//                 songId: body.songId,
//                 editorId: body.editorId
//             });
//             Deno.writeTextFileSync(
//                 "../data/database.json",
//                 JSON.stringify(data, null, 2)
//             );
//             return handleResponse(JSON.stringify(playlist), 200, { "Content-Type": "application/json" }
//             );
//         }
//     }


//     if (request.method == "DELETE") {
//         // delete song from playlist if owner
//         let songRoute = new URLPattern({ pathname: "/api/playlists/:id/songs/:songId" });
//         if (songRoute.test(request.url)) {
//             let match = songRoute.exec(request.url);
//             let playlistId = match.pathname.groups.id;
//             let songId = match.pathname.groups.songId;
//             let removed = deleteSongFromPlaylist(playlists, playlistId, songId);
//             if (!removed) {
//                 return handleResponse("Song not found", 404, null);
//             }
//             Deno.writeTextFileSync("../data/database.json", JSON.stringify(data, null, 2));
//             return handleResponse( JSON.stringify({ message: "Song removed" }), 200, { "Content-Type": "application/json" });
//         }
//         // delete playlist if owner
//         let playlistRoute = new URLPattern({ pathname: "/api/playlists/:id" });
//         if (playlistRoute.test(request.url)) {
//             let match = playlistRoute.exec(request.url);
//             let playlistId = match.pathname.groups.id;
//             // kontrollera att användaren är inloggad
//             let cookie = request.headers.get("cookie");
//             if (!cookie) {
//                 return handleResponse("Unauthorized", 401, null);
//             }
//             let parts = cookie.split("=");
//             let cookieId = parts[1];
//             // hitta aktuell session
//             let currentUser = null;
//             for (let session of cookies) {
//                 if (session.cookie == cookieId) {
//                     currentUser = session;
//                     break;
//                 }
//             }
//             if (!currentUser) {
//                 return handleResponse("Unauthorized", 401, null);
//             }
//             // hitta användaren i users.json
//             let foundUser = null;
//             for (let user of users) {
//                 if (user.username == currentUser.username) {
//                     foundUser = user;
//                     break;
//                 }
//             }
//             if (!foundUser) {
//                 return handleResponse("Unauthorized", 401, null);
//             }
//             // hitta spellistan
//             let foundPlaylist = null;
//             for (let playlist of playlists) {
//                 if (playlist.id == playlistId) {
//                     foundPlaylist = playlist;
//                     break;
//                 }
//             }
//             if (!foundPlaylist) {
//                 return handleResponse("Playlist not found", 404, null);
//             }
//             // kontrollera att användaren är ägaren
//             if (foundPlaylist.ownerId != foundUser.id) {
//                 return handleResponse(
//                     "You are not the owner of this playlist",
//                     403,
//                     null
//                 );
//             }
//             // Radera spellistan
//             let deleted = deletePlaylistById(data, playlistId);
//             if (!deleted) {
//                 return handleResponse(
//                     "Playlist could not be deleted",
//                     404,
//                     null
//                 );
//             }
//             // Spara databasen
//             Deno.writeTextFileSync(
//                 "../data/database.json",
//                 JSON.stringify(data, null, 2)
//             );
//             return handleResponse(null, 204, null);
//         }
//     }

//     // if (request.method == "DELETE") {
//     //     // Delete playlist if owner
//     //     let route = new URLPattern({ pathname: "/user/playlists/:id" });
//     //     if (route.test(request.url)) {
//     //         let match = route.exec(request.url);
//     //         let id = pathname.groups.id
//     //         deletePlaylistById(playlists, id);
//     //         return new Response(null, {});
//     //     }

//     //     // Delete song from playlist if owner FRÅGA OM DETTA SKA VA I PATCH ELLER DELETE
//     //     let songRoute = new URLPattern({ pathname: "/user/playlists/:id/:songId" });
//     //     if (route.test(request.url)) {
//     //         let match = songRoute.exec(request.url);
//     //         let playlistId = pathname.groups.id;
//     //         let songId = pathname.groups.songId;

//     //         deleteSongFromPlaylist(playlists, playlistId, songId);

//     //         return new Response(null, {});
//     //     }
//     // }

//     if (url.pathname.startsWith("/uploads/")) {
//     return serveDir(request, {
//         fsRoot: "../uploads",
//         urlRoot: "uploads"
//     });
// }
    return serveDir(request, { fsRoot: "../../frontend" });
    }
Deno.serve(handler);