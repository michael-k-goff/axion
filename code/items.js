// Items

class Item {
    constructor(args={}) {
        this.name = args["name"];
        // Target can be "None" or "Single".
        this.target = args["target"];
        this.effect = args["effect"];
        this.consumable = "persistent" in args ? false:true;
        this.cost = "cost" in args ? args["cost"]:0;
        this.desc = "desc" in args ? args["desc"]:0;
        // The default icon is, for now, a blank space.
        this.icon = "icon" in args ? args["icon"]:["art/animation.png",0,224,32,32];
        this.can_use = args.can_use ? args.can_use : ()=>1;
        this.will_use = args.will_use ? args.will_use : (target)=>1;
    }
}

class ItemDatabase {
    constructor() {
        this.items = {};
    }
}

item_database = new ItemDatabase();

item_database.items.potion = new Item({"name":"Potion","target":"Single",
    "effect":(target) => {
        stats.heroes[target].recover(5);
        menu_manager.text_animation({"character":target, "text":"5", "color":"rgba(0,255,0,1.0)"});
        return "";
    },
    "cost":5,
    "desc":"Recover 5 HP.",
    "icon":["art/animation.png",160,0,32,32],
    "will_use":(target) => {
        if (stats.heroes[target].hp>0 && stats.heroes[target].hp<stats.heroes[target].hp_power()) {
            return 1;
        }
        else {
            menu_manager.text_animation({"character":target, "text":"No Effect", "color":"rgba(160,160,160,1.0)"});
            return 0;
        }
    }
});
item_database.items.tonic = new Item({"name":"Tonic","target":"Single",
    "effect":(target) => {
        stats.heroes[target].recover(15);
        menu_manager.text_animation({"character":target, "text":"15", "color":"rgba(0,255,0,1.0)"});
        return "";
    },
    "cost":20,
    "desc":"Recover 15 HP.",
    "icon":["art/animation.png",192,128,32,32],
    "will_use":(target) => {
        if (stats.heroes[target].hp>0 && stats.heroes[target].hp<stats.heroes[target].hp_power()) {
            return 1;
        }
        else {
            menu_manager.text_animation({"character":target, "text":"No Effect", "color":"rgba(160,160,160,1.0)"});
            return 0;
        }
    }
});
item_database.items.candy = new Item({"name":"Candy","target":"Single",
    "effect":(target) => {
        stats.heroes[target].recover_mp(5);
        menu_manager.text_animation({"character":target, "text":"5", "color":"rgba(255,0,255,1.0)"});
        return "";
    },
    "cost":10,
    "desc":"Recover 5 MP.",
    "icon":["art/animation.png",192,0,32,32],
    "will_use":(target) => {
        if (stats.heroes[target].hp>0 && stats.heroes[target].mp<stats.heroes[target].mp_power()) {
            return 1;
        }
        else {
            menu_manager.text_animation({"character":target, "text":"No Effect", "color":"rgba(160,160,160,1.0)"});
            return 0;
        }
    }
});
item_database.items.tent = new Item({"name":"Tent","target":"None",
    "effect":(target) => {
        stats.restore();
        for (var i=0; i<stats.heroes.length; i++) {
            menu_manager.text_animation({"character":i, "text":`${stats.heroes[i].hp_power()}`, "color":"rgba(0,255,0,1.0)"});
            menu_manager.text_animation({"character":i, "text":`${stats.heroes[i].mp_power()}`, "color":"rgba(255,0,255,1.0)","delay":0.5});
        }
        return "";
    },
    "cost":12,
    "desc":"Fully restore stats.",
    "icon":["art/animation.png",128,32,32,32],
    "can_use":()=>{
        return map_controller.current_map == "Overworld";
    }
});
