// Classes

// Stat keys are multipliers (e.g. "strength":1.1 means that strength is multplied by 1.1
// if using that class.)
// [stat]_level adds to the multipler, by this parameter times the current class level.

// ability_bundles, if present, is a list of all the ability bundles granted by the class
// More mechanisms may be added over time for granting bundles to players.
// See ability_bundles in character.js for the function that defines them for menu purposes.

class_database = {
    "":{
        "name":"No Class"
    },
    "fighter":{
        "name":"Fighter",
        "strength":1.2,
        "strength_level":0.01,
        "agility":1.1,
        "ability_bundles":["fight"]
    },
    "soldier":{
        "name":"Soldier",
        "strength":1.1,
        "stamina":1.1,
        "stamina_level":0.01,
        "maxhp":1.1,
        "ability_bundles":["training"]
    },
    "mystic":{
        "name":"Mystic",
        "magic":1.2,
        "magic_level":0.01,
        "maxmp":1.1,
        "ability_bundles":["mysticism"]
    },
    // Order as displayed in the main class menu.
    "menu_order":["","fighter","soldier","mystic"]
}
