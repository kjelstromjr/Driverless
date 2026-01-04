import path from "path";
import fs from "fs";

import { varsSetup, __dirname } from "./vars.js";
import { beamSetup } from "./beam.js";

const pluginDir = path.join(__dirname, "Resources/Server/DriverlessPlugin");
const sourceFile = path.join(__dirname, "plugins/Driverless.lua");
const destFile = path.join(pluginDir, "Driverless.lua");

export function setupServer() {

    ensurePluginFile();

    if (!fs.existsSync('./Resources/Disabled')) {
        fs.mkdirSync('./Resources/Disabled', { recursive: true });
    }

    varsSetup();
    beamSetup();
}

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