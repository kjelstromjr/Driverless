// TODO: track point at top of ground.

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

let objects = [];
let people = [];
let zoom = 1;
let preZoom = 1;
let zoomIn = -1;

let secondsPassed, oldTimeStamp;
let fpsDisplay = document.getElementById("fps");

let running = true;

let mouseX = 0;
let mouseY = 0;
let preMouseX = 0;
let preMouseY = 0;

let width = window.innerWidth;
let height = window.innerHeight;

let scale = 1;
let originx = 0;
let originy = 0;
const zoomIntensity = 0.2;
let visibleHeight = height;
let visibleWidth = width;

let mouseDown = false;

let groundOriginX = 0;
let groundOriginY = 0;

let groundWidth = width / 17 - 20;
let groundHeight = height / 6 - 20;

let wheelX = 0;
let wheelY = 0;

let gx = 10;
let gy = 10;

let fx = 0;
let fy = 0;

let maxScale = 1;

let displayOpen = false;

let moving = false;

let following;

function wheel(e) {
    if (!displayOpen) {
        e.preventDefault();
        const [premousex, premousey] = screenToWorld(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        const wheel = e.deltaY < 0 ? 1 : -1 
        const zoom = Math.exp(wheel * zoomIntensity);

        scale *= zoom;

        const [mousex, mousey] = screenToWorld(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);

        fx += premousex - mousex;
        fy += premousey - mousey;

        // if (scale >= maxScale) {
        //     fx += premousex - mousex;
        //     fy += premousey - mousey;
        // } else {
        //     scale = maxScale;
        // }

        // if (fx < 0) {
        //     fx = 0;
        // }

        // if (fy < 0) {
        //     fy = 0;
        // }

        // if (fx > ((26 * 50 * scale) - width) / scale) {
        //     fx = ((26 * 50 * scale) - width) / scale;
        // }

        // if (fy > ((16 * 50 * scale) - height) / scale) {
        //     fy = ((16 * 50 * scale) - height) / scale;
        // }
    }
}

function screenToWorld(x, y) {
    let newX = x / scale + fx;
    let newY = y / scale + fy;

    return [newX, newY];
}

function worldToScreen(x, y) {
    y = y * -1;

    let newX = (x - fx) * scale;
    let newY = (y - fy) * scale;
    
    return [newX, newY];
}

document.addEventListener("wheel", wheel, {passive: false});

onmousemove = function(e) {
    preMouseX = mouseX;
    preMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (mouseDown && !displayOpen) {
        //forceDisplayEnd();
        moving = true;
        fx += (preMouseX - mouseX) / scale;
        fy += (preMouseY - mouseY) / scale;

        following = null;

        // if (fx < 0) {
        //     fx = 0;
        // }

        // if (fy < 0) {
        //     fy = 0;
        // }

        // if (fx > ((26 * 50 * scale) - width) / scale) {
        //     fx = ((26 * 50 * scale) - width) / scale;
        // }

        // if (fy > ((16 * 50 * scale) - height) / scale) {
        //     fy = ((16 * 50 * scale) - height) / scale;
        // }
    }
}

onmousedown = function(e) {
    mouseDown = true;
    moving = false;
}

onmouseup = function(e) {
    mouseDown = false;
    moving = false;
}

onclick = function(e) {
    for (let i = objects.length - 1; i > -1; i--) {
        try {
            objects[i].clicked();
        } catch (err) {}
    }
}

onkeydown = function(e) {
    if (e.key === "=") {
        running = false;
    }
}

/*
function handler(timeStamp) {
    if (running) {
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;
        fps = Math.round(1 / secondsPassed);
        
        //fpsDisplay.textContent = `FPS: ${fps}`;
        
        ctx.save();
        ctx.clearRect(originx, originy, width, height);

        ctx.fillStyle = "green";

        let [sx, sy] = worldToScreen(groundOriginX, groundOriginY);

        ctx.fillRect(sx, sy, 50 * 26 * scale, 50 * 16 * scale);
        
        for (let i = 0; i < objects.length; i++) {
            objects[i].id = i;
        }

        objects.forEach((object) => {
            object.update();
        });
    
        objects.forEach((object) => {
            object.draw();
        });
   
        window.requestAnimationFrame(handler);
    }
}
*/

function update(timeStamp) {
    if (running) {
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;
        fps = Math.round(1 / secondsPassed);
        
        //fpsDisplay.textContent = `FPS: ${fps}`;
        
        for (let i = 0; i < objects.length; i++) {
            objects[i].id = i;
        }

        objects.forEach((object) => {
            object.update();
        });
   
        window.requestAnimationFrame(update);
    }
}

function draw() {
    if (running) {        
        ctx.save();
        ctx.clearRect(originx, originy, width, height);

        //ctx.fillStyle = "green";

        let [sx, sy] = worldToScreen(groundOriginX, groundOriginY);

        //ctx.fillRect(sx, sy, 50 * 26 * scale, 50 * 16 * scale);
    
        objects.forEach((object) => {
            object.draw();
        });
   
        window.requestAnimationFrame(draw);
    }
}

//handler();
update();
draw();