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
    // Se till att fälten har required
    // Informera användare om det är inkorrekt inlogg
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
            console.log("1")
            return false;
        }
    }

    if (!username || !password) {
        console.log("2");
        return false;
    }
    console.log("test");

    let newUser = {
        id: id,
        username: username,
        password: password,
        profilePicUrl: `../uploads/${filename}`,
    };
    console.log('newuser: ', newUser);
    users.push(newUser);

    let cookie = { username: req.username, cookie: cookieId };
    cookies.push(cookie);

    return newUser;
}

/* 
checkSignup(users, filename, signupReq)
                // for (let user of users) {
                //     if (username == user.username) {
                //         return handleResponse("Username is already taken", 401);
                //     }
                // }
                
                // if (!username || !password) {
                //     return handleResponse("Input data missing", 400);
                // }
            
                // createUser(users, filename, username, password);
                // Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
                
                // let cookieId = createRandomString();
                // let cookie = { username: username, cookie: cookieId };
                // cookies.push(cookie);
            
                // let headers = {
                //     "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
                //     "Location": "/"
                // };
                // return handleResponse(null, 303, headers);


    {
      "id": "u-3",
      "username": "dilara",
      "password": "moni",
      "profilePicUrl": "msp.png"
    }
*/

export function getActiveUser(activeCookie, cookies, users) {
    let activeUser = null;
    activeCookie = activeCookie.split("=")[1];

    for (let cookie of cookies) {
        if (cookie.cookie == activeCookie) {
            for (let user of users) {
                if (user.username == cookie.username) {
                    activeUser = user;
                }
            }
        }
    }

    return activeUser;
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

/* 
    {
      "id": "u-3",
      "username": "dilara",
      "password": "moni",
      "profilePicUrl": "msp.png"
    }
*/


// /* 
//             for (let user of users) {
//                 if (username == user.username) {
//                     return new Response("Username is already taken", { status: 401 });
//                 }
//             }
            
//             if (!username || !password) {
//                 return new Response("Input data missing", { status: 400 });
//             }
        
//             createUser(users, file, username, password);
//             Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            
//             let cookieId = createRandomCookie();
//             let cookie = { username: username, cookie: cookieId };
//             cookies.push(cookie);
        
//             let headers = {
//                 "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
//                 "Location": "/"
//             };
        
//             return new Response(null, {
//                 status: 303,
//                 headers: headers
//             });
// */

// function getNewUserId(users) {
//     let highest = 0;

//     for (let user of users) {
//         let idNr = user.id.substring(2);
//         idNr = parseInt(idNr);

//         if (highest < idNr) {
//             highest = idNr;
//         }
//     }

//     let newNr = highest + 1;
//     return "u-" + newNr;
// }

// export function getUser(users, cookies, activeCookie) {
//     for (let cookie of cookies) {
//         if (cookie.cookie == activeCookie) {
//             for (let user of users) {
//                 if (user.username == cookie.username) {
//                     return user;
//                 }
//             }
//         }
//     }
//     return null;
// }

// export function createUser(users, file, username, password) {
//     let id = getNewUserId(users);
    
//     let newUser = {
//         id: id,
//         username: username,
//         password: password,
//         profilePicUrl: file.name
//     };

//     console.log(newUser);

//     users.push(newUser);
//     return newUser;
// }

// export function getUserByUsername(users, username) {
//     for (let user of users) {
//         if (user.username == username) {
//             console.log(user);
//             return user;
//         }
//     }
//     return null;
// }








// // export function checkSession(cookie, cookies) {
// //     if (cookie != null) {
// //         for (let i = 0; i < cookies.length; i++) {
// //             let cookieStr = "session_id=" + cookies[i].cookie;
// //             if (cookie.includes(cookieStr)) return true;
// //         }
// //     }
// //     return false;
// // }

// // export function checkLogin(users, req, cookieId, cookies) {
// //     // Se till att fälten har required
// //     // Informera användare om det är inkorrekt inlogg
// //     for (let user of users) {
// //         if (user.username == req.username && user.password == req.password) {
// //             let cookie = { username: user.username, cookie: cookieId };
// //             cookies.push(cookie);
// //             return true;
// //         }
// //     }
// //     return false;
// // }

// // export function checkSignup(users, req, cookieId, cookies) {
// //     // Sätt required på fälten
// //     // Informera användaren om ett användarnamn redan är taget

// //     for (let user of users) {
// //         if (user.username == req.username) {
// //             return false;
// //         }
// //     }

// //     // Lägg till filuppladning
// //     // Generera ett nytt id
// //     // let cookie = { username: req.username, cookie = cookieId };
// //     // cookies.push(cookie);

// //     // let newUser = { username: req.username, password: req.password };
// //     // users.push(newUser);

// //     // return true;
// // }

// // export function getActiveUser(activeCookie, cookies, users) {
// //     let activeUser = null;
// //     activeCookie = activeCookie.split("=")[1];

// //     for (let cookie of cookies) {
// //         if (cookie.cookie == activeCookie) {
// //             for (let user of users) {
// //                 if (user.username == cookie.username) {
// //                     activeUser = user;
// //                 }
// //             }
// //         }
// //     }
// //     return activeUser;
// // }



// /* 
//             for (let user of users) {
//                 if (username == user.username) {
//                     return new Response("Username is already taken", { status: 401 });
//                 }
//             }
            
//             if (!username || !password) {
//                 return new Response("Input data missing", { status: 400 });
//             }
        
//             createUser(users, file, username, password);
//             Deno.writeTextFileSync("../data/users.json", JSON.stringify(userData, null, 2));
            
//             let cookieId = createRandomCookie();
//             let cookie = { username: username, cookie: cookieId };
//             cookies.push(cookie);
        
//             let headers = {
//                 "Set-Cookie": "session_id=" + cookieId + "; Max-Age=86400; Path=/",
//                 "Location": "/"
//             };
        
//             return new Response(null, {
//                 status: 303,
//                 headers: headers
//             });
// */

// // function getNewUserId(users) {
// //     let highest = 0;

// //     for (let user of users) {
// //         let idNr = user.id.substring(2);
// //         idNr = parseInt(idNr);

// //         if (highest < idNr) {
// //             highest = idNr;
// //         }
// //     }

// //     let newNr = highest + 1;
// //     return "u-" + newNr;
// // }

// // export function getUser(users, cookies, activeCookie) {
// //     for (let cookie of cookies) {
// //         if (cookie.cookie == activeCookie) {
// //             for (let user of users) {
// //                 if (user.username == cookie.username) {
// //                     return user;
// //                 }
// //             }
// //         }
// //     }
// //     return null;
// // }

// // export function createUser(users, file, username, password) {
// //     let id = getNewUserId(users);
    
// //     let newUser = {
// //         id: id,
// //         username: username,
// //         password: password,
// //         profilePicUrl: file.name
// //     };

// //     console.log(newUser);

// //     users.push(newUser);
// //     return newUser;
// // }

// // export function getUserByUsername(users, username) {
// //     for (let user of users) {
// //         if (user.username == username) {
// //             console.log(user);
// //             return user;
// //         }
// //     }
// //     return null;
// // }