export function checkSession(cookie, cookies) {
    if (cookie != null) {
        for (let i = 0; i < cookies.length; i++) {
            let cookieStr = "session_id=" + cookies[i].cookie;
            if (cookie.includes(cookieStr)) return true;
        }
    }
    return false;
}

export function createRandomString() {
    return crypto.randomUUID(); 
}

export function checkLogin(users, req, cookieId, cookies) {
    for (let user of users) {
        if (user.username == req.username && user.password == req.password) {
            return true;
        }
    }
    return false;
}

export function getActiveUser(cookie, cookies) {
    if (!cookie) return null;

    let parts = cookie.split("=");
    let cookieId = parts[1];

    for (let c of cookies) {
        if (c.cookie == cookieId) {
            return c;
        }
    }
    return null;

    // let user = null;
    // for (let i = 0; i < cookies.length; i++) {
    //     if (cookies[i].cookie.includes(cookie)) user = cookies[i];
    // }
    // return user;
}


export function getUserInfo(users, cookies, cookie) {
    console.log(cookie);
    let parts = cookie.split("=");
    let cookieId = parts[1];

    let activeCookie;
    for (let c of cookies) {
        if (c.cookie == cookieId) {
            activeCookieUser = c.username
        }
    }

    for (let user of users) {
        if (user.username == activeCookieUser) {
            return user;
        }
    }

    return null;
    
    // let user = null;
    // for (let i = 0; i < cookies.length; i++) {
    //     if (cookies[i].cookie.includes(cookie)) user = cookies[i];
    // }
    // return user;
}


/* 
            for (let user of users) {
                if (username == user.username) {
                    return new Response("Username is already taken", { status: 401 });
                }
            }
            
            if (!username || !password) {
                return new Response("Input data missing", { status: 400 });
            }
        
            createUser(users, file, username, password);
            Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            
            let cookieId = createRandomCookie();
            let cookie = { username: username, cookie: cookieId };
            cookies.push(cookie);
        
            let headers = {
                "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
                "Location": "/"
            };
        
            return new Response(null, {
                status: 303,
                headers: headers
            });
*/

function getNewUserId(users) {
    let highest = 0;

    for (let user of users) {
        let idNr = user.id.substring(2);
        idNr = parseInt(idNr);

        if (highest < idNr) {
            highest = idNr;
        }
    }

    let newNr = highest + 1;
    return "u-" + newNr;
}

export function getUser(users, cookies, activeCookie) {
    for (let cookie of cookies) {
        if (cookie.cookie == activeCookie) {
            for (let user of users) {
                if (user.username == cookie.username) {
                    return user;
                }
            }
        }
    }
    return null;
}

export function createUser(users, filename, username, password) {
    let id = getNewUserId(users);
    
    let newUser = {
        id: id,
        username: username,
        password: password,
        profilePicUrl: filename
    };

    console.log(newUser);

    users.push(newUser);
    return newUser;
}

export function getUserByUsername(users, username) {
    for (let user of users) {
        if (user.username == username) {
            console.log(user);
            return user;
        }
    }
    return null;
}
