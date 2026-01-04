const rootStyles = getComputedStyle(document.documentElement);
let actionColor = rootStyles.getPropertyValue('--action').trim();

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

let restoreClicked = false;

let wakeLock;
let wakeLocked = true;

let reloadOnUpdate = true;

let version = 0;

let currentAllowed;

let offsetX = 500;
let offsetY = 500;

let playersDisplayed = false;

let mapOffset;

let uploadingPhrases = ["Accessing mainframe", "Downloading consciousness", "Uploading the virus", "Deactivating HAL", "Booting up JARVIS", "Loading program", "Transmitting coordinates", "Executing order 66", "Initiating launch sequence", "Reactor meltdown in T-minus", "Re-routing power", "Preparing for re-entry", "Activating override protocols", "Opening pod bay doors", "Scanning for threats", "Mapping the genome", "Rebuilding the system", "Launching the nukes", "Critical failure imminent", "Diverting all energy to engines", "Decrypting the files", "Bypassing encryption", "Uploading ghost protocol", "Syncing data stream", "Rebuilding neural pathways", "Activating autonomous protocols", "Running diagnostics", "Engaging stealth mode", "AI directive in progress", "Aligning trajectory", "Initiating hyperspace jump", "Docking sequence initiated", "Launching the drone", "Flooding the core chamber"];

objects.push(new Updater());

// Call the function to load the file when the script runs
loadFile();

getSetup();

allowed();

const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
    console.log("Connected");
};

socket.onmessage = (event) => {
    let json = event.data;
    playerData = json.playerData;
    if (json.version !== version) {
        if (version < 1) {
            version = json.version;
        } else {
            if (reloadOnUpdate) {
                window.location.reload();
            }
        }
    }
};

socket.onclose = () => {
    console.log("Disconnected");
};

if (!debug) {
    // Uncomment this if you want to use HTTP for the player data
    // dataGetter = window.setInterval(() => {
    //     getData();
    // }, 100);
}

if (localStorage.getItem("color") === null) {
    document.getElementById("color").value = "#3131e3";
} else {
    document.getElementById("color").value = localStorage.getItem("color");
    actionColor = localStorage.getItem("color");
    document.documentElement.style.setProperty("--action-hover", decreaseHexColor(localStorage.getItem("color"), 10, 10, 54));
}

// Re-request wake lock when the page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

if ((localStorage.getItem("sleep") === "true" || localStorage.getItem("sleep") === null) && ('wakeLock' in navigator)) {
    document.getElementById("sleep").checked = true;
    wakeLocked = true;
    requestWakeLock();
} else if (!('wakeLock' in navigator)) {
    document.getElementById("sleep").disabled = true;
    document.getElementById("sleep").checked = false;
} else {
    document.getElementById("sleep").checked = false;
    wakeLocked = false;
}

if (localStorage.getItem("reloadOnUpdate") === "true" || localStorage.getItem("reloadOnUpdate") === null) {
    document.getElementById("reloadOnUpdate").checked = true;
    reloadOnUpdate = true;
} else {
    document.getElementById("reloadOnUpdate").checked = false;
    reloadOnUpdate = false;
}

document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
        displayOpen = true;
        document.getElementById("admin-popup").style.display = "flex";
        window.setTimeout(() => {
            document.getElementById("adminPassword").focus();
        }, 100);
    }
});