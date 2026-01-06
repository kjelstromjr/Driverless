function updateCall() {
    displayOpen = true;
    document.getElementById("restart").style.display = "flex";
}

function closePopups() {
    document.getElementById("restart").style.display = "none";
    document.getElementById("offline").style.display = "none";
    document.getElementById("restarting").style.display = "none";
    document.getElementById("upload-popup").style.display = "none";
    document.getElementById("settings-popup").style.display = "none";
    document.getElementById("admin-popup").style.display = "none";
    document.getElementById("admin-settings-popup").style.display = "none";

    displayOpen = false;
}

function closeServerPopups() {

    if (document.getElementById("restarting").style.display !== "none" || document.getElementById("offline").style.display !== "none") {
        displayOpen = false;
    }

    document.getElementById("restarting").style.display = "none";
    document.getElementById("offline").style.display = "none";
}

function openMods() {
    displayOpen = true;
    document.getElementById("upload-popup").style.display = "flex";
}

function openSettings() {
    displayOpen = true;
    document.getElementById("settings-popup").style.display = "flex";
}

function openAdminSettings() {
    displayOpen = true;
    document.getElementById("admin-settings-popup").style.display = "flex";
}

function offline() {
    if (!offlineDisplayed) {
        displayOpen = true;
        document.getElementById("offline").style.display = "flex";
        offlineDisplayed = true;
    }
}

function uploadPage() {
    document.getElementById("upload-page").style.left = "0%";
}

function deletePage() {
    document.getElementById("delete-page").style.left = "0%";
}

function closeUploadPage() {
    document.getElementById("upload-page").style.left = "100%";
}

function closeDeletePage() {
    document.getElementById("delete-page").style.left = "110%";
}

function restarting() {
    displayOpen = true;
    document.getElementById("restarting").style.display = "flex";
    document.getElementById("numPlayers").style.display = "none";
    document.getElementById("numCars").style.display = "none";
    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("playersOnline").style.display = "none";
}

function displayNodes(nodes) {
    let lines = nodes.split("\n");

    objects.push(new drawStarter());

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let data = line.split(";");

        let type = data[0];

        for (let j = 1; j < data.length - 1; j++) {
            let point = data[j];
            point = point.split(",");

            let nextPoint = data[j + 1];
            nextPoint = nextPoint.split(",");

            if (type == "d") {
                objects.push(new Line(parseInt(point[0]), parseInt(point[1]), parseInt(nextPoint[0]), parseInt(nextPoint[1]), "hsl(0, 0%, 40%)"));
            } else if (type == "m") {
                objects.push(new Line(parseInt(point[0]), parseInt(point[1]), parseInt(nextPoint[0]), parseInt(nextPoint[1]), "hsl(0, 0%, 20%)"));
            } else {
                err(`Unknown data type "${type}" found in map file`);
                console.log("Unknown type");
            }
        }
    }

    objects.push(new drawEnder());
}

function displayPlayers() {
    let data = playerData;

    if (data === undefined) {
        return;
    }

    let online = [];
    offlineDisplayed = false;

    for (let i = 0; i < data.length; i++) {
        try {
            let car = data[i];
            let user = car[0];
            let id = car[1][0];
            let x = car[2].pos[0];
            let y = car[2].pos[1];

            if (!playersDisplayed) {
                let player = new Player(x, y, user, id);

                objects.push(player);
                players.push(player);
            }

            if (!online.includes(user)) {
                online.push(user);
            }
        } catch (e) {
            
        }
    }

    playersDisplayed = true;

    document.getElementById("players-online").textContent = online.length + " / " + maxPlayers;
}

function startDelete() {
    let toBeDeleted = [];
    let modsToCheck = document.getElementById("delete-page").getElementsByClassName("option-select");

    for (let i = 0; i < modsToCheck.length; i++) {
        let mod = modsToCheck[i];
        let input = mod.getElementsByTagName("input")[0];
        if (input.checked) {
            toBeDeleted.push(input.name.split("-")[1]);
        }
    }

    deleteMods(toBeDeleted);
}

function restore() {
    if (!restoreClicked) {
        restoreClicked = true;
        document.getElementById("restoreButton").classList = "stopbutton";
        document.getElementById("restoreButton").textContent = "Are you sure?";
        let timer = window.setTimeout(() => {
            restoreClicked = false;
            document.getElementById("restoreButton").classList = "defaultbutton";
            document.getElementById("restoreButton").textContent = "Restore Default Settings";
        }, 5000);
    } else {
        restoreClicked = false;
        document.getElementById("restoreButton").classList = "defaultbutton";
        document.getElementById("restoreButton").textContent = "Restore Default Settings";

        document.getElementById("color").value = "#3131e3";
        changeColor();

        document.getElementById("sleep").checked = true;
        localStorage.setItem("sleep", true);

        document.getElementById("reloadOnUpdate").checked = true;
        localStorage.setItem("reloadOnUpdate", true);
    }
}

function updateChanged(setting) {
    document.getElementById("allowedUpdateButton").disabled = false;

    if (currentAllowed.indexOf(setting) >= 0) {
        currentAllowed = currentAllowed.filter(v => v !== setting);
    } else {
        currentAllowed.push(setting);
    }
}

function err(thing) {
    let m = document.getElementById("message");
    if (m.innerHTML !== `<div style="color: darkred;background-color: rgb(255, 125, 125);">${thing}</div>`) {
        m.innerHTML = `<div style="color: darkred;background-color: rgb(255, 125, 125);">${thing}</div>`;
        window.setTimeout(() => {
            m.innerHTML = ``;
        }, 4000);
    }
}

function message(thing) {
    let m = document.getElementById("message");
    if (m.innerHTML !== `<div>${thing}</div>`) {
        m.innerHTML = `<div>${thing}</div>`;
        window.setTimeout(() => {
            m.innerHTML = ``;
        }, 4000);
    }
}