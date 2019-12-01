// Rectangle

class Rectangle {
    constructor(l,b,r,t) {
        // Position as displayed
        this.l = l;
        this.b = b;
        this.r = r;
        this.t = t;
        // "True" position in the window"
        this.perm_l = l;
        this.perm_r = r;
        this.perm_b = b;
        this.perm_t = t;
        this.border_width = 5;
        // Offsets work as follows. offset is how much the position is off from the permanent values.
        // target_offset is what the offset moves toward automatically.
        // hide_offset is for default "off screen" positions, which can be remembered when offset is first set.
        this.offset = [0,0];
        this.target_offset = [0,0];
        this.hide_offset = [0,0];
    }
    display(hud_bmp) {
        // Process animation. For now, speed is hard-coded.
        if (this.offset[0]>this.target_offset[0]) {
            this.offset[0] = Math.max(this.offset[0]-1000*global_delta,this.target_offset[0]);
        }
        if (this.offset[0]<this.target_offset[0]) {
            this.offset[0] = Math.min(this.offset[0]+1000*global_delta,this.target_offset[0]);
        }
        if (this.offset[1]>this.target_offset[1]) {
            this.offset[1] = Math.max(this.offset[1]-1000*global_delta,this.target_offset[1]);
        }
        if (this.offset[1]<this.target_offset[1]) {
            this.offset[1] = Math.min(this.offset[1]+1000*global_delta,this.target_offset[1]);
        }
        this.l = this.perm_l + this.offset[0];
        this.r = this.perm_r + this.offset[0];
        this.b = this.perm_b + this.offset[1];
        this.t = this.perm_t + this.offset[1];
        hud_bmp.fillStyle = "rgba(0,0,0,0.75)";
		hud_bmp.fillRect(this.l, this.b, this.r-this.l, this.t-this.b);
        // Borders
        hud_bmp.fillStyle = "rgba(100,100,255,1.0)";
        hud_bmp.fillRect(this.l, this.b, this.border_width, this.t-this.b);
        hud_bmp.fillRect(this.r - this.border_width, this.b, this.border_width, this.t-this.b);
        hud_bmp.fillRect(this.l, this.b, this.r-this.l, this.border_width);
        hud_bmp.fillRect(this.l, this.t-this.border_width, this.r-this.l, this.border_width);
        hud_bmp.fillStyle = "rgba(255,255,255,1.0)"; // Default for text
    }
    draw_text(hud_bmp,text,x_offset=10,y_offset=30,params={}) {
        hud_bmp.stroke();
		hud_bmp.font = "Normal 30px Arial";
		hud_bmp.textAlign = 'left';
        wrapText(hud_bmp, text, this.l+x_offset+this.border_width,
            this.b+y_offset+this.border_width,
            this.r-this.l-20-2*this.border_width,30);
    }
    draw_text_right(hud_bmp,text,x_offset=10,y_offset=30) {
        hud_bmp.stroke();
		hud_bmp.font = "Normal 30px Arial";
		hud_bmp.textAlign = 'right';
        hud_bmp.fillText(text, this.r-x_offset-this.border_width,
            this.b+y_offset+this.border_width);
    }
    draw_lines(hud_bmp,text_lines,x_offset=10,y_offset=30,params={}) {
        hud_bmp.stroke();
		hud_bmp.font = "Normal 30px Arial";
		hud_bmp.textAlign = "right" in params ? 'right' : 'left';
        for (var i=0; i<text_lines.length; i++) {
            if ("colors" in params) {
                hud_bmp.fillStyle = params["colors"][i];
            }
            // Note: does not do word wrapping for right-justified text.
            if ("right" in params) {
                hud_bmp.fillText(text_lines[i], this.r-x_offset-this.border_width,
                    this.b+y_offset+this.border_width+30*i);
            }
            else {
                wrapText(hud_bmp, text_lines[i],
                    this.l+x_offset+this.border_width,
                    this.b+y_offset+30*i+this.border_width,
                    this.r-this.l-20-2*this.border_width,30);
            }
        }
    }
    draw_image(hud_bmp,image,sx,sy,sw,sh,dx,dy,dw,dh) {
        hud_bmp.drawImage(hud_images[image],sx,sy,sw,sh,
        			this.l+dx+this.border_width,this.b+dy+this.border_width,dw,dh);
    }
}

// Revealing a rectangle, typically sliding from off screen.
// x and y is the offset. If using the default values, do not change hide_offset
Rectangle.prototype.reveal = function(x=-7777, y=-7777) {
    this.target_offset = [0,0];
    if (x != -7777 || y != -7777) {
        this.hide_offset = [x,y];
        this.offset = [x,y];
    }
    else {
        this.offset = [this.hide_offset[0],this.hide_offset[1]];
    }
}

Rectangle.prototype.hide = function(x=-7777, y=-7777) {
    if (x == -7777 && y == -7777) {
        this.target_offset = [this.hide_offset[0],this.hide_offset[1]];
    }
    else {this.target_offset = [x,y]}
}

// Start a period of clipping. Make sure we stop it later on.
Rectangle.prototype.start_clip = function(hud_bmp) {
    hud_bmp.save();
    hud_bmp.beginPath();
    // To be done hopefully: figure out how to make clipping rectangle completely invisible.
    hud_bmp.rect(this.l+5,this.b+5, this.r-this.l-10, this.t-this.b-10);
    hud_bmp.closePath();
    hud_bmp.clip();
}
Rectangle.prototype.end_clip = function(hud_bmp) {
    hud_bmp.restore();
    // The following is done to get rid of clipping artifacts.
    // There appears to be a bug somewhere that this is somehow suppressing.
    hud_bmp.save();
    hud_bmp.beginPath();
    hud_bmp.rect(-5,-5,-5,-5);
    hud_bmp.closePath();
    hud_bmp.clip();
    hud_bmp.restore()
}

Rectangle.prototype.progress_bar = function(hud_bmp, params) {
    var x = "x" in params ? params.x : 10;
    var y = "y" in params ? params.y : 30;
    var border_color = "border_color" in params ? params.border_color : "rgba(255,255,255,1.0)";
    var bar_color = "bar_color" in params ? params.bar_color : "rgba(255,255,255,1.0)";
    var thickness = "thickness" in params ? params.thickness : 2;
    var width = "width" in params ? thickness.width : this.r-this.l-20;
    var height = "height" in params ? params.height : 10;
    var frac = "frac" in params ? params.frac : 1.0;
    hud_bmp.fillStyle = bar_color;
    hud_bmp.fillRect(this.l+x, this.b+y, frac*width, height);
    hud_bmp.fillStyle = border_color;
    hud_bmp.fillRect(this.l+x, this.b+y, thickness, height);
    hud_bmp.fillRect(this.l+x+width, this.b+y, thickness, height);
    hud_bmp.fillRect(this.l+x, this.b+y, width+thickness,thickness);
    hud_bmp.fillRect(this.l+x, this.b+y+height, width+thickness,thickness);
    hud_bmp.fillStyle = "rgba(255,255,255,1.0)"; // Default for text
}
