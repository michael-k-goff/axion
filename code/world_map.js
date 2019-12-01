// Overworld

function hwall(terrain, y, x1, x2, t) {
	for (var i=x1; i<=x2; i++) {
		terrain[y][i] = t;
	}
}
function vwall(terrain, y1, y2, x, t) {
	for (var i=y1; i<=y2; i++) {
		terrain[i][x] = t;
	}
}

function overworld_generator() {
	var width = 100;
	var height = 100;
	var terrain = Array(height);
	// Fill with grass, adding water around the edges and some scrub in the middle
	// Big stripe of scrubland in the northeast
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('g');
		for (var j=0; j<width; j++) {
			if (j > 0.8*i+60 && j < 0.9*i+75) {
				terrain[i][j] = 's'; // Override with water if appropriate
			}
			if (Math.pow(i-49.5,4)+Math.pow(j-49.5,4)>=Math.pow(49.5,4) ||
				j < 2+2*Math.cos((i-50)/3) ||
				j > 97+3*Math.cos((i-50)/6) ||
				i < 2+2*Math.cos((j-50)/3) ||
				i > 97+3*Math.cos((j-50)/6)) {
				terrain[i][j] = 'w';
			}
			if (5*Math.pow(i-50,2)+Math.pow(j-50,2) < 100) {
				terrain[i][j] = 's';
			}
		}
	}
	// Patch of scrub near the cave
	for (var i=86; i<90; i++) {
		for (var j=11; j<15; j++) {
			terrain[i][j] = 's';
		}
	}
	for (var i=87; i<89; i++) {
		for (var j=14; j<18; j++) {
			terrain[i][j] = 's';
		}
	}
	// Scrub in the northwest, with lake
	for (var j=12; j<25; j++) {
		for (var i=Math.floor(12-j/3); i<17+j/7; i++) {
			terrain[i][j] = 's';
		}
	}
	for (var j=21; j<29; j++) {
		for (var i=12; i<20; i++) {
			if (Math.pow(j-25,2)+Math.pow(i-16,2)<12) {
				terrain[i][j] = 'w'
			}
		}
	}
	// River that flows from the mountain near the middle to the north coast.
	for (var i=0; i < 43; i++) {
		for (var j = Math.floor(52-i/6); j<58-i/4.4; j++) {
			terrain[i][j] = 'w';
		}
	}
	// Small lake in the center
	terrain[49][49] = 'w';
	terrain[49][50] = 'w';
	terrain[50][50] = 'w';
	terrain[50][49] = 'w';
	return terrain;
}

function overworld_generator2() {
	var width = 100;
	var height = 100;
	var tiles = Array(height);
	for (var i=0; i<height; i++) {
		tiles[i] = Array(width).fill('.');
	}
	// Forests in the west
	for (var i=30; i<85; i++) {
		for (var j=Math.floor(i/6+8); j<Math.floor(i/5+10); j++) {
			tiles[i][j] = 'f';
		}
	}
	// Mountains in the east
	for (var i=29; i<96; i++) {
		for (var j=Math.floor(86-i/6); j<Math.floor(93-i/5); j++) {
			tiles[i][j] = 'm';
		}
	}
	// Mountains near the middle that are the source of the river
	for (var i=41; i<45; i++) {
		for (var j=45; j<49; j++) {
			tiles[i][j] = 'm';
		}
	}
	// Small forest patch to the east of the above-mentioned mountains
	for (var j=55; j<65; j++) {
		for (var i=40; i<50; i++) {
			if (Math.pow(j-60,2)+Math.pow(i-45,2)<12) {
				tiles[i][j] = 'f'
			}
		}
	}
	// Some patches of passable bushes
	for (var i=70; i<78; i++) {
		for (var j=43+Math.abs(i-74); j<60+Math.abs(i-78); j++) {
			if ((i+j)%2) {
				tiles[i][j] = 'b';
			}
		}
	}
	// Some patches of passable bushes
	for (var i=47; i<53; i++) {
		for (var j=27; j<35; j++) {
			if ((i+j)%2) {
				tiles[i][j] = 'b';
			}
		}
	}
	// Small forest patch in northwest
	for (var j=30; j<40; j++) {
		for (var i=25; i<35; i++) {
			if (Math.pow(j-35,2)+Math.pow(i-30,2)<12) {
				tiles[i][j] = 'f'
			}
		}
	}
	return tiles;
}

// Town

function town_generator() {
	var width = 50;
	var height = 50;
	var tiles = Array(height);
	for (var i=0; i<height; i++) {
		tiles[i] = Array(width).fill('g');
	}
	// Main central paths
	for (var i=3; i<height-3; i++) {
		tiles[i][24] = 's';
		tiles[i][25] = 's';
		tiles[24][i] = 's';
		tiles[25][i] = 's';
	}
	// Paths to houses
	tiles[26][10] = 's'
	tiles[26][11] = 's';
	tiles[26][38] = 's'
	tiles[26][39] = 's';
	tiles[23][10] = 's'
	tiles[23][11] = 's';
	tiles[23][38] = 's'
	tiles[23][39] = 's';
	// Lake
	for (var i=0; i<height; i++) {
		for (var j=0; j<width; j++) {
			if ((i-25)*(i-25)+(j-25)*(j-25) < 25) {
				tiles[i][j] = 'w';
			}
		}
	}
	// Farm
	for (var i=0; i<3; i++) {
		for (var j=0; j<10; j++) {
			tiles[9+i][10+j] = 'F';
			tiles[9+i][30+j] = 'F';
		}
	}
	return tiles;
}

function town_generator2() {
	var width = 50;
	var height = 50;
	var tiles = Array(height);
	for (var i=0; i<height; i++) {
		tiles[i] = Array(width).fill('.');
	}
	// Stone path loop around the town
	for (var i=2; i<height-2; i++) {
		tiles[i][2] = 'p';
		tiles[i][3] = 'p';
		tiles[i][width-3] = 'p';
		tiles[i][width-4] = 'p';
		tiles[2][i] = 'p';
		tiles[3][i] = 'p';
		tiles[height-3][i] = 'p';
		tiles[height-4][i] = 'p';
	}
	// Entrance
	for (var i=0; i<3; i++) {
		tiles[height-i-1][24] = 'p';
		tiles[height-i-1][25] = 'p';
	}
	// Shop buildings
	for (var j=0; j<3; j++) {
		for (var k=0; k<5; k++) {
			tiles[45-j][5+k] = '0';
			tiles[45-j][15+k] = '0';
			tiles[45-j][30+k] = '0';
			tiles[45-j][40+k] = '0';
		}
	}
	// Shop doors
	tiles[45][7] = 'd';
	tiles[45][17] = 'd';
	tiles[45][32] = 'd';
	tiles[45][42] = 'd';
	// Houses
	for (var i=0; i<3; i++) {
		for (var j=0; j<3; j++) {
			// Southwest quadrant
			tiles[38+i][4+j] = '1';
			tiles[32+i][4+j] = '1';
			tiles[26+i][4+j] = '1';
			tiles[26+i][10+j] = '1';
			// Southeast quadrant
			tiles[38+i][43+j] = '1';
			tiles[32+i][43+j] = '1';
			tiles[26+i][43+j] = '1';
			tiles[26+i][37+j] = '1';
			// Northwest quadrant
			tiles[9+i][4+j] = '1';
			tiles[15+i][4+j] = '1';
			tiles[21+i][4+j] = '1';
			tiles[21+i][10+j] = '1';
			tiles[4+i][10+j] = '1';
			tiles[4+i][16+j] = '1';
			// Northeast quadrant
			tiles[9+i][43+j] = '1';
			tiles[15+i][43+j] = '1';
			tiles[21+i][43+j] = '1';
			tiles[21+i][37+j] = '1';
			tiles[4+i][37+j] = '1';
			tiles[4+i][31+j] = '1';
		}
	}
	// House doors
	tiles[39][4] = 'd';
	tiles[33][4] = 'd';
	tiles[27][4] = 'd';
	tiles[26][11] = 'd';
	tiles[39][45] = 'd';
	tiles[33][45] = 'd';
	tiles[27][45] = 'd';
	tiles[26][38] = 'd';

	tiles[10][4] = 'd';
	tiles[16][4] = 'd';
	tiles[22][4] = 'd';
	tiles[23][11] = 'd';
	tiles[10][45] = 'd';
	tiles[16][45] = 'd';
	tiles[22][45] = 'd';
	tiles[23][38] = 'd';
	tiles[4][11] = 'd';
	tiles[4][17] = 'd';
	tiles[4][32] = 'd';
	tiles[4][38] = 'd';
	return tiles;
}

// Second town
function town2_generator() {
	var width = 50;
	var height = 50;
	var tiles = Array(height);
	for (var i=0; i<height; i++) {
		tiles[i] = Array(width).fill('g');
	}
	for (var i=width-6; i<width; i++) {
		for (var j=0; j<height; j++) {
			tiles[j][i] = 'w';
		}
	}
	return tiles;
}

function town2_generator2() {
	var width = 50;
	var height = 50;
	var tiles = Array(height);
	for (var i=0; i<height; i++) {
		tiles[i] = Array(width).fill('.');
	}
	// Paths
	for (var i=0; i<height; i++) {
		tiles[i][24] = 'p';
		tiles[i][25] = 'p';
		tiles[i][width-6] = 'p';
		tiles[i][width-7] = 'p';
	}
	for (var i=0; i<width-6; i++) {
		tiles[24][i] = 'p';
		tiles[25][i] = 'p';
	}
	// Dock
	for (var i=width-5; i<width; i++) {
		tiles[24][i] = 'D';
	}
	// Shop buildings
	for (var j=0; j<5; j++) {
		for (var k=0; k<3; k++) {
			tiles[45-j][26+k] = '0';
			tiles[38-j][26+k] = '0';
			tiles[31-j][26+k] = '0';
		}
	}
	for (var j=0; j<3; j++) {
		for (var k=0; k<5; k++) {
			tiles[28-j][31+k] = '0';
		}
	}
	tiles[43][26] = 'd';
	tiles[36][26] = 'd';
	tiles[29][26] = 'd';
	tiles[26][33] = 'd';
	// Big buildings in the northern part of town
	for (var j=0; j<7; j++) {
		for (var k=0; k<7; k++) {
			tiles[23-j][8+k] = '0';
			tiles[23-j][30+k] = '0';
		}
	}
	tiles[23][8] = '.';
	tiles[23][9] = '.';
	tiles[23][11] = 'd';
	tiles[23][13] = '.';
	tiles[23][14] = '.';
	tiles[23][30] = '.';
	tiles[23][31] = '.';
	tiles[23][33] = 'd';
	tiles[23][35] = '.';
	tiles[23][36] = '.';
	// Houses on the edge of town
	for (var i=0; i<height; i++) {
		tiles[i][0] = '1';
		tiles[i][1] = '1';
		if (i%4 < 3) {
			tiles[i][2] = '1';
			tiles[i][3] = '1';
		}
		if (i%4 == 1 && i>3) {tiles[i][3] = 'd'}
		if (i%4 == 3 && i>3) {tiles[i][1] = 'd'}
	}
	for (var i=0; i<width-6; i++) {
		tiles[0][i] = '1';
		tiles[1][i] = '1';
		if (i%4 < 3) {
			tiles[2][i] = '1';
			tiles[3][i] = '1';
		}
		if (i%4 == 1 && i>3) {tiles[3][i] = 'd'}
		if (i%4 == 3 && i>3) {tiles[1][i] = 'd'}
	}
	tiles[3][3] = '1';
	return tiles;
}

// Cave stuff
function cave_terrain() {
	var width = 32;
	var height = 32;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
		for (var j=0; j<height; j++) {
			if (i==0 || j==0 || i==height-1 || j==height-1) {
				terrain[i][j] = 'w';
			}
		}
	}
	// Interior walls
	for (var i=0; i<22; i++) {
		terrain[i][11] = 'w';
	}
	for (var i=0; i<11; i++) {
		terrain[i][22] = 'w';
	}
	for (var i=11; i<22; i++) {
		terrain[22][i] = 'w';
	}
	return terrain;
}

function cave_second_floor_terrain() {
	var width = 32;
	var height = 32;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
		for (var j=0; j<height; j++) {
			if (i==0 || j==0 || i==height-1 || j==height-1) {
				terrain[i][j] = 'w';
			}
		}
	}
	// Interior walls
	for (var i=11; i<32; i++) {
		terrain[11][i] = 'w';
		terrain[22][i] = 'w';
	}
	return terrain;
}

function cave_terrain2() {
	var width = 32;
	var height = 32;
	var terrain = Array(height);
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
	}
	return terrain;
}

// Tower
function tower1_terrain() {
	var width = 40;
	var height = 40;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
		for (var j=0; j<height; j++) {
			if (i==0 || j==0 || i==height-1 || j==height-1) {
				terrain[i][j] = 'w';
			}
		}
	}
	// Carve an entrance
	hwall(terrain, height-1,19,21,'.');
	vwall(terrain,5,height-1,22,'w');
	vwall(terrain,1,height-1,18,'w');
	hwall(terrain,5,22,39,'w');
	vwall(terrain,10,39,31,'w');
	vwall(terrain,18,22,18,'.');
	hwall(terrain,22,4,18,'w');
	hwall(terrain,18,0,18,'w');
	vwall(terrain,22,39,4,'w');
	vwall(terrain,33,35,4,'.');
	return terrain;
}
function tower2_terrain() {
	var width = 40;
	var height = 40;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
		for (var j=0; j<height; j++) {
			if (i==0 || j==0 || i==height-1 || j==height-1) {
				terrain[i][j] = 'w';
			}
		}
	}
	vwall(terrain, 4,17,35,'w');
	vwall(terrain, 4,14,16,'w');
	hwall(terrain, 4,0,5,'w');
	hwall(terrain, 4,9,35,'w');
	hwall(terrain, 17, 0,35,'w');
	hwall(terrain, 23, 0,39,'w');
	hwall(terrain, 35,0,35,'w');
	vwall(terrain, 23,35,35,'w');
	return terrain;
}
function tower3_terrain() {
	var width = 40;
	var height = 40;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
		for (var j=0; j<height; j++) {
			if (i==0 || j==0 || i==height-1 || j==height-1) {
				terrain[i][j] = 'w';
			}
		}
	}
	hwall(terrain,23,0,5,'w');
	vwall(terrain,5,23,5,'w');
	hwall(terrain,5,5,39,'w');
	vwall(terrain,35,39,17,'w');
	hwall(terrain,35,17,39,'w');
	hwall(terrain,23,0,39,'w');
	hwall(terrain,27,5,39,'w');
	vwall(terrain,27,39,5,'w');
	vwall(terrain,10,23,20,'w');
	return terrain;
}
function tower4_terrain() {
	var width = 40;
	var height = 40;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
		for (var j=0; j<height; j++) {
			if (i==0 || j==0 || i==height-1 || j==height-1) {
				terrain[i][j] = 'w';
			}
		}
	}
	hwall(terrain,0,18,22,'.'); // Opening to jump down from the top
	vwall(terrain,0,17,35,'w');
	vwall(terrain,21,39,35,'w');
	vwall(terrain,0,39,23,'w');
	vwall(terrain,0,39,17,'w');
	vwall(terrain,0,4,5,'w');
	vwall(terrain,8,25,5,'w');
	vwall(terrain,29,39,5,'w');
	hwall(terrain,22,5,17,'w');
	return terrain;
}
function tower_overlay() {
	var width = 40;
	var height = 40;
	var terrain = Array(height);
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
	}
	return terrain;
}

function oasis_terrain() {
	var width = 20;
	var height = 20;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('s');
		for (var j=0; j< width; j++) {
			if ( (j-10)*(j-10)+(i-10)*(i-10) < 25 ) {
				terrain[i][j] = 'w';
			}
		}
 	}
	return terrain;
}

function oasis_overlay() {
	var width = 20;
	var height = 20;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('.');
 	}
	return terrain;
}

function shrine_terrain() {
	var width = 20;
	var height = 20;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('s');
 	}
	return terrain;
}

function shrine_overlay() {
	var width = 20;
	var height = 20;
	var terrain = Array(height);
	// Set the floor and outer walls
	for (var i=0; i<height; i++) {
		terrain[i] = Array(width).fill('p');
		for (var j=0; j< width; j++) {
			if ( (j-9.5)*(j-9.5)+(i-10)*(i-10) > 90 ) {
				terrain[i][j] = '0';
			}
		}
 	}
	return terrain;
}

// All world maps in a single object
// The 'townlike' flag is current used to determine whether the first character should always
// be the displayed sprite.
world_maps = {
	"Overworld":{"terrain":make_map("Overworld", overworld_generator(), overworld_generator2()),
		"objects":[
		{"type":"Warp","x":52,"y":4,"tex":"art/overworld.png","blocks":[[15,1]],"destination":{"x":25,"y":2,"map":"Town"}}, // Grove (first town)
		{"type":"Warp","x":84,"y":6,"tex":"art/overworld.png","blocks":[[17,8]],"destination":{"x":10,"y":2,"map":"Shrine"}}, // Shrine
		{"type":"Warp","x":89,"y":90,"tex":"art/overworld.png","blocks":[[8,5]],"destination":{"x":25,"y":2,"map":"Town2"}},	// Portabay (second town)
		{"type":"Warp","x":90,"y":90,"tex":"art/overworld.png","blocks":[[9,5]],"destination":{"x":25,"y":2,"map":"Town2"}},	// Portabay (second town)
		{"type":"Warp","x":89,"y":91,"tex":"art/overworld.png","blocks":[[8,6]],"destination":{"x":25,"y":2,"map":"Town2"}},	// Portabay (second town)
		{"type":"Warp","x":90,"y":91,"tex":"art/overworld.png","blocks":[[9,6]],"destination":{"x":25,"y":2,"map":"Town2"}},	// Portabay (second town)
		// Tower
		{"type":"Warp","x":46,"y":95,"tex":"art/1sttileset.png","blocks":[[3,19]],"destination":{"x":20,"y":1,"map":"Tower1"},
			"condition":() => stats.plot["Captain Convo 1"],"message":new CutSceneConvo({
				"text":["The door is locked."]
			})
		},
		{"type":"Warp","x":12,"y":12,"tex":"art/1sttileset.png","blocks":[[1,18]],"destination":{"x":2,"y":2,"map":"Cave"}}, // Cave
		{"type":"Warp","x":49,"y":48,"tex":"art/overworld.png","blocks":[[15,1]],"destination":{"x":10,"y":2,"map":"Oasis"}} // Oasis
		],
		"spawn":(x,y)=>{
			// Despawning old enemies here. Probably want a more systematic method later and elsewhere
			map_objects.remove_objects("Overworld",MapEnemy,(en)=>{
				if (clock.elapsedTime < en.start_time + 5) {return false;}
				return (Math.abs(map_hero.x-en.x) > 20 || Math.abs(map_hero.y-en.y) > 20);
			});
			// Make a new enemy
			var enemy_list = y<50 ? ["beetle","blob"] : ["bumblebee","deathcap","viper"];
			var num_enemies = Math.floor(Math.random() * 2) + (y>50 ? 2:1);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":25}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Overworld",MapEnemy);
		}
	},
	"Town":{"terrain":make_map("Town",town_generator(), town_generator2()),
		"objects":[
		{"type":"Warp","x":0,"y":0,size:[100,1],"destination":{"x":52,"y":4,"map":"Overworld"},"condition":()=>stats.plot["Blacksmith Convo 1"],"message":new CutSceneConvo({
			"text":[""],"dynamic_text":()=>[`${stats.heroes[0].name}: Ugh. I really need to check in with Orin first.`]
		})},
		{"type":"Warp","x":0,"y":0,size:[1,100],"destination":{"x":52,"y":4,"map":"Overworld"},"condition":()=>stats.plot["Blacksmith Convo 1"],"message":new CutSceneConvo({
			"text":[""],"dynamic_text":()=>[`${stats.heroes[0].name}: Ugh. I really need to check in with Orin first.`]
		})},
		{"type":"Warp","x":49,"y":0,size:[1,100],"destination":{"x":52,"y":4,"map":"Overworld"},"condition":()=>stats.plot["Blacksmith Convo 1"],"message":new CutSceneConvo({
			"text":[""],"dynamic_text":()=>[`${stats.heroes[0].name}: Ugh. I really need to check in with Orin first.`]
		})},
		{"type":"Warp","x":0,"y":49,size:[100,1],"destination":{"x":52,"y":4,"map":"Overworld"},"condition":()=>stats.plot["Blacksmith Convo 1"],"message":new CutSceneConvo({
			"text":[""],"dynamic_text":()=>[`${stats.heroes[0].name}: Ugh. I really need to check in with Orin first.`]
		})},
		{"type":"CutScene","x":17,"y":4,
			"cutscene":new CutSceneInn({
				"cost":5
			})},
		{"type":"CutScene","x":7,"y":4,
			"cutscene":new CutSceneItem({
				"items":["potion","candy","tent"]
			})},
		{"type":"CutScene","x":32,"y":4,
			"cutscene":new CutSceneEquip({
				"items":[["weapon","knife"],["weapon","sword"],["armor","clothes"],["shield","trash_lid"],["helmet","hat"],["accessory","ring"]]
			})},
		{"type":"CutScene","x":42,"y":4,
			"cutscene":new CutSceneElement({
				"items":["hp","mp","strength","agility","magic","stamina"]
			})},
		{"type":"CutScene","x":4,"y":10,"cutscene":new CutSceneConvo({"text":["Grove is a pleasant town. It hasn't changed a bit since I was a kid."]})},
		{"type":"CutScene","x":4,"y":16,"cutscene":new CutSceneConvo({"text":["Our child is due soon. You should come to the celebration!"]})},
		{"type":"CutScene","x":4,"y":22,"cutscene":new CutSceneConvo({"text":["You want to know about the history of Grove? I dunno ... nothing really happens here."]})},
		{"type":"CutScene","x":11,"y":23,"cutscene":new CutSceneConvo({"text":["My job is boring, but I guess I should be grateful for it."]})},
		{"type":"CutScene","x":45,"y":10,"cutscene":new CutSceneConvo({"text":["A few years ago, I was attacked by Anima at the mines. I was lucky to get out alive. They may be settling down, but you need to be careful."]})},
		{"type":"CutScene","x":45,"y":16,"cutscene":new CutSceneConvo({"text":["What is an Element, actually? Beats me. Oh well."]})},
		{"type":"CutScene","x":45,"y":22,"cutscene":new CutSceneConvo({"text":["We do not want travelers in Grove. At any rate, there is no reason for anyone to stop here."]})},
		{"type":"CutScene","x":38,"y":23,"cutscene":new CutSceneConvo({"text":["Now that I am a Mystic class, I will never change."]})},
		{"type":"CutScene","x":4,"y":39,"cutscene":new CutSceneConvo({"text":["In Grove, we make all our decisions through concensus. I can't remember the last time we had an argument at the town hall. I don't always agree with the decisions, but I have no reason to complain."]})},
		{"type":"CutScene","x":4,"y":33,"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=>[`${stats.heroes[0].name}, I am making a cake to share with you. Please come back later!`]})},
		{"type":"CutScene","x":4,"y":27,"cutscene":new CutSceneConvo({"text":["It's another pleasant day. Almost makes me want to come out."]})},
		{"type":"CutScene","x":45,"y":39,"cutscene":new CutSceneConvo({"text":["The mines are bountiful. The iron ore never runs low, and there always seems to be more treasure."]})},
		{"type":"CutScene","x":45,"y":33,"cutscene":new CutSceneConvo({"text":["*sob*sob*sob* I miss my dear Olivia."]})},
		{"type":"CutScene","x":45,"y":27,"cutscene":new CutSceneConvo({"text":["I am an historian. Let me tell you a bit about the history of Grove.","We used to be politically unified with Portabay, which is to the north. However, when trade began to slow down, the economy suffered and Grove became independent.","We never declared independence; we just started living on our own, and Portabay never stopped us.","That was about 200 years ago. Since then, little has changed. Our region is rich in Elements, and we live comfortably and without having to work too hard.","I'm afraid I don't know anything farther back, certainly not when or how Grove was founded."]})},
		{"type":"CutScene","x":38,"y":26,"cutscene":new CutSceneConvo({"text":["You're brave to head out to the mines. I don't want to leave the town and ever see an Anima."]})},
		{"type":"CutScene","x":11,"y":45,"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=>[`(This is ${stats.heroes[0].name}'s home. ${stats.heroes[0].name} would rather travel than stay here.)`]})},
		{"type":"CutScene","x":17,"y":45,"cutscene":new CutSceneConvo({"text":["I've never considered leaving Grove. I don't know what's out in the rest of the world, but it can't be too interesting."]})},
		{"type":"CutScene","x":32,"y":45,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
		{"type":"CutScene","x":38,"y":45,"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=>[`(This is ${stats.heroes[1].name}'s home. It's a nice place.)`]})},
		// Blacksmith
		{"type":"Person","x":11,"y":26,"tex":"art/npc.png","blocks":[[2,7]],"direction_blocks":{"Down":[[2,7]],"Left":[[3,7]],"Right":[[1,7]],"Up":[[0,7]]},
			"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=> {
				if (stats.plot["Blacksmith Convo 2"]) {
					return [`I suggest you head to Portabay, the big trading city to the northeast. You will find more opportunity there, and it is your best chance to catch a ship off this island.`];
				}
				if (stats.plot["Iron Ore"]) {
					stats.plot["Blacksmith Convo 2"] = 1;
					stats.gold += 100;
					stats.plot.Hint = "I'm finally leaving Grove. I should head to Portabay to the northeast and see what I can find there.";
					return [
						`${stats.heroes[0].name}: This what I found, Orin.\n\nOrin: Heh, is this the best you could do? Oh well, it will suffice. Here's 100 gold. Now, I need you here on time tomorrow. In the mines, you should find a--`,
						`${stats.heroes[0].name}: No.\n\nOrin: What do you mean, no?`,
						`${stats.heroes[0].name}: I mean, I'm done. I am quitting and leaving Grove. You're going to have to find someone else to run your errands.\n\nOrin: This is a joke, right? It's not funny.`,
						`Orin: I'm disappointed, ${stats.heroes[0].name}. I thought you had potential. You have the skill to become a master blacksmith, but not the work ethic I suppose. Well, I can't stop you. Best of luck.`,
						`Orin: I know you don't want any advice from me, but I suggest you head to Portabay, the big trading city to the northeast. You will find more opportunity there, and it is your best chance to catch a ship off this island. I think you are making a big mistake.`,
						`Orin: There is nothing for you in Portabay, or anywhere else in the world, that you can't have here. But I hope you prove me wrong. I mean it.`];
				}
				if (stats.plot["Blacksmith Convo 1"]) {
					return [`Orin: The mines are to the west. Don't go north. You won't find the ore I need, and you are not ready to fight the Anima that live there.`];
				}
				stats.gold += 50;
				stats.add_element("hp",3);
				stats.add_element("mp",3);
				stats.add_element("strength",3);
				stats.add_element("magic",3);
				stats.add_element("stamina",3);
				stats.add_element("agility",3);
				stats.plot["Blacksmith Convo 1"] = 1;
				stats.plot.Hint = "Orin wants some Iron Ore, which can be found in the cave to the west of Grove. Going north might be too dangerous for now.";
				return [
					`Orin: ${stats.heroes[0].name}, you are late for work again, and I don't care for your attitude lately.`,
					`We're running low on iron ore, so today you're gonna head to the mines and get some more. Got it?`,
					`The mines are to the west. Don't go north. You won't find the ore I need, and you are not ready to fight the Anima that live there.`,
					`Here is some advance pay. I suggest you buy some equipment. The shops are in the south part of town.`,
					`You'll need some Elements too. Here are a few. Don't forget to equip them in the main menu.`
				];
			}})
		},
		// Quincy
		{"type":"Person","x":12,"y":10,"tex":"art/mod_RPG_assets.png","blocks":[[1,6]],
			"direction_blocks":{"Down":[[1,6]],"Left":[[0,6]],"Right":[[2,6]],"Up":[[3,6]]},
			"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=> {
				if (stats.plot["Blacksmith Convo 2"]) {
					return [`${stats.heroes[1].name}: I think we're done here. I'm ready to head to Portabay whenever you are.`];
				}
				else if (stats.plot["Iron Ore"]) {
					return [`${stats.heroes[1].name}: Good work. Let's turn the ore in and get moving.`]
				}
				else if (stats.plot["Blacksmith Convo 1"]) {
					return [`${stats.heroes[1].name}: Heading to the mines? Don't worry, I'll come with you.`]
				}
				else {
					return [`${stats.heroes[1].name}: Hi ${stats.heroes[0].name}. I know you don't want to, but you should check in with Orin.`];
				}
			}})
		},
		// Max
		{"type":"Person","x":38,"y":18,"tex":"art/mod_RPG_assets.png","blocks":[[4,3]],
			"direction_blocks":{"Down":[[4,3]],"Left":[[7,3]],"Right":[[5,3]],"Up":[[6,3]]},
			"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=> {
				return [`${stats.heroes[2].name}: I will always be by your side. You know that, ${stats.heroes[0].name}.`];
			}})
		},
		// Training dummy
		{"type":"Person","x":33,"y":9,"tex":"art/enemies.png","blocks":[[3,6]],
			"direction_blocks":{"Down":[[3,6]],"Left":[[3,6]],"Right":[[3,6]],"Up":[[3,6]]},
			"cutscene": new CutSceneConvo({
				"text":[""],"dynamic_text":()=>{
					return ["This is a training dummy. Do you want to practice fighting?"]
				},
				"battle":(cs)=>cs.menu.get_choice() ? ["dummy"] : 0,
				"menu":()=>new Menu(
					[0,1],
					["Not now","OK"],
					[window.innerWidth-250,20,window.innerWidth-20,120]
				),
				"menu_node":0
			})
		},
		// Various NPCs
		{"type":"Person","x":13,"y":39,"tex":"art/npc.png","blocks":[[6,0]],
			"direction_blocks":{"Down":[[6,0]],"Left":[[7,0]],"Right":[[5,0]],"Up":[[4,0]]},
			"motion":{"type":"loop","points":[[10,39],[19,39]], "speed":0.5},
			"cutscene":new CutSceneConvo({"text":["Just tending my garden. It's another beautiful day, isn't it?"]})
		},
		{"type":"Person","x":29,"y":28,"tex":"art/npc.png","blocks":[[4,7]],
			"direction_blocks":{"Down":[[4,7]],"Left":[[5,7]],"Right":[[6,7]],"Up":[[7,7]]},
			"motion":{"type":"random_walk", "pause_time":0.5, "speed": 4.0},
			"cutscene":new CutSceneConvo({"text":[""], "dynamic_text":() => [
				`${stats.heroes[0].name}! Let's play after you're done with work.\n\nI hope we'll be friends forever.`
			]})
		},
		{"type":"Person","x":47,"y":47,"tex":"art/npc.png","blocks":[[6,3]],
			"direction_blocks":{"Down":[[6,3]],"Left":[[7,3]],"Right":[[5,3]],"Up":[[4,3]]},
			"cutscene":new CutSceneConvo({"text":["Mona: Flynn finally asked me out and wanted to meet at the edge of town. But where is he? I hope he didn't forget."]})
		},
		{"type":"Person","x":2,"y":2,"tex":"art/npc.png","blocks":[[2,3]],
			"direction_blocks":{"Down":[[2,3]],"Left":[[3,3]],"Right":[[1,3]],"Up":[[0,3]]},
			"cutscene":new CutSceneConvo({"text":["Flynn: Have you seen Mona? I asked her to meet me at the edge of town, but where is she? Drat, maybe she doesn't like me after all."]})
		},
		{"type":"Person","x":29,"y":17,"tex":"art/npc.png","blocks":[[0,0]],
			"direction_blocks":{"Down":[[0,0]],"Left":[[0,0]],"Right":[[0,0]],"Up":[[0,0]]},
			"motion":{"type":"random_walk"},
			"cutscene":new CutSceneConvo({"text":["* Meow * Meow * Meow *\n\n(I don't have any useful information for you, but I am cute and cuddly.)"]})
		},
		{"type":"Person","x":38,"y":35,"tex":"art/npc.png","blocks":[[6,4]],
			"direction_blocks":{"Down":[[6,4]],"Left":[[7,4]],"Right":[[5,4]],"Up":[[4,4]]},
			"motion":{"type":"random_walk", "pause_time":0.5, "speed": 4.0},
			"cutscene":new CutSceneConvo({"text":["Let's play tag! Oh, you're busy. Promise you'll come by later?"]})
		},
		{"type":"Person","x":26,"y":4,"tex":"art/npc.png","blocks":[[0,5]],
			"direction_blocks":{"Down":[[0,5]],"Left":[[1,5]],"Right":[[2,5]],"Up":[[3,5]]},
			"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=>[
				"Welcome to Grove!\n\nOh, it's you Alice. How are you today?","You know, I've been working this post for 12 years and there has never once been an incident. Easy money I guess."
			]})
		}],
		"enter":(map)=>{stats.waypoint = ["Town",11,45]},
		"townlike":1
	},
	"Town2":{"terrain":make_map("Town",town2_generator(), town2_generator2()),
		"objects":[
			{"type":"Warp","x":0,"y":0,size:[100,1],"destination":{"x":89,"y":90,"map":"Overworld"}},
			// Doors
			{"type":"CutScene","x":7,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":11,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":15,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":19,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":23,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":27,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":31,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":35,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":39,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":43,"y":48,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":5,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":9,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":13,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":17,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":21,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":25,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":29,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":33,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":37,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":41,"y":46,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":44,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":42,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":40,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":38,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":36,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":34,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":32,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":30,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":28,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":26,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":11,"y":26,"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=>[`${stats.heroes[0].name}: Looks like a wealthy person lives here.\n\n${stats.heroes[1].name}: Better steer clear for now.`]})},
			{"type":"CutScene","x":33,"y":26,"cutscene":new CutSceneConvo({"text":["This is the Portabay Guild Hall. The likes of you have no business here."]})},
			{"type":"CutScene","x":3,"y":24,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":22,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":20,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":18,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":16,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":14,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":12,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":10,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":8,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":6,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":4,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":1,"y":2,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			{"type":"CutScene","x":3,"y":0,"cutscene":new CutSceneConvo({"text":["(Looks like nobody's home.)"]})},
			// Shops
			{"type":"CutScene","x":33,"y":23,"cutscene":new CutSceneElement({
				"items":["hp","mp","strength","agility","magic","stamina"]
			})},
			{"type":"CutScene","x":26,"y":20,"cutscene":new CutSceneEquip({
				"items":[["weapon","staff"],["weapon","club"],["armor","leathercloak"],["shield","buckler"],["helmet","sturdycap"],["accessory","horn"],["accessory","mirror"]]
			})},
			{"type":"CutScene","x":26,"y":13,"cutscene":new CutSceneItem({
				"items":["potion","tonic","candy","tent"]
			})},
			{"type":"CutScene","x":26,"y":6,"cutscene":new CutSceneInn({
				"cost":5
			})},
			// Quincy
			{"type":"Person","x":39,"y":18,"tex":"art/mod_RPG_assets.png","blocks":[[1,6]],
				"direction_blocks":{"Down":[[1,6]],"Left":[[0,6]],"Right":[[2,6]],"Up":[[3,6]]},
				"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=> {
					if (stats.plot["Captain Convo 2"]) {
						return [`${stats.heroes[1].name}: Darn, it's the end of the demo. I was looking forward to seeing Plaint, too.`];
					}
					else if (stats.plot["Activate Lighthouse"]) {
						return [`${stats.heroes[1].name}: We did it! I'm a little nervous about setting sail, but I'm ready.`];
					}
					else if (stats.plot["Captain Convo 1"]) {
						return [`${stats.heroes[1].name}: We are going to the reactivate the lighthouse now? Ok...`];
					}
					else if (stats.plot["Blacksmith Convo 2"]) {
						return [`${stats.heroes[1].name}: To tell you the truth, I have never been to Portabay before. There is so much more going on here than in Grove. I could get used to this.`];
					}
					else {
						return [`${stats.heroes[1].name}: Why are we here? We still have work to do in Grove.`];
					}
				}})
			},
			// Max
			{"type":"Person","x":8,"y":42,"tex":"art/mod_RPG_assets.png","blocks":[[4,3]],
				"direction_blocks":{"Down":[[4,3]],"Left":[[7,3]],"Right":[[5,3]],"Up":[[6,3]]},
				"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=> {
					if (stats.plot["Captain Convo 2"]) {
						return [`${stats.heroes[2].name}: I hope you enjoyed the demo. Maybe in the full version you can find out what kind of creature I am.`]
					}
					else if (stats.plot["Captain Convo 1"]) {
						return [`${stats.heroes[2].name}: I hear there is a shrine to our south. Maybe we should check it out before going to the lighthouse.`];
					}
					else if (stats.plot["Blacksmith Convo 2"]) {
						return [`${stats.heroes[2].name}: ${stats.heroes[0].name}, I think it was wise for us to come here. You seem happier now that we are away from Grove.`,`But you don't really know what are you looking for, do you?`];
					}
					else {
						return [`${stats.heroes[2].name}: ${stats.heroes[0].name}, I know you are unhappy, but you will have responsibilities in Grove. Let's head back.`]
					}
				}})
			},
			// Captain
			{"type":"Person","x":49,"y":25,"tex":"art/npc.png","blocks":[[2,4]],
				"direction_blocks":{"Down":[[2,4]],"Left":[[3,4]],"Right":[[1,4]],"Up":[[0,4]]},
				"cutscene":new CutSceneConvo({"text":[""], "dynamic_text":()=>
					{
						if (stats.plot["Captain Convo 2"]) {
							return ["This is the end of the demo. Thanks for playing."];
						}
						if (stats.plot["Activate Lighthouse"]) {
							stats.plot["Captain Convo 2"] = 1;
							stats.plot.Hint = "You have completed the demo.";
							return [
								`Captain: Wonderful! I didn't think you could do it, but the lighthouse is burning beautifully. We're ready to set sail.`,
								`Captain: At least we would be, but this is the end of the demo. Thanks for playing.`
							];
						}
						if (stats.plot["Captain Convo 1"]) {
							return [`Captain: The lighthouse is locked, but I know a secret passage. (You can now enter the lighthouse.)`];
						}
						if (stats.plot["Blacksmith Convo 2"]) {
							stats.plot["Captain Convo 1"] = 1;
							stats.plot.Hint = "I need to get the lighthouse back in order. It is west of Portabay. I will probably have to climb to the top, which means I had better be well prepared.";
							return [
								`Captain: Ahoy! We will be sailing first thing in the morning.\n\nAt least if someone gets the lighthouse working again.`,
								`Captain: The sea is my livelihood. I've got a cargo hold full of ore and Elements, and it's lean times if I can't get it to Plaint.`,
								`${stats.heroes[0].name}: Dammit, I need to get to Plaint. Who is taking care of this?\n\nCaptain: No one I know of ... and what makes you think you need to get to Plaint? I'm not running a ferry.`,
								`${stats.heroes[0].name}: I'll do it.\n\nCaptain: You'll do what?\n\n${stats.heroes[0].name}: I'll fix the lighthouse.`,
								`Captain: You can't be serious. No matter, if you can actually fix it, I'll take you to Plaint. The lighthouse is locked, but I know a secret passage. (You can now enter the lighthouse.)`
							]
						}
						else {
							return [`Captain: And who might you be? I'm busy right now, come back later.`]
						}
					}
				})
			},
			// Other people on the map
			{"type":"Person","x":21,"y":2,"tex":"art/npc.png","blocks":[[0,5]],
				"direction_blocks":{"Down":[[0,5]],"Left":[[1,5]],"Right":[[2,5]],"Up":[[3,5]]},
				"cutscene":new CutSceneConvo({"text":["(Did I really spend a year in training to be a town greeter?)\n\nUh, hi! Welcome to Portabay."]})
			},
			{"type":"Person","x":27,"y":28,"tex":"art/npc.png","blocks":[[4,2]],
				"direction_blocks":{"Down":[[4,2]],"Left":[[5,2]],"Right":[[6,2]],"Up":[[7,2]]},
				"motion":{"type":"random_walk","speed":1.0},
				"cutscene":new CutSceneConvo({"text":["I run the cannery in Portabay. Business is good these days."]})
			},
			{"type":"Person","x":10,"y":22,"tex":"art/npc.png","blocks":[[4,1]],
				"direction_blocks":{"Down":[[4,1]],"Left":[[5,1]],"Right":[[6,1]],"Up":[[7,1]]},
				"motion":{"type":"random_walk","speed":1.0},
				"cutscene":new CutSceneConvo({"text":["Mind your manners, I come from a long line of city leaders.\n\nBusiness is normally steady, but the lighthouse has been out of commission for weeks. Without trade, we are struggling."]})
			},
			{"type":"Person","x":44,"y":49,"tex":"art/npc.png","blocks":[[0,1]],
				"direction_blocks":{"Down":[[0,1]],"Left":[[1,1]],"Right":[[2,1]],"Up":[[3,1]]},
				"cutscene":new CutSceneConvo({"text":["ACK!\n\nUh, go away, I'm busy."]})
			},
			{"type":"Person","x":31,"y":39,"tex":"art/npc.png","blocks":[[4,7]],
				"direction_blocks":{"Down":[[4,7]],"Left":[[5,7]],"Right":[[6,7]],"Up":[[7,7]]},
				"motion":{"type":"loop","points":[[31,39],[34,39],[34,36],[31,36]]},
				"cutscene":new CutSceneConvo({"text":["The captain took me out to Plaint one time. I got sick. I can't wait to go again!"]})
			},
			{"type":"Person","x":34,"y":36,"tex":"art/npc.png","blocks":[[6,4]],
				"direction_blocks":{"Down":[[6,4]],"Left":[[7,4]],"Right":[[5,4]],"Up":[[4,4]]},
				"motion":{"type":"loop","points":[[34,36],[31,36],[31,39],[34,39]]},
				"cutscene":new CutSceneConvo({"text":["Um, hi. Who are you? I'm Lisa.\n\n...\n\nBye!"]})
			},
			{"type":"Person","x":4,"y":45,"tex":"art/npc.png","blocks":[[3,0]],
				"direction_blocks":{"Down":[[3,0]],"Left":[[3,0]],"Right":[[3,0]],"Up":[[3,0]]},
				"motion":{"type":"random_walk"},
				"cutscene":new CutSceneConvo({"text":["* Purr * Purrrrrr *\n\n(I may just be a cat, but I know the Anima in the lighthouse are very strong and you need to be well prepared.)"]})
			},
			{"type":"Person","x":8,"y":13,"tex":"art/npc.png","blocks":[[0,6]],
				"direction_blocks":{"Down":[[0,6]],"Left":[[1,6]],"Right":[[2,6]],"Up":[[3,6]]},
				"motion":{"type":"random_walk"},
				"cutscene":new CutSceneConvo({"text":["City life is for me. I wish there was a place more exciting than Portabay."]})
			},
			{"type":"Person","x":44,"y":27,"tex":"art/npc.png","blocks":[[6,5]],
				"direction_blocks":{"Down":[[6,5]],"Left":[[7,5]],"Right":[[5,5]],"Up":[[4,5]]},
				"cutscene":new CutSceneConvo({"text":["Skipper: We can't go out on the sea until the lighthouse is fixed. To tell you the truth, I don't like sailing. Maybe I should become a farmer?"]})
			}],
		"enter":(map)=>{stats.waypoint = ["Town2",25,2]},
		"townlike":1
	},
	"Cave":{"terrain":make_map("Cave", cave_terrain(), cave_terrain2()),
		"objects":[
			{"type":"Warp","x":2,"y":2,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":12,"y":12,"map":"Overworld"}}, // Stairs back outside
			{"type":"Warp","x":29,"y":29,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":29,"y":29,"map":"Cave2"}}, // Downstairs
			{"type":"Treasure","x":9,"y":29,"treasure":{"gold":5, "item":[["potion",2]],"equipment":[["weapon","sword",1]],"element":[["mystic",1]]}},
			{"type":"Treasure","x":13,"y":29,"treasure":{"gold":50, "item":[["potion",10],["candy",5]]}}
		],
		"spawn":(x,y)=>{
			var enemy_list = ["bat","enchanted_blob"];
			var num_enemies = 1+Math.floor(Math.random() * 2);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":10}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Cave",MapEnemy);
			map_objects.open_treasure("Cave");
		}
	},
	"Cave2":{"terrain":make_map("Cave", cave_second_floor_terrain(), cave_terrain2()),
		"objects":[
			{"type":"Warp","x":29,"y":29,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":29,"y":29,"map":"Cave"}}, // Stairs up
			{"type":"Treasure","x":29,"y":18,"treasure":{"gold":25, "item":[["tent",3]],"element":[["soldier",1]]}},
			{"type":"Treasure","x":29,"y":11,"treasure":{"element":[["hp",10],["mp",10],["strength",10],["stamina",10],["agility",10],["magic",10]]}},
			{"type":"Treasure","x":29,"y":7,"treasure":{"gold":50, "element":[["fighter",1]]}},
			{"type":"Treasure","x":29,"y":2,"treasure":{"equipment":[["weapon","sword",1],["armor","clothes",1],["shield","trash_lid",1],["helmet","hat",1],["accessory","ring",1]]}},
			// Iron Ore
			{"type":"Person","x":29,"y":4,"tex":"art/animation.png","blocks":[[1,2]],
				"direction_blocks":{"Down":[[1,2]],"Left":[[1,2]],"Right":[[1,2]],"Up":[[1,2]]},
				"cutscene":new CutSceneConvo({"text":[""],"dynamic_text":()=> {
					if (!(stats.plot["Iron Ore"])) {
						stats.plot["Iron Ore"] = 1;
						stats.plot.Hint = "I've got the ore, now I need to bring it back to Orin.";
						return [
							`${stats.heroes[0].name}: Here we go. Not the best I've found in these mines, but it will do. Let's get the hell out of here.\n\n${stats.heroes[1].name}: Are you upset? I think we did all right.`,
							`${stats.heroes[0].name}: Dammit ${stats.heroes[1].name}, I've been in these mines so many times, I can't stand it anymore. I can't spend the rest of my life doing pointless fetch quests. I'm not coming back here again.\n\n${stats.heroes[2].name}: What, are you quitting?`,
							`${stats.heroes[0].name}: I'm not just quitting. I'm getting out of Grove. I'm getting off this island. I need to see the world and accomplish something.`,
							`${stats.heroes[2].name}: I don't know about this.\n\n${stats.heroes[0].name}: I do.`,
							`${stats.heroes[1].name}: I have to be honest, I don't like this idea one bit. But if you've made up your mind ... I am coming with you.\n\n${stats.heroes[2].name}: I am coming too, of course.`,
							`${stats.heroes[0].name}: I know. Now let's get back to Grove, get my last payment, and get moving.`];
					}
					else {
						return [`${stats.heroes[0].name}: I've got enough ore. Let's bring it back to Orin.`]
					}
				}})
			}
		],
		"spawn":(x,y)=>{
			var enemy_list = ["bat","enchanted_blob"];
			var num_enemies = 2+Math.floor(Math.random() * 2);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":10}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Cave2",MapEnemy);
			map_objects.open_treasure("Cave2");
		}
	},
	"Tower1":{"terrain":make_map("Tower", tower1_terrain(), tower_overlay()),
		"objects":[
			{"type":"Warp","x":0,"y":-0.4,size:[100,1],"destination":{"x":46,"y":95,"map":"Overworld"}},
			{"type":"Warp","x":37,"y":37,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":37,"y":37,"map":"Tower2"}},
			{"type":"Warp","x":32,"y":32,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":32,"y":32,"map":"Tower2"}},
			{"type":"Warp","x":2,"y":2,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":2,"y":2,"map":"Tower2"}},
			{"type":"Warp","x":2,"y":37,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":2,"y":37,"map":"Tower2"}},
			{"type":"Treasure","x":16,"y":15,"treasure":{"gold":100}},
			{"type":"Treasure","x":16,"y":2,"treasure":{"gold":100}},
			{"type":"Treasure","x":37,"y":2,"treasure":{"gold":100}},
			{"type":"Treasure","x":33,"y":2,"treasure":{"gold":100}},
			{"type":"Treasure","x":29,"y":2,"treasure":{"gold":100}},
			{"type":"Treasure","x":24,"y":2,"treasure":{"gold":100}},
			{"type":"Treasure","x":16,"y":37,"treasure":{"gold":100}},
			{"type":"Treasure","x":16,"y":23,"treasure":{"gold":100}},
			{"type":"Treasure","x":2,"y":23,"treasure":{"gold":100}}
		],
		"spawn":(x,y)=>{
			var enemy_list = ["dryad","firedrake","gnome","goblin"];
			var num_enemies = 1+Math.floor(Math.random() * 1);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":10}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Tower1",MapEnemy);
			map_objects.open_treasure("Tower1");
		}
	},
	"Tower2":{"terrain":make_map("Tower", tower2_terrain(), tower_overlay()),
		"objects":[
			{"type":"Warp","x":37,"y":37,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":37,"y":37,"map":"Tower1"}},
			{"type":"Warp","x":32,"y":32,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":32,"y":32,"map":"Tower1"}},
			{"type":"Warp","x":7,"y":7,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":7,"y":7,"map":"Tower3"}},
			{"type":"Warp","x":2,"y":2,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":2,"y":2,"map":"Tower1"}},
			{"type":"Warp","x":2,"y":37,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":2,"y":37,"map":"Tower1"}},
			{"type":"Warp","x":3,"y":20,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":3,"y":20,"map":"Tower3"}},
			{"type":"Warp","x":37,"y":14,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":37,"y":14,"map":"Tower3"}},
			{"type":"Treasure","x":33,"y":24,"treasure":{"gold":250}},
			{"type":"Treasure","x":33,"y":14,"treasure":{"gold":250}},
			{"type":"Treasure","x":33,"y":6,"treasure":{"gold":250}}
		],
		"spawn":(x,y)=>{
			var enemy_list = ["dryad","firedrake","gnome","goblin"];
			var num_enemies = 1+Math.floor(Math.random() * 2);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":10}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Tower2",MapEnemy);
			map_objects.open_treasure("Tower2");
		}
	},
	"Tower3":{"terrain":make_map("Tower", tower3_terrain(), tower_overlay()),
		"objects":[
			{"type":"Warp","x":3,"y":20,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":3,"y":20,"map":"Tower2"}},
			{"type":"Warp","x":37,"y":37,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":37,"y":37,"map":"Tower4"}},
			{"type":"Warp","x":33,"y":7,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":33,"y":7,"map":"Tower4"}},
			{"type":"Warp","x":7,"y":7,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":7,"y":7,"map":"Tower2"}},
			{"type":"Warp","x":37,"y":3,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":37,"y":3,"map":"Tower4"}},
			{"type":"Warp","x":20,"y":3,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":20,"y":3,"map":"Tower4"}},
			{"type":"Warp","x":37,"y":14,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":37,"y":14,"map":"Tower2"}},
			{"type":"Warp","x":3,"y":3,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":3,"y":3,"map":"Tower4"}},
			{"type":"Warp","x":12,"y":20,"tex":"art/animation.png","blocks":[[3,2]],"destination":{"x":12,"y":20,"map":"Tower4"}},
			{"type":"Treasure","x":37,"y":18,"treasure":{"item":[["candy",3]],"equipment":[["weapon","mace",1]]}},
			{"type":"Treasure","x":37,"y":32,"treasure":{"gold":10,"equipment":[["shield","coppershield",1]]}},
			{"type":"Treasure","x":22,"y":18,"treasure":{"gold":10,"equipment":[["armor","chainmail",1]]}},
			{"type":"Treasure","x":15,"y":2,"treasure":{"element":[["soldier",1],["fighter",1],["mystic",1]]}}
		],
		"spawn":(x,y)=>{
			var enemy_list = ["dryad","firedrake","gnome","goblin"];
			var num_enemies = 2+Math.floor(Math.random() * 1);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":10}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Tower3",MapEnemy);
			map_objects.open_treasure("Tower3");
		}
	},
	"Tower4":{"terrain":make_map("Tower", tower4_terrain(), tower_overlay()),
		"objects":[
			// Opening to jump down
			{"type":"Warp","x":18,"y":39,size:[5,1],"destination":{"x":46,"y":96,"map":"Overworld"},"condition":()=>stats.plot["Tower Jumpoff"],"message":new CutSceneConvo({
				"text":[""],"dynamic_text":()=>{
					stats.plot["Tower Jumpoff"] = 1;
					return [`${stats.heroes[2].name}: Watch out. If we jump, we will have to climb all the way back up.`];
				}
			})},
			{"type":"Warp","x":37,"y":37,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":37,"y":37,"map":"Tower3"}},
			{"type":"Warp","x":33,"y":7,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":33,"y":7,"map":"Tower3"}},
			{"type":"Warp","x":37,"y":3,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":37,"y":3,"map":"Tower3"}},
			{"type":"Warp","x":20,"y":3,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":20,"y":3,"map":"Tower3"}},
			{"type":"Warp","x":3,"y":3,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":3,"y":3,"map":"Tower3"}},
			{"type":"Warp","x":12,"y":20,"tex":"art/animation.png","blocks":[[2,2]],"destination":{"x":12,"y":20,"map":"Tower3"}},
			{"type":"Treasure","x":15,"y":2,"treasure":{"gold":10,"equipment":[["weapon","axe",1]]}},
			{"type":"Treasure","x":15,"y":15,"treasure":{"item":[["tonic",3]],"equipment":[["helmet","ironhelmet",1]]}},
			{"type":"Treasure","x":25,"y":37,"treasure":{"gold":10,"equipment":[["accessory","lamp",1]]}},
			{"type":"Treasure","x":33,"y":37,"treasure":{"gold":10,"equipment":[["accessory","cards",1]]}},
			// Lighthouse flame
			{"type":"Person","x":20,"y":36,"tex":"art/animation.png","blocks":[[7,3]],
				"direction_blocks":{"Down":[[7,3]],"Left":[[7,3]],"Right":[[7,3]],"Up":[[7,3]]},
				"cutscene":new CutSceneConvo({
					"text":[""],
					"dynamic_text":()=> {
						if (!(stats.plot["Activate Lighthouse"])) {
							stats.special_victory = () => {
								stats.plot["Activate Lighthouse"] = 1;
								world_maps["Tower4"].flame_sprite();
							}
							stats.plot.Hint = "Now that the lighthouse is working again, I should talk to the captain.";
							return [
								`${stats.heroes[0].name}: Looks like the light is out. This doesn't look too hard to fix. That old captain didn't think we could do it.\n\n${stats.heroes[2].name}: I'm impressed, ${stats.heroes[0].name}. I haven't seen you this animated in a long time.`,
								`${stats.heroes[1].name}: I still don't know why we have to do this.\n\n${stats.heroes[0].name}: Are you kidding? This is our ticket to see the world.`,
								`${stats.heroes[0].name}: You know, most people don't even care. Have you even thought about where Elements come from, or how big the world even is?`,
								`${stats.heroes[1].name}: Hey, I'm with you all the way. But, I have a bad feeling about this.\n\n${stats.heroes[0].name}: Oh, just relax. I've almost got it working again.`,
								`${stats.heroes[2].name}: Watch out behind you!`
							];
						}
						else {
							return [`The flame burns peacefully.`];
						}
					},
					"battle":(cs)=>stats.plot["Activate Lighthouse"] ? 0:["fire_elemental","fire_elemental","fire_elemental","fire_elemental"]
				}),
				"label":"flame"
			}
		],
		"spawn":(x,y)=>{
			var enemy_list = ["dryad","firedrake","gnome","goblin"];
			var num_enemies = 2+Math.floor(Math.random() * 2);
			var enemies = [];
			for (var i=0; i<num_enemies; i++) {
				enemies = enemies.concat(enemy_list[Math.floor(Math.random() * enemy_list.length)]);
			}
			var tex = enemy_database[enemies[0]].tex;
			var blocks = enemy_database[enemies[0]].blocks["Down"];
			return {"tex":tex,"blocks":blocks,"enemies":enemies,"max_enemies":10}
		},
		"enter":(map)=>{
			map_objects.remove_objects("Tower4",MapEnemy);
			map_objects.open_treasure("Tower4");
			world_maps["Tower4"].flame_sprite()
		},
		// Separate function for immediately changing the flame sprite to be accessible by plot triggers.
		"flame_sprite":() => {
			// Change flame sprite in case of a reload.
			for (var i=0; i<map_objects.map_objects["Tower4"].length; i++) {
				if (map_objects.map_objects["Tower4"][i].label == "flame" && stats.plot["Activate Lighthouse"]) {
					map_objects.map_objects["Tower4"][i].blocks = [[0,2]];
					map_objects.map_objects["Tower4"][i].direction_blocks = {"Down":[[0,2]],"Left":[[0,2]],"Right":[[0,2]],"Up":[[0,2]]};
					map_objects.map_objects["Tower4"][i].set_animation([[0,2]]);
				}
			}
		}
	},
	"Oasis":{"terrain":make_map("Overworld", oasis_terrain(), oasis_overlay()),
		"objects":[
			// Warps at the edges of the map
			{"type":"Warp","x":0,"y":0,size:[100,1],"destination":{"x":49,"y":48,"map":"Overworld"}},
			{"type":"Warp","x":0,"y":0,size:[1,100],"destination":{"x":49,"y":48,"map":"Overworld"}},
			{"type":"Warp","x":19,"y":0,size:[1,100],"destination":{"x":49,"y":48,"map":"Overworld"}},
			{"type":"Warp","x":0,"y":19,size:[100,1],"destination":{"x":49,"y":48,"map":"Overworld"}},
			{"type":"Person","x":10,"y":4,"tex":"art/npc.png","blocks":[[4,1]],
				"direction_blocks":{"Down":[[4,1]],"Left":[[5,1]],"Right":[[6,1]],"Up":[[7,1]]},
				"cutscene":new CutSceneItem({"items":["potion","tonic","candy","tent"]})
			},
			{"type":"Person","x":2,"y":17,"tex":"art/npc.png","blocks":[[1,0]],
				"direction_blocks":{"Down":[[1,0]],"Left":[[1,0]],"Right":[[1,0]],"Up":[[1,0]]},
				"cutscene":new CutSceneConvo({"text":["...\n\n(Nothing personal. I just don't like humans. By the way, you should make your first class change as soon as you can.)"]})
			},
			{"type":"Person","x":16,"y":16,"tex":"art/npc.png","blocks":[[4,2]],
				"direction_blocks":{"Down":[[4,2]],"Left":[[5,2]],"Right":[[6,2]],"Up":[[7,2]]},
				"cutscene":new CutSceneConvo({"text":["Business is slow. We don't get very many travelers these days. A long time ago, a large bazaar ran at this oasis.","Back in those days, there was extensive travel between Grove and Portabay, and there were villages to the west."]})
			}
		]
	},
	"Shrine":{"terrain":make_map("Town", shrine_terrain(), shrine_overlay()),
		"objects":[
			{"type":"Warp","x":0,"y":0,size:[100,1],"destination":{"x":84,"y":6,"map":"Overworld"}},
			{"type":"Person","x":10,"y":7,"tex":"art/npc.png","blocks":[[0,2]],
				"direction_blocks":{"Down":[[0,2]],"Left":[[1,2]],"Right":[[2,2]],"Up":[[3,2]]},
				"cutscene":new CutSceneConvo({
					"text":[""],
					"dynamic_text":()=>["Welcome traveler. This is an Elemental Shrine. I see you have many questions. What do you want to know?"],
					"menu":()=>new Menu(
						[0,1,2,3,4],
						["Elemental Shrine?","What is the history of the island?","What about the rest of the world?","What are Anima?","Never mind."],
						[window.innerWidth-600,20,window.innerWidth-20,300]
					),
					"menu_node":0,
					"menu_result":(c,cs) => {cs.data.text = cs.data.text.concat([
						["Elements are the source of life and power in this world. We use them to grow our food, to build, to power ships, to keep our health, and for every conceivable purpose.","This shrine, and many others like it throughout the world, existed to research new ways to find and use Elements. But there is nothing left to discover, so it is mainly a library and place of meditation.","Yes, there are more shrines in the world. Keep on the lookout for them."],
						["Portabay, to the north, is the main city on this island. Our livelihood is trade. We used to trade all over the world, but lately, most of our ships come from and to Plaint, to the East.","The island used to be unified politically, and it was much more populous, with cities to the west. Now the only major cities left are Portabay and Grove.","While the island has declined economically, we are still prosperous and peaceful. Our lives are basically the same today as they were 100 years ago.","How far back does our history go? Gosh, I don't know. It must be over a thousand years."],
						["There are several major continents. Plaint, to the east, is the largest. We are just a rather small island.","Unfortunately, I don't know much. We don't get much information about the rest of the world anymore.","The continent was once controlled by the mighty Norvum Empire. I believe that Norvum has declined, but I really don't know how things are now.","You really want to see it? I don't think traveling would be a good idea."],
						["Anima are creatures that subsist directly on Elements for power. Many incorporate Elements directly into their bodies. Anima are generally peaceful but territorial; they tend to attack Element hunters.","Anima can also be put to work for us, but it's too difficult and not practical."],
						[]
					][c])}
				})
			},
			{"type":"Person","x":4,"y":13,"tex":"art/npc.png","blocks":[[2,0]],
				"direction_blocks":{"Down":[[2,0]],"Left":[[2,0]],"Right":[[2,0]],"Up":[[2,0]]},
				"motion":{"type":"random_walk","condition":(x,y)=>(y>=7)},
				"cutscene":new CutSceneConvo({"text":["Meeewowowwwwww\n\n(My friend at the oasis forgot to tell you. Make sure you get some abilities for your classes too. You can buy some Elements here if you need them.)"]})
			},
			{"type":"Person","x":15,"y":8,"tex":"art/npc.png","blocks":[[6,0]],
				"direction_blocks":{"Down":[[6,0]],"Left":[[7,0]],"Right":[[5,0]],"Up":[[4,0]]},
				"cutscene":new CutSceneElement({
					"items":["quickhit","guard","heal","psi_blast","powerup"]
				})
			}
		]
	}
}

// Add IDs to all the treasure chests (and maybe other things later on)
for (key in world_maps) {
	for (var i=0; i<world_maps[key].objects.length; i++) {
		var obj = world_maps[key].objects[i];
		if (obj.type=="Treasure") {
			obj.id = key+"_"+obj.x+"_"+obj.y;
		}
	}
}
