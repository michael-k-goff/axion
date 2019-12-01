// Elements

// levelup is a function that returns the number of experience points needed to gain a level.
// The parameter is the current level of the Element.

element_database = {
    "": {
        "name":"No Element",
        "desc":""
    },
    "hp": {
        "name":"HP",
        "cost":20,
        "levelup":(x)=>10+2*x+2*x*x,
        "master":function(character) {character.maxhp += 3},
        "desc":"Raise Max HP by 3.",
        "icon":["art/animation.png",96,32,32,32]
    },
    "mp": {
        "name":"MP",
        "cost":20,
        "levelup":function(x) {return 10+2*x+2*x*x},
        "master":function(character) {character.maxmp += 2},
        "desc":"Raise Max MP by 2.",
        "icon":["art/animation.png",96,32,32,32]
    },
    "strength": {
        "name":"Strength",
        "cost":20,
        "levelup":function(x) {return 10+2*x+2*x*x},
        "master":function(character) {character.strength += 1},
        "desc":"Raise Strength by 1.",
        "icon":["art/animation.png",96,32,32,32]
    },
    "magic": {
        "name":"Magic",
        "cost":20,
        "levelup":function(x) {return 10+2*x+2*x*x},
        "master":function(character) {character.magic += 1},
        "desc":"Raise Magic by 1.",
        "icon":["art/animation.png",96,32,32,32]
    },
    "agility": {
        "name":"Agility",
        "cost":20,
        "levelup":function(x) {return 10+2*x+2*x*x},
        "master":function(character) {character.agility += 1},
        "desc":"Raise Agility by 1.",
        "icon":["art/animation.png",96,32,32,32]
    },
    "stamina": {
        "name":"Stamina",
        "cost":20,
        "levelup":function(x) {return 10+2*x+2*x*x},
        "master":function(character) {character.stamina += 1},
        "desc":"Raise Stamina by 1.",
        "icon":["art/animation.png",96,32,32,32]
    },
    "fighter": {
        "name":"Fighter",
        "cost":50,
        "levelup":(x)=>20*Math.pow(x+1,3),
        "master":(character)=>{},
        "desc":"Learn Fighter Class.",
        "icon":["art/animation.png",160,32,32,32]
    },
    "soldier": {
        "name":"Soldier",
        "cost":50,
        "levelup":(x)=>20*Math.pow(x+1,3),
        "master":(character)=>{},
        "desc":"Learn Soldier Class.",
        "icon":["art/animation.png",160,32,32,32]
    },
    "mystic": {
        "name":"Mystic",
        "cost":50,
        "levelup":(x)=>20*Math.pow(x+1,3),
        "master":(character)=>{},
        "desc":"Learn Mystic Class.",
        "icon":["art/animation.png",160,32,32,32]
    },
    "quickhit": {
        "name":"Quick Hit",
        "cost":75,
        "levelup":(x)=>14*Math.pow(x+1,3)+20*x*x+26,
        "master":(character)=>{},
        "desc":"Learn Quick Hit Ability.",
        "icon":["art/animation.png",192,32,32,32],
        "prereq_element":[["fighter",1]]
    },
    "guard": {
        "name":"Guard",
        "cost":75,
        "levelup":(x)=>14*Math.pow(x+1,3)+20*x*x+26,
        "master":(character)=>{},
        "desc":"Learn Guard Ability.",
        "icon":["art/animation.png",192,32,32,32],
        "prereq_element":[["soldier",1]]
    },
    "heal": {
        "name":"Heal",
        "cost":75,
        "levelup":(x)=>14*Math.pow(x+1,3)+20*x*x+26,
        "master":(character)=>{},
        "desc":"Learn Heal Ability.",
        "icon":["art/animation.png",192,32,32,32],
        "prereq_element":[["mystic",1]]
    },
    "psi_blast": {
        "name":"PSI Blast",
        "cost":75,
        "levelup":(x)=>14*Math.pow(x+1,3)+20*x*x+26,
        "master":(character)=>{},
        "desc":"Learn PSI Blast Ability.",
        "icon":["art/animation.png",192,32,32,32],
        "prereq_element":[["mystic",1]]
    },
    "powerup": {
        "name":"Power Up",
        "cost":75,
        "levelup":(x)=>14*Math.pow(x+1,3)+20*x*x+26,
        "master":(character)=>{},
        "desc":"Learn Power Up Ability.",
        "icon":["art/animation.png",192,32,32,32],
        "prereq_element":[["mystic",1]]
    }
}

// Fill in data
for (var key in element_database) {
    if (!("icon" in element_database[key])) {
        element_database[key].icon = ["art/animation.png",0,224,32,32];
    }
}
