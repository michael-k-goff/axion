// This file controls the battle system

// Stats to be displayed in battle
class BattleSimpleStats extends Rectangle {
	constructor() {
		super(window.innerWidth-250,0,window.innerWidth, window.innerHeight);
	}
	display(hud_bmp) {
		super.display(hud_bmp);
		var lines = [];
		var colors = [];
		// Stats for each individual character
		for (var i=0; i<stats.heroes.length; i++) {
			lines = lines.concat([
				stats.heroes[i].name,
				`HP: ${stats.heroes[i].hp}/${stats.heroes[i].hp_power()}`,
				`MP: ${stats.heroes[i].mp}/${stats.heroes[i].mp_power()}`,
				""
			]);
			var next_color = "rgba(0,200,255,1.0)";
			if (stats.heroes[i].hp != stats.heroes[i].hp_power() || stats.heroes[i].mp != stats.heroes[i].mp_power()) {
				next_color = "rgba(0,255,64,1.0)";
			}
			if (stats.heroes[i].hp < 0.8*stats.heroes[i].hp_power()) {
				next_color = "rgba(255,255,255,1.0)";
			}
			if (stats.heroes[i].hp < 0.6*stats.heroes[i].hp_power()) {
				next_color = "rgba(255,255,0,1.0)";
			}
			if (stats.heroes[i].hp < 0.4*stats.heroes[i].hp_power()) {
				next_color = "rgba(255,128,0,1.0)";
			}
			if (stats.heroes[i].hp < 0.2*stats.heroes[i].hp_power()) {
				next_color = "rgba(200,0,0,1.0)";
			}
			if (stats.heroes[i].hp == 0) {
				next_color = "rgba(100,100,100,1.0)";
			}
			colors = colors.concat([next_color, next_color, next_color, next_color]);
			var progress = stats.heroes[i].get_charge();
			var bar_color = progress[1] == "mission" ? "rgba(255,0,0,1.0)" : "rgba(128,0,255,1.0)";
			if (["Menu","SecondaryMenu","Target"].indexOf(battle_manager.battle_state)>=0 && i==battle_manager.current_hero) {
				var alpha = 0.6+0.4*Math.sin(3*battle_manager.age);
				bar_color = `rgba(255,255,255,${alpha})`;
			}
			var frac = Math.max(Math.min(1,progress[0]),0);
			this.progress_bar(hud_bmp,{"y":30*lines.length-18, "bar_color":bar_color,"frac":frac});
		}
		super.draw_lines(hud_bmp, lines, 10, 30, {"colors":colors});
	}
}

class BattleManager {
    constructor() {
        this.battle_scene = new THREE.Scene();
        this.battle_camera = new THREE.OrthographicCamera(-window.innerWidth/100, window.innerWidth/100, window.innerHeight/100, -window.innerHeight/100, 0, 30 );
        this.battle_map = null; // The object for the map.
        this.battle_objects = []; // Hero, enemies, and other things on the map
        // The main state for the battle system
        this.battle_state = "";
        this.events = []; // A list of ongoing events and processes
        this.end_of_battle = []; // A list of messages for the end of battle
        this.battle_stats = new BattleSimpleStats();
		// Storage for temporary battle objects. Flushed at the start of a frame
		this.temporary_objects = [];
    }
    // Update delta seconds
    update(delta) {
		this.age += delta;
        if (this.battle_state == "") {
            var result = stats.update(delta);
            if ("lost" in result) {
                this.battle_state = "Lost";
				this.textbox.reveal();
            }
            else if ("win" in result) {
                this.battle_state = "Win";
                this.end_of_battle = result.victory_message;
				this.textbox.reveal();
            }
            else if ("hero_turn" in result) {
                this.main_menu = stats.heroes[result.hero_turn].generate_battle_menu();
				this.main_menu.reveal(0,this.main_menu.rect.b-this.main_menu.rect.t);
                this.current_hero = result.hero_turn; // The character whose turn is up
                this.battle_state = "Menu";
                this.selector_object = result.selector_object;
                this.selector_object.render();
            }
        }
		else if (this.battle_state == "Fadeout") {
			this.fadeout_time -= delta;
		}
		else if (this.battle_state == "Target") {
			// Smooth sliding of the target object
			var delta_x = this.target_object.dest_x - this.target_object.x;
			var delta_y = this.target_object.dest_y - this.target_object.y;
			if (delta_x*delta_x + delta_y*delta_y > 0) {
				var dist = 20*delta;
				if (dist*dist > delta_x*delta_x + delta_y*delta_y) {
					this.target_object.move(this.target_object.dest_x, this.target_object.dest_y);
				}
				else {
					var dx = dist*delta_x / Math.sqrt(delta_x*delta_x + delta_y*delta_y);
					var dy = dist*delta_y / Math.sqrt(delta_x*delta_x + delta_y*delta_y);
					this.target_object.move(this.target_object.x+dx, this.target_object.y+dy);
				}
			}
		}
		// Process active battle events
        var i = this.events.length;
        while (i--) {
            this.events[i].age += delta;
            if (this.battle_state == "") {this.events[i].active_age += delta}
            if (this.events[i].update(this.events[i], delta,this.battle_state)) {
                this.events[i].cleanup();
                this.events.splice(i,1);
            }
        }
    }
    // General display
    display() {
		stats.battle_display();
        this.battle_camera.position.x = 15;
        this.battle_camera.position.y = 10;
        this.battle_camera.position.z = 5;
        renderer.render( this.battle_scene, this.battle_camera );
		for (var i=0; i<this.temporary_objects.length; i++) {
			this.temporary_objects[i].unrender();
		}
		this.temporary_objects = [];
    }
    // Heads up display
    display_hud(hud_bmp) {
        this.battle_stats.display(hud_bmp);
        if (this.battle_state == "Menu") {
            this.main_menu.render(hud_bmp);
        }
        if (this.battle_state == "SecondaryMenu") {
            this.main_menu.render(hud_bmp,0,1);
            this.secondary_menu.render(hud_bmp);
        }
        if (this.battle_state == "Target") {
            this.main_menu.render(hud_bmp,0,1);
            if (this.last_menu_secondary) {
                this.secondary_menu.render(hud_bmp,0,1);
            }
			this.textbox.display(hud_bmp);
			this.textbox.draw_text(hud_bmp,stats.get_target().name);
        }
        if (this.battle_state == "Lost") {
            this.textbox.display(hud_bmp);
            this.textbox.draw_text(hud_bmp,"You lost.");
        }
        if (this.battle_state == "Win") {
            this.textbox.display(hud_bmp);
            this.textbox.draw_text(hud_bmp,this.end_of_battle[0]);
        }
		if (this.battle_state == "Fadeout") {
			var alpha = 1-this.fadeout_time;
		    hud_bmp.fillStyle = "rgba(0,0,0,"+alpha.toString()+")";
		    hud_bmp.fillRect(0,0, window.innerWidth, window.innerHeight);
		    hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
		}
		// Fade-in animation. Does not interrupt the flow of battle
		if (this.age < 1) {
			var alpha = 1-this.age;
		    hud_bmp.fillStyle = "rgba(0,0,0,"+alpha.toString()+")";
		    hud_bmp.fillRect(0,0, window.innerWidth, window.innerHeight);
		    hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
		}
	}
    // Handle a key press
    // Selecting a menu choice, which is used by menus
    // c is the key of the choice, which is assumed to be a key in actions.js if valid
    process_menu(c) {
		// In general, we are allowing menu commands that are not valid actions
		// In that case, selecting the choice should result in nothing happening
		if (!(c in actions)) {return}
        if (actions[c].target == "Self") {
            stats.heroes[this.current_hero].set_mission(c);
            this.battle_state = "";
            this.selector_object.unrender();
			cut_scenes.hide_menu(this.main_menu);
        }
        if (actions[c].target == "Single") {
            this.battle_state = "Target";
            this.current_command = c;
            this.target_object = stats.set_target();
            this.target_object.render();
			this.textbox.reveal();
        }
        if (actions[c].target == "Ally") {
            this.battle_state = "Target";
            this.current_command = c;
            this.target_object = stats.set_target(0);
            this.target_object.render();
			this.textbox.reveal();
        }
        if (actions[c].target == "Menu") {
            this.battle_state = "SecondaryMenu";
            this.current_command = c;
            this.secondary_menu = actions[c].execute(stats.heroes[this.current_hero]);
			this.secondary_menu.reveal(0,this.secondary_menu.rect.t-this.secondary_menu.rect.b);
        }
    }
    process_key(key) {
        var result = {};
        if (this.battle_state == "Menu") {
            this.main_menu.scroll(key);
            if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
                var c = this.main_menu.get_choice();
                this.process_menu(c);
                this.last_menu_secondary = false;
			}
            return result;
        }
        if (this.battle_state == "SecondaryMenu") {
            this.secondary_menu.scroll(key);
			if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return result;}
            if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
                var c = this.secondary_menu.get_choice();
                this.process_menu(c);
                this.last_menu_secondary = true;
                return result;
			}
            if (key != 'ArrowUp' && key != 'ArrowDown') {
				this.battle_state = "Menu";
				cut_scenes.hide_menu(this.secondary_menu);
			}
            return result;
        }
        if (this.battle_state == "Target") {
            stats.scroll_target(key, this.target_object);
			if (["ArrowUp","ArrowDown","RepeatUp","RepeatDown"].indexOf(key)>=0) {
                stats.swap_target_team(key, this.target_object);
            }
			if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return result;}
            if (["Enter"," "].indexOf(key)>=0) {
                stats.heroes[this.current_hero].set_mission(this.current_command);
                this.target_object.unrender();
                this.selector_object.unrender();
				cut_scenes.hide_window(this.textbox);
                this.battle_state = "";
				cut_scenes.hide_menu(this.main_menu);
				if (this.last_menu_secondary) {cut_scenes.hide_menu(this.secondary_menu);}
            }
            if (["Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].indexOf(key)<0) {
                this.battle_state = this.last_menu_secondary ? "SecondaryMenu" : "Menu";
                this.target_object.unrender();
				cut_scenes.hide_window(this.textbox);
            }
            return result;
        }
        if (this.battle_state == "Lost") {
            if (["Enter"," "].indexOf(key) >= 0) {
                this.fadeout_time = 1;
				this.battle_state = "Fadeout";
				cut_scenes.hide_window(this.textbox);
            }
            return result;
        }
        if (this.battle_state == "Win") {
            if (["Enter"," "].indexOf(key) >= 0) {
                this.end_of_battle.splice(0,1);
                if (this.end_of_battle.length == 0) {
					this.fadeout_time = 1;
					this.battle_state = "Fadeout";
					cut_scenes.hide_window(this.textbox);
                }
            }
            return result;
        }
        return result;
    }
	// Initialize the battle for stats and state system
    start_battle(enemies) {
        stats.start_battle(enemies);
        this.battle_state = "";
    }
	// Initialize the battle for display
	initialize_battle() {
		var cur_map = world_maps[map_controller.current_map].terrain;
		this.render_battle_map(cur_map.art,cur_map.battle_panel[0],cur_map.battle_panel[1]);
		this.age = 0;
		// General text box for displaying messages at the top of the screen.
		this.textbox = new Rectangle(window.innerWidth/4,0,window.innerWidth-450,60);
		this.textbox.hide_offset = [0,-60];
	}
    // Clean up all animation and sprites from the field
    clean_battle() {
        for (var i=0; i<this.events.length; i++) {
            this.events[i].cleanup();
        }
        this.events = [];
        stats.clear_objects();
		// Remove battle map. Why wasn't this here before?
		this.battle_scene.remove(this.battle_map);
		this.battle_map = null;
		this.material.dispose();
		this.material = null;
		this.planeGeo.dispose();
		this.material = null;
    }
	// Whether the battle is done and we are ready to return to the map state.
	is_done() {
		if (this.battle_state == "Fadeout" && this.fadeout_time <= 0) {
			this.clean_battle();
			if (stats.is_dead) {
				map_controller.next_map = stats.waypoint;
				stats.process_loss();
			}
			return 1;
		}
		return 0;
	}
    render_battle_map(tex, block_x, block_y) {
        // Default texture for battle map tiles.
        this.material = new THREE.MeshBasicMaterial( {
            map: textures[tex]
        } );
        this.material.transparent = true;
        // Fill in later with more appropriate values
        var h = 20;
        var w = 30;
		var xx = texture_dimensions[tex][0];
		var yy = texture_dimensions[tex][1];
        this.planeGeo = new THREE.PlaneGeometry(w,h,w,h);
        for (i=0; i<h; i++) {
            for (j=0; j<w; j++) {
                this.planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)   ][ 0 ].set( block_x/xx,     (block_y+1)/yy); // upper left quarter
                this.planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)   ][ 1 ].set( block_x/xx,     block_y/yy);
                this.planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)   ][ 2 ].set( (block_x+1)/xx, (block_y+1)/yy);
                this.planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)+1 ][ 0 ].set( block_x/xx,     block_y/yy);
                this.planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)+1 ][ 1 ].set( (block_x+1)/xx, block_y/yy);
                this.planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)+1 ][ 2 ].set( (block_x+1)/xx, (block_y+1)/yy);
            }
        }
        this.battle_map = new THREE.Mesh(this.planeGeo, this.material);
        this.battle_map.position.set(w/2-1/2,h/2-1/2,0);
        this.battle_scene.add( this.battle_map );
    }
}
battle_manager = new BattleManager();

// This is an event manager for battles. It is meant for things like processing moves
// It will supersede the BattleAnimation class.
class BattleEvent {
    constructor(input) {
        this.objects = [];
        input.setup(this);
        this.is_done = input.is_done;
        this.update = input.update;
        for (var i=0; i<this.objects.length; i++) {
            this.objects[i].render();
        }
        // Aging will be handled externally
        this.age = 0; // Age in real time
        this.active_age = 0; // Age in game time
    }
    cleanup() {
        for (var i=0; i<this.objects.length; i++) {
            this.objects[i].unrender();
        }
    }
}

class BattleObject extends XObject {
    constructor(input) {
		super(input);
        this.scene = battle_manager.battle_scene;
	}
}
