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

export function createUser(users, signupReq) {
    let id = getNewUserId(users);
    
    let newUser = {
        id: id,
        username: signupReq.username,
        password: signupReq.password,
        profilePicUrl: signupReq.profilePicUrl
    };
    console.log(newUser)

    users.push(newUser);
    return newUser;
}