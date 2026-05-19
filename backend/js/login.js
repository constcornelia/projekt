function getUserId(users) {}

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
    let id = getUserId(users);
    
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

export function alertUser(msg) {
    const errorAlert = document.querySelector("error-note");
    errorAlert.innerHTML = msg;
}