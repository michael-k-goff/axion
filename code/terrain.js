terrain_impassible = ['w'];

terrain_map = [
	["    w    ",[7,5]], // Water
	["    wg   ",[0,7]], // Water
	["   gw    ",[2,7]], // Water
	[" g  w    ",[1,6]], // Water
	["    w  g ",[1,8]], // Water
	[" wg ww   ",[0,6]], // Water
	["gw ww    ",[2,6]], // Water
	["    ww wg",[0,8]], // Water
	["   ww gw ",[2,8]], // Water
	["    wg g ",[4,7]], // Water
	[" g  wg   ",[4,8]], // Water
	["   gw  g ",[3,7]], // Water
	[" g gw    ",[3,8]], // Water

	["    ws   ",[0,1]], // Water
	["   sw    ",[2,1]], // Water
	[" s  w    ",[1,0]], // Water
	["    w  s ",[1,2]], // Water
	[" ws ww   ",[0,0]], // Water
	["sw ww    ",[2,0]], // Water
	["    ww ws",[0,2]], // Water
	["   ww sw ",[2,2]], // Water
	[" w wws s ",[4,1]], // Water
	[" s wws w ",[4,2]], // Water
	[" w sww s ",[3,1]], // Water
	[" s sww w ",[3,2]], // Water

	["    g    ",[1,7]], // Grass // [1,7]

	["    s    ",[1,4]], // Scrub
	["   gs    ",[0,4]], // Scrub
	["    sg   ",[2,4]], // Scrub
	[" g  s    ",[1,5]], // Scrub
	["    s  g ",[1,3]], // Scrub
	[" g gss s ",[0,5]], // Scrub
	[" s gss g ",[0,3]], // Scrub
	[" g ssg s ",[2,5]], // Scrub
	[" s ssg g ",[2,3]], // Scrub
	[" sg ss   ",[3,4]], // Scrub
	["gs ss    ",[4,4]], // Scrub
	["    ss sg",[3,5]], // Scrub
	["   ss gs ",[4,5]], // Scrub
	// Farm
	["    F    ",[30,2]],
	["   gF    ",[29,2]],
	["    Fg   ",[31,2]],
	[" g  F    ",[30,3]],
	["    F  g ",[30,1]],
	[" g gF    ",[29,3]],
	[" g  Fg   ",[31,3]],
	["   gF  g ",[29,1]],
	["    Fg g ",[31,1]]
]

terrain2_impassible = ['f','m'];

terrain_map2 = [
	["    .    ",[18,0]], // Blank
	["    f    ",[8,1]], // Forest
	["   f.    ",[9,1]], // Forest
	["    .f   ",[7,1]], // Forest
	["    .  f ",[8,2]], // Forest
	["   .. f..",[9,2]], // Forest
	["    ....f",[7,2]], // Forest
	[" f  .    ",[8,0]], // Forest
	["f....    ",[9,0]], // Forest
	["..f ..   ",[7,0]], // Forest
	[" f ..f . ",[6,3]], // Forest
	[" f f.. . ",[5,3]], // Forest
	[" . ..f f ",[6,2]], // Forest
	[" . f.. f ",[5,2]], // Forest

	["    m    ",[12,1]], // Mountain
	["    m.   ",[13,1]], // Mountain
	["   .m    ",[10,1]], // Mountain
	[" .  m    ",[12,6]], // Mountain
	["    m  . ",[12,0]], // Mountain
	["    m. . ",[13,0]], // Mountain
	["   .m  . ",[10,0]], // Mountain
	[" .  m.   ",[13,6]], // Mountain
	[" . .m    ",[10,6]], // Mountain
	["    mm m.",[8,4]], // Mountain
	["   mm .m ",[9,4]], // Mountain
	[".m mm    ",[9,3]], // Mountain
	[" m. mm   ",[8,3]], // Mountain

	["    b    ",[7,3]] // Bush
]

town_map2_impassible = ['0','1'];
town_map2_passible = ['D','p'];
town_map2 = [
	["    .    ",[7,0]], // Blank
	["    p    ",[0,7]], // Path
	["    p.   ",[1,7]],
	["   .p    ",[4,7]],
	[" .  p    ",[2,7]],
	["    p  . ",[3,7]],
	["    p. . ",[7,7]],
	[" .  p.   ",[5,7]],
	["   .p  . ",[0,6]],
	[" . .p    ",[6,7]],
	// Buildings
	["    0    ",[1,6]],
	["    1    ",[2,6]],
	["    d    ",[3,6]],
	// Dock
	["    D    ",[4,6]]

];

function overworld_transformer(map) {
	// Add in some alternate terrains
	for (var i=0; i<map.length; i++) {
		for (var j=0; j<map[0].length-1; j++) {
			if (map[i][j][0]==1 && map[i][j][1]==7) {
				if ((i+3*j)%10 == 0 && (3*i-j)%10 == 0) {
					map[i][j] = (i%2) ? [3,6] : [4,6];
				}
			}
			if (map[i][j][0]==1 && map[i][j][1]==4) {
				if ((i+3*j)%10 == 0 && (3*i-j)%10 == 0) {
					map[i][j] = (i%2) ? [1,1] : [1,1];
				}
			}
			if (map[i][j][0]==7 && map[i][j][1]==5) {
				if ((i+2*j)%5 == 0 && (2*i-j)%5 == 0) {
					map[i][j] = (i%2) ? [3,0] : [4,0];
				}
			}
		}
	}
}

cave_map = [
	["    .    ",[14,1]],
	["    w    ",[13,3]],
	[" w  w    ",[13,3]],
	["   www   ",[15,2]],
	[" w ww    ",[13,3]],
	[" w  ww   ",[13,3]],
	["   ww  w ",[13,3]],
	["    ww w ",[13,3]],
	[" w  w  w ",[13,1]]
]
cave_map2 = [
	["    .    ",[23,0]]
]
cave_impassible = ['w'];
cave_impassible2 = [];

// Tower
tower_map = [
	["    .    ",[14,5]],
	["    w    ",[13,6]],
	[" w  w    ",[13,4]],
	["   www   ",[15,6]],
	[" w ww    ",[12,7]],
	[" w  ww   ",[11,6]],
	["   ww  w ",[15,6]],
	["    ww w ",[15,6]],
	[" w  w  w ",[13,5]],
	["   www w ",[15,6]]
]
tower_map2 = [
	["    .    ",[23,0]]
]
tower_impassible = ['w'];
tower_impassible2 = [];

terrain_packs = {
    "Overworld":{
        "map":terrain_map,
        "map2":terrain_map2,
        "impassible":terrain_impassible,
        "impassible2":terrain2_impassible,
        "art":"art/overworld.png",
        "transformer":overworld_transformer,
		"battle_panel":[1,7]
    },
	"Town":{
        "map":terrain_map,
        "map2":town_map2,
        "impassible":terrain_impassible,
        "impassible2":town_map2_impassible,
		"passible2":town_map2_passible,
        "art":"art/overworld.png",
		"art2":"art/town_overlay.png",
		"battle_panel":[1,7]
    },
    "Cave":{
        "map":cave_map,
        "map2":cave_map2,
        "impassible":cave_impassible,
        "impassible2":cave_impassible2,
        "art":"art/dirt_tiles_mod.png",
		"battle_panel":[14,1]
    },
	"Tower":{
        "map":tower_map,
        "map2":tower_map2,
        "impassible":tower_impassible,
        "impassible2":tower_impassible2,
        "art":"art/dirt_tiles_mod.png",
		"battle_panel":[14,5]
    }
}

function make_map(terrain_pack, layer1, layer2) {
    var result = {
        "terrain":layer1,
        "terrain_map":terrain_packs[terrain_pack]["map"],
        "terrain_impassible":terrain_packs[terrain_pack]["impassible"],
        "terrain2":layer2,
        "terrain_map2":terrain_packs[terrain_pack]["map2"],
        "terrain_impassible2":terrain_packs[terrain_pack]["impassible2"],
		"terrain_passible2":"passible2" in terrain_packs[terrain_pack] ? terrain_packs[terrain_pack]["passible2"] : [],
        "art":terrain_packs[terrain_pack]["art"],
    };
    if ("transformer" in terrain_packs[terrain_pack]) {
        result["transformer"] = terrain_packs[terrain_pack]["transformer"];
    }
	if ("art2" in terrain_packs[terrain_pack]) {
		result["art2"] = terrain_packs[terrain_pack]["art2"];
	}
	else {
		result["art2"] = result["art"];
	}
	if ("battle_panel" in terrain_packs[terrain_pack]) {
		result["battle_panel"] = terrain_packs[terrain_pack]["battle_panel"];
	}
    return result;
}
