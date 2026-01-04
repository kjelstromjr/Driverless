class Line {
    constructor(x1, y1, x2, y2, color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
    }

    update() {
        
    }

    draw() {
        ctx.strokeStyle = this.color;

        let [sx1, sy1] = worldToScreen(this.x1, this.y1);
        let [sx2, sy2] = worldToScreen(this.x2, this.y2);

        //ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        //ctx.stroke();
    }

    clicked() {
        
    }
}

class Player {
    constructor(x, y, name, vehicleID) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.width = 0;
        this.height = 0;
        this.sx = 0;
        this.sy = 0;
        this.wasClicked = false;
        this.vehicleID = vehicleID
    }

    update() {
        if (following === this.vehicleID) {
            //console.log("move");
            fx = this.x - (width / 2 / scale);
            fy = -this.y - (height / 2 / scale); 
        }
    }

    draw() {

        let [sx, sy] = worldToScreen(this.x, this.y);

        let [tx1, ty1] = worldToScreen(this.x + (7.071 / scale), this.y + (7.071 / scale));
        let [tx2, ty2] = worldToScreen(this.x - (7.071 / scale), this.y + (7.071 / scale));

        // ctx.beginPath();
        // ctx.arc(sx, sy, 5, 0, Math.PI * 2); // Full circle
        // ctx.fillStyle = actionColor; // Fill color
        // ctx.fill();
        // ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.fillStyle = actionColor;
        ctx.fill();
        // Measure text size
        let textMetrics = ctx.measureText(this.name);
        let textWidth = textMetrics.width;
        let textHeight = 20; // Approximate height, adjust if needed for accuracy

        // Calculate box dimensions and position
        let paddingLR = 10;
        let paddingTB = 5;
        let boxWidth = textWidth + 2 * paddingLR;
        let boxHeight = textHeight + 2 * paddingTB;
        
        let [bx, by] = worldToScreen(this.x - (boxWidth / 2) / scale, this.y + (boxHeight + 7.071) / scale);

        this.sx = bx;
        this.sy = by;

        ctx.fillRect(bx, by, boxWidth, boxHeight);

        this.width = boxWidth;
        this.height = boxHeight;

        ctx.fillStyle = "white";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = 20 + "px Calibri";
        ctx.fillText(this.name, bx + (boxWidth / 2), by + (boxHeight / 2));

        ctx.closePath();
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    clicked() {
        if (mouseX > this.sx && mouseY < this.sx + this.width && mouseY > this.sy && mouseY < this.sy + this.height) {
            //console.log("clicked");
            this.wasClicked = true;
            following = this.vehicleID;
        }
    }
}

class Updater { 
    update() {
        displayPlayers();       
    }

    draw() {

    }
}

class drawStarter {
    update() {

    }

    draw() {
        ctx.beginPath();
    }
}

class drawEnder {
    update() {

    }

    draw() {
        ctx.stroke();
    }
}