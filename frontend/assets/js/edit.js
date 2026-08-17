const editAccountForm = document.querySelector("#editAccountForm");
const profilePicture = document.querySelector("#ProfilePicture");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const profileInput = document.querySelector("#profile");
const cancelButton = document.querySelector("#CancelCreateButton");
const errorMessage = document.querySelector(".error-note");

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
    const formData = new FormData();
    formData.append("username", usernameInput.value);
    formData.append("password", passwordInput.value);

    if (profileInput.files.length > 0) {
        formData.append("profile", profileInput.files[0]);
    }

    const result = await api.patchRequest("/edit", formData);
    if (result === null) {
        alert("Successfully edited!");
        window.location.href = "/";
        return;
    }

    if (result) {
        errorMessage.textContent = result.message;
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