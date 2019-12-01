// Abilities
// This document defines abilities for use on the map and ability bundles.
// For definitions of abilities in battle, see actions.js or derivative files.

// All data about abilities bundled into this object.
ability_database = {
    "ability_bundles":{
        "fight":{
            "name":"Fight",
            "abilities":["quickhit"]
        },
        "training":{
            "name":"Training",
            "abilities":["guard"]
        },
        "mysticism":{
            "name":"Mysticism",
            "abilities":["heal","psi_blast","powerup"]
        }
    },
    // Data about abilities that are common to their map and battle forms
    // mpcost is used to determine if the ability can be used. Can leave out or
    // set to 0 if no MP cost. The mpcost variable does not cause MP to be
    // deducted when the ability is used.
    "abilities":{
        "quickhit":{
            "name":"Quick Hit",
            "mpcost":1,
            "icon":["art/animation.png",224,32,32,32],
            "desc":"Perform a regular attack quickly."
        },
        "guard":{
            "name":"Guard",
            "icon":["art/animation.png",64,64,32,32],
            "desc":"Raise Defense briefly."
        },
        "heal":{
            "name":"Heal",
            "mpcost":3,
            "icon":["art/animation.png",32,64,32,32],
            "desc":"Recover some HP.",
            "val":(source, target) => {
                var spell_level = (source.element_levels.heal) ? source.element_levels.heal : 1;
                spell_level = 0.8+(spell_level)*0.2 // Multiplier from base of level 1.
                return Math.floor(2*spell_level*source.magic_power());
            }
        },
        "psi_blast":{
            "name":"PSI Blast",
            "mpcost":2,
            "icon":["art/animation.png",0,96,32,32],
            "desc":"Small amount of damage.",
            "val":(source, target) => {
                var spell_level = (source.element_levels.psi_blast) ? source.element_levels.psi_blast : 1;
                spell_level = 0.8+(spell_level)*0.2 // Multiplier from base of level 1.
                return Math.floor(2*spell_level*source.magic_power() - target.magic_power());
            }
        },
        "powerup":{
            "name":"Power Up",
            "mpcost":2,
            "icon":["art/animation.png",0,64,32,32],
            "desc":"Raise Attack briefly."
        }
    },
    // Data about abilities specific to map
    // Target can be 'Single' or 'None'.
    "map_abilities":{
        "heal":{
            "target":"Single",
            "effect":(source, target) => {
                var hp_recovery = ability_database.abilities.heal.val(stats.heroes[source],stats.heroes[target]);
                // Make sure the target can receive the spell.
                if (stats.heroes[target].hp>0 && stats.heroes[target].hp<stats.heroes[target].hp_power()) {
                    stats.heroes[source].mp -= ability_database.abilities.heal.mpcost;
                    stats.heroes[target].recover(hp_recovery);
                    menu_manager.text_animation({"character":target, "text":`${hp_recovery}`, "color":"rgba(0,255,0,1.0)"});
                }
                else {
                    menu_manager.text_animation({"character":target, "text":`No Effect`, "color":"rgba(166,166,166,1.0)"});
                }
                return "";
            }
        }
    },
    // Data about abilities specific to battle
    "battle_abilities":{
        "quickhit":{
            "action":new Action({"target":"Single","charge_time":5,"range": (source) => source.range(),"execute":function(source, target) {
                if (source.mp < ability_database.abilities.quickhit.mpcost) {
                    Action.prototype.hover_text(source,"No MP");
                    return;
                }
                source.mp -= ability_database.abilities.quickhit.mpcost;
                Action.prototype.generic_attack(source,target);
                source.charge = source.full_charge * (0.20+source.element_levels.quickhit?(source.element_levels.quickhit*0.05):0.05);
            }})
        },
        "guard":{
            "action":new Action({"target":"Self","charge_time":5,"execute":function(source, target) {
                var level = source.element_levels.guard ? source.element_levels.guard : 1;
                var value = Math.floor(level + (source.stamina/4));
                source.add_status({"effect":"defense_up","value":value,"timeleft":14+level});
                Action.prototype.hover_text(source,`Def+${value}`);
            }})
        },
        "heal":{
            "action":new Action({"target":"Ally","charge_time":20,range_const:5,"execute":function(source, target) {
                // Spell casting animation
                if (source.mp < ability_database.abilities.heal.mpcost) {
                    Action.prototype.hover_text(source,"No MP");
                    return;
                }
                source.mp -= ability_database.abilities.heal.mpcost;
                var hp_recovery = ability_database.abilities.heal.val(source,target);
                Action.prototype.expanding_animation(source, [[3,5]], 1., 0.3, 1, true);
                this.delayed_event({"source":source,"target":target,"delay":1,
                    "event":(action,alt_target)=> {
                        Action.prototype.expanding_animation(alt_target, [[4,5],[5,5]], 1., 0., 1, true);
                    }
                });
                this.delayed_event({"source":source,"target":target,"delay":1.5,
                    "event":(action,alt_target)=>{
                        if (alt_target.is_alive()) {
                            action.recover(alt_target,hp_recovery);
                        }
                    }
                });
            }})
        },
        "psi_blast":{
            "action":new Action({"target":"Single","charge_time":20,range_const:5,"execute":function(source, target) {
                // Spell casting animation
                if (source.mp < ability_database.abilities.psi_blast.mpcost) {
                    Action.prototype.hover_text(source,"No MP");
                    return;
                }
                source.mp -= ability_database.abilities.psi_blast.mpcost;
                var damage = ability_database.abilities.psi_blast.val(source,target);
                Action.prototype.expanding_animation(source, [[3,5]], 1., 0.3, 1, true);
                this.delayed_event({"source":source,"target":target,"delay":1,
                    "event":(action,alt_target)=> {
                        Action.prototype.expanding_animation(alt_target, [[0,7]], 0.3, 2., 0.5, true);
                    }
                });
                this.delayed_event({"source":source,"target":target,"delay":1.5,
                    "event":(action,alt_target)=>action.do_damage(alt_target,damage) });
            }})
        },
        "powerup":{
            "action":new Action({"target":"Ally","charge_time":20,range_const:5,"execute":function(source, target) {
                if (source.mp < ability_database.abilities.powerup.mpcost) {
                    Action.prototype.hover_text(source,"No MP");
                    return;
                }
                source.mp -= ability_database.abilities.powerup.mpcost;
                Action.prototype.expanding_animation(source, [[3,5]], 1., 0.3, 1, true);
                this.delayed_event({"source":source,"target":target,"delay":1.0,
                    "event":(action,alt_target)=>{
                        var level = source.element_levels.powerup ? source.element_levels.powerup : 1;
                        var value = Math.floor(level + (source.magic/4));
                        alt_target.add_status({"effect":"attack_up","value":value,"timeleft":14+level});
                        action.hover_text(alt_target,`Atk+${value}`);
                    }
                });
            }})
        }
    }
}

// Translate the abilities into actions for the action database
// This requires that this file is loaded after actions.js

battle_bundle_execute_generator = function(bundle) {
    return (source, target) => {
        var display_choices = [];
        var menu_choices = [];
        var right_choices = [];
        var colors = [];
        for (var i=0; i<ability_database.ability_bundles[bundle].abilities.length; i++) {
            var menu_choice = ability_database.ability_bundles[bundle].abilities[i];
            if (ability_database.abilities[menu_choice].is_listed(source)) {
                var can_use = ability_database.abilities[menu_choice].can_use(source) && (menu_choice in ability_database.battle_abilities);
                menu_choices = menu_choices.concat(
                    can_use ? menu_choice : menu_choice+"!"
                );
                display_choices = display_choices.concat(ability_database.abilities[menu_choice].name);
                right_choices = right_choices.concat(
                    "mpcost" in ability_database.abilities[menu_choice] ?
                    ability_database.abilities[menu_choice].mpcost : ""
                );
                colors = colors.concat(
                    can_use ? "#FFFFFF" : "#777777"
                );
            }
        }
        var ability_menu = new Menu(menu_choices, display_choices,
                   [window.innerWidth-500, window.innerHeight-300, window.innerWidth-250, window.innerHeight],
                   right_choices,{"color":colors});
        ability_menu.set_icon_func((key)=>{
            var ability_key = key.split('!')[0];
            return ability_database.abilities[ability_key].icon;
        });
        return ability_menu;
    }
}

for (var bundle in ability_database.ability_bundles) {
    actions[bundle] = new Action({"target":"Menu","charge_time":0,
        "execute":battle_bundle_execute_generator(bundle)
    });
}

ability_listed = function(action) {
    // List an ability if the character has a level for the corresponding element.
    // If there is no corresponding element, then it should always be listed.
    // This is default behavior and may be modified or overwritten
    if (action in element_database) {
        return (character) => {
            return character.element_levels[action];
        }
    }
    else {
        return (character) => {
            return 1;
        }
    }
}

can_use = function(action) {
    // Whether an ability can be used. Different from whether it is listed.
    // For now, only perform an MP check.
    // This is default behavior and may be overwritten.
    if ("mpcost" in ability_database.abilities[action]) {
        return (character) => {
            return character.mp >= ability_database.abilities[action].mpcost;
        }
    }
    else {
        return (character) => {
            return true;
        }
    }
}

for (var action in ability_database.abilities) {
    // For now, population with standard functions whether battle abilities are listed
    // Whether it is listed is separate from whether it can be used
    ability_database.abilities[action].is_listed = ability_listed(action);
    // Whether it can be used
    ability_database.abilities[action].can_use = can_use(action);
}

for (var action in ability_database.battle_abilities) {
    actions[action] = ability_database.battle_abilities[action]["action"];
}
