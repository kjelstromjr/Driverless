function checkForm() {
    let key = document.getElementById("key").value;
    let password = document.getElementById("password").value;

    let button = document.getElementById("finishButton");

    if (key !== "" && password !== "") {
        button.disabled = false;
        return true;
    } else {
        button.disabled = true;
        return false;
    }
}

function finishSetup() {

    if (!checkForm()) {
        return;
    }

    let data = {
        key: document.getElementById("key").value,
        password: document.getElementById("password").value
    };

    fetch(window.location.origin + "/setup", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Origin": window.location.origin + ""
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (!res.ok) {
            err("Something went wrong");
        }
    }).catch(err => {
        console.error(err);
        err("An Error Occurred While Loading Data");
    });

    window.setTimeout(() => {
        window.location.reload();
    }, 1000);
}

window.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        finishSetup();
    }
});