function getUserId(users) {}

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