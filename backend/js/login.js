function getNewUserId(users, id) {
    for (let user of users) {
        if (user.id == id) {
            return user;
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

    users.push(newUser);
    return newUser;
}