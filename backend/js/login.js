function getNewUserId(users, id) {
    for (let user of users) {
        if (user.id == id) {
            return user;
        }
    }
    return null;
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
