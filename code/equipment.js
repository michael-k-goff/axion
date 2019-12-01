// Equipment

equipment_database = {
    "weapon": {
        "":{
            "name":"None",
            "range":1.1,
            "desc":"No weapon."
        },
        "knife":{
            "name":"Knife",
            "attack":1,
            "hp":1,
            "mp":2,
            "cost":10,
            "animation":"knife",
            "range":1.1,
            "desc":"A simple knife. A bit dull.",
            "icon":["art/animation.png",32,0,32,32]
        },
        "sword":{
            "name":"Sword",
            "attack":2,
            "cost":20,
            "animation":"sword",
            "range":1.4,
            "desc":"A basic sword.",
            "icon":["art/animation.png",128,0,32,32]
        },
        "axe":{
            "name":"Axe",
            "attack":5,
            "cost":100,
            "animation":"sword",
            "range":1.3,
            "agility":-1,
            "desc":"A big, heavy axe.",
            "icon":["art/animation.png",32,96,32,32]
        },
        "staff":{
            "name":"Staff",
            "attack":1,
            "cost":50,
            "animation":"sword",
            "range":1.5,
            "magic":1,
            "agility":-1,
            "desc":"An enchanted staff.",
            "icon":["art/animation.png",64,96,32,32]
        },
        "mace":{
            "name":"Mace",
            "attack":4,
            "cost":100,
            "animation":"sword",
            "range":1.4,
            "desc":"A mace. Blunt and powerful.",
            "icon":["art/animation.png",96,96,32,32]
        },
        "club":{
            "name":"Spiked Club",
            "attack":3,
            "cost":50,
            "animation":"sword",
            "range":1.2,
            "desc":"Not too subtle.",
            "icon":["art/animation.png",128,96,32,32]
        },
        "name":"Weapon"
    },
    "armor": {
        "":{
            "name":"None",
            "desc":"No armor."
        },
        "clothes":{
            "name":"Clothes",
            "defense":1,
            "cost":15,
            "desc":"What did you have before equipping this?",
            "icon":["art/animation.png",64,32,32,32]
        },
        "chainmail":{
            "name":"Chain Mail",
            "defense":3,
            "cost":120,
            "desc":"Not very comfortable, but strong.",
            "icon":["art/animation.png",64,128,32,32]
        },
        "leathercloak":{
            "name":"Leather Cloak",
            "defense":2,
            "cost":60,
            "desc":"Stylish and effective.",
            "icon":["art/animation.png",96,128,32,32]
        },
        "name":"Armor"
    },
    "shield": {
        "":{
            "name":"None",
            "desc":"No shield."
        },
        "trash_lid":{
            "name":"Trash Lid",
            "defense":1,
            "cost":10,
            "desc":"The most desperate attempt at a shield.",
            "icon":["art/animation.png",0,32,32,32]
        },
        "buckler":{
            "name":"Buckler",
            "defense":2,
            "cost":30,
            "desc":"Finally, a proper shield.",
            "icon":["art/animation.png",0,32,32,32]
        },
        "coppershield":{
            "name":"Copper Shield",
            "defense":3,
            "cost":65,
            "desc":"Doesn't hold up well in the weather.",
            "icon":["art/animation.png",32,128,32,32]
        },
        "name":"Shield"
    },
    "helmet": {
        "":{
            "name":"None",
            "desc":"No helmet."
        },
        "hat":{
            "name":"Hat",
            "defense":1,
            "cost":10,
            "desc":"A simple hat.",
            "icon":["art/animation.png",32,32,32,32]
        },
        "sturdycap":{
            "name":"Sturdy Cap",
            "defense":2,
            "cost":45,
            "desc":"It won't blow off in the wind.",
            "icon":["art/animation.png",128,128,32,32]
        },
        "ironhelmet":{
            "name":"Iron Helmet",
            "defense":3,
            "cost":85,
            "desc":"It's a helmet ... made of iron.",
            "icon":["art/animation.png",160,128,32,32]
        },
        "name":"Helmet"
    },
    "accessory": {
        "":{
            "name":"None",
            "desc":"No accessory."
        },
        "ring":{
            "name":"Ring",
            "cost":50,
            "desc":"A basic ring.",
            "magic":1,
            "icon":["art/animation.png",224,0,32,32]
        },
        "mirror":{
            "name":"Mirror",
            "cost":250,
            "desc":"The mirror makes you feel good, increasing HP.",
            "hp":5,
            "icon":["art/animation.png",160,96,32,32]
        },
        "horn":{
            "name":"Horn",
            "cost":125,
            "desc":"Increases Agility.",
            "agility":1,
            "icon":["art/animation.png",192,96,32,32]
        },
        "cards":{
            "name":"Elemental",
            "cost":250,
            "desc":"Improve overall magical ability.",
            "magic":2,
            "mp":2,
            "icon":["art/animation.png",224,96,32,32]
        },
        "lamp":{
            "name":"Lamp",
            "cost":125,
            "desc":"Grants three wishes and some MP.",
            "mp":3,
            "icon":["art/animation.png",0,128,32,32]
        },
        "name":"Accessory"
    },
    // List of attributes for display in item descriptions.
    // Attributes are listed in the order here, only if they are part of the equipment.
    "attributes":[
        ["attack","Attack"],
        ["defense","Defense"],
        ["magic","Magic"],
        ["agility","Agility"],
        ["range","Range"],
        ["hp","HP"],
        ["mp","MP"]
    ]
}

// Fill in some default values
for (var t in equipment_database) {
    for (var k in equipment_database[t]) {
        if (k != "name" && !("desc" in equipment_database[t][k])) {equipment_database[t][k]["desc"] = ""}
        if (k != "name" && t != "attributes") {
            if (!("icon" in equipment_database[t][k])) {equipment_database[t][k]["icon"] = ["art/animation.png",0,224,32,32]}
        }
    }
}
