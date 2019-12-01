// Actions

// This file encodes information about actions.
// These are for actions as they appear on the menu.
// The logic here may be separate from the actual execution of actions.

class Action {
    constructor(input) {
        // Options for target include
        // "Self": for things like waiting. No target needs to be selected
        // "Single": select a single target
        // "Ally" selects a single target on the same team.
        // "Menu" pulls up another menu
        // Others may be added later, such as x,y location on map, submenus.
        this.target = input.target;
        // The execution function. This occurs immediately after the action is selected.
        // There may be more code separately.
        this.execute = input.execute;
        this.charge_time = 0; // Default charge time. Should not be 0 in general.
        if ("charge_time" in input) {
            this.charge_time = input.charge_time;
        }
        // Construct the Range function
        if ("range" in input) {this.range = input.range}
        else if ("range_const" in input) {
            this.range = (source) => input.range_const;
        }
        else {
            this.range = (source) => 1.5; // Default range
        }
    }
}

// Following are some fairly standard functions for battle actions.
Action.prototype.do_damage = function(target,amount) {
    target.do_damage(amount);
    this.hover_text(target, amount.toString());
}
Action.prototype.recover = function(target,amount) {
    target.recover(amount);
    this.hover_text(target, amount.toString(),"#00FF00");
}
Action.prototype.recover_mp = function(target,amount) {
    target.recover_mp(amount);
    this.hover_text(target, amount.toString(),"#FF00FF");
}
// Have a text string hover over a character
Action.prototype.hover_text = function(target, text, color="#FFFFFF") {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => {
                event.target = target;
                event.objects = [new BattleObject(
                    {"x":target.battle_object.x,"y":target.battle_object.y,
                    "text":text,"color":color}
                )];
                event.objects[0].z = 2; // Keep text above everything else
            },
            "update": (event, delta, state) => {
                if (event.target.is_alive()) {
                    event.objects[0].move(event.target.battle_object.x,
                        event.target.battle_object.y+event.active_age/2,
                        event.objects[0].z);
                    }
                return (event.active_age > 1);
            }
        }
    ));
}
// A general framework for delayed events.
// It is meant to allow interception and other complex functions
Action.prototype.delayed_event = function(input) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => {},
            "update": (event, delta, state) => {
                if (event.active_age > input.delay) {
                    input.event(this, input.target);
                    return 1;
                }
                // Check to see if anyone other than the source or target can intercept
                if (input.intercept) {
                    var dur_frac = event.active_age / input.delay;
                    var x = input.x + dur_frac*(input.target.battle_object.x-input.x);
                    var y = input.y + dur_frac*(input.target.battle_object.y-input.y);
                    var interceptor = 0;
                    for (var i=0; i<stats.heroes.length; i++) {
                        var ix = stats.heroes[i].battle_object.x;
                        var iy = stats.heroes[i].battle_object.y;
                        if (Math.pow( Math.pow(x-ix,2)+Math.pow(y-iy,2) ,0.5) < 1) {
                            if (stats.heroes[i] != input.source && stats.heroes[i] != input.target) {
                                interceptor = stats.heroes[i];
                            }
                        }
                    }
                    for (var i=0; i<stats.enemies.length; i++) {
                        var ix = stats.enemies[i].battle_object.x;
                        var iy = stats.enemies[i].battle_object.y;
                        if (Math.pow( Math.pow(x-ix,2)+Math.pow(y-iy,2) ,0.5) < 1) {
                            if (stats.enemies[i] != input.source && stats.enemies[i] != input.target) {
                                interceptor = stats.enemies[i];
                            }
                        }
                    }
                    // If someone is blocking the path of the move, apply the intended action
                    // on that character and cancel the event.
                    if (interceptor) {
                        input.event(this, interceptor);
                        return 1;
                    }
                }
            }
        }
    ));
}
Action.prototype.delayed_damage = function(target, amount, delay) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => {},
            "update": (event, delta, state) => {
                if (event.active_age > delay) {
                    this.do_damage(target,amount);
                    return 1;
                }
            }
        }
    ));
}
// Expanding animation. For general purposes
Action.prototype.expanding_animation = function(
        target, blocks, init_size, growth_rate, duration, lock_target) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => event.objects = event.objects.concat(
                new BattleObject({"x":target.battle_object.x,"y":target.battle_object.y,
                    "tex":"art/animation.png","blocks":[blocks[0]],"size":[init_size,init_size]})
            ),
            "update": (event, delta, state) => {
                event.objects[0].unrender();
                if (lock_target) {
                    event.objects[0].x = target.battle_object.x;
                    event.objects[0].y = target.battle_object.y;
                }
                event.objects[0].size = [init_size+growth_rate*event.active_age, init_size+growth_rate*event.active_age];
                event.objects[0].render();
                // Default behavior on animations: 0.25 seconds per frame,
                // timing is tied to active time, not total time
                // (i.e. animations only advance during active battle time)
                var block_num = parseInt(event.active_age / 0.25) % (blocks.length);
                event.objects[0].set_animation([blocks[block_num]]);
                if (event.active_age > duration) {
                    return 1;
                }
            }
        }
    ));
}
// Create a battle event for a generic hit. Might generalize it for animation.
Action.prototype.generic_hit = function(source,target) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => event.objects = event.objects.concat(
                new BattleObject({"x":target.battle_object.x,"y":target.battle_object.y,
                    "tex":"art/animation.png","blocks":[[0,7]],"size":[0.2,0.2]})
            ),
            "update": (event, delta, state) => {
                event.objects[0].unrender();
                event.objects[0].size = [0.2+2*event.active_age, 0.2+2*event.active_age];
                event.objects[0].render();
                if (event.active_age > 0.2) {
                    return 1;
                }
            }
        }
    ));
}
// Create a battle event for a knife hit. Might generalize it for animation.
Action.prototype.knife_hit = function(source,target,icon) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            // Assuming the icon sheet is 8X8, 32X32 pixels per icon.
            "setup": (event) => {
                event.source = source;
                event.target = target;
                event.objects = event.objects.concat(
                    new BattleObject({"x":target.battle_object.x,"y":target.battle_object.y,
                    "tex":icon[0],"blocks":[[icon[1]/32,7-icon[2]/32]]})
                )},
            "update": (event, delta, state) => {
                var x = event.target.battle_object.x - event.source.battle_object.x;
                var y = event.target.battle_object.y - event.source.battle_object.y;
                var dist = Math.pow(x*x+y*y, 0.5);
                var angle = Math.PI/2;
                if (x==0 && y < 0) {angle = -Math.PI/2}
                if (x>0) {angle = Math.atan(y/x)}
                if (x<0) {angle = Math.PI + Math.atan(y/x)}
                event.objects[0].map_object.rotation.z = angle - Math.PI/4;
                event.objects[0].move(
                    event.target.battle_object.x - 3*x/dist*Math.abs(event.active_age-0.3),
                    event.target.battle_object.y - 3*y/dist*Math.abs(event.active_age-0.3),
                    event.objects[0].z
                );
                if (event.active_age > 0.6) {
                    return 1;
                }
            }
        }
    ));
}
// Create a battle event for a sword hit. Might generalize it for animation.
Action.prototype.sword_hit = function(source,target,icon) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => {
                event.source = source;
                event.target = target;
                event.objects = event.objects.concat(
                new BattleObject({"x":target.battle_object.x,"y":target.battle_object.y,
                    "tex":icon[0],"blocks":[[icon[1]/32,7-icon[2]/32]]}));
                },
            "update": (event, delta, state) => {
                var x = event.target.battle_object.x - event.source.battle_object.x;
                var y = event.target.battle_object.y - event.source.battle_object.y;
                var dist = Math.pow(x*x+y*y, 0.5);
                var angle = Math.PI/2;
                if (x==0 && y < 0) {angle = -Math.PI/2}
                if (x>0) {angle = Math.atan(y/x)}
                if (x<0) {angle = Math.PI + Math.atan(y/x)}
                angle = angle + 2*(event.active_age-0.4)
                event.objects[0].map_object.rotation.z = angle - Math.PI/4;
                event.objects[0].move(
                    event.target.battle_object.x - 0.3*x/dist,
                    event.target.battle_object.y - 0.3*y/dist,
                    event.objects[0].z
                );
                if (event.active_age > 0.8) {
                    return 1;
                }
            }
        }
    ));
}
// Generic function for flying objects
// Input should contain x, y (starting), target (battle character),
// texture, blocks for display, duration (of projectile flight)
// Include some code to allow the projectile to be intercepted
Action.prototype.projectile = function(input) {
    battle_manager.events = battle_manager.events.concat(new BattleEvent(
        {
            "setup": (event) => {
                event.x = input.x;
                event.y = input.y;
                event.source = input.source;
                event.target = input.target;
                event.duration = input.duration;
                event.linger = "linger" in input ? input.linger : 0;
                event.objects = event.objects.concat(
                new BattleObject({"x":input.x,"y":input.y,
                    "tex":input.tex,"blocks":input.blocks}));
                },
            "update": (event, delta, state) => {
                var dur_frac = Math.min(1,event.active_age / event.duration);
                var x = event.x + dur_frac*(event.target.battle_object.x - event.x);
                var y = event.y + dur_frac*(event.target.battle_object.y - event.y);
                event.objects[0].move(x,y,event.objects[0].z);
                if (input.intercept && event.active_age < event.duration) {
                    var interceptor = 0;
                    for (var i=0; i<stats.heroes.length; i++) {
                        var ix = stats.heroes[i].battle_object.x;
                        var iy = stats.heroes[i].battle_object.y;
                        if (Math.pow( Math.pow(x-ix,2)+Math.pow(y-iy,2) ,0.5) < 1) {
                            if (stats.heroes[i] != event.source && stats.heroes[i] != event.target) {
                                interceptor = stats.heroes[i];
                            }
                        }
                    }
                    for (var i=0; i<stats.enemies.length; i++) {
                        var ix = stats.enemies[i].battle_object.x;
                        var iy = stats.enemies[i].battle_object.y;
                        if (Math.pow( Math.pow(x-ix,2)+Math.pow(y-iy,2) ,0.5) < 1) {
                            if (stats.enemies[i] != event.source && stats.enemies[i] != event.target) {
                                interceptor = stats.enemies[i];
                            }
                        }
                    }
                    // If someone is blocking the path of the move, apply the intended action
                    // on that character and cancel the event.
                    if (interceptor) {
                        event.active_age = event.duration;
                        event.target = interceptor;
                    }
                }
                if (event.active_age > event.duration + event.linger) {
                    return 1;
                }
            }
        }
    ));
}

Action.prototype.generic_attack = function(source, target) {
    var atk = source.attack_power();
    var def = target.defense_power();
    var damage = Math.max(0, 2*atk-def);
    var aa = source.attack_animation();
    if (aa[0] == "knife") {
        this.knife_hit(source,target,aa[1]);
        this.delayed_damage(target, damage, 0.6);
    }
    else if (aa[0] == "sword") {
        this.sword_hit(source,target,aa[1]);
        this.delayed_damage(target, damage, 0.8);
    }
    else {
        this.generic_hit(source,target);
        this.delayed_damage(target, damage, 0.25);
    }
}

actions = {};
actions["attack"] = new Action({"target":"Single","charge_time":10,"execute":function (source, target) {
    this.generic_attack(source,target);
},
    "range": (source) => source.range()
});
actions["wait"] = new Action({"target":"Self","charge_time":0,"execute":function(source, target) {
    source.charge = -1;
}});
actions["item"] = new Action({"target":"Menu","charge_time":0,"execute":function(source, target) {
    var display_choices = [];
    var menu_choices = [];
    var quantities = [];
    var colors = [];
    for (var i=0; i<stats.items.length; i++) {
        menu_choices = menu_choices.concat("item_"+stats.items[i][0]);
        display_choices = display_choices.concat(item_database.items[stats.items[i][0]].name);
        quantities = quantities.concat(stats.items[i][1].toString());
        colors = colors.concat("item_"+stats.items[i][0] in actions ? "#FFFFFF" : "#777777");
    }
    var item_menu = new Menu(menu_choices, display_choices,
               [window.innerWidth-500, window.innerHeight-300, window.innerWidth-250, window.innerHeight],
               quantities,{"color":colors});
    item_menu.set_icon_func((key)=>{
        return item_database.items[key.slice(5)].icon;
    });
    return item_menu;
}});
actions["item_potion"] = new Action({"target":"Ally","charge_time":20,"range_const":5,"execute":function (source, target) {
    if (!(stats.has_item("potion"))) {return;}
    stats.deplete_item("potion");
    var duration = 0.1*Math.pow( Math.pow(source.battle_object.x-target.battle_object.x,2)+Math.pow(source.battle_object.y-target.battle_object.y,2) ,0.5);
    this.delayed_event({"source":source,"target":target,"delay":duration,"intercept":1,
        "x":source.battle_object.x, "y":source.battle_object.y,
        "event":(action,alt_target)=>{
            if (alt_target.is_alive()) {
                action.recover(alt_target,5);
            }
        }
    });
    this.projectile({source:source,x:source.battle_object.x, y:source.battle_object.y,intercept:1,
        target:target, duration:duration, tex:"art/animation.png",blocks:[[5,7]], linger:0.5});
}});
actions["item_tonic"] = new Action({"target":"Ally","charge_time":20,"range_const":5,"execute":function (source, target) {
    if (!(stats.has_item("tonic"))) {return;}
    stats.deplete_item("tonic");
    var duration = 0.1*Math.pow( Math.pow(source.battle_object.x-target.battle_object.x,2)+Math.pow(source.battle_object.y-target.battle_object.y,2) ,0.5);
    this.delayed_event({"source":source,"target":target,"delay":duration,"intercept":1,
        "x":source.battle_object.x, "y":source.battle_object.y,
        "event":(action,alt_target)=>{
            if (alt_target.is_alive()) {
                action.recover(alt_target,15);
            }
        }
    });
    this.projectile({source:source,x:source.battle_object.x, y:source.battle_object.y,intercept:1,
        target:target, duration:duration, tex:"art/animation.png",blocks:[[6,3]], linger:0.5});
}});
actions["item_candy"] = new Action({"target":"Ally","charge_time":20,"range_const":5,"execute":function (source, target) {
    if (!(stats.has_item("candy"))) {return;}
    stats.deplete_item("candy");
    var duration = 0.1*Math.pow( Math.pow(source.battle_object.x-target.battle_object.x,2)+Math.pow(source.battle_object.y-target.battle_object.y,2) ,0.5);
    this.delayed_event({"source":source,"target":target,"delay":duration,"intercept":1,
        "x":source.battle_object.x, "y":source.battle_object.y,
        "event":(action,alt_target)=>{
            if (alt_target.is_alive()) {
                action.recover_mp(alt_target,5);
            }
        }
    });
    this.projectile({source:source,x:source.battle_object.x, y:source.battle_object.y,intercept:1,
        target:target, duration:duration, tex:"art/animation.png",blocks:[[6,7]], linger:0.5});
}});
