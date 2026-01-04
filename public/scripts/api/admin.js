function checkAdmin() {
    let password = document.getElementById("adminPassword").value;

    if (password === "") {
        message("Please enter a password");
        return;
    }

    let d = {
        password: password
    }

    fetch(window.location.origin + "/admin-login", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        },
        body: JSON.stringify(d)
    }).then(res => {
        if (res.ok) {
            message("Admin mode unlocked");
            sessionStorage.setItem("admin", true);
            allowed();
            closePopups();
        } else {
            err("Incorrect");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function allowed() {
    if (sessionStorage.getItem("admin") === "true") {
        let settings = document.getElementById("server-settings").children;

        for (let i = 0; i < settings.length; i++) {
            settings[i].style.display = "flex";
        }

        document.getElementById("mods").style.display = "flex";
        document.getElementById("adminSettingsPopupButton").style.display = "flex";
        document.getElementById("offsetButton").style.setProperty("display", "flex", "important")
    }

    fetch(window.location.origin + "/allowed", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            err("Something went wrong");
        }
    }).then(json => {
        let allowed = json.allowed;

        if (allowed === undefined) {
            currentAllowed = [];
            return;
        }

        for (let i = 0; i < allowed.length; i++) {
            document.getElementById(allowed[i]).style.display = "flex";
            document.getElementById(allowed[i] + "Switch").checked = true;
        }

        currentAllowed = json.allowed;
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}

function setAllowed() {

    if (document.getElementById("allowedUpdateButton").disabled) {
        err("How did you get here?");
    }

    fetch(window.location.origin + "/set-allowed", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        },
        body: JSON.stringify({
            allowed: currentAllowed
        })
    }).then(res => {
        if (res.ok) {
            message("Allowed settings updated");
            allowed();
        } else {
            err("Something went wrong");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });
}