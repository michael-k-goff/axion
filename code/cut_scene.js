// Cut scene manager

(function(){
	function load(script) {
		document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
	}
	load("code/cut_scene_shop.js");
})();

// A cutscene is a sequence of nodes. The most basic node is a string.
// The conversation is over when the end of the sequence is reached.
// More complicated notes will generally be objects
// Objects might encode menus, encode special instructions such as character healing,
// indicate a battle, shop, or some other game state, etc.
// Code to handle all these cases should be handled here.

class CutSceneManager {
    constructor() {
        this.cutscene = null; // A pointer to the full cutscene data
        // For animations, including residue from old cutscenes.
        // Works in a very similar manner to animations from the main menu system.
        this.animations = [];
    }
    animate() {
		for (var i=0; i<this.animations.length; i++) {
			this.animations[i][0]();
		}
	}
    update(delta) {
        if (this.cutscene) {this.cutscene.update(delta)}
		var i = this.animations.length;
        while (i--) {
            if (this.animations[i][1]()) {
                this.animations[i][2]();
                this.animations.splice(i,1);
            }
        }
	}
    display_hud(hud_bmp) {
        if (this.cutscene) {
            this.cutscene.display(hud_bmp);
        }
	};
    // Initialize a cutscene with a cut scene object, which probably came from a map object.
    initialize_cutscene(cut_scene) {
        this.cutscene = cut_scene;
        this.cutscene.initialize();
    }
    // Handle a key press
    process_key(key) {
        if (this.cutscene) {return this.cutscene.process_key(key);}
        else {return {};}
    }
	// Whether to suppress the map display
	suppress_map() {
		return this.cutscene ? this.cutscene.suppress_map : 0;
	}

}

CutSceneManager.prototype.hide_main_stats = function() {
	menu_manager.main_stats.target_offset = [-250,0];
    this.animations = this.animations.concat([[
        ()=>menu_manager.main_stats.display(hud_manager.hudBitmap),
        ()=>menu_manager.main_stats.target_offset[0] == menu_manager.main_stats.offset[0],
        ()=>menu_manager.main_stats.target_offset = [0,0]
    ]]);
}

CutSceneManager.prototype.hide_window = function(rect,x=-7777,y=-7777) {
	if (x == -7777 && y == -7777) {rect.hide()}
	else {rect.hide(x,y)}
    this.animations = this.animations.concat([[
        ()=>rect.display(hud_manager.hudBitmap),
        ()=>rect.target_offset[0] == rect.offset[0] && rect.target_offset[1] == rect.offset[1],
        ()=>rect.target_offset = [0,0]
    ]]);
}

CutSceneManager.prototype.hide_menu = function(menu,x=-7777,y=-7777) {
	if (x == -7777 && y == -7777) {menu.rect.hide()}
	else {menu.rect.hide(x,y)}
    this.animations = this.animations.concat([[
        ()=>menu.render(hud_manager.hudBitmap,0,0),
        ()=>menu.rect.target_offset[0] == menu.rect.offset[0] && menu.rect.target_offset[1] == menu.rect.offset[1],
        ()=>menu.rect.target_offset = [0,0]
    ]]);
}

cut_scenes = new CutSceneManager();

///////////////////////////////////////////////
// Various types of cut scenes. CutScene is the parent class to all of them.
class CutScene {
    constructor(input) {
        this.data = input;
    }
}
CutScene.prototype.initialize = function() {}
CutScene.prototype.process_key = function(key) {}
CutScene.prototype.display = function(hud_bmp) {}
CutScene.prototype.update = function(delta) {}

// Cut scene for a basic conversation.
class CutSceneConvo extends CutScene {
    constructor(input) {
        super(input);
    }
}
CutSceneConvo.prototype.initialize = function() {
    this.node = 0;
    this.rect = new Rectangle(20,20,500,300);
    this.rect.offset = [0,-300];
    this.scroll_frac_time = 0; // How much scrolling is left after the previous conversation advancement.
	// Real time generation of text if necessary. Not generally expected to be defined.
	if (this.data.dynamic_text) {
		this.data.text = this.data.dynamic_text();
	}
	if (this.data.menu && this.data.menu_node == 0) {
		this.menu = this.data.menu();
		this.menu.reveal(0,-400);
	}
}
CutSceneConvo.prototype.process_key = function(key) {
    var result = {};
	if (this.menu && this.data.menu_node == this.node) {
		this.menu.scroll(key);
		if (['Enter','ArrowRight',' '].indexOf(key) >= 0) {
			if (this.data.menu_result) {
				this.data.menu_result(this.menu.get_choice(), this);
			}
			cut_scenes.hide_menu(this.menu);
		}
		else {
			return result;
		}
	}
	if (["RepeatLeft","RepeatRight","RepeatUp","RepeatDown"].indexOf(key) >= 0) {
		return result;
	}
    this.node += 1;
	if (this.data.menu && this.data.menu_node == this.node) {
		this.menu = this.data.menu();
		this.menu.reveal(0,-400);
	}
    if (this.node >= this.data.text.length) {
        this.rect.target_offset = [0,-300];
        var final_text = this.data.text[this.data.text.length-1]
		cut_scenes.animations = cut_scenes.animations.concat([[
			()=>{
                this.rect.display(hud_manager.hudBitmap);
                this.rect.draw_text(hud_manager.hudBitmap,final_text);
            },
			()=>this.rect.target_offset[1] == this.rect.offset[1],
			()=>this.rect.target_offset = [0,0]
		]]);
        result["done"] = 1;
		if (this.data.battle) {
			result["battle"] = this.data.battle(this);
		}
    }
    else {
        this.scroll_frac_time = 1;
    }
    return result;
}
CutSceneConvo.prototype.update = function(delta) {
    this.scroll_frac_time = Math.max(0,this.scroll_frac_time-2*delta);
}
CutSceneConvo.prototype.display = function(hud_bmp) {
    this.rect.display(hud_bmp);
    this.rect.start_clip(hud_bmp);
    if (this.scroll_frac_time > 0 && this.node>0) {
        var pixel_offset = (this.rect.t-this.rect.b) * this.scroll_frac_time;
        this.rect.draw_text(hud_bmp,this.data.text[this.node],10,30+pixel_offset);
        this.rect.draw_text(hud_bmp,this.data.text[this.node-1],10,30+pixel_offset-this.rect.t+this.rect.b);
    }
    else {
        this.rect.draw_text(hud_bmp,this.data.text[this.node],10,30);
		if ("icons" in this.data && this.data.icons[this.node]) {
			for (var i=0; i<this.data.icons[this.node].length; i++) {
				var ic = this.data.icons[this.node][i];
				if (ic) {
					this.rect.draw_image(hud_bmp,ic[0], ic[1],ic[2],
						ic[3],ic[4], 0,4+30*i,30,30); // lineHeight assumed to be 30px.
				}
			}
		}
    }
    this.rect.end_clip(hud_bmp);
	// Display other stuff
	if (this.menu && this.data.menu_node == this.node) {
		this.menu.render(hud_bmp);
	}
}

class CutSceneOpen extends CutScene {
	constructor(input) {
		super(input);
		this.main_menu = new Menu(["load","new1","new2"],["Load Game","New Game (Casual)","New Game (Hardcore)"],[0,0,360,130]);
		this.hot_keys = new Rectangle(window.innerWidth-600,0,window.innerWidth,window.innerHeight);
		this.info = new Rectangle(0,130,530,window.innerHeight);
		this.suppress_map = 1;
	}
}
CutSceneOpen.prototype.display = function(hud_bmp) {
	this.main_menu.render(hud_bmp);
	this.hot_keys.display(hud_bmp);
	this.hot_keys.draw_text(hud_bmp,"Instructions\n\n"+menu_manager.game_info[1][1]+"\n\nSee Info in the main menu for more instructions.");
	this.info.display(hud_bmp);
	this.info.draw_text(hud_bmp,"Axion\n\nThis is a demo, created Nov. 25, 2019.\n\nDesigned and programmed by Michael Goff.\n\nArt courtesy of OpenGameArt, see detailed image credits under Info in the main menu.\n\nThanks to members of the Portland Indie Game Squad for playtesting and support.");
}
CutSceneOpen.prototype.process_key = function(key) {
	this.main_menu.scroll(key);
	if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
		start_game(this.main_menu.get_choice() == "load");
		cut_scenes.hide_window(this.info,-300,0);
		cut_scenes.hide_menu(this.main_menu,-300,0);
		cut_scenes.hide_window(this.hot_keys,600,0);
		if (this.main_menu.get_choice() == "new1") {
			stats.casual = 1;
		}
		if (this.main_menu.get_choice() == "new2") {
			stats.casual = 0;
		}
		if (this.main_menu.get_choice() == "new1" || this.main_menu.get_choice() == "new2") {
			return {"done":1,"cutscene": new CutSceneConvo({"text":[`${stats.heroes[0].name}: Drat, I overslept. I need to check in with Orin. But I really don't want to.`]})};
		}
		return {"done":1};
	}
	return {};
}

// Utility function that should help with wrapping text in the boxes
// Adapted from https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var lines = text.split('\n');
	for (var l=0; l<lines.length; l++) {
		var words = lines[l].split(' ');
	    var line = '';
	    for(var n = 0; n < words.length; n++) {
	        var testLine = line + words[n] + ' ';
	        var metrics = context.measureText(testLine);
	        var testWidth = metrics.width;
	        if (testWidth > maxWidth && n > 0) {
	            context.fillText(line, x, y);
	            line = words[n] + ' ';
	            y += lineHeight;
	        }
	        else {
	            line = testLine;
	        }
	    }
	    context.fillText(line, x, y);
		y += lineHeight;
	}
}
