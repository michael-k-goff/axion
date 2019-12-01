// Results of some performance tests on map generation
// 100 X 100: about 50-100 milliseconds
// 250 X 250: about 1-2 seconds
// 500 X 500: about 3-8 seconds

(function(){
  function load(script) {
    document.write('<'+'script src="'+script+'" type="text/javascript"><' + '/script>');
  }
  load("code/terrain.js");
  load("code/world_map.js");
})();

class GameMap {
	constructor(map_data) {
		this.terrain = map_data["terrain"];
		this.terrain_map = map_data["terrain_map"];
		this.terrain_impassible = map_data["terrain_impassible"];
		this.terrain2 = map_data["terrain2"];
		this.terrain_map2 = map_data["terrain_map2"];
		this.terrain_impassible2 = map_data["terrain_impassible2"];
        this.terrain_passible2 = map_data["terrain_passible2"];
		this.map = this.terrain_to_map(this.terrain, this.terrain_map);
        if ("transformer" in map_data) {
            map_data["transformer"](this.map);
        }
		this.map2 = this.terrain_to_map(this.terrain2, this.terrain_map2);
        this.tex = map_data["art"];
        this.tex2 = map_data["art2"];
	}
	pattern_match(ter,i,j,tm) {
		for (var ii=-1; ii<2; ii++) {
			for (var jj=-1; jj<2; jj++) {
				var ter_ = ' '
				if (i+ii >= 0 && i+ii < ter.length && j+jj >= 0 && j+jj < ter[0].length) {
					ter_ = ter[i+ii][j+jj]
				}
				var tm_ = tm[3*(ii+1)+(jj+1)];
				if (tm_ != ' ' && ter_ != tm_) {
					return false;
				}
			}
		}
		return true;
	}
	terrain_to_map(ter,ter_map) {
		var m = Array(ter.length).fill(0);
		for (var i=0; i<ter.length; i++) {
			m[i] = Array(ter[0].length).fill(0);
			for (var j=0; j<ter[0].length; j++) {
				for (var k=0; k<ter_map.length; k++) {
					if (this.pattern_match(ter,i,j,ter_map[k][0])) {
						m[i][j] = ter_map[k][1];
					}
				}
			}
		}
		return m;
	}
	// Interact. For now, assume it is with the hero
	interact(interaction_result) {
		if (!passable(interaction_result["new_position"])) {
			interaction_result["impassible"] = 1;
		}
	}
}
GameMap.prototype.update = function(delta) {
    //return; // asdf Get rid of this; this line temporarily prevents enemy spawning
    if ("spawn" in world_maps[map_controller.current_map]) {
        var cur_objects = map_objects.map_objects[map_controller.current_map];
        var num_enemies = 0; // Number of enemies on map
        for (var i=0; i<cur_objects.length; i++) {
            if (cur_objects[i] instanceof MapEnemy) {num_enemies += 1;}
        }
        var x = Math.floor(Math.random() * map_controller.get_map().terrain[0].length);
        var y = Math.floor(Math.random() * map_controller.get_map().terrain.length);
        var e = world_maps[map_controller.current_map]["spawn"](x,y);
        if (num_enemies < e["max_enemies"]) {
            if (passable([x,y]) && (map_hero.x>x+10 || map_hero.x<x-10 || map_hero.y>y+10 || map_hero.y<y-10) ) {
                var new_enemy = new MapEnemy({"x":x,"y":y,"tex":e.tex, "blocks":e.blocks, "enemies":e.enemies});
                map_objects.add_map_object(new_enemy,map_controller.current_map);
                new_enemy.render();
            }
        }
    }
}

class MapController {
	constructor() {
		this.maps = {};
		this.current_map = "";
		this.map_scene_objects = [null, null]; // The objects as they appear in the scene
        this.fadein = -1; // Time left for current fadein animation.
        this.fadeout = -1; // Time left for current fadeout animation
        this.next_map = 0; // The next map to warp to, if any
	}
	add_map(map,mapname) {
		this.maps[mapname] = map;
	}
	set_map(mapname) {
		if (this.current_map.length > 0) {
			this.unrender_current_map();
		}
		this.current_map = mapname;
		this.render_current_map();
	}
	render_current_map() {
		load_map(scene,this.maps[this.current_map].map,this.maps[this.current_map].tex,0);
		load_map(scene,this.maps[this.current_map].map2,this.maps[this.current_map].tex2,1,0.1);
		map_objects.render_map(this.current_map);
        var d2 = new Date();
        var n2 = d2.getTime();
	}
	unrender_current_map() {
        map_objects.unrender_map(this.current_map);
		scene.remove(this.map_scene_objects[0].mesh);
        this.map_scene_objects[0].material.dispose();
        this.map_scene_objects[0].geometry.dispose();
		scene.remove(this.map_scene_objects[1].mesh);
        this.map_scene_objects[1].material.dispose();
        this.map_scene_objects[1].geometry.dispose();
	}
	get_map() {
		return this.maps[this.current_map];
	}
	// Update for delta milliseconds
	update(delta) {
        if (this.is_active()) {
            this.maps[this.current_map].update(delta);
            map_objects.update(this.current_map,delta);
        }
        this.fadein -= delta;
        this.fadeout -= delta;
        if (this.next_map && this.fadeout <= 0) {
            this.set_map(this.next_map[0]);
            if (world_maps[this.current_map].enter) {
                world_maps[this.current_map].enter(this.maps[this.current_map]);
            }
            map_hero.set_lead();
            // I don't like going to the object directly, but so be it.
            map_hero.x = this.next_map[1];
            map_hero.y = this.next_map[2];
            map_hero.map_object.position.set(map_hero.x, map_hero.y, map_hero.z);
            this.next_map = 0;
            this.activate();
        }
	}
	// Interact with the map. Meant initially for use with the hero, maybe later with other objects
	interact(interaction_result) {
		// Interact with the current map
		this.get_map().interact(interaction_result);
		// Interact with all objects on the current map
		map_objects.interact(interaction_result, this.current_map);
		// Post-processing of interaction
		if (interaction_result["new_map"]) { // Warp to a new map. Doesn't happen right away
            this.next_map = [interaction_result["new_map"],interaction_result["next_x"],interaction_result["next_y"]];
            this.fadeout = 1;
		}
		if (!interaction_result["impassible"]) {
			interaction_result["map_obj"].x = interaction_result["new_position"][0];
			interaction_result["map_obj"].y = interaction_result["new_position"][1];
		}
	}
    // Activate the map after being inactive, probably after battle
    activate() {
        this.fadein = 1;
    }
    // Return whether the map is active, meaning the player can move, summon menus, NPCs move, etc.
    is_active() {
        return (this.fadeout <= 0 && this.fadein <= 0);
    }
    // Active interact, such as when pressing enter. For now, assume map_obj is the hero.
    active_interact(map_obj,result) {
        var target_x = map_obj.x + {"Left":-1,"Right":1,"Up":0,"Down":0}[map_obj.direction];
        var target_y = map_obj.y + {"Left":0,"Right":0,"Up":1,"Down":-1}[map_obj.direction];
        // For now, there is no active interaction directly with the maps
        map_objects.active_interact(map_obj, target_x, target_y, this.current_map,result);
    }
    // General display function for map and all objects on it
    display() {
        var cam_x = Math.min(this.maps[this.current_map].map[0].length-camera.right-0.5,Math.max(map_hero.x,camera.right-0.5));
        if (this.maps[this.current_map].map[0].length < 2*camera.right) {
            cam_x = camera.right-1.25;
        }
        var cam_y = Math.min(this.maps[this.current_map].map.length-camera.top-0.5,Math.max(map_hero.y,camera.top-0.5));
        if (this.maps[this.current_map].map.length < 2*camera.top) {
            cam_y = camera.top-1.25;
        }
        camera.position.x = cam_x;
        camera.position.y = cam_y;
        renderer.render( scene, camera );
    }
    display_hud(hud_bmp) {
        if (this.fadein > 0) {
            var alpha = this.fadein;
            hud_bmp.fillStyle = "rgba(0,0,0,"+alpha.toString()+")";
            hud_bmp.fillRect(0,0, window.innerWidth, window.innerHeight);
            hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
        }
        // Hopefully we won't get both simultaneously
        if (this.fadeout > 0) {
            var alpha = 1-this.fadeout;
            hud_bmp.fillStyle = "rgba(0,0,0,"+alpha.toString()+")";
            hud_bmp.fillRect(0,0, window.innerWidth, window.innerHeight);
            hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
        }
    }
}
map_controller = new MapController();

function load_map(scene,map,tex,level_number,z=0) {
    var material = new THREE.MeshBasicMaterial( {
        map: textures[tex]
    } );
    material.transparent = true;
    var h = map.length;
    var w = map[0].length;
    var planeGeo = new THREE.PlaneGeometry(w,h,w,h);
    for (i=0; i<h; i++) {
        for (j=0; j<w; j++) {
            block_x = map[i][j][0];
            block_y = map[i][j][1];
            var tx = texture_dimensions[tex][0];
            var ty = texture_dimensions[tex][1];
            // The small offsets in the texture coordinate are to prevent neighboring tiles from bleeding in.
            // This (I think) resolves a flickering bug.
            planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)   ][ 0 ].set( block_x/tx+0.001,     (block_y+1)/ty-0.001); // upper left quarter
            planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)   ][ 1 ].set( block_x/tx+0.001,     block_y/ty+0.001);
            planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)   ][ 2 ].set( (block_x+1)/tx-0.001, (block_y+1)/ty-0.001);
            planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)+1 ][ 0 ].set( block_x/tx+0.001,     block_y/ty+0.001);
            planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)+1 ][ 1 ].set( (block_x+1)/tx-0.001, block_y/ty+0.001);
            planeGeo.faceVertexUvs[ 0 ][ 2*(w*i+j)+1 ][ 2 ].set( (block_x+1)/tx-0.001, (block_y+1)/ty-0.001);
        }
    }
    var shape_mesh = new THREE.Mesh( planeGeo, material ) ;
    shape_mesh.position.set(w/2-1/2,h/2-1/2,z);
    scene.add( shape_mesh ); // scene.remove( shape_mesh ) to take out the object.
    map_controller.map_scene_objects[level_number] = {
        "mesh":shape_mesh,
        "material":material,
        "geometry":planeGeo
    };
    return;
}

function passable(new_pos, check_objects=0) {
	var map = map_controller.get_map();
	if (new_pos[0] < 0 || new_pos[1] < 0 || new_pos[0]+1 > map.map[0].length || new_pos[1]+1 > map.map.length) {
        return false;
	}
	var rounded = [Math.round(new_pos[0]), Math.round(new_pos[1])];
	var ter1 = map.terrain[map.terrain.length-rounded[1]-1][rounded[0]];
	var ter2 = map.terrain2[map.terrain2.length-rounded[1]-1][rounded[0]];
    if (map.terrain_passible2.indexOf(ter2) >= 0) {
        return true;
    }
	if (map.terrain_impassible.indexOf(ter1) >= 0 || map.terrain_impassible2.indexOf(ter2) >= 0) {
		return false;
	}
    // Impassible if there is a conflict with any object, even warps, etc.. May need refining later
    if (check_objects) {
        var map_objs = map_objects.map_objects[map_controller.current_map];
        for (var i=0; i<map_objs.length; i++) {
            if (map_objs[i] != check_objects && map_objs[i].is_in(new_pos[0], new_pos[1])) {
                return false;
            }
        }
    }
	return true;
}

// Initialize the raw data into maps
function map_initialize() {
	for (key in world_maps) {
		map_objects.register_map(key);
		map_controller.add_map(new GameMap(world_maps[key]["terrain"]), key);
		for (var i=0; i<world_maps[key]["objects"].length; i++) {
			var new_obj;
			switch (world_maps[key]["objects"][i]["type"]) {
			case "Generic":
				new_obj = new MapObject( world_maps[key]["objects"][i] );
				break;
            case "CutScene":
                new_obj = new MapCutScene( world_maps[key]["objects"][i] );
                break;
			case "Warp":
				new_obj = new MapWarp( world_maps[key]["objects"][i] );
				break;
            case "Person":
                new_obj = new MapPerson( world_maps[key]["objects"][i] );
                break;
            case "Enemy":
                new_obj = new MapEnemy ( world_maps[key]["objects"][i] );
                break;
            case "Treasure":
                new_obj = new MapTreasure ( world_maps[key]["objects"][i] );
                break;
            }

			map_objects.add_map_object(new_obj,key);
		}
	}
}

// Some helper animation functions.
// They may be moved later on.
function animate_battle(hud_bmp, transition_time) {
    var alpha = 1-transition_time;
    var red = Math.min(255,512*transition_time);
    hud_bmp.fillStyle = "rgba("+red.toString()+",0,0,"+alpha.toString()+")";
    hud_bmp.fillRect(0,0, window.innerWidth, window.innerHeight);
    hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
}
