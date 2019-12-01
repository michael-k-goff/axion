// Menus

class Menu {
	constructor(choices, display_choices = [], dims=[window.innerWidth*2/3, 0, window.innerWidth, window.innerHeight],
				right_choices=[],params = {}) {
		this.regenerate_choices(choices,display_choices,right_choices);
		// Default dimensions from the main menu.
		// Add a mechanism to change for other menus.
		this.rect = new Rectangle(dims[0],dims[1],dims[2],dims[3]);
		this.cursor_pos = 0; // Which choice the cursor is pointing to
		this.cursor_display_pos = 0; // The cursor position, as displayed.
		this.scroll_val = 0; // How many choices the menu is scrolled down
		// Some more default parameters
		this.line_height = 30; // Number of pixels between menu choices
		this.color = "color" in params ? params.color : Array(choices.length).fill("#FFFFFF");
		// The color to be used if the menu is displayed but inactive.
		// May allow something more dynamic here later on.
		this.passive_color = "#777777";
		this.age = 0;
	}
	// Maximum number of choices that will fit in the menu
	max_display() {
		return Math.floor((this.rect.t-this.rect.b-30)/this.line_height);
	}
	reset() {
		this.cursor_pos = 0;
		this.cursor_display_pos = 0;
		this.scroll_val = 0;
	}
	regenerate_choices(choices,display_choices=[],right_choices=[],params={}) {
		this.choices = choices;
		this.display_choices = display_choices.length > 0 ? display_choices : choices;
		this.right_choices = right_choices;
		if ("color" in params) {
			this.color = params.color;
		}
		this.fix();
	}
	render(hud_bmp,active=1,display_cursor=1) {
		// Update the display position of the cursor and scroll as needed
		// It breaks protocol to do this here rather than in a separate update function.
		if (this.cursor_display_pos < this.cursor_pos) {
			this.cursor_display_pos = Math.min(this.cursor_pos, this.cursor_display_pos+10*global_delta);
		}
		if (this.cursor_display_pos > this.cursor_pos) {
			this.cursor_display_pos = Math.max(this.cursor_pos, this.cursor_display_pos-10*global_delta);
		}
		this.age += global_delta;
		this.scroll_val = Math.max(Math.floor(this.scroll_val),this.scroll_val-10*global_delta);
		this.scroll_val = Math.min(this.scroll_val,this.cursor_display_pos);
		this.scroll_val = Math.max(this.scroll_val,1+this.cursor_display_pos - this.max_display());

		// Display
		this.rect.display(hud_bmp);
		hud_bmp.save();
		hud_bmp.beginPath();
		// To be done hopefully: figure out how to make clipping rectangle completely invisible.
		hud_bmp.rect(this.rect.l+5,this.rect.b+5, this.rect.r-this.rect.l-10, this.rect.t-this.rect.b-10);
		hud_bmp.closePath();
		hud_bmp.clip();
		for (var i=Math.floor(this.scroll_val); i<Math.ceil(Math.min(this.scroll_val+this.max_display(),this.display_choices.length)); i++) {
			hud_bmp.fillStyle = active ? this.color[i] : this.passive_color;
			this.rect.draw_text(hud_bmp, this.display_choices[i],
				30+((this["icons_active"] && this.icon_position=="left") ? 30:0),
				40+this.line_height*(i-this.scroll_val));
			if (this.icons_active) {
				// Draw icon
				var icon_data = this.icon_func(this.choices[i]);
				if (icon_data) {
					var x = 30; // For left icon positions
					if (this.icon_position == "right_prefix" && this.right_choices.length > i) {
						x = this.rect.r-this.rect.l - hud_bmp.measureText(this.right_choices[i]).width - 50;
					}
					this.rect.draw_image(hud_bmp,icon_data[0], icon_data[1],icon_data[2],
						icon_data[3],icon_data[4], x,14+this.line_height*(i-this.scroll_val),30,30);
				}
			}
		}
		for (var i=Math.floor(this.scroll_val); i<Math.ceil(Math.min(this.scroll_val+this.max_display(),this.right_choices.length)); i++) {
			hud_bmp.fillStyle = active ? this.color[i] : this.passive_color;
			this.rect.draw_text_right(hud_bmp, this.right_choices[i], 10, 40+this.line_height*(i-this.scroll_val));
		}
		// Draw cursor and scroll bars
		if (this.choices.length && display_cursor) {
			var cursor_icon_phase = 0;
			if (active) {
				cursor_icon_phase = Math.floor(10*this.age) % 18;
				if (cursor_icon_phase > 9) {
					cursor_icon_phase = 18-cursor_icon_phase;
				}
			}
			this.rect.draw_image(hud_bmp,"art/Pointer.png",32*cursor_icon_phase,0,32,32,
				0,10+this.line_height*(this.cursor_display_pos-this.scroll_val),32,32);
		}
		if (this.choices.length) {
			if (this.scroll_val > 0) {
				this.rect.draw_image(hud_bmp,"art/animation.png",192,224,32,32,
					(this.rect.r-this.rect.l-32)/2, 5,32,32);
			}
			if (this.scroll_val < this.display_choices.length-this.max_display()) {
				this.rect.draw_image(hud_bmp,"art/animation.png",224,224,32,32,
					(this.rect.r-this.rect.l-32)/2, (this.rect.t-this.rect.b-25),32,32);
			}
		}
		hud_bmp.restore();
		// The following is done to get rid of clipping artifacts.
		// There appears to be a bug somewhere that this is somehow suppressing.
/*		hud_bmp.save();
		hud_bmp.beginPath();
		hud_bmp.rect(-5,-5,-5,-5);
		hud_bmp.closePath();
		hud_bmp.clip();
		hud_bmp.restore();*/
	}
	scroll(key) {
		// Need to figure out how to deal with menus with no choices better.
		if (this.choices.length == 0) {return}
		if (key == "ArrowUp" || key == "RepeatUp") {
			this.cursor_pos = Math.max(0,this.cursor_pos-1);
		}
		if (key == "ArrowDown" || key == "RepeatDown") {
			this.cursor_pos = Math.min(this.choices.length-1,this.cursor_pos+1);
		}
		//this.scroll_val = Math.min(this.scroll_val,this.cursor_pos);
		//this.scroll_val = Math.max(this.scroll_val,1+this.cursor_pos - this.max_display());
	}
	// Make sure the cursor is in range. Call whenever there is a risk of getting out of range.
	fix() {
		this.cursor_pos = Math.min(this.choices.length-1,this.cursor_pos);
		this.cursor_pos = Math.max(0,this.cursor_pos);
	}
	// For now, return just the name from the cursor position. Will want more later.
	get_choice() {
		if (this.choices.length == 0 || this.cur_pos >= this.choices.length) {return}
		return this.choices[this.cursor_pos];
	}
}
Menu.prototype.set_offset = function (x,y) {
	this.rect.offset = [x,y]
}

Menu.prototype.reveal = function (x,y) {
	this.rect.reveal(x,y);
}

Menu.prototype.hide = function(x =-7777, y=-7777) {
	if (x == -7777 && y == -7777) {
		this.rect.hide();
	}
	else {this.rect.hide(x,y);}
}

// The following defines a function that are used to dynamically generate icons.
// f is a function that takes the menu choice as input and outputs an array of five,
// with elements indicating respectively the filename, x,y, width, and height of icon.
// For the moment, other values, such as the size of the icon as it appears, are fixed.
Menu.prototype.set_icon_func = function(f,icon_position="left") {
	this.icons_active = 1;
	this.icon_func = f;
	// Possible values:
	// left (default) is on the left
	// right_prefix puts the icon before the right text display.
	this.icon_position = icon_position;
}
