// Main menu system

// Load various objects
(function(){
	function load(script) {
		document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
	}
	load("code/menu_main_elements.js");
	load("code/menu_main_equipment.js");
	load("code/menu_main_item.js");
	load("code/menu_main_status.js");
	load("code/menu_main_class.js");
	load("code/menu_main_ability.js");
	load("code/menu_main_stance.js");
	load("code/menu_main_info.js");
})();

// This is a window that displays basic stats for all characters.
// It is not to be confused for the window that displays more details stats for a single character.
class SimpleStats extends Rectangle {
	constructor() {
		super(0,0,300, window.innerHeight);
		this.choice = -1;
		this.display_choice = -1;
		this.age = 0;
	}
	display(hud_bmp) {
		super.display(hud_bmp);
		if (this.choice >= 0) {
			if (this.display_type == "") {
				var alpha = 0.3
				if (this.active) {
					alpha = 0.4+0.2*Math.sin(2.5*this.age);
				}
				hud_bmp.fillStyle = `rgba(0,255,128,${alpha})`;
		    	hud_bmp.fillRect(this.l, 120*this.display_choice, this.r-this.l, 120);
		    	hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
			}
			else if (this.display_type == "icon") {
				this.draw_image(hud_bmp,this.icon[0], this.icon[1],this.icon[2],
					this.icon[3],this.icon[4], this.r-this.l-75,20+120*this.display_choice,60,60);
			}
		}
		var lines = [];
		// Stats for each individual character
		for (var i=0; i<stats.heroes.length; i++) {
			lines = lines.concat([
				stats.heroes[i].name,
				`HP: ${stats.heroes[i].hp}/${stats.heroes[i].hp_power()}`,
				`MP: ${stats.heroes[i].mp}/${stats.heroes[i].mp_power()}`,
				""
			]);
			// Draw characters. Assuming character sprites are 16X16 and an 8X8 sheet.
			this.draw_image(hud_bmp,stats.heroes[i].tex, 16*stats.heroes[i].blocks["Down"][0][0],
				112-16*stats.heroes[i].blocks["Down"][0][1],16,16, 7,120*i+50,48,48);
		}
		super.draw_lines(hud_bmp, lines,60,30);
	}
}
SimpleStats.prototype.scroll = function(key) {
	if (key == "ArrowUp" || key == "RepeatUp") {
		this.choice = Math.max(0,this.choice-1);
	}
	if (key == "ArrowDown" || key == "RepeatDown") {
		this.choice = Math.min(stats.heroes.length-1,this.choice+1);
	}
}

SimpleStats.prototype.init_menu = function(params={}) {
	this.choice = 0;
	this.display_choice = 0;
	this.active=0; // Whether to pulsate the display
	if ("icon" in params) {
		this.display_type = "icon";
		this.icon = params.icon;
	}
	else {
		this.display_type = "";
	}
}

SimpleStats.prototype.exit_menu = function() {
	this.choice = -1;
	this.display_choice = -1;
}

SimpleStats.prototype.update = function(delta) {
	this.age += delta;
	if (this.display_choice < this.choice) {
		this.display_choice = Math.min(this.choice, this.display_choice+5*delta);
	}
	else if (this.display_choice > this.choice) {
		this.display_choice = Math.max(this.choice, this.display_choice-5*delta);
	}
}

class SummaryStats extends Rectangle {
	constructor() {
		super(window.innerWidth-300,0,window.innerWidth,window.innerHeight);
	}
	display(hud_bmp) {
		super.display(hud_bmp);
		var lines = [`Gold: ${stats.gold}`,""];
		var right_lines = ["",""];
		var indented_lines = ["",""]
		// Elements for each individual character
		for (var i=0; i<stats.heroes.length; i++) {
			lines = lines.concat(stats.heroes[i].name);
			right_lines = right_lines.concat("");
			indented_lines = indented_lines.concat("");
			var elts = stats.heroes[i].elements;
			for (var j=0; j<elts.length; j++) {
				lines = lines.concat("");
				indented_lines = indented_lines.concat(element_database[elts[j][0]].name);
				var icon = element_database[elts[j][0]].icon;
				super.draw_image(hud_bmp,icon[0],icon[1],icon[2],icon[3],icon[4],
					10,90+150*i+30*j,32,32);

				if (elts[j][0].length > 0) {
					var elt_levels = stats.heroes[i].element_levels;
		            var elt_level = elts[j][0] in elt_levels ? elt_levels[elts[j][0]] : 0;
		            var exp_needed = element_database[elts[j][0]].levelup(elt_level);
					right_lines = right_lines.concat(`${elts[j][1]}/${exp_needed}`);
				}
				else {
					right_lines = right_lines.concat("");
				}
			}
			lines = lines.concat("");
			right_lines = right_lines.concat("");
			indented_lines = indented_lines.concat("");
		}
		super.draw_lines(hud_bmp, lines);
		super.draw_lines(hud_bmp, indented_lines,40);
		super.draw_lines(hud_bmp, right_lines, 10, 30, {"right":1});
	}
}

// This class manages the main menu system. It is not responsible for menus outside the main one.
class MenuManager {
	constructor() {
		this.main_menu = new Menu(
			["Status","Ability","Items","Elements","Equipment","Class","Stance","Info"],
			["Status","Ability","Items","Elements","Equipment","Class","Stance","Info"],
			[window.innerWidth-600, 0, window.innerWidth-300, window.innerHeight*0.5]);
		this.status_screen = new StatusScreen();
		this.menu_state = "Main"; // Indicates which menu/screen is up.
		// The following are simplified status windows for all characters
		this.main_stats = new SimpleStats();
		this.summary_stats = new SummaryStats();
		// Each animation is a list of the following
		// [0]: what to do on each frame (usually display/render something)
		// [1]: conditions under which to stop
		// [2]: what to do when stopped
		this.animations = [];
	}
	initialize() {
		this.main_menu.reset();
		this.main_menu.reveal(0,-250);
		this.main_stats.offset = [-250,0];
		this.summary_stats.reveal(250,0);
	}
	update(delta) {
		var i = this.animations.length;
        while (i--) {
            if (this.animations[i][1]()) {
                this.animations[i][2]();
                this.animations.splice(i,1);
            }
        }
		this.main_stats.update(delta);
	}
	animate() {
		for (var i=0; i<this.animations.length; i++) {
			this.animations[i][0]();
		}
	}
	display_hud(hud_bmp) {
		// Note that animate() is not being called here but from outside.
		// The reason is that animations might occur even if not in the menu state.
		this["Display"+this.menu_state](hud_bmp);
	}
	process_key(key) {
		var result = {};
		this["Key"+this.menu_state](key, result);
		return result;
	}
}

MenuManager.prototype.DisplayMain = function(hud_bmp) {
	this.main_menu.render(hud_bmp);
	this.main_stats.display(hud_bmp);
	this.summary_stats.display(hud_bmp);
}

MenuManager.prototype.KeyMain = function(key, result) {
	this.main_menu.scroll(key);
	if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
	if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
		cut_scenes.hide_window(this.summary_stats);
		switch( this.main_menu.get_choice() ) {
		case "Status":
			this.status_setup();
			break;
		case "Items":
			this.items_setup();
			break;
		case "Elements":
			this.elements_setup();
			break;
		case "Equipment":
			this.equipment_setup();
			break;
		case "Class":
			this.class_setup();
			break;
		case "Ability":
			this.ability_setup();
			break;
		case "Stance":
			this.stance_setup();
			break;
		case "Info":
			this.info_setup();
			break;
		}
	}
	else if (key != 'ArrowUp' && key != 'ArrowDown') {
		result["done"]=1;
		cut_scenes.hide_menu(this.main_menu);
		cut_scenes.hide_main_stats();
		cut_scenes.hide_window(this.summary_stats);
	}
}

// Add a textual animation in the main status box.
// Used for effects such as indicating how many HP a character recovers.
MenuManager.prototype.text_animation = function(params) {
	var start_time = clock.elapsedTime;
	var delay = "delay" in params ? params.delay : 0;
	this.animations = this.animations.concat([[
        ()=>{
			if (clock.elapsedTime-start_time > delay) {
				if ("color" in params) {hud_manager.hudBitmap.fillStyle = params.color;}
				this.main_stats.draw_text(hud_manager.hudBitmap,params.text,20,
					60+120*params.character-(clock.elapsedTime-start_time-delay)*50);
				if ("color" in params) {hud_manager.hudBitmap.fillStyle = "rgba(255,255,255,1.0)";}
			}
		},
        ()=>clock.elapsedTime > start_time + 0.5+delay,
        ()=>{}
    ]]);
}
