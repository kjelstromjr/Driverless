import { addedMaps, currentMap, maxPlayers, maxCars, title, visibility, description, serverData, setSetup, __dirname, modsData } from "../utils/vars.js";
import { beamProcess, restartBeam } from "../utils/beam.js";
import { updateLineSync, broadcast } from "../utils/utils.js";

const defaultMaps = ["gridmap_v2", "johnson_valley", "automation_test_track", "east_coast_usa", "hirochi_raceway", "italy", "jungle_rock_island", "Industrial", "small_island", "smallgrid", "Utah", "west_coast_usa", "driver_training", "derby"];
let playerData = [];
let version = 1;

export function playerPosition(req, res) {
    const { points } = req.body;
    // console.log(`Points: ${JSON.stringify(points)}`);
    playerData = points;

    broadcast({playerData: playerData, version: version});

    res.status(200).send('Position received');
}

export function getPlayerPosition(req, res) {
    res.json({playerData: playerData, version: version});
    res.status(200).end();
}

export function map(req, res) {
    res.json({maps: defaultMaps.concat(addedMaps)});
}

export function currentSetup(req, res) {
    res.json({
        map: currentMap,
        maxPlayers: maxPlayers,
        maxCars: maxCars,
        name: title,
        visibility: visibility,
        description: description,
        mapOffset: serverData.offsets.find(i => i.map === currentMap)
    });
    res.status(200).end();
}

export function getCurrentMap(req, res) {
    res.sendFile(__dirname + "/Roads/" + currentMap + ".rds");
}

export function updateSettings(req, res) {
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
            let privateV = json.visibility;
            let desc = json.description;

            if (map === undefined || players === undefined || cars === undefined || serverName === undefined || privateV === undefined || desc === undefined) {
                return res.status(403).end();
            }

            if (privateV === "private") {
                privateV = true;
            } else {
                privateV = false;
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

            try {
                updateLineSync(__dirname + "/ServerConfig.toml", 31, `Map = "/levels/${modsData.mapNames.find(m => m.file === "stupid_monaco_1_8").map}/info.json"`);
            } catch (e) {
                console.log("Map name not found, trying to use default");
                updateLineSync(__dirname + "/ServerConfig.toml", 31, `Map = "/levels/${map}/info.json"`);
            }
            updateLineSync(__dirname + "/ServerConfig.toml", 30, `MaxPlayers = ${players}`);
            updateLineSync(__dirname + "/ServerConfig.toml", 12, `MaxCars = ${cars}`);
            updateLineSync(__dirname + "/ServerConfig.toml", 18, `Name = "${serverName}"`);
            updateLineSync(__dirname + "/ServerConfig.toml", 19, `Private = ${privateV}`);
            updateLineSync(__dirname + "/ServerConfig.toml", 11, `Description = "${desc}"`);

            // Restart the BeamMP server process asynchronously
            console.log("Starting new process...");
            restartBeam();
            setSetup(map, players, cars, serverName, privateV, desc);

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
}