async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    console.error(`${err.name}: ${err.message}`);
  }
}

function changeColor() {
    let color = document.getElementById("color").value;

    document.documentElement.style.setProperty("--action", color);
    document.documentElement.style.setProperty("--action-hover", decreaseHexColor(color, 10, 10, 54));
    actionColor = color;

    localStorage.setItem("color", color);
}

function decreaseHexColor(hex, amountR, amountG, amountB) {
    // Ensure the hex string starts with '#' and is 6 or 3 characters long
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
      throw new Error("Invalid hex color format");
    }
  
    // Expand shorthand hex to full hex if necessary (e.g., #abc -> #aabbcc)
    if (hex.length === 4) {
      hex = '#' + hex[1].repeat(2) + hex[2].repeat(2) + hex[3].repeat(2);
    }
  
    // Extract the R, G, and B components
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
  
    // Decrease each component and clamp the values between 0 and 255
    r = Math.max(0, r - amountR);
    g = Math.max(0, g - amountG);
    b = Math.max(0, b - amountB);
  
    // Convert back to a hex string and pad with zeros if needed
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function clearPlayers() {
    for (let i = 0; i < players.length; i++) {
        objects.splice(objects.indexOf(players[i]), 1);
    }

    playersDisplayed = false;

    players = [];
}

function updateMods(obj, e) {

    e.stopPropagation();

    let mod = obj.parentElement.children[0].textContent;

    if (obj.children[0].checked) {
        if (activated.includes(mod)) {
            activated.splice(activated.indexOf(mod), 1);
        } else {
            deactivated.push(mod);
        }
    } else {
        if (deactivated.includes(mod)) {
            deactivated.splice(deactivated.indexOf(mod), 1);
        } else {
            activated.push(mod);
        }
    }

    document.getElementById("modsUpdateBtn").disabled = false;
}

function changeSleep() {
    if (wakeLocked) {
        wakeLock.release();
        wakeLock = null;
        localStorage.setItem("sleep", false);
        wakeLocked = false;
    } else {
        requestWakeLock();
        wakeLocked = true;
        localStorage.setItem("sleep", true);
    }
}

function changeReload() {
    if (reloadOnUpdate) {
        reloadOnUpdate = false;
    } else {
        reloadOnUpdate = true;
    }

    localStorage.setItem("reloadOnUpdate", reloadOnUpdate);
}