const rootStyles = getComputedStyle(document.documentElement);
const actionColor = rootStyles.getPropertyValue('--action').trim();

let players = [];

let offlineDisplayed = false;

let playerData = [];

let debug = false;

let currentMap = "";
let maxPlayers = -1;
let maxCars = -1;

let dataGetter;

let activated = [];
let deactivated = [];

class Line {
    constructor(x1, y1, x2, y2, color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
    }

    update() {
        
    }

    draw() {
        ctx.strokeStyle = this.color;

        let [sx1, sy1] = worldToScreen(this.x1, this.y1);
        let [sx2, sy2] = worldToScreen(this.x2, this.y2);

        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
    }

    clicked() {
        
    }
}

class Player {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
    }

    update() {

    }

    draw() {

        let [sx, sy] = worldToScreen(this.x, this.y);

        let [tx1, ty1] = worldToScreen(this.x + (7.071 / scale), this.y + (7.071 / scale));
        let [tx2, ty2] = worldToScreen(this.x - (7.071 / scale), this.y + (7.071 / scale));

        // ctx.beginPath();
        // ctx.arc(sx, sy, 5, 0, Math.PI * 2); // Full circle
        // ctx.fillStyle = actionColor; // Fill color
        // ctx.fill();
        // ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.fillStyle = actionColor;
        ctx.fill();
        // Measure text size
        let textMetrics = ctx.measureText(this.name);
        let textWidth = textMetrics.width;
        let textHeight = 20; // Approximate height, adjust if needed for accuracy

        // Calculate box dimensions and position
        let paddingLR = 10;
        let paddingTB = 5;
        let boxWidth = textWidth + 2 * paddingLR;
        let boxHeight = textHeight + 2 * paddingTB;
        
        let [bx, by] = worldToScreen(this.x - (boxWidth / 2) / scale, this.y + (boxHeight + 7.071) / scale);

        ctx.fillRect(bx, by, boxWidth, boxHeight);

        ctx.fillStyle = "white";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = 20 + "px Calibri";
        ctx.fillText(this.name, bx + (boxWidth / 2), by + (boxHeight / 2));

        ctx.closePath();
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }
}

class Updater {
    update() {
        displayPlayers();       
    }

    draw() {

    }
}

objects.push(new Updater());

function displayNodes(nodes) {
    let lines = nodes.split("\n");

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
}

function updateCall() {
    displayOpen = true;
    document.getElementById("restart").style.display = "flex";
}

function closePopups() {
    document.getElementById("restart").style.display = "none";
    document.getElementById("offline").style.display = "none";
    document.getElementById("restarting").style.display = "none";
    document.getElementById("upload-popup").style.display = "none";

    displayOpen = false;
}

function closeServerPopups() {

    if (document.getElementById("restarting").style.display !== "none" || document.getElementById("offline").style.display !== "none") {
        displayOpen = false;
    }

    document.getElementById("restarting").style.display = "none";
    document.getElementById("offline").style.display = "none";
}

function restart() {
    window.clearInterval(dataGetter);
    closePopups();
    restarting();

    let data = {
        map: document.getElementById("maps").value,
        maxPlayers: document.getElementById("players").value,
        maxCars: document.getElementById("cars").value
    }

    fetch(window.location.origin  + "/update-settings", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin  + ""
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.ok) {
            window.location.reload();
        } else {
            err("Could not Restart");
            console.error("Could Not Restart");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });

    // window.setTimeout(() => {
    //     window.location.reload();
    // }, 1000);
}

function restarting() {
    displayOpen = true;
    document.getElementById("restarting").style.display = "flex";
    document.getElementById("numPlayers").style.display = "none";
    document.getElementById("numCars").style.display = "none";
    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("playersOnline").style.display = "none";
}

function openMods() {
    displayOpen = true;
    document.getElementById("upload-popup").style.display = "flex";
}

async function upload() {
    if (document.getElementById("files").value === "") {
        message("Please Select a File to Upload");
        return;
    }
    
    const fileInput = document.getElementById('files');
    const file = fileInput.files[0];

    if (file) {
        document.getElementById("upload-content").innerHTML = `<div class="container">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <h3>Uploading files...</h3>
            <span id="yup" style="display: none">Yup, still going</span>`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            window.setTimeout(() => {
                document.getElementById("yup").style.display = "block";
            }, 60000);

            const response = await fetch(window.location.origin  + "/upload-mod", {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                document.getElementById("upload-content").innerHTML = `
                <div class="close" onclick="closePopups()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </div>
                <h1>Upload Failed</h1>`;
            } else {
                document.getElementById("upload-content").innerHTML = `
                <div class="close" onclick="closePopups()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </div>
                <h1>Upload Successfull</h1>
                <span>The server needs to be restarted before the mods can take effect.</span>
                <div class="horizontalGrid">
                    <button class="stopbutton" onclick="restart()">Restart</button>
                </div>
                `;
            }

            const result = await response.text();
            console.log(result);
        } catch (error) {
            console.error('Error uploading file:', error);
            document.getElementById("upload-content").innerHTML = `
                <div class="close" onclick="closePopups()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </div>
                <h1>Upload Failed</h1>`;
        }
    } else {
        err("No File Selected");
        console.log('No file selected');
    }
}

function offline() {
    if (!offlineDisplayed) {
        displayOpen = true;
        document.getElementById("offline").style.display = "flex";
        offlineDisplayed = true;
    }
}

// Fetch the static file content
async function loadFile() {
    try {
        const response = await fetch(window.origin + '/current-map'); // Fetch the file
        if (!response.ok) throw new Error('File not found');
      
        const content = await response.text(); // Read the file content as text
        displayNodes(content);

        //objects.push(new Player(-253.709, -35.8504, "kjelstromjr"));
        //objects.push(new Player(60, 100, "Morsh"));
    } catch (error) {
        console.error('Error loading file:', error);
    }
}

// Call the function to load the file when the script runs
loadFile();

function getData() {
	fetch(window.location.origin  + "/get-player-position", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin  + ""
        }
    }).then(res => {
        clearPlayers();
        if (res.ok) {
            closeServerPopups();
            return res.json();
        } else if (res.status == 404) {
            offline();
        } else {
            err("Could not get data");
            console.error("Could Not Get Data");
        }
    }).then(json => {
		playerData = json.playerData;
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function getMaps() {
    fetch(window.location.origin  + "/maps", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin  + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Could not load maps!");
            console.log("Could not get maps!");
        }
    }).then(json => {
		maps = json.maps;
        let html = "";

        for (let i = 0; i < maps.length; i++) {
            if (maps[i] === currentMap) {
                html += `<option value="${maps[i]}" selected>${maps[i]}</option>`;
            } else {
                html += `<option value="${maps[i]}">${maps[i]}</option>`;
            }
        }

        document.getElementById("maps").innerHTML = html;

        getMods();
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function getSetup() {
    fetch(window.location.origin  + "/current-setup", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin  + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Could not load the current server settings")
            console.log("Could not get current setup!");
        }
    }).then(json => {
		currentMap = json.map;
        maxPlayers = json.maxPlayers;
        maxCars = json.maxCars;

        document.getElementById("players").value = maxPlayers;
        document.getElementById("cars").value = maxCars;

        getMaps();
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}
getSetup();

function displayPlayers() {
    let data = playerData;

    //console.log(data[0]);
    let online = [];
    offlineDisplayed = false;

    for (let i = 0; i < data.length; i++) {
        try {
            let car = data[i];
            let user = car[0];
            let x = car[2].pos[0];
            let y = car[2].pos[1];

            let player = new Player(x, y, user);

            objects.push(player);
            players.push(player);

            if (!online.includes(user)) {
                online.push(user);
            }
        } catch (e) {
            
        }
    }

    document.getElementById("players-online").textContent = online.length + " / " + maxPlayers;
}

function clearPlayers() {
    for (let i = 0; i < players.length; i++) {
        objects.splice(objects.indexOf(players[i]), 1);
    }

    players = [];
}

function uploadPage() {
    document.getElementById("upload-page").style.left = "0%";
}

function closeUploadPage() {
    document.getElementById("upload-page").style.left = "100%";
}

function getMods() {
    fetch(window.location.origin  + "/mods", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin  + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Could not get maps!");
            console.log("Could not get maps!");
        }
    }).then(json => {
		let active = json.active;
        let disabled = json.disabled;
        let html = "";

        for (let i = 0; i < active.length; i++) {
            let mod = active[i];
            let name = mod.substring(0, mod.length - 4);
            html += `<div class="mod body3">
                        <span>${name}</span>
                        <label class="switch" onmouseup="updateMods(this, event)">
                            <input type="checkbox" name="${name}" id="${name}" checked>
                            <div class="slider"></div>
                        </label>
                    </div>`;
        }

        for (let i = 0; i < disabled.length; i++) {
            let mod = disabled[i];
            let name = mod.substring(0, mod.length - 4);
            html += `<div class="mod body3">
                        <span>${name}</span>
                        <label class="switch" onmouseup="updateMods(this, event)">
                            <input type="checkbox" name="${name}" id="${name}">
                            <div class="slider"></div>
                        </label>
                    </div>`;
        }

        html += `<div id="upload-page" class="page">
                    <div class="back-arrow" onclick="closeUploadPage()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </div>
                    <h1>Upload Mods</h1>
                    <div class="horizontalGrid">
                        <input type="file" name="files" id="files" accept=".zip" multiple>
                    </div>
                    <br><br>
                    <div class="horizontalGrid">
                        <div class="actionbutton" onclick="upload()">Upload</div>
                    </div>
                </div>`;

        document.getElementById("upload-content").innerHTML += html;
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Mod Data");
    });
}

function updateMods(obj, e) {

    e.stopPropagation();

    let mod = obj.parentElement.children[0].textContent;

    if (obj.children[0].checked) {
        if (activated.includes(mod)) {
            activated.splice(activated.indexOf(mod), 1);
        } else {
            deactivated.push(mod);
        }
    } else {
        if (deactivated.includes(mod)) {
            deactivated.splice(deactivated.indexOf(mod), 1);
        } else {
            activated.push(mod);
        }
    }

    document.getElementById("modsUpdateBtn").disabled = false;
}

function changeMods() {

    let d = {
        active: activated,
        disabled: deactivated
    }

    fetch(window.location.origin  + "/change-mods", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin  + ""
        },
        body: JSON.stringify(d)
    }).then(res => {
        if (res.ok) {
            message("Mods updated successfully");
            document.getElementById("upload-content").innerHTML = `
            <div class="close" onclick="closePopups()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
            </div>
            <h1>Upload Successfull</h1>
            <span>The server needs to be restarted before the mods can take effect.</span>
            <div class="horizontalGrid">
                <button class="stopbutton" onclick="restart()">Restart</button>
            </div>
            `;
        } else {
            err("An error occured while changing the mods")
            console.log("Could not update mods!");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
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

if (!debug) {
    dataGetter = window.setInterval(() => {
        getData();
    }, 100);
}