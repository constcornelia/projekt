export function checkSession(cookie, cookies) {
    if (cookie != null) {
        for (let i = 0; i < cookies.length; i++) {
            let cookieStr = "session_id=" + cookies[i].cookie;
            if (cookie.includes(cookieStr)) return true;
        }
    }
    return false;
}

export function checkLogin() {}

export function createRandomString() {
    return crypto.randomUUID(); 
}


function getNewUserId(users) {
    let highest = 0;

    for (let user of users) {
        let idNr = user.id.substring(2);
        idNr = parseInt(idNr);

        if (highest < idNr) {
            highest = idNr
        };
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

export function createUser(users, file, username, password) {
    let id = getNewUserId(users);
    
    let newUser = {
        id: id,
        username: username,
        password: password,
        profilePicUrl: file.name
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
