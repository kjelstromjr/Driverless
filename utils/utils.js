import AdmZip from 'adm-zip';
import crypto from "crypto";
import * as fs from "fs";
import { spawn } from "child_process";

import { __dirname, dataJsonPath, serverData } from './vars.js';

let wss;

export function hashStringSHA256(str) {
  return crypto.createHash('sha256')
               .update(str)
               .digest('hex');
}

export function updateLineSync(filePath, lineNumber, newContent) {
    console.log(filePath);
    let data = fs.readFileSync(filePath, "utf8");
    let lines = data.split(/\r?\n/);

    lines[lineNumber - 1] = newContent;

    fs.writeFileSync(filePath, lines.join("\n"));
}

export async function unzipRunAndRemove(zipFilePath, extractTo, fileName) {
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

export function updateDataFile() {
    fs.writeFileSync(dataJsonPath, JSON.stringify(serverData), 'utf8');
}

export function broadcast(data) {
    const message = JSON.stringify(data);

    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

export function setSockerServer(server) {
    wss = server;
}
