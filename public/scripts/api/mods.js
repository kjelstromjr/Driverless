function getMods() {
    fetch(window.location.origin + "/mods", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Could not get maps!");
            console.log("Could not get maps!");
        }
    }).then(json => {
		let active = json.active;
        let disabled = json.disabled;
        let html = "";

        for (let i = 0; i < active.length; i++) {
            let mod = active[i];
            let name = mod.substring(0, mod.length - 4);
            if (name === "mods.") {
                continue;
            }
            html += `<div class="option body3">
                        <span>${name}</span>
                        <label class="switch" onmouseup="updateMods(this, event)">
                            <input type="checkbox" name="${name}" id="${name}" checked>
                            <div class="slider"></div>
                        </label>
                    </div>`;
        }

        for (let i = 0; i < disabled.length; i++) {
            let mod = disabled[i];
            let name = mod.substring(0, mod.length - 4);
            html += `<div class="option body3">
                        <span>${name}</span>
                        <label class="switch" onmouseup="updateMods(this, event)">
                            <input type="checkbox" name="${name}" id="${name}">
                            <div class="slider"></div>
                        </label>
                    </div>`;
        }

        html += `<div id="upload-page" class="page">
                    <div class="back-arrow" onclick="closeUploadPage()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </div>
                    <br>
                    <h1>Upload Mods</h1>
                    <div class="horizontalGrid">
                        <input type="file" name="files" id="files" accept=".zip" multiple>
                    </div>
                    <br><br>
                    <div class="horizontalGrid">
                        <div class="actionbutton" onclick="upload()">Upload</div>
                    </div>
                </div>`;

        html += `<div id="delete-page" class="page">
                    <div class="back-arrow" onclick="closeDeletePage()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"></path>
                        </svg>
                    </div>
                    <h1>Delete Mods</h1>
                    <span>Disabled mods</span>`

        for (let i = 0; i < disabled.length; i++) {
            let mod = disabled[i];
            let name = mod.substring(0, mod.length - 4);
            html += `<div class="option option-select body3">
                        <input type="checkbox" name="delete-${name}" id="delete-${name}">
                        <span>${name}</span>
                    </div>`;
        }

        html += `   <div class="horizontalGrid">
                        <div class="stopbutton" onclick="startDelete()">Delete</div>
                    </div>
                </div>`;

        document.getElementById("upload-content").innerHTML += html;
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Mod Data");
    });
}

function changeMods() {

    let d = {
        active: activated,
        disabled: deactivated
    }

    fetch(window.location.origin + "/change-mods", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        },
        body: JSON.stringify(d)
    }).then(res => {
        if (res.ok) {
            message("Mods updated successfully");
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
        } else {
            err("An error occured while changing the mods")
            console.log("Could not update mods!");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function deleteMods(mods) {
    let d = {
        mods: mods
    }

    fetch(window.location.origin + "/delete-mods", {
        method: "DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        },
        body: JSON.stringify(d)
    }).then(res => {
        message("Mods deleted");
        window.setTimeout(() => {
            window.location.reload();
        }, 2000);
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}