//metod patch, /api/profile/:username

// Let enpoint = “/api/profile/” + currentUser.username;
// api.patchRequest(endpoint) ;

const editAccountForm = document.querySelector("#editAccountForm");
const profilePicture = document.querySelector("#ProfilePicture");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const profileInput = document.querySelector("#profile");
const cancelButton = document.querySelector("#CancelCreateButton");

const api = new API();

let currentUser;

async function getProfileInfo() {
    currentUser = await api.getRequest("/api/profile/info");
    if (!currentUser) {
        return;
    }
    usernameInput.value = currentUser.username;
    passwordInput.value = currentUser.password;
    if (currentUser.profilePicUrl) {
        profilePicture.src = "../../../backend/uploads/" + currentUser.profilePicUrl;
    }
}

editAccountForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    // const endpoint = "/api/profile/" + currentUser.username;
    const endpoint = "/edit";
    const formData = new FormData();
    formData.append("username", usernameInput.value);
    formData.append("password", passwordInput.value);
    if (profileInput.files.length > 0) {
        formData.append("profile", profileInput.files[0]);
    }
    const updatedUser = await api.patchRequest(endpoint, formData);
    if (updatedUser) {
        currentUser = updatedUser; 
        usernameInput.value = currentUser.username;
        passwordInput.value = currentUser.password;
        if (currentUser.profilePicUrl) {
            profilePicture.src = "../../../backend/uploads/" + currentUser.profilePicUrl;
        }
        alert("Successfully edited!");
        window.location.href = "/";
    }
});

cancelButton.addEventListener("click", async function () {
    if (!currentUser) {
        console.log("No current user");
        return;
    }
    window.location.href = `/profile/${currentUser.username}`;
});
getProfileInfo();