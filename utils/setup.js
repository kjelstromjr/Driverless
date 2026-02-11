import path from "path";
import fs from "fs";

import { varsSetup, __dirname } from "./vars.js";
import { beamSetup } from "./beam.js";

const pluginDir = path.join(__dirname, "beammp/Resources/Server/DriverlessPlugin");
const sourceFile = path.join(__dirname, "plugins/Driverless.lua");
const destFile = path.join(pluginDir, "Driverless.lua");

export function setupServer() {

    checkStructure();
    ensurePluginFile();

    if (!fs.existsSync('./beammp/Resources/Disabled')) {
        fs.mkdirSync('./beammp/Resources/Disabled', { recursive: true });
    }

    beamSetup();
    setTimeout(varsSetup, 1000);
}

function checkStructure() { // Finish for /config and /Roads
    let dirs = ["./beammp/Resources", "./beammp/Resources/Client", "./beammp/Resources/Disabled", "./beammp/Resources/Server"];

    for (let i = 0; i < dirs.length; i++) {
        if (!fs.existsSync(dirs[i])) {
            fs.mkdirSync(dirs[i], {recursive: true});
            console.log(`Created ${dirs[i]}`);
        }
    }

    if (!fs.existsSync("./beammp/BeamMP-Server.ubuntu.22.04.x86_64")) {
        fs.copyFileSync("./beammp-src/BeamMP-Server.ubuntu.22.04.x86_64", "./beammp/BeamMP-Server.ubuntu.22.04.x86_64");
        console.log("Copied beammp executable");
    }

    let configFiles = fs.readdirSync("./config-src");

    for (let i = 0; i < configFiles.length; i++) {
        if (!fs.existsSync(`./config/${configFiles[i]}`)) {
            fs.copyFileSync(`./config-src/${configFiles[i]}`, `./config/${configFiles[i]}`);
            console.log(`Copied ./config/${configFiles[i]}`);
        }
    }

    let roadsFiles = fs.readdirSync("./Roads-src");

    for (let i = 0; i < roadsFiles.length; i++) {
        if (!fs.existsSync(`./Roads/${roadsFiles[i]}`)) {
            fs.copyFileSync(`./Roads-src/${roadsFiles[i]}`, `./Roads/${roadsFiles[i]}`);
            console.log(`Copied ./Roads/${roadsFiles[i]}`);
        }
    }
}

function ensurePluginFile() {
  // Create directory if missing
  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
    console.log("Created /beammp/Resources/Server/DriverlessPlugin");
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
    console.log("Lua file moved");
  } catch (err) {
    console.error("Error moving file:", err);
  }
}