import { spawn } from "child_process";

import { setup } from './vars.js';

export let beamProcess;
let executable = './BeamMP-Server.ubuntu.22.04.x86_64';

export function beamSetup() {
    if (!setup) {
        beamProcess = spawn(executable);

        beamProcess.stdout.on('data', (data) => {
          console.log(`${data}`);
        });

        beamProcess.stderr.on('data', (data) => {
          console.error(`Error: ${data}`);
        });
    }
}

export function restartBeam() {
    beamProcess = spawn(executable);
}