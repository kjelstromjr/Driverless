import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = "/app/";

export const dataJsonPath = path.join(__dirname, "data.json");
export const modsJsonPath = path.join(__dirname, "mods.json");
export let serverConfig = fs.readFileSync("./ServerConfig.toml", "utf8");
export let modsData = fs.readFileSync(modsJsonPath, 'utf-8');
export let addedMaps = [];
export let maxPlayers = -1;
export let maxCars = -1;
export let currentMap = "";
export let title = "";
export let description = "";
export let visibility = false;
export let setup = false;

export let serverData = {
    key: "",
    password: "",
    allowed: [],
    offsets: []
}

export function varsSetup() {
    if (!fs.existsSync(modsJsonPath)) {
        fs.writeFileSync(modsJsonPath, `{"maps":[],"addons":[]}`, 'utf8');
        console.log(`mods.json was created.`);
    }

    if (!modsData || modsData.trim() === '') {
        fs.writeFileSync(modsJsonPath, `{"maps":[],"addons":[]}`, 'utf8');
        console.log(`mods.json was empty, initialized with defaults.`);
    }
    modsData = JSON.parse(fs.readFileSync(modsJsonPath, 'utf-8'));
    addedMaps = modsData.maps;

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
        process.exit();
    }
    
    if (maxPlayers == -1) {
        console.log("Max players not found in ServerConfig.toml. Check to make sure it is set up properly.");
        console.log("Ex: MaxPlayers = 8");
        process.exit();
    }
    
    if (maxCars == -1) {
        console.log("Max cars not found in ServerConfig.toml. Check to make sure it is set up properly.");
        console.log("Ex: MaxCars = 10");
        process.exit();
    }

    if (!fs.existsSync(dataJsonPath)) {
        fs.writeFileSync(dataJsonPath, JSON.stringify(serverData), 'utf8');
    }
    
    serverData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));

    if (serverData.key === "" || serverData.password === "") {
        console.log("Looks like we need to do some setup, please go to the webpage");
        setup = true;
    }
}

export function setSetup(map, players, cars, serverName, vis, desc) {
    currentMap = map;
    maxPlayers = players;
    maxCars = cars;
    title = serverName;
    visibility = vis;
    description = desc;
}