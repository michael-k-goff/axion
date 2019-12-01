class MapHero extends MapObject {
	constructor() {
		super({"x":stats.start_position().x,"y":stats.start_position().y,
			"tex":"art/mod_RPG_assets.png","blocks":[[4,6]]
		});
		this.z = 1.1;
		this.lead = 0; // Lead character
	}
	update(milliSec) {
		this.set_direction();
		var interaction_result = this.walk(milliSec);
		super.update(milliSec);
		return interaction_result;
	}
	walk(delta) {
		var speed = debug_mode ? 10.0:4.0; // Walking speed
		var delta_x = 0;
		var delta_y = 0;
		if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
			delta_x -= speed*delta;
		}
		if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
			delta_x += speed*delta;
		}
		if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
			delta_y -= speed*delta;
		}
		if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
			delta_y += speed*delta;
		}
		var new_pos = [this.x + delta_x, this.y + delta_y];
		var interaction_result = {"map_obj":this, "new_position":new_pos};
		map_controller.interact(interaction_result);
		this.map_object.position.set(this.x,this.y,this.z);
		return interaction_result;
	}
	set_direction() {
		var new_direction = this.direction;
		var new_is_moving = 1;
		if (keys["ArrowRight"]) {
			new_direction = "Right";
		}
		else if (keys["ArrowLeft"]) {
			new_direction = "Left";
		}
		else if (keys["ArrowDown"]) {
			new_direction = "Down";
		}
		else if (keys["ArrowUp"]) {
			new_direction = "Up";
		}
		else {
			new_is_moving = 0;
		}
		if (new_direction != this.direction || new_is_moving != this.is_moving) {
			this.set_hero_animation(new_direction,new_is_moving);
		}
	}
	set_hero_animation(new_direction,new_is_moving) {
		if (new_is_moving) {
			this.set_animation({
				"Left":[[[7,4],[7,6]],[[0,4],[0,6]],[[7,1],[7,3]]][this.lead],
				"Right":[[[5,4],[5,6]],[[2,4],[2,6]],[[5,1],[5,3]]][this.lead],
				"Down":[[[4,4],[4,5]],[[1,4],[1,5]],[[4,1],[4,2]]][this.lead],
				"Up":[[[6,4],[6,5]],[[3,4],[3,5]],[[6,1],[6,2]]][this.lead]
			}[new_direction]);
		}
		else {
			this.set_animation({
				"Left":[[[7,6]],[[0,6]],[[7,3]]][this.lead],
				"Right":[[[5,6]],[[2,6]],[[5,3]]][this.lead],
				"Down":[[[4,6]],[[1,6]],[[4,3]]][this.lead],
				"Up":[[[6,6]],[[3,6]],[[6,3]]][this.lead]
			}[new_direction]);
		}
		this.direction = new_direction;
		this.is_moving = new_is_moving;
	}
}
MapHero.prototype.set_lead = function() {
	var new_lead = 0;
	if (!(world_maps[map_controller.current_map].townlike)) {
		if (!(stats.heroes[0].is_alive())) {
			new_lead = 1;
			if (!(stats.heroes[1].is_alive())) {
				new_lead = 2;
			}
		}
	}
	if (new_lead != this.lead) {
		this.lead = new_lead;
		this.set_hero_animation(this.direction, this.is_moving);
	}
}
