// Game state system
// A state of "" is the top level state, corresponding to walking around on the map without any menus, dialogue boxes, etc.

class StateSystem {
	constructor() {
		this.state = "";
		// The next two variables handle non-instantaneous transitions from one state to the next.
		// No transition is scheduled if next_state is not a recognized state.
		// transition_time in seconds.
		this.next_state = "None";
		this.transition_time = -1;
		// A frame counter
		this.frame_count = 0;
	}
	update(delta) {
		// The main menu update goes here because all it does now is play animations
		// There may be residual animations in other stats, so we need to keep running it.
		// Update this is the menu manager takes on other functions that should not be
		// done regardless of state.
		menu_manager.update(delta);
		// Same for cut scenes
		cut_scenes.update(delta);
		switch(this.state) {
		case "":
			if (this.next_state == "Battle") {
				this.transition_time -= delta;
				if (this.transition_time <= 0) {
					battle_manager.initialize_battle();
					this.state = "Battle";
					this.next_state = "None";
				}
				else {

				}
			}
			else {
				map_controller.update(delta);
				if (map_controller.is_active()) {
					var interaction_result = map_hero.update(delta);
					if (interaction_result["battle"]) {
						this.next_state = "Battle";
						this.transition_time = 1;
						// The following sets up the battle. Will need parameters or to fetch data from elsewhere at some point
						battle_manager.start_battle(interaction_result["enemies"]);
					}
					else if (interaction_result["CutScene"]) {
						this.state = "CutScene";
						cut_scenes.initialize_cutscene(interaction_result["CutScene"])
					}
				}
			}
			break;
		case "Menu":
			break;
		case "CutScene":
			break;
		case "Battle":
			battle_manager.update(delta);
			// This is the second way for battles to end, done after a fadeout.
			// It will probably be the only active used method.
			if (battle_manager.is_done()) {
				stats.save(); // Save after every battle.
				this.state = "";
				map_controller.activate();
			}
			break;
		}
	}
	display() {
		this.frame_count += 1;
		if (this.frame_count % 30 == 0) {
			renderer.dispose(); // Garbage collection
		}
		switch(this.state) {
		case "":
			map_controller.display();
			break;
		case "Menu":
			map_controller.display();
			break;
		case "CutScene":
			if (!(cut_scenes.suppress_map())) {
				map_controller.display();
			}
			break;
		case "Battle":
			battle_manager.display();
			break;
		}
		renderer.autoClear = false;
		hud_manager.clear();
		// The HUD display
		switch(this.state) {
		case "":
			if (this.next_state == "Battle") {
				// See map.js for this function.
				animate_battle(hud_manager.hudBitmap, this.transition_time);
			}
			map_controller.display_hud(hud_manager.hudBitmap);
			break;
		case "Menu":
			menu_manager.display_hud(hud_manager.hudBitmap);
			break;
		case "CutScene":
			cut_scenes.display_hud(hud_manager.hudBitmap);
			break;
		case "Battle":
			battle_manager.display_hud(hud_manager.hudBitmap);
			break;
		}
		// there may be residual animations from the main menu screen, so check for those.
		menu_manager.animate();
		// Maybe residual animations in the cut scenes too.
		cut_scenes.animate();

		hud_manager.render();
		renderer.autoClear = true;
	}
	process_key(key) {
		var key_dict = {"w":"ArrowUp","W":"ArrowUp","a":"ArrowLeft","A":"ArrowLeft",
			"s":"ArrowDown","S":"ArrowDown","d":"ArrowRight","D":"ArrowRight",
			"RepeatW":"RepeatUp","RepeatA":"ArrowLeft","RepeatS":"ArrowDown","RepeatD":"ArrowRight"};
		if (key_dict[key]) {key = key_dict[key];}
		switch(this.state) {
		case "":
			if (!(map_controller.is_active())) {break;}
			if (['m','M','`','Backspace','Escape'].indexOf(key) >= 0) {
				this.state = "Menu";
				menu_manager.initialize();
			}
			if ([' ',"Enter"].indexOf(key) >= 0) {
				var result = {};
				map_controller.active_interact(map_hero,result);
				if (result["CutScene"]) {
					this.state = "CutScene";
					cut_scenes.initialize_cutscene(result["CutScene"])
				}
			}
			break;
		case "Menu":
			var result = menu_manager.process_key(key);
			if (result["done"]) {
				stats.save(); // Looks like a good time to save
				this.state = "";
			}
			break;
		case "CutScene":
			var result = cut_scenes.process_key(key);
			if (result["done"]) {
				// Save whenever coming out of a cutscene
				// Note that this includes opening treasure chests, shopping, regular conversations, etc.
				stats.save();
				this.state = "";
				if (result["battle"]) {
					this.next_state = "Battle";
					this.transition_time = 1;
					// The following sets up the battle. Will need parameters or to fetch data from elsewhere at some point
					battle_manager.start_battle(result["battle"]);
				}
				if (result["cutscene"]) {
					this.state = "CutScene";
					cut_scenes.initialize_cutscene(result["cutscene"]);
				}
			}
			break;
		case "Battle":
			var result = battle_manager.process_key(key);
			if (result["done"]) {
				stats.save(); // Save after every battle.
				this.state = "";
			}
			break;
		}
	}
	// Set up the opening menu
	open(opening_cutscene) {
		this.state = "CutScene";
		cut_scenes.initialize_cutscene(opening_cutscene);
	}
}

state_system = new StateSystem();
