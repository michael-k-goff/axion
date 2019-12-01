class MapObject extends XObject {
	constructor(input) {
		// Default image is blank. Make sure nothing appears there.
		super(input);
		this.label = input.label;
	}
}
// Interaction function. For now it is meant to be interaction with the hero,
// but could be extended to interaction with any other object
MapObject.prototype.interact = function(interaction_result,object_num) {
	if (this.is_leaving(interaction_result["map_obj"], interaction_result["new_position"])) {
		// Illustration of how to remove an object from the scene
		interaction_result["remove_objects"] =
			interaction_result["remove_objects"].concat(object_num);
	}
}
// When a player tries to interact with the obect actively, e.g. with Enter key
MapObject.prototype.active_interact = function(map_obj, target_x, target_y, object_num,result) {
}
// Helper functions for interaction
MapObject.prototype.block = function(interaction_result) {
	if (this.is_entering(interaction_result["map_obj"], interaction_result["new_position"])) {
		interaction_result["impassible"] = 1;
	}
}

// Generic invisible cutscene, triggered by walking into it
class MapCutScene extends MapObject {
	constructor(input) {
		super(input);
		this.cutscene = input.cutscene;
	}
}
MapCutScene.prototype.interact = function(interaction_result, object_num) {
	if (this.is_entering(interaction_result["map_obj"], interaction_result["new_position"])) {
		interaction_result["CutScene"] = this.cutscene;
	}
}

class MapWarp extends MapObject {
	constructor(input) {
		super(input);
		this.destination = input.destination;
		// What to do if a condition for activiting the warp is not met.
		if ("condition" in input) {
			this.condition = input.condition;
			if ("message" in input) {
				this.message = input.message;
			}
		}
	}
}
MapWarp.prototype.interact = function(interaction_result, object_num) {
	if (this.is_entering(interaction_result["map_obj"], interaction_result["new_position"])) {
		if (!(this.condition) || this.condition()) {
			interaction_result["next_x"] = this.destination.x;
			interaction_result["next_y"] = this.destination.y;
			interaction_result["new_map"] = this.destination.map;
		}
		else if (this.message) {
			interaction_result["CutScene"] = this.message;
		}
	}
}

class MapPerson extends MapObject {
	constructor(input) {
		super(input);
		this.cutscene = input.cutscene;
		this.direction_blocks = input.direction_blocks;
		this.motion = input.motion;
		this.target_x = this.x;
		this.target_y = this.y;
		this.modify = input.modify;
		this.motion_speed = (input.motion && input.motion.speed) ? input.motion.speed : 2.0;
	}
}
MapPerson.prototype.interact = function(interaction_result,object_num) {
	this.block(interaction_result);
}
MapPerson.prototype.active_interact = function(map_obj, target_x, target_y, object_num,result) {
	if (this.is_in(target_x, target_y)) {
		var next_direction = {"Up":"Down","Down":"Up","Left":"Right","Right":"Left"}[map_obj.direction];
		if (this.direction_blocks) {
			this.set_animation(this.direction_blocks[next_direction]);
		}
		if (this.cutscene) {
			result["CutScene"] = this.cutscene;
		}
		if (this.modify) {
			this.modify(this);
		}
	}
}
MapPerson.prototype.move_to_target = function(delta) {
	// If not already at the target, move toward it
	// Return 1 if blocked
	var vector = [this.target_x - this.x, this.target_y - this.y];
	var vector_length = Math.sqrt(Math.pow(this.target_x - this.x,2)+Math.pow(this.target_y - this.y,2));
	var step = delta*this.motion_speed;
	var new_pos = [this.target_x, this.target_y];
	if (step < vector_length) {
		new_pos = [this.x + step * vector[0]/vector_length, this.y + step * vector[1]/vector_length];
	}
	if (passable([ new_pos[0], new_pos[1] ], this) && !(map_hero.is_in(new_pos[0], new_pos[1]))) {
		this.x = new_pos[0];
		this.y = new_pos[1];
		this.map_object.position.set(this.x,this.y,this.z);
	}
	else {
		return 1;
	}
}
MapPerson.prototype.update = function(delta) {
	XObject.prototype.update(delta);
	if (this.motion) {
		if (this.x != this.target_x || this.y != this.target_y) {
			if (Math.abs(this.target_x-this.x) > Math.abs(this.target_y-this.y)) {
				this.set_animation(this.direction_blocks[this.target_x>this.x ? "Right" : "Left"]);
			}
			else {
				this.set_animation(this.direction_blocks[this.target_y>this.y ? "Up" : "Down"]);
			}
			if (this.move_to_target(delta) && this.motion.type == "random_walk") {
				this.target_x = this.x;
				this.target_y = this.y;
			}
			return;
		}
		if (this.motion.type == "random_walk") {
			if (this.time_left && this.time_left > 0) {
				this.time_left -= delta;
				return;
			}
			var random_dir = Math.floor(Math.random()*4);
			var target_x = this.x + [-1,1,0,0][random_dir];
			var target_y = this.y + [0,0,-1,1][random_dir];
			if (!(this.motion.condition) || this.motion.condition(target_x, target_y)) {
				this.target_x = target_x;
				this.target_y = target_y;
				this.time_left = "pause_time" in this.motion ? this.motion.pause_time : 2;
				this.set_animation(this.direction_blocks[["Left","Right","Down","Up"][random_dir]]);
			}
		}
		if (this.motion.type == "loop") {
			if (!("station" in this)) {
				this.station = 0;
			}
			this.station = (this.station+1)%this.motion.points.length;
			this.target_x = this.motion.points[this.station][0];
			this.target_y = this.motion.points[this.station][1];
		}
	}
}

// Treasure chest
class MapTreasure extends MapObject {
	constructor(input) {
		input.tex = "art/animation.png";
		input.blocks = [[6,5]];
		super(input);
		var message = "Received";
		var icons = [null];
		this.id = input.id; // Unique ID that lets us keep track of which treasures are opened.
		this.treasure = input.treasure;
		if ("gold" in input.treasure) {
			message += `\n${input.treasure.gold} Gold`;
			icons = icons.concat(null);
		}
		if ("item" in input.treasure) {
			for (var i=0; i<input.treasure.item.length; i++) {
				var item = item_database.items[input.treasure.item[i][0]];
				var num = input.treasure.item[i][1];
				message += `\n   ${item.name}`;
				if (num > 1) {
					message += ` x${num}`;
				}
				icons = icons.concat([item.icon]);
			}
		}
		if ("equipment" in input.treasure) {
			for (var i=0; i< input.treasure.equipment.length; i++) {
				var e = equipment_database[input.treasure.equipment[i][0]][input.treasure.equipment[i][1]];
				var num = input.treasure.equipment[i][2];
				message += `\n   ${e.name}`;
				if (num > 1) {
					message += ` x${num}`;
				}
				icons = icons.concat([e.icon]);
			}
		}
		if ("element" in input.treasure) {
			for (var i=0; i< input.treasure.element.length; i++) {
				var e = element_database[input.treasure.element[i][0]];
				var num = input.treasure.element[i][1];
				message += `\n   ${e.name}`;
				if (num > 1) {
					message += ` x${num}`;
				}
				icons = icons.concat([e.icon]);
			}
		}
		this.cutscene = new CutSceneConvo({"text":[message],"icons":[icons]});
		// Alternate cut scene for when the box is already open.
		this.open_cutscene = new CutSceneConvo({"text":["You search the box for more items. There is a message scrawled at the bottom.\n\n\"Greed shall be your undoing.\""]});
	}
}
MapTreasure.prototype.interact = function(interaction_result,object_num) {
	// Open box icon if needed
	if (stats.treasures[this.id]) {
		this.blocks=[[7,5]];
	}
	this.block(interaction_result);
}
MapTreasure.prototype.active_interact = function(map_obj, target_x, target_y, object_num,result) {
	if (this.is_in(target_x, target_y)) {
		// Handle the empty box case
		if (stats.treasures[this.id]) {
			result["CutScene"] = this.open_cutscene;
			return;
		}
		// Grant the items
		if ("gold" in this.treasure) {
			stats.gold += this.treasure.gold;
		}
		if ("item" in this.treasure) {
			for (var i=0; i<this.treasure.item.length; i++) {
				stats.grant_items(this.treasure.item[i][0],this.treasure.item[i][1]);
			}
		}
		if ("equipment" in this.treasure) {
			for (var i=0; i<this.treasure.equipment.length; i++) {
				stats.add_equipment(this.treasure.equipment[i][0], this.treasure.equipment[i][1], this.treasure.equipment[i][2]);
			}
		}
		if ("element" in this.treasure) {
			for (var i=0; i<this.treasure.element.length; i++) {
				stats.add_element(this.treasure.element[i][0], this.treasure.element[i][1]);
			}
		}
		// Swap the icon and save the opening of the chest.
		stats.treasures[this.id] = 1;
		this.set_animation([[7,5]]);
		// Load cut scene
		if (this.cutscene) {
			result["CutScene"] = this.cutscene;
		}
	}
}

// All map objects are stored here by map name
class MapObjectController {
	constructor() {
		this.map_objects = {}
	}
	// Register a map. Needed if there are no map objects to be added
	register_map(mapname) {
		if (!(mapname in this.map_objects)) {
			this.map_objects[mapname] = [];
		}
	}
	// Add a map object. For now, the object itself is initialized elsewhere
	add_map_object(obj,mapname) {
		if (!(mapname in this.map_objects)) {
			this.map_objects[mapname] = [];
		}
		this.map_objects[mapname] = this.map_objects[mapname].concat(obj);
	}
	render_map(mapname) {
		for (var i=0; i<this.map_objects[mapname].length; i++) {
			this.map_objects[mapname][i].render();
		}
	}
	unrender_map(mapname) {
		for (var i=0; i<this.map_objects[mapname].length; i++) {
			this.map_objects[mapname][i].unrender();
		}
	}
	// Update. Needs to know the current map
	update(current_map,delta) {
		if (!(current_map in this.map_objects)) {
			return;
		}
		for (var i=0; i<this.map_objects[current_map].length; i++) {
			this.map_objects[current_map][i].update(delta);
		}
	}
	// Interact (the hero, for now) with all objects on the current map
	interact(interaction_result, current_map) {
		// Pre-processing of interaction with map objects
		interaction_result["remove_objects"] = [];

		// Interact with each map object individually
		for (var i=0; i<this.map_objects[current_map].length; i++) {
			this.map_objects[current_map][i].interact(interaction_result,i);
		}

		// Post-processing of interaction with map objects
		if (interaction_result["remove_objects"].length > 0) {
			for (var i=interaction_result["remove_objects"].length-1; i>=0; i--) {
				var rm_index = interaction_result["remove_objects"][i]
				scene.remove(this.map_objects[current_map][rm_index].map_object);
				this.map_objects[current_map].splice(rm_index,1);
			}
		}
	}
	remove_object(current_map, rm_index) {
		scene.remove(this.map_objects[current_map][rm_index].map_object);
		this.map_objects[current_map].splice(rm_index,1);
	}
	remove_objects(current_map, object_type, condition=null) {
		var i = map_objects.map_objects[current_map].length;
		while (i--) {
			if (map_objects.map_objects[current_map][i] instanceof object_type) {
				if (!condition || condition(map_objects.map_objects[current_map][i])) {
					map_objects.remove_object(current_map,i);
				}
			}
		}
	}
	// Swap all open treasure chests with the open icon.
	// Might want to do this in a more systematic manner later.
	open_treasure(current_map) {
		var i = map_objects.map_objects[current_map].length;
		while (i--) {
			if (map_objects.map_objects[current_map][i] instanceof MapTreasure) {
				if (stats.treasures[map_objects.map_objects[current_map][i].id]) {
					map_objects.map_objects[current_map][i].set_animation([[7,5]]);
				}
			}
		}
	}
	active_interact(map_obj, target_x, target_y, current_map,result) {
		// Interact with each map object individually
		for (var i=0; i<this.map_objects[current_map].length; i++) {
			this.map_objects[current_map][i].active_interact(map_obj, target_x, target_y, i,result);
		}
	}
}
map_objects = new MapObjectController();
