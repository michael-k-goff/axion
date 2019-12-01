// The portion of the main menu for status

// Display stuff for the main character's status screen
class StatusScreen {
	constructor() {
		this.rect = new Rectangle(300,0,window.innerWidth-300,window.innerHeight);
		this.cached_character = 0; // Saving which character is being displayed
	}
	render(hud_bmp) {
		// The main status box
		this.rect.display(hud_bmp);
		var i = menu_manager.main_stats.choice >= 0 ? menu_manager.main_stats.choice : this.cached_character;
		this.cached_character = i;
		var lines1 = [
			stats.heroes[i].name,"",
			`HP:`,
			`MP:`,
			`Atk:`,
			`Def:`,
			`Agi:`,
			`Mag:`,
			""
		];
		var lines2 = [
			"","",
			`${stats.heroes[i].hp}/${stats.heroes[i].hp_power()}`,
			`${stats.heroes[i].mp}/${stats.heroes[i].mp_power()}`,
			`${stats.heroes[i].attack_power().toFixed(0)}`,
			`${stats.heroes[i].defense_power().toFixed(0)}`,
			`${stats.heroes[i].agility_power().toFixed(0)}`,
			`${stats.heroes[i].magic_power().toFixed(0)}`
		];
		var current_class = stats.heroes[i].class;
		var lines3 = [
			`Class: ${class_database[current_class].name}`,"",
			`Base:`,
			`Base:`,
			`Base:`,
			`Base:`,
			`Base:`,
			`Base:`,
			""
		];
		var lines4 = [
			"","",
			`${stats.heroes[i].maxhp}`,
			`${stats.heroes[i].maxmp}`,
			`${stats.heroes[i].strength}`,
			`${stats.heroes[i].stamina}`,
			`${stats.heroes[i].agility}`,
			`${stats.heroes[i].magic}`,
			""
		];
		var elts = stats.heroes[i].elements;
		for (var j=0; j<elts.length; j++) {
			lines1 = lines1.concat("    " + element_database[elts[j][0]].name);
			var icon = element_database[elts[j][0]].icon;
			this.rect.draw_image(hud_bmp,icon[0],icon[1],icon[2],icon[3],icon[4],
				10,270+30*j,32,32);

			if (elts[j][0].length > 0) {
				var elt_levels = stats.heroes[i].element_levels;
				var elt_level = elts[j][0] in elt_levels ? elt_levels[elts[j][0]] : 0;
				var exp_needed = element_database[elts[j][0]].levelup(elt_level);
				lines3 = lines3.concat(`${elts[j][1]}/${exp_needed}`);
			}
			else {
				lines3 = lines3.concat("");
			}
			lines4 = lines4.concat("");
		}
		lines1 = lines1.concat("");
		var eqp = stats.heroes[i].equipment;
		for (var j=0; j<eqp.length; j++) {
			lines1 = lines1.concat("    " + equipment_database[eqp[j][0]][eqp[j][1]].name);
			var icon = equipment_database[eqp[j][0]][eqp[j][1]].icon;
			this.rect.draw_image(hud_bmp,icon[0],icon[1],icon[2],icon[3],icon[4],
				10,30*(lines1.length-1),32,32);
		}
		lines3 = lines3.concat(["","Range:"]);
		lines4 = lines4.concat(["",`${stats.heroes[i].range()}`]);
		this.rect.draw_lines(hud_bmp, lines1);
		this.rect.draw_lines(hud_bmp, lines2,110,30);
		this.rect.draw_lines(hud_bmp, lines3,260,30);
		this.rect.draw_lines(hud_bmp, lines4,360,30);
	}
}

MenuManager.prototype.generate_full_element_menu = function() {
	var elt_list = stats.heroes[menu_manager.main_stats.choice].element_levels;
	var keys = Object.keys(elt_list);
	const sorter = (x,y) => {
		if (element_database[y].name>element_database[x].name) {return -1}
		if (element_database[y].name<element_database[x].name) {return 1}
		return 0;
	}
	keys.sort(sorter);
	this.num_elements_status = keys.length; // Number of elements for current character
	if (keys.length > 0) {
		this.full_element_menu = new Menu(keys, keys.map( (x)=>element_database[x].name ),
			  [window.innerWidth-300, 0, window.innerWidth, window.innerHeight-200],
			  keys.map( (x)=>elt_list[x] ));
	}
	else {
		this.full_element_menu = new Menu([""], ["No Elements"],
			  [window.innerWidth-300, 0, window.innerWidth, window.innerHeight-200],
			  [""] );
	}
}

MenuManager.prototype.status_setup = function() {
    this.menu_state = "Status";
	this.status_menu_state = 0; // 0 if on the character menu, 1 if on the element menu.
	this.main_stats.init_menu();
	this.main_stats.active = 1;
	this.status_screen.rect.offset = [0,window.innerHeight];
    this.main_menu.rect.target_offset = [0,-250];
    this.animations = this.animations.concat([[
        ()=>this.main_menu.render(hud_manager.hudBitmap),
        ()=>this.main_menu.rect.target_offset[1] == this.main_menu.rect.offset[1],
        ()=>this.main_menu.rect.target_offset = [0,0]
    ]]);
	this.generate_full_element_menu();
	this.full_element_menu.reveal(300,0);
	this.status_element_display_box = new Rectangle(window.innerWidth-300, window.innerHeight-200, window.innerWidth,window.innerHeight);
}

MenuManager.prototype.DisplayStatus = function(hud_bmp) {
    this.status_screen.render(hud_bmp);
    this.main_stats.display(hud_bmp);
	this.full_element_menu.render(hud_bmp, this.status_menu_state, this.status_menu_state);
	if (this.status_menu_state) {
		this.status_element_display_box.display(hud_bmp);
		var elt = this.full_element_menu.get_choice();
		if (elt) {
			this.status_element_display_box.draw_text(hud_bmp,element_database[elt].desc);
		}
	}
}

MenuManager.prototype.KeyStatus = function(key,result) {
	[this.main_stats, this.full_element_menu][this.status_menu_state].scroll(key);
	if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
	if ((key == "ArrowUp" || key == "ArrowDown") && this.status_menu_state == 0) {
		this.generate_full_element_menu();
	}
    if (key != 'ArrowUp' && key != 'ArrowDown') {
		if (this.status_menu_state) {
			this.status_menu_state = 0;
			this.main_stats.active = 1;
			cut_scenes.hide_window(this.status_element_display_box);
			return;
		}
		if (['ArrowRight','Enter',' '].indexOf(key) >= 0) {
			if (this.num_elements_status) {
				this.status_menu_state = 1;
				this.main_stats.active = 0;
				this.status_element_display_box.reveal(0,200);
			}
			return;
		}
        this.menu_state = "Main";
        this.main_menu.set_offset(0,-250);
		this.main_stats.exit_menu();
        this.status_screen.rect.target_offset = [0,window.innerHeight];
        this.animations = this.animations.concat([[
            ()=>this.status_screen.render(hud_manager.hudBitmap),
            ()=>this.status_screen.rect.target_offset[1] == this.status_screen.rect.offset[1],
            ()=>this.status_screen.rect.target_offset = [0,0]
        ]]);
		cut_scenes.hide_menu(this.full_element_menu);
    }
}
