// Character class

// Base class for characters, whether heroes, enemies, etc.
// Meant to represent them as they appear in battle and not to persist beyond
// the end of the battle.

// As a helper, basic data on status effects. May spin off to a separate file later.
status_effect_database = {
    "defense_up":{
        "icon":["art/animation.png",0,6]
    },
    "attack_up":{
        "icon":["art/animation.png",1,7]
    }
}

class Character {
    constructor (team,tex,blocks,params={}) {
        // Basic stats, to be filled in with other things
        // The following are for heroes. If the character is an enemy,
        // they will be overwritten below.
        if (debug_mode) {
            this.maxhp = 20;
            this.hp = 20;
            this.mp = 5;
            this.maxmp = 5;
        }
        else {
            this.maxhp = 20;
            this.hp = 20;
            this.mp = 2;
            this.maxmp = 2;
        }
        this.strength = 3;
        this.stamina = 3;
        this.agility = 3;
        this.magic = 3;
        this.team = team;
        this.status_effects = [];
        this.move_speed = 1; // Move speed. 1 is the default. Applies in a mission
        this.stance_speed = 1; // Stance speed. 1 is default. Applies outside of missions.
        this.stance_type = "normal" // Options are "normal", "offensive", "defensive"
        // Equipment. Each entry in the main array is an array indicating an equipment slow.
        // The first element is the type of equipment, and the second is what is equipped.
        this.equipment = [
            ["weapon",""],
            ["armor",""],
            ["shield",""],
            ["helmet",""],
            ["accessory",""]
        ];
        // Elements currently equipped
        this.elements = [
            ["",0],
            ["",0],
            ["",0]
        ];
        // Permanent Element levels
        this.element_levels = {};
        if (debug_mode) {
            this.element_levels["soldier"]=1;
            this.element_levels["mystic"]=1;
            this.element_levels["guard"]=1;
            this.element_levels["heal"]=1;
            this.element_levels["psi_blast"]=1;
        }
        // Other stuff that is generally more for heroes
        this.class = debug_mode ? "mystic" : "";
        this.battles_in_class = 9999; // Battles since last class change. Starts high to allow immediate change.
        // Things specific to enemies
        if (this.team == "enemy") {
            this.en = params.enemy;
            var ed = enemy_database[this.en];
            this.name = ed.name;
            if ("total_count" in params && params.total_count > 1) {
                this.name += [" A"," B"," C"," D"," E"," F"," G"," H"," I"," J"," K"," L"][params.rank_order-1];
            }
            this.hp = ed.maxhp;
            this.maxhp = ed.maxhp;
            this.mp = ed.maxmp;
            this.maxmp = ed.maxmp;
            this.strength = ed.strength;
            this.stamina = ed.stamina;
            this.agility = ed.agility;
            this.magic = ed.magic;
            this.gold = ed.gold;
            this.exp = ed.exp;
            this.item_reward = ed.item_reward ? ed.item_reward : {};
            this.equipment_reward = ed.equipment_reward ? ed.equipment_reward : [];
            this.element_reward = ed.element_reward ? ed.element_reward : {};
            if (ed.move_speed) {this.move_speed = ed.move_speed;}
            if ("stance_speed" in ed) {this.stance_speed = ed.stance_speed;}
            if (ed.stance_type) {this.stance_type = ed.stance_type;}
        }
        // Texture data
        this.tex = tex;
        this.blocks = blocks;
        if (!("init_direction" in params)) {
            params["init_direction"]="Up";
        }
        this.init_direction = params["init_direction"];
        this.battle_direction = params["init_direction"];
        this.battle_direction_cooldown = 0; // Cooldown time for changing direction
        this.battle_object = new BattleObject(
            {"x":-1,"y":-1,"tex":tex,"blocks":blocks[params["init_direction"]]}
        );
    }
    battle_init(x,y) {
        this.full_charge = 100; // Points for a full charge.
        this.charge = Math.random()*80;
        this.mission = {"command":"","target":null,"range":0,"charge":0,"full_charge":0};
        this.battle_object.move(x,y);
        this.battle_direction = this.init_direction;
        this.battle_direction_cooldown = 1;
    }
    update(delta,result) {
        var single_result = {};
        this.process_status(delta);
        if (!(this.is_alive())) {
            // Will have to think about handling death. For now, moving character off screen.
            this.battle_object.move(-9999,-9999);
            return single_result;
        }
        this.battle_direction_cooldown -= delta;
        if (this.mission.command.length == 0) {
            // At some point, maybe introduce a battle pace variable
            // For now, 10*agility charge points per second.
            this.charge += stats.battle_pace * delta * this.agility_power();
            if (this.charge > this.full_charge) {
                single_result["ready"] = 1;
            }
            else {
                this.process_stance(delta);
            }
        }
        else {
            this.advance_mission(delta,result);
        }
        return single_result;
    }
    // If no mission in progress, update stance.
    process_stance(delta) {
        if (!(this.is_alive())) {
            return false;
        }
        var opponents = this.team == "enemy" ? stats.heroes : stats.enemies;
        var allies = this.team == "enemy" ? stats.enemies : stats.heroes;
        var deltax = 0;
        var deltay = 0;
        for (var i=0; i<opponents.length; i++) {
            var dx = this.battle_object.x - opponents[i].battle_object.x;
            var dy = this.battle_object.y - opponents[i].battle_object.y;
            dx *= {"normal":1.0, "defensive":0.5, "offensive":1.5}[this.stance_type];
            dy *= {"normal":1.0, "defensive":0.5, "offensive":1.5}[this.stance_type];
            var d2 = dx*dx+dy*dy;
            deltax += dx/d2;
            deltay += dy/d2;
        }
        for (var i=0; i<allies.length; i++) {
            if (allies[i] != this) {
                var dx = this.battle_object.x - allies[i].battle_object.x;
                var dy = this.battle_object.y - allies[i].battle_object.y;
                var d2 = dx*dx+dy*dy;
                deltax += dx/d2;
                deltay += dy/d2;
            }
        }
        // The following encourages characters to gravitate toward center
        deltax += (15 - this.battle_object.x)/3;
        deltay += (10 - this.battle_object.y)/3;
        var d = Math.sqrt(deltax*deltax + deltay*deltay);
        deltax = deltax / d * delta * this.stance_speed;
        deltay = deltay / d * delta * this.stance_speed;
        this.attempt_move(this,
            this.battle_object.x + deltax, this.battle_object.y + deltay,
            this.battle_object.x, this.battle_object.y);
        this.update_direction();
    }
    update_direction() {
        var opponents = this.team == "enemy" ? stats.heroes : stats.enemies;
        var allies = this.team == "enemy" ? stats.enemies : stats.heroes;
        var face_x = 0;
        var face_y = 0;
        for (var i=0; i<opponents.length; i++) {
            if (opponents[i].is_alive()) {
                face_x += opponents[i].battle_object.x - this.battle_object.x;
                face_y += opponents[i].battle_object.y - this.battle_object.y;
            }
        }
        if (this.battle_direction_cooldown <= 0) {
            var new_direction = this.battle_direction;
            if (Math.abs(face_x) > Math.abs(face_y)) {
                new_direction = face_x>0 ? "Right":"Left";
                this.set_direction(face_x>0 ? "Right":"Left");
            }
            else {
                new_direction = face_y>0 ? "Up":"Down";
                this.set_direction(face_y>0 ? "Up":"Down");
            }
            if (new_direction != this.battle_direction) {
                this.battle_direction = new_direction;
                this.set_direction(new_direction);
                this.battle_direction_cooldown = 1;
            }
        }
    }
    // Check if moving to the point (x,y) is possible, and if so, do it.
    // chain is the number of steps in the push chain, added to avoid risk of infinite loop.
    attempt_move(c,x,y,x_origin,y_origin,chain=0) {
        // Check if numbers are valid. If we get in here it is a bug.
        if (isNaN(x) || isNaN(y)) {
            return false;
        }
        // Check if overlapping another chatacter
        // As of July 16, 2019, "overlapping" means within distance 1 (circle radius, not square as it was before)
        for (var i=0; i<stats.heroes.length; i++) {
            var bo = stats.heroes[i].battle_object;
            if (c != stats.heroes[i] && Math.pow( Math.pow(x-bo.x,2)+Math.pow(y-bo.y,2) ,0.5)<1 ) {
                stats.heroes[i].push(c,x,y,x_origin,y_origin,chain);
                return false;
            }
        }
        for (var i=0; i<stats.enemies.length; i++) {
            var bo = stats.enemies[i].battle_object;
            if (c != stats.enemies[i] && Math.pow( Math.pow(x-bo.x,2)+Math.pow(y-bo.y,2) ,0.5)<1 ) {
                stats.enemies[i].push(c,x,y,x_origin,y_origin,chain);
                return false;
            }
        }
        // Check if in bounds. For now, assume a 30X20 battle board.
        if (x > 0 && x < 29 && y > 0 && y < 19) {
            this.battle_object.move(x,y);
        }
    }
    // Push from character c at x_origin, y_origin that is trying to move to x_target,y_target
    push(c,x_target,y_target,x_origin,y_origin,chain) {
        if (chain > 3) {
            return false;
        }
        var dx = x_target-x_origin;
        var dy = y_target-y_origin;
        var speed = Math.sqrt(dx*dx+dy*dy);
        dx = this.battle_object.x - x_origin;
        dy = this.battle_object.y - y_origin;
        var dist = Math.sqrt(dx*dx+dy*dy);
        var new_x = this.battle_object.x + dx*speed/dist;
        var new_y = this.battle_object.y + dy*speed/dist;
        this.attempt_move(this,new_x,new_y,
            this.battle_object.x,this.battle_object.y,chain+1);
    }
    advance_mission(delta,result) {
        this.mission.charge -= stats.battle_pace*delta*this.agility_power()/3;
        this.check_cancel();
        this.check_execute(delta);
    }
    set_mission(command, target=null) {
        this.mission.command = command;
        if (["Single","Ally"].indexOf(actions[command].target) >= 0) {
            this.mission.target = target ? target : stats.get_target();
            this.mission.range = actions[command].range(this);
        }
        else if (actions[command].target == "Self") {
            this.mission.target = this;
            this.mission.range = 9999;
        }
        this.mission.charge = actions[command].charge_time;
        this.mission.full_charge = this.mission.charge;
        this.check_execute();
    }
    check_cancel() { // Check to see if the mission needs to be canceled
        // Cancellation might be caused by target being removed from map, or
        // the character being incapacitated in some way.
        if (!(this.is_alive())) {
            this.cancel_mission();
        }
        if (this.mission.target && !(this.mission.target.is_alive())) {
            this.cancel_mission();
        }
    }
    cancel_mission() {
        this.mission.command = "";
        this.charge = 0;
    }
    check_execute(delta) { // Check to see if the current mission can be executed
        if (this.mission.command.length == 0) { // Check if there is actually a mission
            return false;
        }
        if (this.mission.charge > 0) { // Check if charged
            this.update_direction();
            return false;
        }
        if (this.mission.target) { // Check distance to target
            var t = this.mission.target;
            var dx = t.battle_object.x - this.battle_object.x;
            var dy = t.battle_object.y - this.battle_object.y;
            if (this.mission.range*this.mission.range < dx*dx+dy*dy) {
                if (delta) {
                    this.move_to_target(delta);
                }
                return false;
            }
        }
        // To be done: check if there is a range condition and if it is satisfied
        this.execute_mission();
    }
    move_to_target(delta) { // Assume the character is intended to move
        var t = this.mission.target;
        var dx = t.battle_object.x - this.battle_object.x;
        var dy = t.battle_object.y - this.battle_object.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        var nx = this.battle_object.x + 3*this.move_speed*dx/d*delta;
        var ny = this.battle_object.y + 3*this.move_speed*dy/d*delta;
        this.attempt_move(this,nx,ny,this.battle_object.x,this.battle_object.y);
        // Face target
        if (Math.abs(dx) < Math.abs(dy)) {
            this.set_direction(dy>0 ? "Up":"Down");
        }
        else {
            this.set_direction(dx>0 ? "Right":"Left");
        }
    }
    execute_mission() { // Execute the current mission
        var c = this.mission.command;
        this.mission.command = "";
        this.charge = 0;
        actions[c].execute(this, this.mission.target);
    }
    generate_battle_menu() { // Return the main menu for battle.
        var keys = ["attack"];
        var names = ["Attack"];
        var bundles = this.ability_bundles();
        for (var i=0; i<bundles.length; i++) {
            if (bundles[i] in ability_database.ability_bundles) {
                // Check whether there is at least one ability that is listed
                var any_listed = 0;
                for (var j=0; j<ability_database.ability_bundles[bundles[i]].abilities.length; j++) {
                    var ability = ability_database.ability_bundles[bundles[i]].abilities[j];
                    if (ability_database.abilities[ability].is_listed(this)) {
                        any_listed = 1;
                    }
                }
                if (any_listed) {
                    keys = keys.concat(bundles[i]);
                    names = names.concat(ability_database.ability_bundles[bundles[i]].name);
                }
            }
        }
        keys = keys.concat(["item","wait"]);
        names = names.concat(["Item","Wait"])
        return new Menu(keys,names,[window.innerWidth-450,0,window.innerWidth-250,200]);
    }
    do_damage(num) {
        this.hp -= num;
        if (this.hp <= 0) { // :(
            this.hp = 0;
            this.battle_object.unrender();
        }
    }
    is_alive() {
        return (this.hp > 0)
    }
    restore() {
        this.hp = this.hp_power();
        this.mp = this.mp_power();
    }
}

Character.prototype.battle_display = function() {
    this.status_effect_display();
}

Character.prototype.recover = function(num) {
    this.hp = Math.min(this.hp+num, this.hp_power());
}
Character.prototype.recover_mp = function(num) {
    this.mp = Math.min(this.mp+num, this.mp_power());
}
// Make sure HP and MP don't go over the cap
Character.prototype.hpmp_cap = function() {
    this.hp = Math.min(this.hp_power(), this.hp);
    this.mp = Math.min(this.mp_power(), this.mp);
}
// Get the attack power, taking equipment into account
Character.prototype.attack_power = function() {
    var atk = this.strength;
    for (var i=0; i<this.equipment.length; i++) {
        var equip_type = this.equipment[i][0];
        var equip_item = equipment_database[equip_type][this.equipment[i][1]];
        if ("attack" in equip_item) {
            atk += equip_item["attack"];
        }
    }
    var class_modifier = "strength" in class_database[this.class] ? class_database[this.class].strength : 1;
    if ("strength_level" in class_database[this.class] && this.class in this.element_levels) {
        class_modifier += class_database[this.class].strength_level * this.element_levels[this.class];
    }
    atk = atk*class_modifier;
    for (var i=0; i<this.status_effects.length; i++) {
        if (this.status_effects[i].effect == "attack_up") {
            atk += this.status_effects[i].value;
        }
    }
    return parseInt(atk);
}
// Get the defense power, taking equipment into account
Character.prototype.defense_power = function() {
    var def = this.stamina;
    for (var i=0; i<this.equipment.length; i++) {
        var equip_type = this.equipment[i][0];
        var equip_item = equipment_database[equip_type][this.equipment[i][1]];
        if ("defense" in equip_item) {
            def += equip_item["defense"];
        }
    }
    var class_modifier = "stamina" in class_database[this.class] ? class_database[this.class].stamina : 1;
    if ("stamina_level" in class_database[this.class] && this.class in this.element_levels) {
        class_modifier += class_database[this.class].stamina_level * this.element_levels[this.class];
    }
    def = def*class_modifier;
    for (var i=0; i<this.status_effects.length; i++) {
        if (this.status_effects[i].effect == "defense_up") {
            def += this.status_effects[i].value;
        }
    }
    return parseInt(def);
}
// Get agility, taking equipment into account
Character.prototype.agility_power = function() {
    var agi = this.agility;
    for (var i=0; i<this.equipment.length; i++) {
        var equip_type = this.equipment[i][0];
        var equip_item = equipment_database[equip_type][this.equipment[i][1]];
        if ("agility" in equip_item) {
            agi += equip_item["agility"];
        }
    }
    var class_modifier = "agility" in class_database[this.class] ? class_database[this.class].agility : 1;
    if ("agility_level" in class_database[this.class] && this.class in this.element_levels) {
        class_modifier += class_database[this.class].agility_level * this.element_levels[this.class];
    }
    return parseInt(agi * class_modifier);
}
// Get magic, taking equipment into account
Character.prototype.magic_power = function() {
    var mag = this.magic;
    for (var i=0; i<this.equipment.length; i++) {
        var equip_type = this.equipment[i][0];
        var equip_item = equipment_database[equip_type][this.equipment[i][1]];
        if ("magic" in equip_item) {
            mag += equip_item["magic"];
        }
    }
    var class_modifier = "magic" in class_database[this.class] ? class_database[this.class].magic : 1;
    if ("magic_level" in class_database[this.class] && this.class in this.element_levels) {
        class_modifier += class_database[this.class].magic_level * this.element_levels[this.class];
    }
    return parseInt(mag * class_modifier);
}
// Get max HP, taking equipment into account
Character.prototype.hp_power = function() {
    var mhp = this.maxhp;
    for (var i=0; i<this.equipment.length; i++) {
        var equip_type = this.equipment[i][0];
        var equip_item = equipment_database[equip_type][this.equipment[i][1]];
        if ("hp" in equip_item) {
            mhp += equip_item["hp"];
        }
    }
    var class_modifier = "maxhp" in class_database[this.class] ? class_database[this.class].maxhp : 1;
    if ("maxhp_level" in class_database[this.class] && this.class in this.element_levels) {
        class_modifier += class_database[this.class].maxhp_level * this.element_levels[this.class];
    }
    return parseInt(mhp * class_modifier);
}
// Get max MP, taking equipment into account
Character.prototype.mp_power = function() {
    var mmp = this.maxmp;
    for (var i=0; i<this.equipment.length; i++) {
        var equip_type = this.equipment[i][0];
        var equip_item = equipment_database[equip_type][this.equipment[i][1]];
        if ("mp" in equip_item) {
            mmp += equip_item["mp"];
        }
    }
    var class_modifier = "maxmp" in class_database[this.class] ? class_database[this.class].maxmp : 1;
    if ("maxmp_level" in class_database[this.class] && this.class in this.element_levels) {
        class_modifier += class_database[this.class].maxmp_level * this.element_levels[this.class];
    }
    return parseInt(mmp * class_modifier);
}
// Get a string indicating the attack animation
Character.prototype.attack_animation = function() {
    for (var i=0; i < this.equipment.length; i++) {
        if (equipment_database[this.equipment[i][0]][this.equipment[i][1]].animation) {
            var eq = equipment_database[this.equipment[i][0]][this.equipment[i][1]]
            return [eq.animation, eq.icon];
        }
    }
    return ["",0];
}
// Range for regular attacks. Might be used for other moves.
Character.prototype.range = function() {
    for (var i=0; i < this.equipment.length; i++) {
        if (equipment_database[this.equipment[i][0]][this.equipment[i][1]].range) {
            return equipment_database[this.equipment[i][0]][this.equipment[i][1]].range;
        }
    }
    return 1.3; // Default; should be avoided in general.
}
Character.prototype.set_direction = function(new_dir) {
    this.battle_object.set_animation(this.blocks[new_dir]);
}

// Return information about the character's charge state.
// First value is the charge fraction, second is whether they are charging a move.
// Designed for drawing a move progress bar in battle.
Character.prototype.get_charge = function() {
    if (this.mission.command.length) {
        return [1-this.mission.charge/this.mission.full_charge,"mission"];
    }
    else {
        return [this.charge / this.full_charge,"none"];
    }
}

// Get the list of ability bundles the character can use, for menu purposes.
// For now, the same list applies to map and battle; may separate them in the future.
Character.prototype.ability_bundles = function() {
    if ("ability_bundles" in class_database[this.class]) {
        return class_database[this.class].ability_bundles;
    }
    return [];
}

// Add or modify a status effect, typically through the use of an ability
Character.prototype.add_status = function(params) {
    for (var i=0; i<this.status_effects.length; i++) {
        if (this.status_effects[i].effect == params.effect) {
            // Deal with a status effect that already exists
            // Will add more here later
            return;
        }
    }
    this.status_effects = this.status_effects.concat(params);
}

// Process all status effects
Character.prototype.process_status = function(delta) {
    var i=this.status_effects.length;
    while (i--) {
        if ("timeleft" in this.status_effects[i]) {
            this.status_effects[i].timeleft -= delta;
            if (this.status_effects[i].timeleft <= 0) {
                this.status_effects.splice(i,1);
            }
        }
    }
}

Character.prototype.status_effect_display = function() {
    for (var i=0; i<this.status_effects.length; i++) {
        var status_object = new BattleObject(
            {"x":this.battle_object.x+0.7*i-0.35*this.status_effects.length+0.35,
            "y":this.battle_object.y+0.5,
            "tex":status_effect_database[this.status_effects[i].effect].icon[0],
            "blocks":[[
                status_effect_database[this.status_effects[i].effect].icon[1],
                status_effect_database[this.status_effects[i].effect].icon[2]
            ]]}
        );
        status_object.size = [0.7, 0.7];
        status_object.render();
        battle_manager.temporary_objects = battle_manager.temporary_objects.concat(status_object);
    }
}

Character.prototype.process_victory = function() {
    var i=this.status_effects.length;
    while (i--) {
        if ("timeleft" in this.status_effects[i]) {
            this.status_effects.splice(i,1);
        }
    }
    this.battles_in_class += 1;
}

Character.prototype.battles_to_class_change = function() {
    return 25-this.battles_in_class;
}

Character.prototype.change_class = function(new_class) {
    this.class = new_class;
    this.hpmp_cap();
    this.battles_in_class = 0;
}
