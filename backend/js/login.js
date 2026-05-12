import { serveFile } from "jsr:@std/http/file-server";
const data = JSON.parse(Deno.readTextFileSync("../data/users.json"));
const users = data.users;

// till för att lägga till aktiva och ta bort inaktiva users
// Glöm inte att lägga in user.json på gitignore

// ger ut random cookie
function createRandomCookie () { // Ska denna kanske flyttas till ui eller api eller något... hmmmmm
    return crypto.randomUUID(); 
}

async function login(request) {
    let url = new URL(request.url);
    const cookies = [];

    if (request.method == "GET") {

        // Här ska jag kolla om det finns en aktiv cookie, om det gör det kommer man till startsidan, annars omdirigeras man till login
        // if (url.pathname == "/") {
        //     const cookie = request.headers.get("cookie"); 
        // }


        if (url.pathname == "/login") {
            return serveFile(request, "../../test.html");
        }
    }

    // Loggar in och skapar cookien
    if (request.method == "POST") {
        let loginReq = await request.json();

        for (let user of users) {
            if (user.username == loginReq.username && user.password == loginReq.password) {
                let cookie = createRandomCookie();
                cookies.push({ 
                    cookie: cookie,
                    username: user.username
                });

                let headers = { 
                    "Set-Cookie": "sessionId=" + cookie + "; Max-Age=10080" 
                }
                
                return serveFile(request, "../../test.html")
                // return new Response("Welcome", { headers });
            }
        }
        return new Response("Wrong login", { status: 401 });
    }
}

// 1. loop igenom arrayen "cookies"

// 2. kolla om något av objekten har användarnamnet == username

// 3. om inget objekt finns med användarnamnet, 
// skapa det som { username: ..., cookie: ... } 
// och pusha det till cookie arrayen

// 4. om det finns - då har dom loggat in igen, 
// uppdatera cookien? dvs objektet.cookie = den nya 
// cookien

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


// Deno.serve(handleCookies); // Lägger denna i en kommentar temporärt
// Deno.serve(handler);
Deno.serve(login);

// 1. loop igenom arrayen "cookies"

// 2. kolla om något av objekten har användarnamnet == username

// 3. om inget objekt finns med användarnamnet, 
// skapa det som { username: ..., cookie: ... } 
// och pusha det till cookie arrayen

// 4. om det finns - då har dom loggat in igen, 
// uppdatera cookien? dvs objektet.cookie = den nya 
// cookien
