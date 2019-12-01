// Enemy Database

enemy_database = {
    "dummy":{ // Grove. The training dummy doesn't fight back.
        "name":"Training Dummy",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[3,6]],"Up":[[3,6]],"Left":[[3,6]],"Right":[[3,6]]},
        // Stats
        "maxhp":40,
        "maxmp":0,
        "strength":0,
        "stamina":0,
        "agility":0,
        "magic":0,
        "stance_speed":0.0,
        // Actions
        "mission": (status) => {return{
            "mission":"attack",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":0,
        "exp":0,
        "item_reward":{
        }
    },
    "beetle":{ // Island, south
        "name":"Bothersome Beetle",
        // Display Information
        "tex":"art/beetle5_2.png",
        "blocks":{"Down":[[1,3]],"Up":[[1,2]],"Left":[[1,0]],"Right":[[1,1]]},
        // Stats
        "maxhp":7,
        "maxmp":9999,
        "strength":3,
        "stamina":3,
        "agility":3,
        "magic":3,
        "stance_type":"offensive",
        // Actions
        "mission": (status) => {return{
            "mission":"attack",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":1,
        "exp":1,
        "item_reward":{
            "potion":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "blob":{ // Island, south
        "name":"Generic Blob",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[0,7]],"Up":[[0,7]],"Left":[[0,7]],"Right":[[0,7]]},
        // Stats
        "maxhp":5,
        "maxmp":9999,
        "strength":3,
        "stamina":4,
        "agility":3,
        "magic":3,
        "move_speed":0.6,
        "stance_type":"defensive",
        // Actions
        "mission": (status, en) => {
            if (en.hp < en.hp_power()) {
                return {"mission":"heal", "target":en}
            }
            else {
                return {"mission":"attack","target":status.random_char("hero")}
            }
        },
        // Rewards
        "gold":1,
        "exp":1,
        "item_reward":{
            "potion":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "bat":{ // Cave
        "name":"Goshdarn Bat",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[1,7]],"Up":[[1,7]],"Left":[[1,7]],"Right":[[1,7]]},
        // Stats
        "maxhp":10,
        "maxmp":0,
        "strength":6,
        "stamina":5,
        "agility":6,
        "magic":3,
        "move_speed":1.3,
        "stance_type":"offensive",
        // Actions
        "mission": (status) => {return{
            "mission":"attack",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":2,
        "exp":3,
        "item_reward":{
            "potion":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "enchanted_blob":{ // Cave
        "name":"Enchanted Blob",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[0,6]],"Up":[[0,6]],"Left":[[0,6]],"Right":[[0,6]]},
        // Stats
        "maxhp":15,
        "maxmp":9999,
        "strength":7,
        "stamina":6,
        "agility":5,
        "magic":5,
        "move_speed":0.6,
        "stance_type":"defensive",
        // Actions
        "mission": (status) => {
            var heal_target = status.random_char("enemy",(c)=>c.hp < c.hp_power()/2);
            if (heal_target) {
                return {"mission":"heal", "target":heal_target}
            }
            else {
                return {"mission":"psi_blast","target":status.random_char("hero")}
            }
        },
        // Rewards
        "gold":3,
        "exp":3,
        "item_reward":{
            "potion":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "bumblebee":{ // Island, north
        "name":"Bunglebee",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[2,7]],"Up":[[2,7]],"Left":[[2,7]],"Right":[[2,7]]},
        // Stats
        "maxhp":18,
        "maxmp":9999,
        "strength":7,
        "stamina":6,
        "agility":10,
        "magic":8,
        "move_speed":2.0,
        "stance_type":"offensive",
        // Actions
        "mission": (status, en) => {
            for (var i=0; i<en.status_effects.length; i++) {
                if (en.status_effects[i].effect == "attack_up") {
                    return {"mission":"attack","target":status.random_hero()};
                }
            }
            return {"mission":"powerup","target":en};
        },
        // Rewards
        "gold":5,
        "exp":6,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "deathcap":{ // Island, north
        "name":"Death Cap Mushroom",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[3,7]],"Up":[[3,7]],"Left":[[3,7]],"Right":[[3,7]]},
        // Stats
        "maxhp":21,
        "maxmp":0,
        "strength":8,
        "stamina":8,
        "agility":8,
        "magic":3,
        // Actions
        "mission": (status) => {return{
            "mission":"attack",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":6,
        "exp":6,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "viper":{ // Island, north
        "name":"Viper",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[1,6]],"Up":[[1,6]],"Left":[[1,6]],"Right":[[1,6]]},
        // Stats
        "maxhp":20,
        "maxmp":0,
        "strength":10,
        "stamina":6,
        "agility":9,
        "magic":3,
        "stance_type":"offensive",
        // Actions
        "mission": (status) => {return{
            "mission":"attack",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":6,
        "exp":5,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015
        }
    },
    "dryad":{ // Tower
        "name":"Lesser Dryad",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[4,7]],"Up":[[4,7]],"Left":[[4,7]],"Right":[[4,7]]},
        // Stats
        "maxhp":35,
        "maxmp":9999,
        "strength":12,
        "stamina":13,
        "agility":12,
        "magic":3,
        "move_speed":0.8,
        // Actions
        "mission": (status, en) => {
            for (var i=0; i<en.status_effects.length; i++) {
                if (en.status_effects[i].effect == "defense_up") {
                    return {"mission":"attack","target":status.random_hero()};
                }
            }
            return {"mission":"guard","target":en};
        },
        // Rewards
        "gold":9,
        "exp":10,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015,
            "guard":0.1
        }
    },
    "firedrake":{ // Tower
        "name":"Fire Drake",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[5,7]],"Up":[[5,7]],"Left":[[5,7]],"Right":[[5,7]]},
        // Stats
        "maxhp":28,
        "maxmp":9999,
        "strength":14,
        "stamina":12,
        "agility":13,
        "magic":3,
        "move_speed":1.2,
        "stance_type":"offensive",
        // Actions
        "mission": (status) => {return{
            "mission":"quickhit",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":9,
        "exp":11,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1,
            "tent":0.01
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015,
            "quickhit":0.1
        }
    },
    "gnome":{ // Tower
        "name":"Tacky Gnome",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[6,7]],"Up":[[6,7]],"Left":[[6,7]],"Right":[[6,7]]},
        // Stats
        "maxhp":30,
        "maxmp":9999,
        "strength":11,
        "stamina":12,
        "agility":13,
        "magic":13,
        "stance_type":"defensive",
        // Actions
        "mission": (status) => {
            var heal_target = status.random_char("enemy",(c)=>c.hp < c.hp_power()/2);
            if (heal_target) {
                return {"mission":"heal", "target":heal_target}
            }
            else {
                return {"mission":"psi_blast","target":status.random_char("hero")}
            }
        },
        // Rewards
        "gold":11,
        "exp":9,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1,
            "tent":0.01
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015,
            "psi_blast":0.1,
            "heal":0.1
        }
    },
    "goblin":{ // Tower
        "name":"Annoying Goblin",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[7,7]],"Up":[[7,7]],"Left":[[7,7]],"Right":[[7,7]]},
        // Stats
        "maxhp":30,
        "maxmp":0,
        "strength":13,
        "stamina":11,
        "agility":13,
        "magic":3,
        // Actions
        "mission": (status) => {return{
            "mission":"attack",
            "target":status.random_hero()
        }},
        // Rewards
        "gold":10,
        "exp":9,
        "item_reward":{
            "tonic":0.1,
            "candy":0.1,
            "tent":0.01
        },
        "element_reward":{
            "hp":0.015,
            "mp":0.015,
            "strength":0.015,
            "magic":0.015,
            "stamina":0.015,
            "agility":0.015,
            "powerup":0.1
        }
    },
    "fire_elemental":{ // Lighthouse boss.
        "name":"Fire Elemental",
        // Display Information
        "tex":"art/enemies.png",
        "blocks":{"Down":[[2,6]],"Up":[[2,6]],"Left":[[2,6]],"Right":[[2,6]]},
        // Stats
        "maxhp":50,
        "maxmp":9999,
        "strength":12,
        "stamina":12,
        "agility":13,
        "magic":20,
        // Actions
        "mission": (status) => {
            var heal_target = status.random_char("enemy",(c)=>c.hp < c.hp_power()/2);
            if (heal_target) {
                return {"mission":"heal", "target":heal_target}
            }
            else {
                return {"mission":"psi_blast","target":status.random_char("hero")}
            }
        },
        // Rewards
        "gold":50,
        "exp":50,
        "item_reward":{
        }
    }
};
