export function checkSession(cookie, cookies) {
    if (cookie != null) {
        for (let i = 0; i < cookies.length; i++) {
            let cookieStr = "session_id=" + cookies[i].cookie;
            if (cookie.includes(cookieStr)) return true;
        }
    }
    return false;
}

export function checkLogin(users, req, cookieId, cookies) {
    for (let user of users) {
        if (user.username == req.username && user.password == req.password) {
            let cookie = { username: user.username, cookie: cookieId };
            cookies.push(cookie);
            return true;
        }
    }
    return false;
}

export function checkSignup(users, req, filename, cookieId, cookies, id) {
    const username = req.get("username");
    const password = req.get("password");

    for (let user of users) {
        if (user.username == req.username) {
            return false;
        }
    }

    if (!username || !password) {
        return false;
    }

    let newUser = {
        id: id,
        username: username,
        password: password,
        profilePicUrl: filename,
    };
    users.push(newUser);

    let cookie = { username: req.username, cookie: cookieId };
    cookies.push(cookie);

    return newUser;
}

export function getActiveUser(activeCookie, cookies, users) {
    if (activeCookie == null) return null;

    activeCookie = activeCookie.split("=")[1];

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

export function getUserByUsername(users, username) {
    let foundUser = null;
    for (let user of users) {
        if (user.username == username) {
            foundUser = user;
        }
    }
    return foundUser;
}

export function updateUser(user, users, req, newFile) {
    const username = req.get("username");
    const password = req.get("password");

    if (username && username != undefined) {
        for (let u of users) {
            if (u.username == username && user.username != username) {
                return null;
            }
        }
        user.username = username;
    }
    
    if (password && password != undefined) user.password = password;
    if (newFile) user.profilePicUrl = newFile;

    console.log('username:',username)
    console.log('password:',password)
    console.log('newFile:',newFile)

    console.log('return value; user:', user)

    return user;
}