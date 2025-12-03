// Node.js server to receive player positions from Lua script

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const yauzl = require('yauzl');
const AdmZip = require('adm-zip');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = 3000;

let playerData = [];

const defaultMaps = ["gridmap_v2", "johnson_valley", "automation_test_track", "east_coast_usa", "hirochi_raceway", "italy", "jungle_rock_island", "Industrial", "small_island", "smallgrid", "Utah", "west_coast_usa", "driver_training", "derby"];
let addedMaps = [];
let disabledMods = [];
let maxPlayers = -1;
let maxCars = -1;
let currentMap = "";
let title = "";
let description = "";
let visibility = false;

let exit = false;

let version = 1;

let setup = false;

const { spawn } = require('child_process');

const dataJsonPath = path.join(__dirname, "data.json");

let serverData = {
    key: "",
    password: "",
    allowed: []
}

if (!fs.existsSync(dataJsonPath)) {
    fs.writeFileSync(dataJsonPath, JSON.stringify(serverData), 'utf8');
}

currData = fs.readFileSync(dataJsonPath, 'utf-8');
if (!currData || currData.trim() === '') {
    fs.writeFileSync(dataJsonPath, JSON.stringify(serverData), 'utf8');
}

serverData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));

if (serverData.key === "" || serverData.password === "") {
    console.log("Looks like we need to do some setup, please go to the webpage");
    setup = true;
}

let beamProcess;

if (!setup) {
    beamProcess = spawn('./BeamMP-Server.ubuntu.22.04.x86_64');

    beamProcess.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    beamProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });
}

// Adjust these paths:
const pluginDir = path.join(__dirname, "Resources/Server/DriverlessPlugin");
const sourceFile = path.join(__dirname, "plugins/Driverless.lua");        // Where the file currently is
const destFile = path.join(pluginDir, "Driverless.lua");           // Where it should end up

function ensurePluginFile() {
  // Create directory if missing
  if (!fs.existsSync(pluginDir)) {
    console.log("DriverlessPlugin directory missing — creating it...");
    fs.mkdirSync(pluginDir, { recursive: true });
  }

  // If the file is already in the directory, stop
  if (fs.existsSync(destFile)) {
    // console.log("Lua file already exists in DriverlessPlugin. Nothing to do.");
    return;
  }

  // Ensure source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error("Source Lua file does NOT exist. Cannot move.");
    return;
  }

  // Move the file
  try {
    try {
        fs.renameSync(sourceFile, destFile);    } catch (err) {
        if (err.code === 'EXDEV') {
            // Copy + unlink fallback
            fs.copyFileSync(sourceFile, destFile);
            fs.unlinkSync(sourceFile);
        } else {
            throw err;
        }
    }
    console.log("Lua file moved successfully!");
  } catch (err) {
    console.error("Error moving file:", err);
  }
}

ensurePluginFile();

function hashStringSHA256(str) {
  return crypto.createHash('sha256')
               .update(str)
               .digest('hex');
}

function updateLineSync(filePath, lineNumber, newContent) {
    console.log(filePath);
    let data = fs.readFileSync(filePath, "utf8");
    let lines = data.split(/\r?\n/);

    lines[lineNumber - 1] = newContent;

    fs.writeFileSync(filePath, lines.join("\n"));
}

// app.use(bodyParser.json());
// app.use(fileUpload());

let serverConfig = fs.readFileSync("./ServerConfig.toml", "utf8");

if (serverConfig === "") {
    console.log("Failed to read ServerConfig.toml. Retrying...");
    serverConfig = fs.readFileSync("./ServerConfig.toml", "utf8");
}

serverConfig = serverConfig.split("\n");

for (let i = 0; i < serverConfig.length; i++) {
    let line = serverConfig[i];

    if (line.includes("Map")) {
        let mapLine = line.split("/");
        currentMap = mapLine[2];
    } else if (line.includes("MaxPlayers")) {
        let playersLine = line.split(" ");
        maxPlayers = parseInt(playersLine[2]);
    } else if (line.includes("MaxCars")) {
        let carsLine = line.split(" ");
        maxCars = parseInt(carsLine[2])
    } else if (line.includes("Name")) {
        let nameLine = line.split("\"");
        title = nameLine[1];
    } else if (line.includes("Private")) {
        let privateLine = line.split(" ");
        visibility = privateLine[2];
    } else if (line.includes("Description")) {
        let descLine = line.split("\"");
        description = descLine[1];
    }
}

if (currentMap === "") {
    console.log("Map not found in ServerConfig.toml. Check to make sure it is set up properly.");
    console.log("Ex: Map = \"/levels/west_coast_usa/info.json\"");
    exit = true;
}

if (maxPlayers == -1) {
    console.log("Max players not found in ServerConfig.toml. Check to make sure it is set up properly.");
    console.log("Ex: MaxPlayers = 8");
    exit = true;
}

if (maxCars == -1) {
    console.log("Max cars not found in ServerConfig.toml. Check to make sure it is set up properly.");
    console.log("Ex: MaxCars = 10");
    exit = true;
}

const modsJsonPath = path.join(__dirname, "mods.json");

if (!fs.existsSync(modsJsonPath)) {
    fs.writeFileSync(modsJsonPath, `{"maps":[],"addons":[]}`, 'utf8');
    console.log(`mods.json was created.`);
}



let modsData = fs.readFileSync(modsJsonPath, 'utf-8');
if (!modsData || modsData.trim() === '') {
    fs.writeFileSync(modsJsonPath, `{"maps":[],"addons":[]}`, 'utf8');
    console.log(`mods.json was empty, initialized with defaults.`);
}

modsData = JSON.parse(fs.readFileSync(modsJsonPath, 'utf-8'));

addedMaps = modsData.maps;

if (!fs.existsSync('./Resources/Disabled')) {
    fs.mkdirSync('./Resources/Disabled', { recursive: true });
}

fs.readdirSync("./Resources/Disabled", (err, files) => {
    if (err) {
        console.log("Unable to read Disabled directory");
        console.error(err);
        exit = true;
    }

    disabledMods = files;
});

if (exit) {
    process.exit();
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    if (setup) {
        res.sendFile(__dirname + "/views/setup.html");
    } else {
        res.sendFile(__dirname + "/views/index.html");
    }
});

app.post('/setup', (req, res) => {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        try {
            let json = JSON.parse(data);
            let key = json.key;
            let password = json.password;

            serverData.key = key;
            serverData.password = hashStringSHA256(password);
            serverData.allowed = ["mods", "map", "numPlayers", "numCars"];

            fs.writeFileSync(dataJsonPath, JSON.stringify(serverData), 'utf8');
            updateLineSync(__dirname + "/ServerConfig.toml", 29, `AuthKey = "${serverData.key}"`);

            console.log("The process is about to exit...");
            console.log("If you are viewing the logs without the docker-compose \"-d\" flag (ex: docker-compose up), you may need to exit to view the logs or open a new terminal");

            process.exit(0);
        } catch (e) {
            res.status(500).end();
        }
    });
});

app.post('/admin-login', (req, res) => {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        let json = JSON.parse(data);
        let password = json.password;

        if (hashStringSHA256(password) === serverData.password) {
            res.status(200).end();
        } else {
            res.status(404).end();
        }
    });
});

app.get("/allowed", (req, res) => {
    res.json({allowed: serverData.allowed});
    res.status(200).end();
});

app.post("/set-allowed", (req, res) => {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        let json = JSON.parse(data);

        if (json.allowed === undefined) {
            res.status(403).end();
        }

        serverData.allowed = json.allowed;

        fs.writeFileSync(dataJsonPath, JSON.stringify(serverData), 'utf8');

        res.status(200).end();
    });
});

// Endpoint to receive player position data
app.post('/player-position', bodyParser.json(), (req, res) => {
    const { points } = req.body;
    // console.log(`Points: ${JSON.stringify(points)}`);
    playerData = points;
    res.status(200).send('Position received');
});

app.post("/get-player-position", (req, res) => {
    res.json({playerData: playerData, version: version});
    res.status(200).end();
});

app.post("/maps", (req, res) => {
    res.json({maps: defaultMaps.concat(addedMaps)});
});

app.post("/current-setup", (req, res) => {
    res.json({
        map: currentMap,
        maxPlayers: maxPlayers,
        maxCars: maxCars,
        name: title,
        visibility: visibility,
        description: description
    });
    res.status(200).end();
});

app.get("/current-map", (req, res) => {
    res.sendFile(__dirname + "/Roads/" + currentMap + ".rds");
});

// TODO: Update for changing all settings
app.post("/update-settings", (req, res) => {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        try {
            const json = JSON.parse(data);
            const map = json.map;
            const players = json.maxPlayers;
            const cars = json.maxCars;
            const serverName = json.name;
            let private = json.visibility;
            let desc = json.description;

            if (map === undefined || players === undefined || cars === undefined || serverName === undefined || private === undefined || desc === undefined) {
                return res.status(403).end();
            }

            if (private === "private") {
                private = true;
            } else {
                private= false;
            }

            if (players < 0 || cars < 0) {
                return res.status(403).end();
            }

            if (!defaultMaps.includes(map) && !addedMaps.includes(map)) {
                console.log(`${map} not found in maps list`);
                return res.status(404).end();
            }

            // Kill the existing process (if running)
            if (beamProcess) {
                console.log("Killing existing process...");
                beamProcess.kill();
            }

            // Update configuration with new map
            console.log("Updating map in configuration...");
            // let settings = fs.readFileSync("./ServerConfig.toml", "utf8").split("\n");
            // for (let i = 0; i < settings.length; i++) {
            //     if (settings[i].includes("Map")) {
            //         let mapLine = settings[i].split("/");
            //         settings[i] = `${mapLine[0]}/${mapLine[1]}/${map}/${mapLine[3]}`;
            //     } else if (settings[i].includes("MaxPLayers")) {
            //         let line = settings[i].split(" ");
            //         settings[i] = `${line[0]} ${mapLine[1]} ${players}`;
            //     } else if (settings[i].includes("MaxCars")) {
            //         let line = settings[i].split(" ");
            //         settings[i] = `${line[0]} ${line[1]} ${cars}`;
            //     }
            // }
            // fs.writeFileSync("./ServerConfig.toml", settings.join("\n"));

            updateLineSync(__dirname + "/ServerConfig.toml", 31, `Map = "/levels/${map}/info.json"`);
            updateLineSync(__dirname + "/ServerConfig.toml", 30, `MaxPlayers = ${players}`);
            updateLineSync(__dirname + "/ServerConfig.toml", 12, `MaxCars = ${cars}`);
            updateLineSync(__dirname + "/ServerConfig.toml", 18, `Name = "${serverName}"`);
            updateLineSync(__dirname + "/ServerConfig.toml", 19, `Private = ${private}`);
            updateLineSync(__dirname + "/ServerConfig.toml", 11, `Description = "${desc}"`);

            // Restart the BeamMP server process asynchronously
            console.log("Starting new process...");
            beamProcess = spawn("./BeamMP-Server.ubuntu.22.04.x86_64");
            currentMap = map;
            maxPlayers = players;
            maxCars = cars;
            title = serverName;
            visibility = private;
            description = desc;

            beamProcess.stdout.on('data', (data) => {
                console.log(`${data}`);
                return res.status(200).end();
            });

            beamProcess.stderr.on('data', (data) => {
                console.error(`Error: ${data}`);
            });

            version++;
        } catch (error) {
            console.error("Error in request handling:", error);
            return res.status(500).end();
        }
    });
});

app.get("/mods", (req, res) => {
    let modsPath = __dirname + "/Resources/Client"; // replace with your directory path
    let disabledPath = __dirname + "/Resources/Disabled";

    let data = {};

    fs.readdir(modsPath, (err, files) => {
        if (err) {
          return console.log('Unable to scan directory: ' + err);
        }
        // List all files and directories in the directory
        data.active = files;

        fs.readdir(disabledPath, (err, otherFiles) => {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }

            data.disabled = otherFiles;

            res.json(data);
            res.status(200).end();
        });
    });
});

app.post("/upload-mod", fileUpload(), (req, res) => {
    console.log("Request Recieved");

    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    console.log("Saving file...");
    const uploadedFile = req.files.file;

    // Save the file to the specified directory
    uploadedFile.mv("./Resources/Client/" + uploadedFile.name, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        isMap("./Resources/Client/" + uploadedFile.name)
            .then(result => {
                if (result) {
                    unzipRunAndRemove("./Resources/Client/" + uploadedFile.name, "./Temp", uploadedFile.name.substring(0, uploadedFile.name.length - 4));
                    if (!modsData.maps.includes(uploadedFile.name.substring(0, uploadedFile.name.length - 4))) {
                        modsData.maps.push(uploadedFile.name.substring(0, uploadedFile.name.length - 4));
                    }
                } else {
                    if (!modsData.addons.includes(uploadedFile.name.substring(0, uploadedFile.name.length - 4))) {
                        modsData.addons.push(uploadedFile.name.substring(0, uploadedFile.name.length - 4));
                    }
                }

                fs.writeFileSync(modsJsonPath, JSON.stringify(modsData, null, 2));
                res.status(200).send('File uploaded successfully');
            })
            .catch(err => {
                console.error(err);
            });
    });
});

app.post("/change-mods", (req, res) => {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", async () => {
        let json = JSON.parse(data);

        let active = json.active;
        let disabled = json.disabled;

        for (let i = 0; i < active.length; i++) {
            try {

                try {
                    fs.renameSync(`./Resources/Disabled/${active[i]}.zip`, `./Resources/Client/${active[i]}.zip`)
                } catch (err) {
                    if (err.code === 'EXDEV') {
                        // Copy + unlink fallback
                        fs.copyFileSync(`./Resources/Disabled/${active[i]}.zip`, `./Resources/Client/${active[i]}.zip`);
                        fs.unlinkSync(`./Resources/Disabled/${active[i]}.zip`);
                    } else {
                        throw err;
                    }
                }

                try {
                    let result = await isMap("./Resources/Client/" + active[i] + ".zip");
                    if (result) {
                        modsData.maps.push(active[i]);
                    } else {
                        modsData.addons.push(active[i]);
                    }
                } catch (err) {
                    console.error(err);
                }
            } catch (e) {
                console.error(e);
                res.status(500).end();
                break;
            }
        }

        for (let i = 0; i < disabled.length; i++) {
            if (modsData.maps.includes(disabled[i])) {
                modsData.maps.splice(modsData.maps.indexOf(disabled[i]), 1);
            }

            if (modsData.addons.includes(disabled[i])) {
                modsData.addons.splice(modsData.addons.indexOf(disabled[i]), 1);
            }

            try {
                try {
                    fs.renameSync(`./Resources/Client/${disabled[i]}.zip`, `./Resources/Disabled/${disabled[i]}.zip`)
                } catch (err) {
                    if (err.code === 'EXDEV') {
                        // Copy + unlink fallback
                        fs.copyFileSync(`./Resources/Client/${disabled[i]}.zip`, `./Resources/Disabled/${disabled[i]}.zip`);
                        fs.unlinkSync(`./Resources/Client/${disabled[i]}.zip`);
                    } else {
                        throw err;
                    }
                }
            } catch (e) {
                console.error(e);
                res.status(500).end();
                break;
            }
        }

        console.log(modsData);

        fs.writeFileSync(modsJsonPath, JSON.stringify(modsData, null, 2));

        res.status(200).end();
    });
});

app.listen(PORT, () => {
    console.log(`Node.js server running on http://localhost:${PORT}`);
});

function isMap(file) {
    return new Promise((resolve, reject) => {
        yauzl.open(file, { lazyEntries: true }, (err, zipfile) => {
            if (err) {
                reject(err);
                return;
            }
            
            let hasLevelsDir = false;

            zipfile.readEntry();
            zipfile.on("entry", entry => {
                // Check if the entry is a directory named 'levels'
                if (entry.fileName === "levels/" && /\/$/.test(entry.fileName)) {
                    hasLevelsDir = true;
                }
                zipfile.readEntry();
            });

            zipfile.on("end", () => {
                resolve(hasLevelsDir);
            });

            zipfile.on("error", err => {
                reject(err);
            });
        });
    });
}

async function unzipRunAndRemove(zipFilePath, extractTo, fileName) {
    try {
        // Unzip the file
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractTo, true); // Extract all files to the specified directory
        console.log(`Extracted files to ${extractTo}`);
        
        // Run the road-finder program
        console.log(`Running road-finder...`);
        await new Promise((resolve, reject) => {

            let finder = spawn(__dirname + `/road-finder`, [`${extractTo}`, `${fileName}`]);

            // Handle stdout
            finder.stdout.on('data', (data) => {
                console.log(`road-finder stdout: ${data}`);
            });

            // Handle stderr
            finder.stderr.on('data', (data) => {
                console.error(`road-finder stderr: ${data}`);
            });

            finder.on("error", (error) => {
                console.error("Error starting BeamMP process:", error);
            });

            finder.on("close", (code) => {
                if (code === 0) {
                    try {
                        fs.renameSync(`./${fileName}.rds`, `./Roads/${fileName}.rds`)
                    } catch (err) {
                        if (err.code === 'EXDEV') {
                            // Copy + unlink fallback
                            fs.copyFileSync(`./${fileName}.rds`, `./Roads/${fileName}.rds`);
                            fs.unlinkSync(`./${fileName}.rds`);
                        } else {
                            throw err;
                        }
                    }
                    
                    resolve();
                } else {
                    reject(new Error(`road-finder exited with code ${code}`));
                }
            });
        });

        fs.rmSync(extractTo, { recursive: true, force: true });
        console.log(`Removed directory: ${extractTo}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}