import fs from "fs";

import { hashStringSHA256, updateLineSync, updateDataFile } from "../utils/utils.js";
import { dataJsonPath, serverData, __dirname } from "../utils/vars.js";

export function adminSetup(req, res) {
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
            console.error(e);
            res.status(500).end();
        }
    });
}

export function adminLogin(req, res) {
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
}

export function allowed(req, res) {
    res.json({allowed: serverData.allowed});
    res.status(200).end();
}

export function setAllowed(req, res) {
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
}

export function setMapOffset(req, res) {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        let json = JSON.parse(data);

        if (serverData.offsets === undefined) {
            serverData.offsets = [];
        }

        let entry = serverData.offsets.find(i => i.map === json.map);

        if (entry === undefined) {
            serverData.offsets.push({
                map: json.map,
                x: json.x,
                y: json.y,
                scale: json.scale
            });
        } else {
            entry.x = json.x;
            entry.y = json.y;
            entry.scale = json.scale;
        }

        updateDataFile();

        res.status(200).end();
    });
}