// Generic object class. Meant to be a parent to map and battle objects

class XObject {
	constructor(input) {
		this.x = input.x;
		this.y = input.y;
		this.currentDisplayTime = 0;
		this.currentTile = 0;
		if ("tex" in input) {
			this.texname = input.tex;
			this.blocks = input.blocks;
		}
		if ("text" in input) { // For objects that will be presented as rendered text
			this.text = input.text;
			this.color = "color" in input ? input.color : "#FFFFFF";
		}
        this.scene = scene; // The scene with which the object is associated
        // By default, it is the map scene. Do we want a default?
		// Some values have defaults but will have mechanisms to change as needed
		this.z = 1;
		this.frame_time = 250; // Duration of an animation frame in millseconds
		this.direction = "Down"; // Direction the object is "facing". Should be irrelevant for objects that don't move.
		this.is_moving = 0; // By default, objects don't move.
		this.size = "size" in input ? input["size"] : [1,1]; // x and y of size, relative to standard objects
	}

	// Change the offset with the texture for displaying
	set_offset(block_x, block_y) {
		var tx = texture_dimensions[this.texname][0];
		var ty = texture_dimensions[this.texname][1];
		if (!this.geometry) {return}
		this.geometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].set( block_x/tx,     (block_y+1)/ty); // upper left quarter
		this.geometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].set( block_x/tx,     block_y/ty);
		this.geometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].set( (block_x+1)/tx, (block_y+1)/ty);
		this.geometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].set( block_x/tx,     block_y/ty);
		this.geometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].set( (block_x+1)/tx, block_y/ty);
  		this.geometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].set( (block_x+1)/tx, (block_y+1)/ty);
		this.geometry.uvsNeedUpdate = true;
	}
	// Update object animation as needed, perform whatever other checks are needed
	update(milliSec)
	{
		this.currentDisplayTime += 1000*milliSec;
		if (this.currentDisplayTime >= this.frame_time && this.blocks)
		{
			this.currentDisplayTime = this.currentDisplayTime % this.frame_time;
			this.currentTile = (this.currentTile + 1)%(this.blocks.length);
			this.set_offset(this.blocks[this.currentTile][0], this.blocks[this.currentTile][1]);
		}
	}
	// Change animation to a certain block set
	set_animation(blocks) {
		this.blocks = blocks;
		this.currentDisplayTime = 0;
		this.currentTile = 0;
		this.set_offset(blocks[0][0],blocks[0][1]);
	}
	// Add object to the scene
	render() {
		if ("text" in this) {
			this.render_text();
		}
		else if ("texname" in this) {
			this.render_image();
		}
	}
	render_image() {
		this.material = new THREE.MeshBasicMaterial( { map: textures[this.texname] } );
		this.material.transparent = true;
		this.geometry = new THREE.PlaneGeometry(this.size[0],this.size[1],1,1); // Assumes a 1X1 object with two triangles.
		this.set_offset(this.blocks[0][0],this.blocks[0][1]);
		this.map_object = new THREE.Mesh(this.geometry, this.material);
		this.map_object.position.set(this.x,this.y,this.z); // z coordinate can be changed.
		this.scene.add(this.map_object);
	}
	render_text() {
		this.can = document.createElement('canvas');
		this.can.width = 256;
		this.can.height = 64;

		this.bmp = this.can.getContext('2d');
		this.bmp.fillStyle = this.color;
		this.bmp.font = "Normal 30px Arial";
		this.bmp.textAlign = 'center';
		this.bmp.fillText(this.text, 128,32);

		this.t = new THREE.Texture(this.can);
		this.t.minFilter = THREE.LinearFilter;
		this.t.needsUpdate = true;
		this.material = new THREE.MeshBasicMaterial( {map: this.t} );
		this.material.transparent = true;
		// Size of text determined here. Revise as necessary.
		this.geometry = new THREE.PlaneGeometry( 6.0,1.5,1,1 );
		this.map_object = new THREE.Mesh( this.geometry, this.material );
		this.map_object.position.set(this.x,this.y,this.z); // z coordinate can be changed.
		this.scene.add( this.map_object );
	}
	unrender() {
		this.scene.remove(this.map_object);
		this.map_object = null;
		if (this.material) {
			this.material.dispose();
			this.material = null;
		}
		if (this.t) {
			this.t.dispose();
			this.t = null;
		}
		if (this.geometry) {
			this.geometry.dispose();
			this.geometry = null;
		}
	}
	move(x,y) { // Move the object and set position
		this.x = x;
		this.y = y;
		if (this.map_object) {
			this.map_object.position.set(x,y,this.z);
		}
	}
	// Helper functions for interaction
	is_in(x,y) {
		return (x > this.x-0.5 && x < this.x+this.size[0]-0.5 &&
			y > this.y-0.5 && y < this.y+this.size[1]-0.5
		);
	}
	is_entering(map_obj, new_pos) {
		return ( this.is_in(new_pos[0],new_pos[1]) && !(this.is_in(map_obj.x,map_obj.y)) );
	}
	is_leaving(map_obj, new_pos) {
		return ( !(this.is_in(new_pos[0],new_pos[1])) && this.is_in(map_obj.x,map_obj.y) );
	}
}
