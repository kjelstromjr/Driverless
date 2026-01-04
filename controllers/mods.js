import fs from "fs";
import yauzl from "yauzl";

import { unzipRunAndRemove } from "../utils/utils.js";
import { modsData, modsJsonPath, __dirname } from "../utils/vars.js";

export function mods(req, res) {
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
}

export function uploadMod(req, res) {
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
}

export function deleteMods(req, res) {
    let data = "";

    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        let json = JSON.parse(data);
        let toDelete = json.mods;

        for (let i = 0; i < toDelete.length; i++) {
            let mod = toDelete[i];

            try {
                fs.unlinkSync(`./Resources/Disabled/${mod}.zip`);
            } catch (err) {
                console.log("Failed to delete file");
            }

            try {
                fs.unlinkSync(`./Roads/${mod}.rds`);
            } catch (err) {

            }
        }

        res.status(200).end();
    });
}

export function changeMods(req, res) {
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
}

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