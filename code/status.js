// Status
// This file is the top level for all game stats and functions around them.
// Status includes things like HP, Strength, Elements, Inventory, Equipment,
// Allies, Enemies and their stats. etc.

// At this point, the hero is created at the start of battle from thin air.
// Should be designed to be created out of permanent stats, and the character
// in battle should be paired to those stats.
class StatusManager {
    constructor() {

    }
    // Initialize stats for a new game.
    initialize() {
        this.heroes = [ new Character("hero","art/mod_RPG_assets.png",{"Up":[[6,6]],"Down":[[4,6]],"Left":[[7,6]],"Right":[[5,6]]}),
                new Character("hero","art/mod_RPG_assets.png",{"Up":[[3,6]],"Down":[[1,6]],"Left":[[0,6]],"Right":[[2,6]]}),
                new Character("hero","art/mod_RPG_assets.png",{"Up":[[6,3]],"Down":[[4,3]],"Left":[[7,3]],"Right":[[5,3]]})    ];
        this.heroes[0].name = "Fiona";
        this.heroes[1].name = "Quincy";
        this.heroes[2].name = "Max";
        this.enemies = [];
        // Various forms of inventory
        this.gold = debug_mode ? 100: 0;
        this.items = debug_mode ? [["potion",5],["candy",3],["tent",2]] : [];
        this.equipment = debug_mode ? [["weapon","knife",3],["weapon","sword",1],["armor","clothes",1]] : [];
        this.elements = debug_mode ? [
            ["hp",4],["mp",1],["strength",1],
            ["fighter",1],["soldier",1],["mystic",1],
            ["quickhit",1],["guard",1],["heal",1],["powerup",1],["psi_blast",1]
        ] : [];
        // Treasure chest and plot data
        this.treasures = {}; // Which treasures are opened.
        this.plot = {"Hint":"I need to talk with Orin, who is the town blacksmith and my boss. He will give me an assignment. I really don't like my job, though."}; // Plot triggers
        this.waypoint = ["Town",11,45]; // Where to respawn after death or reloading game
        // Miscellaneous stuff
        this.last_targets = {"enemy":0,"hero":0};

    }
    start_battle(enemies) {
        this.last_targets = {"enemy":0, "hero":0};
        this.enemies = [];
        for (var i=0; i<enemies.length; i++) {
            // This snippet will determine the number of the enemy class and the i-th enemy's relative position among its clss.
            var total_count = 0;
            var rank_order = 1;
            for (var j=0; j<enemies.length; j++) {
                if (enemies[i] == enemies[j]) {
                    total_count += 1;
                    rank_order += (j<i ? 1:0);
                }
            }
            this.enemies = this.enemies.concat(
                new Character("enemy",enemy_database[enemies[i]].tex,enemy_database[enemies[i]].blocks,{"init_direction":"Down","enemy":enemies[i],"total_count":total_count,"rank_order":rank_order})
            );
            this.enemies[i].battle_init(12+5*i-Math.floor(enemies.length*2.5),12);
        }
        for (var i=0; i<this.heroes.length; i++) {
            this.heroes[i].battle_init(8+2*i,8);
            this.heroes[i].battle_object.render();
            this.heroes[i].set_direction(this.heroes[i].battle_direction);
        }
        for (var i=0; i<this.enemies.length; i++) {
            this.enemies[i].battle_object.render();
        }
        this.set_battle_pace();
    }
    // The general update loop
    // Some modifications are probably desired down the line.
    // Should first check if the battle is over and for outcome, or if a menu
    // or other state change is needed. Only if nothing need to be done would
    // we advanced all characters, animations, etc.
    update(delta) {
        var result = {};
        // Check for hero turn
        for (var i=0; i<this.heroes.length; i++) {
            var single_result = this.heroes[i].update(delta,result);
            if (single_result["ready"]) {
                result["hero_turn"] = i;
                result["selector_object"] = new BattleObject(
                    {"x":this.heroes[i].battle_object.x,
                    "y":this.heroes[i].battle_object.y,
                    "tex":"art/animation.png","blocks":[[2,7]]}
                );
            }
        }
        // Check for enemy turn
        for (var i=0; i<this.enemies.length; i++) {
            var single_result = this.enemies[i].update(delta,result);
            if (single_result["ready"]) {
                var mission = enemy_database[this.enemies[i].en].mission(this, this.enemies[i]);
                stats.enemies[i].set_mission(mission.mission,mission.target);
            }
        }
        // Check if battle is lost
        var lost = 1;
        var win = 1;
        for (var i=0; i<this.heroes.length; i++) {
            if (this.heroes[i].is_alive()) {
                lost = 0;
            }
        }
        for (var i=0; i<this.enemies.length; i++) {
            if (this.enemies[i].is_alive()) {
                win = 0;
            }
        }
        if (lost) {
            result["lost"] = 1;
            this.is_dead = 1;
        }
        else if (win) {
            result["win"] = 1;
            result["victory_message"] = this.process_victory();
        }
        return result;
    }
    // Display functions for when in battle
    battle_display() {
        for (var i=0; i<this.heroes.length; i++) {
            this.heroes[i].battle_display();
        }
        for (var i=0; i<this.enemies.length; i++) {
            this.enemies[i].battle_display();
        }
    }
    // Process loss. This is what happens after you die and are being restored.
    process_loss() {
        this.special_victory = null; // Lose whatever special victory actions might have been present.
        this.restore();
        this.is_dead = 0;
        this.gold = 0; // :(
        for (var i=0; i<this.heroes.length; i++) {
            for (var j=0; j<this.heroes[i].elements.length; j++) {
                var elt_type = this.heroes[i].elements[j][0]
                if (elt_type.length > 0) {
                    this.heroes[i].elements[j][1] = 0; // >:(
                }
            }
        }
        map_hero.set_lead();
    }
    // Handle all stat changes from winning a fight and process rewards
    process_victory() {
        // Determine global rewards
        var gold_reward = 0;
        var exp_reward = 0;
        var item_reward = {};
        var equipment_reward = {};
        var element_reward = {};
        for (var i=0; i<this.enemies.length; i++) {
            gold_reward += this.enemies[i].gold;
            exp_reward += this.enemies[i].exp;
            for(var key in this.enemies[i].item_reward) {
                if (Math.random() < this.enemies[i].item_reward[key]) {
                    if (!(key in item_reward)) {
                        item_reward[key] = 0;
                    }
                    item_reward[key] += 1;
                }
            }
            for(var key in this.enemies[i].element_reward) {
                if (Math.random() < this.enemies[i].element_reward[key]) {
                    if (!(key in element_reward)) {
                        element_reward[key] = 0;
                    }
                    element_reward[key] += 1;
                }
            }
            for (var j=0; j<this.enemies[i].equipment_reward.length; j++) {
                if (Math.random() < this.enemies[i].equipment_reward[j][2]) {
                    var key = this.enemies[i].equipment_reward[j][0]+";"+this.enemies[i].equipment_reward[j][1];
                    if (!(key in equipment_reward)) {
                        equipment_reward[key] = 0;
                    }
                    equipment_reward[key] += 1;
                }
            }
        }
        this.gold += gold_reward;
        var victory_report = [`You win!`,`Earned ${gold_reward} Gold`,`Earned ${exp_reward} Exp`];
        if (this.special_victory) { // Process special events like plot triggers
            this.special_victory();
            this.special_victory = null;
        }
        // Rewards for individual characters
        for (var i=0; i<this.heroes.length; i++) {
            this.heroes[i].process_victory(); // Stuff other than giving rewards
            for (var j=0; j<this.heroes[i].elements.length; j++) {
                var elt_type = this.heroes[i].elements[j][0]
                if (elt_type.length > 0 && this.heroes[i].is_alive()) {
                    this.heroes[i].elements[j][1] += exp_reward;
                    var elt_levels = this.heroes[i].element_levels;
                    var cur_level = elt_type in elt_levels ? elt_levels[elt_type] : 0;
                    if (this.heroes[i].elements[j][1] >= element_database[elt_type].levelup(cur_level)) {
                        victory_report = victory_report.concat(
                            `${this.heroes[i].name} completed ${element_database[elt_type].name} ${cur_level+1}`
                        );
                        if (!(elt_type in elt_levels)) {elt_levels[elt_type] = 0}
                        elt_levels[elt_type] += 1;
                        if ("master" in element_database[elt_type]) {
                            element_database[elt_type].master(this.heroes[i]);
                        }
                        this.heroes[i].elements[j] = ["",0];
                    }
                }
            }
        }
        for(var key in item_reward) {
            victory_report = victory_report.concat(`Got ${item_reward[key]}X ${key}.`);
            this.grant_items(key,item_reward[key]);
        }
        for (var key in element_reward) {
            victory_report = victory_report.concat(`Got ${element_reward[key]}X ${element_database[key].name}.`);
            this.add_element(key, element_reward[key]);
        }
        for (var key in equipment_reward) {
            var [key1,key2] = key.split(';');
            this.add_equipment(key1, key2, equipment_reward[key]);
            victory_report = victory_report.concat(`Got ${equipment_reward[key]}X ${equipment_database[key1][key2].name}.`)
        }
        map_hero.set_lead();
        return victory_report;
    }
    // Set target
    set_target(enemy=1) {
        this.target = 0;
        // Remember targets. Otherwise start at 0.
        if (enemy && this.enemies[this.last_targets.enemy].is_alive()) {
            this.target = this.last_targets.enemy;
        }
        if (!enemy && this.heroes[this.last_targets.hero].is_alive()) {
            this.target = this.last_targets.hero;
        }
        this.target_on_last_team = -1;
        this.target_is_enemy = enemy;
        var team = enemy==1 ? this.enemies : this.heroes;
        while ( this.target < team.length && !(team[this.target].is_alive()) ) {
                this.target += 1;
        }
        // This is the case where no suitable target can be found.
        // If we get into this state, there's something wrong.
        if (this.target >= team.length) {
            this.target = 0;
            console.log("status.js: no target found");
        }
        return new BattleObject(
            {"x":team[this.target].battle_object.x,
            "y":team[this.target].battle_object.y,
            "tex":"art/animation.png","blocks":[[3,7]],
            "size":[1.4,1.4]}
        );
    }
    // Check if new target is better than old target
    better_target(key, old_target, new_target, base_target) {
        var new_score = Math.floor(1000*new_target.battle_object.x)/1000 + new_target.battle_object.y/1000000;
        var old_score = Math.floor(1000*old_target.battle_object.x)/1000 + old_target.battle_object.y/1000000;
        var base_score = Math.floor(1000*base_target.battle_object.x)/1000 + base_target.battle_object.y/1000000;
        new_score -= base_score;
        old_score -= base_score;
        if (new_score < 0) {
            new_score += 1000;
        }
        if (new_score == 0 && (key == "ArrowRight" || key == "RepeatRight")) {
            new_score = 1000;
        }
        if (old_score < 0) {
            old_score += 1000;
        }
        if (old_score == 0 && (key == "ArrowRight" || key == "RepeatRight")) {
            old_score = 1000;
        }
        if (key == "ArrowLeft" || key == "RepeatLeft") {
            return new_score > old_score;
        }
        if (key == "ArrowRight" || key == "RepeatRight") {
            return new_score < old_score;
        }
    }
    // Scrolling from one target to the next
    scroll_target(key,target_object) {
        var team = this.target_is_enemy==1 ? this.enemies : this.heroes;
        if (team.length < 1) {
            return;
        }
        var new_target = this.target;
        for (var i=0; i<team.length; i++) {
            // Check if the new target is better than the current one
            if (team[i].is_alive() && this.better_target(key, team[new_target], team[i], team[this.target])) {
                new_target = i;
            }
        }
        this.target = new_target;
        if (this.target_is_enemy) {this.last_targets.enemy = new_target;}
        else {this.last_targets.hero = new_target;}
        target_object.dest_x = team[this.target].battle_object.x;
        target_object.dest_y = team[this.target].battle_object.y;
    }
    // Swap the team that the target is pointing to.
    swap_target_team(key,target_object) {
        var temp = this.target;
        this.target_is_enemy = this.target_is_enemy? 0:1;
        var team = (this.target_is_enemy) ? this.enemies : this.heroes;
        if (this.target_is_enemy && team[this.last_targets.enemy].is_alive()) {
            this.target = this.last_targets.enemy;
        }
        else if (!this.target_is_enemy && team[this.last_targets.hero].is_alive()) {
            this.target = this.last_targets.hero;
        }
        else if (this.target_on_last_team >= 0) { // I think this case should be generally avoided
            this.target = this.target_on_last_team;
        }
        else {
            this.target = 0;
            while ( this.target < team.length && !(team[this.target].is_alive()) ) {
                    this.target += 1;
            }
        }
        this.target_on_last_team = temp;
        // This is the case where no suitable target can be found.
        // If we get into this state, there's something wrong.
        if (this.target >= team.length) {
            this.target = 0;
            console.log("status.js: no target found");
        }
        else {
            target_object.dest_x = team[this.target].battle_object.x;
            target_object.dest_y = team[this.target].battle_object.y;
            if (this.target_is_enemy) {
                this.last_targets.enemy = this.target;
            }
            else {
                this.last_targets.hero = this.target;
            }
        }
    }
    // Return the current target as a character
    get_target() {
        var team = this.target_is_enemy==1 ? this.enemies : this.heroes;
        return team[this.target];
    }
    // Remove all objects from the map
    clear_objects() {
        for (var i=0; i<this.heroes.length; i++) {
            this.heroes[i].battle_object.unrender();
        }
        for (var i=0; i<this.enemies.length; i++) {
            this.enemies[i].battle_object.unrender();
        }
    }
    // Some targeting helper functions. Will probably move later on.
    // Pick a random hero who is a valid target
    random_hero() {
        var target = 0;
        var num_attempted = 0;
        for (var i=0; i<this.heroes.length; i++) {
            if (this.heroes[i].is_alive()) {
                num_attempted += 1;
                if (Math.floor(Math.random() * num_attempted)==0) {
                    target = i;
                }
            }
        }
        return this.heroes[target];
    }
    // Random. Specify team and a condition to look for
    random_char(team="hero", condition=null) {
        var t = team=="hero" ? this.heroes : this.enemies;
        var target = -1;
        var num_attempted = 0;
        for (var i=0; i<t.length; i++) {
            if (t[i].is_alive() && (!condition || condition(t[i])) ) {
                num_attempted += 1;
                if (Math.floor(Math.random() * num_attempted)==0) {
                    target = i;
                }
            }
        }
        return target >= 0 ? t[target] : null;
    }
    // Give some items to the player
    grant_items(key,number) {
        for (var i=0; i<this.items.length; i++) {
            if (key==this.items[i][0]) {
                this.items[i][1] += number;
                return;
            }
        }
        this.items = this.items.concat([[key,number]]);
    }
    // Carry out the effect of the item.
    // This function depletes the item from inventory if it is consumable;
    // the item's specific effect does not need to account for that.
    // This function also updates the inventory object appropriately.
    // Return true if the item has run out; otherwise false or nothing.
    use_item(key,target) {
        // item_result is a text string that displays the result of the last item used.
        // Used for display in the main menu system.
        if (item_database.items[key].will_use(target)) {
            this.item_result = item_database.items[key].effect(target);
            if (item_database.items[key].consumable) {
                return this.deplete_item(key);
            }
        }
    }
    deplete_item(key) {
        for (var i=0; i<this.items.length; i++) {
            if (key==this.items[i][0]) {
                this.items[i][1] -= 1;
                if (this.items[i][1] <= 0) {
                    this.items.splice(i,1);
                    return true;
                }
                return false;
            }
        }
    }
    // Just check if there is an item, but don't use it.
    has_item(key) {
        for (var i=0; i<this.items.length; i++) {
            if (key==this.items[i][0]) {
                return true;
            }
        }
        return false;
    }
    // Restore all stats
    restore() {
        for (var i=0; i<this.heroes.length; i++) {
            this.heroes[i].restore();
        }
    }
    // Equip
    equip(hero_num, item_slot, item_key) {
        var item_type = this.heroes[hero_num].equipment[item_slot][0];
        var de_equip = this.heroes[hero_num].equipment[item_slot][1];
        this.heroes[hero_num].equipment[item_slot][1] = item_key;
        this.add_equipment(item_type, de_equip);
        this.remove_equipment(item_type, item_key);
        this.heroes[hero_num].hpmp_cap();
        return;
    }
    add_equipment(item_type, item_key, num=1) {
        if (item_key == "") {return;}
        for (var i=0; i<this.equipment.length; i++) {
            if (this.equipment[i][0] == item_type && this.equipment[i][1] == item_key) {
                this.equipment[i][2] += num;
                return;
            }
        }
        this.equipment = this.equipment.concat([[item_type, item_key, num]]);
    }
    remove_equipment(item_type, item_key) {
        if (item_key == "") {return;}
        for (var i=0; i<this.equipment.length; i++) {
            if (this.equipment[i][0] == item_type && this.equipment[i][1] == item_key) {
                this.equipment[i][2] -= 1;
                if (this.equipment[i][2] <= 0) {
                    this.equipment.splice(i,1);
                }
                return;
            }
        }
    }
    // Equip an element
    equip_element(hero_num, elt_slot, elt_key) {
        var de_equip = this.heroes[hero_num].elements[elt_slot][0];
        this.heroes[hero_num]["elements"][elt_slot] = [elt_key,0];
        this.add_element(de_equip);
        this.remove_element(elt_key);
    }
    add_element(elt_key, num=1) {
        if (elt_key == "") {return;}
        for (var i=0; i<this.elements.length; i++) {
            if (this.elements[i][0] == elt_key) {
                this.elements[i][1] += num;
                return;
            }
        }
        this.elements = this.elements.concat([[elt_key, num]]);
    }
    remove_element(elt_key) {
        if (elt_key == "") {return;}
        for (var i=0; i<this.elements.length; i++) {
            if (this.elements[i][0] == elt_key) {
                this.elements[i][1] -= 1;
                if (this.elements[i][1] <= 0) {
                    this.elements.splice(i,1);
                }
                return;
            }
        }
    }
}

StatusManager.prototype.get_equipment_count = function(item_type, item_key) {
    if (item_key == "") {return;}
    var count = 0;
    for (var i=0; i<this.equipment.length; i++) {
        if (this.equipment[i][0] == item_type && this.equipment[i][1] == item_key) {
            count += this.equipment[i][2];
        }
    }
    for (var i=0; i<this.heroes.length; i++) {
        for (var j=0; j<this.heroes[i].equipment.length; j++) {
            if (this.heroes[i].equipment[j][0] == item_type && this.heroes[i].equipment[j][1]==item_key) {
                count += 1;
            }
        }
    }
    return count;
}

StatusManager.prototype.set_battle_pace = function() {
    // Battle pace is set to the average heroes' agility.
    // It does not adjust during the fight.
    var total_agility = 0;
    for (var i=0; i<stats.heroes.length; i++) {
        total_agility += stats.heroes[i].agility_power();
    }
    this.battle_pace = 15 / (total_agility/stats.heroes.length);
}

StatusManager.prototype.get_element_count = function(elt) {
    if (elt == "") {return 0;}
    var count = 0;
    for (var i=0; i<this.elements.length; i++) {
        if (this.elements[i][0] == elt) {count += this.elements[i][1]}
    }
    for (var i=0; i<this.heroes.length; i++) {
        for (var j=0; j<this.heroes[i].elements.length; j++) {
            if (this.heroes[i].elements[j][0] == elt) {count += 1;}
        }
    }
    return count;
}

StatusManager.prototype.get_item_count = function(key) {
    for (var i=0; i<this.items.length; i++) {
        if (key==this.items[i][0]) {
            return this.items[i][1];
        }
    }
    return 0;
}

StatusManager.prototype.can_equip_element = (hero, element) => {
    return stats.missing_element_prereqs(hero,element).length == 0;
}

// Get missing prerequisites for equipping the element in textual form.
StatusManager.prototype.missing_element_prereqs = (hero, element) => {
    var missing = [];
    if (!(element in element_database)) {
        return missing;
    }
    if ("prereq_element" in element_database[element]) {
        for (var i=0; i<element_database[element].prereq_element.length; i++) {
            const elt_type = element_database[element].prereq_element[i][0];
            const elt_level = element_database[element].prereq_element[i][1];
            if (!(elt_type in hero.element_levels) || hero.element_levels[elt_type] < elt_level) {
                missing = missing.concat(`Requires ${element_database[elt_type].name} ${elt_level}.`);
            }
        }
    }
    return missing;
}

StatusManager.prototype.save = function() {
    var save_stats = {};
    top_keys = ["gold", "items", "equipment", "elements","treasures","plot","waypoint"];
    top_keys.map((x)=>save_stats[x]=stats[x]);
    hero_keys = ["maxhp", "hp", "mp", "maxmp", "strength", "stamina", "agility",
        "magic", "equipment", "elements", "element_levels", "name", "class",
        "battles_in_class","stance_type"];
    save_stats["heroes"] = new Array(stats.heroes.length);
    for (var i=0; i<stats.heroes.length; i++) {
        save_stats["heroes"][i] = {};
    }
    hero_keys.map((x)=>{
        for (var i=0; i<stats.heroes.length; i++) {
            save_stats.heroes[i][x] = stats.heroes[i][x];
        }
    });
    localStorage.setItem("stats",JSON.stringify(save_stats));
}
StatusManager.prototype.load = function() {
    var loaded = localStorage.getItem("stats");
    if (loaded) {
        // Load everything one at a time. Maybe not the best, but we can't just copy over the old object.
        loaded = JSON.parse(loaded);

        top_keys = ["gold", "items", "equipment", "elements", "treasures","plot","waypoint"];
        top_keys.map((x)=>stats[x]=loaded[x]);
        hero_keys = ["maxhp", "hp", "mp", "maxmp", "strength", "stamina", "agility",
            "magic", "equipment", "elements", "element_levels", "name", "class",
            "battles_in_class","stance_type"];
        hero_keys.map((x)=>{
            for (var i=0; i<stats.heroes.length; i++) {
                stats.heroes[i][x] = loaded.heroes[i][x];
            }
        });
        // Set position on the map
        this.loaded_start_position = {
            "map":loaded.waypoint[0],
            "x":loaded.waypoint[1],
            "y":loaded.waypoint[2]
        }
    }
}
// Where the character starts. Have it all in one logical place.
StatusManager.prototype.start_position = function() {
    return this.loaded_start_position ? this.loaded_start_position : { // Default start
        "map":"Town",
        "x":11,
        "y":45
    }
}

stats = new StatusManager();
