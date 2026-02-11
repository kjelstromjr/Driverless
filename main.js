import express from "express"
import bodyParser from "body-parser";
import fs from "fs";
import fileUpload from "express-fileupload";
import http from "http";
import https from "https";
import { WebSocketServer } from "ws";

const app = express();

import { setupServer } from "./utils/setup.js";
import { setup, __dirname } from "./utils/vars.js";
import { setSockerServer } from "./utils/utils.js";

import * as adminController from "./controllers/admin.js";
import * as gameController from "./controllers/game.js";
import * as modsController from "./controllers/mods.js";

setupServer();

let config = JSON.parse(fs.readFileSync(__dirname + "/config/server.config.json"));

const PORT = config.port;

let isSecure = config.https.enabled;

let server;

if (isSecure) {
    const options = {
    	key: fs.readFileSync(config.https.keyPath),
      	cert: fs.readFileSync(config.https.certPath)
    };
    server = https.createServer(options, app);
} else {
    server = http.createServer(app);
}

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("Client connected for player positions");
});



setSockerServer(wss);

app.use(express.static('public'));

app.get('/', (req, res) => {
    if (setup) {
        res.sendFile(__dirname + "/views/setup.html");
    } else {
        res.sendFile(__dirname + "/views/index.html");
    }
});

// Admin
app.post('/setup', adminController.adminSetup);
app.post('/admin-login', adminController.adminLogin);
app.get("/allowed", adminController.allowed);
app.post("/set-allowed", adminController.setAllowed);
app.post("/set-map-offset", adminController.setMapOffset);

// Game
app.post('/player-position', bodyParser.json(), gameController.playerPosition);
app.post("/get-player-position", gameController.getPlayerPosition);
app.post("/maps", gameController.map);
app.post("/current-setup", gameController.currentSetup);
app.get("/current-map", gameController.getCurrentMap);
app.post("/update-settings", gameController.updateSettings);

// Mods
app.get("/mods", modsController.mods);
app.post("/upload-mod", fileUpload(), modsController.uploadMod);
app.delete("/delete-mods", modsController.deleteMods);
app.post("/change-mods", modsController.changeMods);


server.listen(PORT, () => {
    if (isSecure) {
        console.log(`Node.js server running on https://localhost:${PORT}`);
    } else {
        console.log(`Node.js server running on http://localhost:${PORT}`);
    }
});