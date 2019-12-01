// Basic code for enemies

// This is for regular enemies on the map.
class MapEnemy extends MapObject {
	constructor(input) {
		super(input);
		// Later on, store information about the battle
        this.enemies = input.enemies;
		this.start_time = clock.elapsedTime;
	}
	interact(interaction_result, object_num) {
		if (this.is_in(interaction_result["new_position"][0], interaction_result["new_position"][1])) {
			// Return more complete battle data
			interaction_result["battle"] = 1;
            interaction_result["enemies"] = this.enemies;
			interaction_result["remove_objects"] =
				interaction_result["remove_objects"].concat(object_num);
		}
	}
}
// This is where we define enemies coming after the hero on the map or other map behavior.
MapEnemy.prototype.update = function(delta) {
	XObject.prototype.update(delta);
	var hero_vector = [map_hero.x - this.x, map_hero.y - this.y];
	var vector_length = Math.sqrt(Math.pow(map_hero.x - this.x,2)+Math.pow(map_hero.y - this.y,2));
	if (vector_length > 10) {return;} // Enemies don't move unless sufficiently close to player.
	var step = delta*3.0;
	var new_pos = [step * hero_vector[0]/vector_length, step * hero_vector[1]/vector_length];
	if (passable([ this.x + new_pos[0],this.y + new_pos[1] ])) {
		this.x += new_pos[0];
		this.y += new_pos[1];
		this.map_object.position.set(this.x,this.y,this.z);
	}
}
