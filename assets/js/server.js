import { serveFile } from "jsr:@std/http/file-server";

// till för att lägga till aktiva och ta bort inaktiva users
let cookies = [{}];

 // ger ut random cookie
function createRandomCookie () {
    return crypto.randomUUID();
}

// hämtar user av id - flytta till ui.js
function getUserById(id) {
    let users = JSON.parse(Deno.readTextFileSync("users.json"));

    for (let user of users) {
        if (user.id == id) {
            return user;
        }
    }
}

// tar hand om cookies
async function handleCookies (request) {
    let url = new URL (request.url);
    
    // går till startsidan
    if (request.method == "GET" && url.pathname == "/") {
        return serveFile(request, "test.html");
    }
    
    // går till login
    if (request.method == "GET" && url.pathname == "/login") {
        return serveFile(request, "test.html");
    }

    // loggar in 
    if (request.method == "POST" && url.pathname == "/login") {

        let body = await request.json(); // users input

        let users = JSON.parse(Deno.readTextfileSync("users.json"));

        let loggedInUser = null;

        for (let user of users) {
            if (user.username == body.username && user.password == body.password) {
                loggedInUser = user;
            }
        }

        // om användaren inte är utloggad
        if (loggedInUser != null) {
            let cookie = createRandomCookie();

            loggedInUser.cookie = cookie;

            Deno.writeTextFileSync("users.json", JSON.stringify(users, null, 2));

            return new Response(await Deno.readTextFileSync("test.html"), {
                headers: {
                    "Content-Type": "text/html",
                    "Set-Cookie": "sessionId=" + cookie + "; Max-Age=10080"
                }
            });
        }
        cookies.push(loggedInUser);

        cookies[username] = loggedInUser.username;

        return new response("Unauhorized", { status: 401 });
    }

}
Deno.serve(handleCookies);