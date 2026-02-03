function restart() {
    window.clearInterval(dataGetter);
    closePopups();
    restarting();

    let data = {
        map: document.getElementById("maps").value,
        maxPlayers: document.getElementById("players").value,
        maxCars: document.getElementById("cars").value,
        name: document.getElementById("serverName").value,
        description: document.getElementById("serverDescription").value,
        visibility: document.getElementById("visibility-options").value
    }

    fetch(window.location.origin + "/update-settings", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.ok) {
            window.location.reload();
        } else if (res.status === 404) {
            message("Map not found, setting map to default");
            window.setTimeout(() => {
                document.getElementById("maps").value = "gridmap_v2";
                restart();
            }, 3000);
        } else {
            err("Could not Restart");
            console.error("Could Not Restart");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });

    // window.setTimeout(() => {
    //     window.location.reload();
    // }, 1000);
}

function uploadFile(formData) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "/upload-mod");

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setProgressBar((e.loaded / e.total) * 90);
            }
        };

        xhr.onload = () => {
            const response = {
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                text: () => Promise.resolve(xhr.responseText),
                json: () => Promise.resolve(JSON.parse(xhr.responseText))
            };

            resolve(response);
        };

        xhr.onerror = reject;

        xhr.send(formData);
    });
}

function setProgressBar(percent) {
    document.getElementById("progress-bar").style.width = `${percent}%`;
}

async function upload() {
    if (document.getElementById("files").value === "") {
        message("Please Select a File to Upload");
        return;
    }
    
    const fileInput = document.getElementById('files');
    const file = fileInput.files[0];

    if (file) {
        document.getElementById("upload-content").innerHTML = `<div class="container">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div id="progress">
                <div id="progress-bar"></div>
            </div>
            <h3 id="uploadMessage">Uploading files...</h3>
            <span id="yup" style="display: none">Yup, still going</span>`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // window.setTimeout(() => {
            //     document.getElementById("yup").style.display = "block";
            // }, 60000);

            window.setInterval(() => {
                document.getElementById("uploadMessage").textContent = uploadingPhrases[Math.round(Math.random() * (uploadingPhrases.length - 1))] + "...";
            }, 10000);

            // const response = await fetch(window.location.origin + "/upload-mod", {
            //     method: 'POST',
            //     body: formData,
            // });

            const response = await uploadFile(formData);

            if (!response.ok) {
                document.getElementById("upload-content").innerHTML = `
                <div class="close" onclick="closePopups()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </div>
                <h1>Upload Failed</h1>`;
            } else {
                document.getElementById("upload-content").innerHTML = `
                <div class="close" onclick="closePopups()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </div>
                <h1>Upload Successfull</h1>
                <span>The server needs to be restarted before the mods can take effect.</span>
                <div class="horizontalGrid">
                    <button class="stopbutton" onclick="restart()">Restart</button>
                </div>
                `;
            }

            // const result = await response.text();
            // console.log(result);
        } catch (error) {
            console.error('Error uploading file:', error);
            if (!debug) {
                document.getElementById("upload-content").innerHTML = `
                <div class="close" onclick="closePopups()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </div>
                <h1>Upload Failed</h1>`;
            }
        }
    } else {
        err("No File Selected");
        console.log('No file selected');
    }
}

function getData() {
	fetch(window.location.origin + "/get-player-position", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        }
    }).then(res => {
        clearPlayers();
        if (res.ok) {
            closeServerPopups();
            return res.json();
        } else if (res.status == 404) {
            offline();
        } else {
            err("Could not get data");
            console.error("Could Not Get Data");
        }
    }).then(json => {
		playerData = json.playerData;
        if (json.version !== version) {
            if (version < 1) {
                version = json.version;
                //document.getElementById("players-online").style.display = "none";
                //document.getElementById("mods").style.display = "none";
                //document.getElementById("server")
            } else {
                if (reloadOnUpdate) {
                    window.location.reload();
                }
            }
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function getMaps() {
    fetch(window.location.origin + "/maps", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Could not load maps!");
            console.log("Could not get maps!");
        }
    }).then(json => {
		maps = json.maps;
        let html = "";

        for (let i = 0; i < maps.length; i++) {
            if (maps[i] === currentMap) {
                html += `<option value="${maps[i]}" selected>${maps[i]}</option>`;
            } else {
                html += `<option value="${maps[i]}">${maps[i]}</option>`;
            }
        }

        document.getElementById("maps").innerHTML = html;

        getMods();
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function getSetup() {
    fetch(window.location.origin + "/current-setup", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Could not load the current server settings")
            console.log("Could not get current setup!");
        }
    }).then(json => {
		currentMap = json.map;
        maxPlayers = json.maxPlayers;
        maxCars = json.maxCars;
        mapOffset = json.mapOffset;

        document.getElementById("players").value = maxPlayers;
        document.getElementById("cars").value = maxCars;

        document.getElementById("serverName").value = json.name;

        document.getElementById("serverDescription").value = json.description;

        if (json.visibility === "true" || json.visibility === true) {
            document.getElementById("visibility-options").value = "private";
        } else {
            document.getElementById("visibility-options").value = "public";
        }

        if (mapOffset !== undefined) {
            fx = mapOffset.x;
            fy = mapOffset.y;
            scale = mapOffset.scale;
        }

        getMaps();
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

let isOffsetOn = false;

function offsetMap() {
    if (!isOffsetOn) {
        document.getElementById("offseton").style.display = "block";
        isOffsetOn = true;
    } else {
        document.getElementById("offseton").style.display = "none";
        isOffsetOn = false;
        fetch(window.location.origin + "/set-map-offset", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Origin": window.location.origin + ""
            },
            body: JSON.stringify({
                map: currentMap,
                x: fx,
                y: fy,
                scale: scale
            })
        }).then(res => {
            if (res.ok) {
                message("Map offset updated");
            } else {
                err("Something went wrong");
            }
        }).catch(err => {
            console.error(err);
            err("An Error Occurred While Loading Data");
        });
    }
}

async function loadFile() {
    try {
        const response = await fetch(window.origin + '/current-map'); // Fetch the file
        if (!response.ok) throw new Error('File not found');
      
        const content = await response.text(); // Read the file content as text
        displayNodes(content);

        //objects.push(new Player(-253.709, -35.8504, "kjelstromjr"));
        //objects.push(new Player(60, 100, "Morsh"));
    } catch (error) {
        console.error('Error loading file:', error);
    }
}