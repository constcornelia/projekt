import { serveFile } from "jsr:@std/http/file-server";

// till för att lägga till aktiva och ta bort inaktiva users
let cookies = [];

 // ger ut random cookie
function createRandomCookie () {
    return crypto.randomUUID();
}

// tar hand om cookies
async function handleCookies (request) {
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
                headers: { // note to self: testa sätta detta separat och sedan return new response
                    "Content-Type": "text/html",
                    "Set-Cookie": "sessionId=" + cookie + "; Max-Age=10080" // 7hours, rework to 1 week? in seconds.
                }
            });
        }
        console.log("hej");
        cookies.push(loggedInUser);

        // cookies[username] = loggedInUser.username;

        return new Response("Unauhorized", { status: 401 }); */
    }

}
Deno.serve(handleCookies);


// 1. loop igenom arrayen "cookies"

// 2. kolla om något av objekten har användarnamnet == username

// 3. om inget objekt finns med användarnamnet, 
// skapa det som { username: ..., cookie: ... } 
// och pusha det till cookie arrayen

// 4. om det finns - då har dom loggat in igen, 
// uppdatera cookien? dvs objektet.cookie = den nya 
// cookien