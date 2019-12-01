// Code for managing the game textures.

textures = {};
texture_dimensions = {};
hud_images = {}

function load_texture(filename,len_x,len_y) {
	textures[filename] = new THREE.TextureLoader().load(filename);
	textures[filename].magFilter = THREE.NearestFilter;
	textures[filename].minFilter = THREE.LinearFilter;
	texture_dimensions[filename] = [len_x, len_y];
}

function load_textures() {
	load_texture("art/overworld.png",32,16);
	load_texture("art/town_overlay.png",8,8);
	load_texture("art/mod_RPG_assets.png",8,8);
	load_texture("art/animation.png",8,8);
	load_texture("art/Pointer.png",10,1);
	load_texture("art/beetle5_2.png",5,4);
	load_texture("art/enemies.png",8,8);
	load_texture("art/1sttileset.png",4,24);
	load_texture("art/dirt_tiles_mod.png",24,16);
	load_texture("art/npc.png",8,8);
}

function load_image(filename) {
	hud_images[filename] = new Image();
	hud_images[filename].src = filename;
}

function load_images() {
	load_image("art/Pointer.png");
	load_image("art/animation.png");
	load_image("art/mod_RPG_assets.png");
}
