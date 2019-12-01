debug_mode = 0;
reload = 0; // Whether to try to reload the old save. Should generally be set.
// The main game control JS file

// Load various objects
(function(){
	function load(script) {
		document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
	}
	load("code/texture_manager.js");
	load("code/hud.js");
	load("code/rectangle.js");
	load("code/items.js");
	load("code/elements.js");
	load("code/equipment.js");
	load("code/class.js");
	load("code/menu.js");
	load("code/menu_main.js");
	load("code/xobject.js");
	load("code/map_object.js");
	load("code/hero.js");
	load("code/enemy.js");
	load("code/cut_scene.js");
	load("code/map.js");
	load("code/character.js");
	load("code/state_system.js");
	load("code/status.js");
	load("code/battle.js");
	load("code/action.js");
	load("code/abilities.js");
	load("code/enemy_database.js");
})();

var clock = new THREE.Clock();
global_delta = 0; // A place to store the delta from the clock.

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

scene = new THREE.Scene();
camera = new THREE.OrthographicCamera(-window.innerWidth/100, window.innerWidth/100, window.innerHeight/100, -window.innerHeight/100, 0, 30 );

function initialize() {
	// Camera
	camera.position.z = 5;
	load_textures();
	load_images();
	map_initialize();
	stats.initialize();
	menu_manager = new MenuManager();

	// Set up opening menu
	var opening_cutscene = new CutSceneOpen();
	state_system.open(opening_cutscene);
}

// Load the game (or not) and set up everything that follows.
function start_game(load) {
	if (load) {
		stats.load();
	}
	map_controller.set_map(stats.start_position().map);
	map_hero = new MapHero();
	map_hero.render();
}

function animate() {
	var delta = clock.getDelta();
	global_delta = delta;
	requestAnimationFrame( animate );
	state_system.update(delta);
	state_system.display();
}
