// Code for processing all shopping cut scenes
// Includes Inns, Item Shops, Equipment Shops, Element Shops.

// Cut scene for an Inn
class CutSceneInn extends CutScene {
    constructor(input) {
        super(input);
    }
}
CutSceneInn.prototype.initialize = function() {
    this.rect = new Rectangle(window.innerWidth-200,0,window.innerWidth, 200);
    this.yn_menu = new Menu(["Yes","No"],["Yes","No"],[window.innerWidth-340,0,window.innerWidth-200, 120]);
    this.yn_menu.set_offset(0,-200);
    menu_manager.main_stats.offset = [-250,0];
    this.rect.offset = [0,-200];
    // State is 0 (still on the menu select) or 1 (on the result page)
    this.state = 0;
    this.result_message = `Welcome traveler. Rest for ${this.data.cost} gold?`;
    this.fadetime = 0;
    this.scroll_frac_time = 0;
    this.old_message = "";
    // Gold box
    this.gold_box = new Rectangle(window.innerWidth-540,0,window.innerWidth-340,100);
    this.gold_box.reveal(0,-200);
}
CutSceneInn.prototype.exit = function() {
    cut_scenes.hide_window(this.gold_box);
    menu_manager.main_stats.target_offset = [-250,0];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>menu_manager.main_stats.display(hud_manager.hudBitmap),
        ()=>menu_manager.main_stats.target_offset[0] == menu_manager.main_stats.offset[0],
        ()=>menu_manager.main_stats.target_offset = [0,0]
    ]]);
    this.rect.target_offset = [0,-200];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>this.rect.display(hud_manager.hudBitmap),
        ()=>this.rect.target_offset[1] == this.rect.offset[1],
        ()=>this.rect.target_offset = [0,0]
    ]]);
    return {"done":1}
}
CutSceneInn.prototype.update = function(delta) {
    this.fadetime = Math.max(this.fadetime-delta, 0);
    this.scroll_frac_time = Math.max(0,this.scroll_frac_time-2*delta);
    if (this.fadetime <= 0) {
        if (this.state == 2) {
            this.state = 3;
            this.result_message = "Farewell traveler.";
            this.fadetime = 1;
        }
        else if (this.state == 3) {
            this.state = 4;
        }
    }
}
CutSceneInn.prototype.process_key = function(key) {
    this.yn_menu.scroll(key);
    if (['ArrowUp','ArrowDown','RepeatLeft','RepeatRight','RepeatUp','RepeatDown'].indexOf(key)>=0) {
        return {};
    }
    if (this.state==4) {
        return this.exit();
    }
    else {
        if ((key != 'ArrowUp' || key != 'ArrowDown') && this.state == 0) {
            this.old_message = this.result_message;
            this.scroll_frac_time = 1;
            this.yn_menu.rect.target_offset = [0,-200];
            cut_scenes.animations = cut_scenes.animations.concat([[
                ()=>this.yn_menu.rect.display(hud_manager.hudBitmap),
                ()=>this.yn_menu.rect.target_offset[1] == this.yn_menu.rect.offset[1],
                ()=>this.yn_menu.rect.target_offset = [0,0]
            ]]);
            if (this.yn_menu.get_choice() == "No" || ['ArrowRight','Enter'].indexOf(key)<0) {
                this.state = 4;
                this.result_message = "OK. Good luck on your travels.";
            }
            else {
                if (stats.gold >= this.data.cost) {
                    this.state = 1;
                    this.result_message = "Enjoy your stay!";
                    stats.gold -= this.data.cost;
                    stats.restore();
                }
                else {
                    this.state = 4;
                    this.result_message = "Sorry friend, you do not have enough money.";
                }
            }
        }
        else if (this.state == 1) {
            this.state = 2;
            this.fadetime = 1;
        }
    }
    return {};
}
CutSceneInn.prototype.display = function(hud_bmp) {
    menu_manager.main_stats.display(hud_bmp);
    this.gold_box.display(hud_bmp);
    this.gold_box.draw_text(hud_bmp,`Gold: ${stats.gold}`);
    this.rect.display(hud_bmp);
    this.rect.start_clip(hud_bmp);
    if (this.scroll_frac_time > 0) {
        var pixel_offset = (this.rect.t-this.rect.b) * this.scroll_frac_time;
        this.rect.draw_text(hud_bmp,this.result_message,10,30+pixel_offset);
        this.rect.draw_text(hud_bmp,this.old_message,10,30+pixel_offset-this.rect.t+this.rect.b);
    }
    else {
        this.rect.draw_text(hud_bmp, this.result_message);
    }
    this.rect.end_clip(hud_bmp);
    if (this.state == 0) {this.yn_menu.render(hud_bmp);}
    if (this.state == 2 || this.state == 3) {
        var alpha = this.state == 2 ? 1-this.fadetime : this.fadetime;
        hud_bmp.fillStyle = "rgba(0,0,0,"+alpha.toString()+")";
        hud_bmp.fillRect(0,0, window.innerWidth, window.innerHeight);
        hud_bmp.fillStyle = "rgba(255,255,255,1.0)";
    }
}

//////////////////////////////////////////////////////// Cut scene for item shop

class CutSceneItem extends CutScene {
    constructor(input) {
        super(input);
    }
}
CutSceneItem.prototype.initialize = function(hud_bmp) {
    menu_manager.main_stats.offset = [-250,0];
    this.menu_state = ""; // Options are "", "Buy", "Sell".
    this.main_menu = new Menu(["Buy","Sell","Leave"],["Buy","Sell","Leave"],[window.innerWidth-500,0,window.innerWidth-350, 140]);
    this.main_menu.reveal(0,-350);
    // Generate the menu for buying items
    var display_choices = [];
    var right_choices = [];
    for (var i=0; i<this.data.items.length; i++) {
        display_choices = display_choices.concat(item_database.items[this.data.items[i]].name);
        right_choices = right_choices.concat(item_database.items[this.data.items[i]].cost + " G");
    }
    this.buy_item_menu = new Menu(this.data.items, display_choices,[window.window.innerWidth-350,0,window.innerWidth, 400],right_choices);
    this.buy_item_menu.set_icon_func((key)=>{
        return item_database.items[key].icon;
    });
    this.buy_item_menu.reveal(350,0);
    // Generate the menu for selling items
    var menu_choices = stats.items.map((x)=>x[0]);
    var display_choices = stats.items.map( (x)=>`${item_database.items[x[0]].name}` );
    var right_choices = stats.items.map( (x)=>Math.floor(item_database.items[x[0]].cost/2) + " G" );
    this.sell_item_menu = new Menu(menu_choices, display_choices, [window.window.innerWidth-350,0,window.innerWidth, 400], right_choices);
    this.sell_item_menu.set_icon_func((key)=>{
        return item_database.items[key].icon;
    });
    this.sell_item_menu.rect.hide_offset = [350,0]; // Because we don't slide it in.
    // Description box for the item
    this.desc_box = new Rectangle(window.window.innerWidth-350,400,window.innerWidth, window.innerHeight);
    // Gold box
    this.gold_box = new Rectangle(window.innerWidth-700,0,window.innerWidth-500,100);
    this.gold_box.reveal(0,-200);
}
CutSceneItem.prototype.exit = function() {
    cut_scenes.hide_main_stats();
    cut_scenes.hide_menu(this.main_menu);
    cut_scenes.hide_menu(this.buy_item_menu);
    cut_scenes.hide_window(this.gold_box);
    return {"done":1}
}
CutSceneItem.prototype.process_key = function(key) {
    if (this.menu_state=="") {this.main_menu.scroll(key);}
    if (this.menu_state=="Buy") {this.buy_item_menu.scroll(key);}
    if (this.menu_state=="Sell") {this.sell_item_menu.scroll(key);}
    if (['RepeatLeft','RepeatRight','RepeatUp','RepeatDown'].indexOf(key)>=0) {
        return {};
    }
    if (["ArrowRight","Enter","ArrowUp","ArrowDown"," "].indexOf(key)<0) {
        if (this.menu_state == "") {return this.exit()}
        this.menu_state = "";
        cut_scenes.hide_window(this.desc_box);
        return {};
    }
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        // Buy an item
        if (this.menu_state == "") {
            this.menu_state = this.main_menu.get_choice();
            if (this.menu_state != "Leave") {
                this.desc_box.reveal(0,window.innerHeight-400);
            }
            return this.menu_state == "Leave" ? this.exit() : {};
        }
        if (this.menu_state == "Buy") {
            var item = this.buy_item_menu.get_choice();
            if (stats.gold >= item_database.items[item].cost) {
                stats.grant_items(item,1);
                stats.gold -= item_database.items[item].cost;
            }
        }
        if (this.menu_state == "Sell") {
            // Sell an item
            var item = this.sell_item_menu.get_choice();
            stats.deplete_item(item);
            stats.gold += Math.floor(item_database.items[item].cost/2);
        }
        // Refresh the sell item menu
        var menu_choices = stats.items.map((x)=>x[0]);
        var display_choices = stats.items.map( (x)=>`${item_database.items[x[0]].name}` );
        var right_choices = stats.items.map( (x)=>Math.floor(item_database.items[x[0]].cost/2) + " G");
        this.sell_item_menu.regenerate_choices(menu_choices, display_choices, right_choices);
    }
    return {};
}
CutSceneItem.prototype.display = function(hud_bmp) {
    menu_manager.main_stats.display(hud_bmp);
    this.gold_box.display(hud_bmp);
    this.gold_box.draw_text(hud_bmp,`Gold: ${stats.gold}`);
    if (this.menu_state != "") {
        this.desc_box.display(hud_bmp);
        var item = this.main_menu.get_choice() == "Buy" ? this.buy_item_menu.get_choice() : this.sell_item_menu.get_choice();
        if (item) {
            var count = stats.get_item_count(item);
            this.desc_box.draw_lines(hud_bmp,[`You have ${count}.`,"",item_database.items[item].desc]);
        }
    }
    if (this.main_menu.get_choice()=="Buy" || this.main_menu.get_choice()=="Leave") {
        this.buy_item_menu.render(hud_bmp,this.menu_state=="Buy",this.menu_state=="Buy");
    }
    if (this.main_menu.get_choice()=="Sell") {
        this.sell_item_menu.render(hud_bmp,this.menu_state=="Sell",this.menu_state=="Sell");
    }
    this.main_menu.render(hud_bmp,this.menu_state=="",this.menu_state=="");
}

/////////////////////////////////////////////////////// Cut scene for equipment shop

class CutSceneEquip extends CutScene {
    constructor(input) {
        super(input);
    }
}
CutSceneEquip.prototype.initialize = function(hud_bmp) {
    menu_manager.main_stats.offset = [-250,0];
    this.menu_state = ""; // Options are "", "Buy", "Sell".
    this.main_menu = new Menu(["Buy","Sell","Leave"],["Buy","Sell","Leave"],[window.innerWidth-500,0,window.innerWidth-350, 140]);
    this.main_menu.reveal(0,-350);
    // Generate the menu for buying items
    var display_choices = this.data.items.map( (x) => equipment_database[x[0]][x[1]]["name"] );
    var right_choices = this.data.items.map( (x) => equipment_database[x[0]][x[1]]["cost"] + " G" );
    this.buy_item_menu = new Menu(this.data.items, display_choices,[window.innerWidth-350,0,window.innerWidth, 300],right_choices);
    this.buy_item_menu.set_icon_func((key)=> {
        return equipment_database[key[0]][key[1]].icon;
    });
    this.buy_item_menu.reveal(350,0);
    // Generate the menu for selling items
    var menu_choices = stats.equipment.map((x)=>[x[0],x[1]]);
    var display_choices = stats.equipment.map( (x)=>`${equipment_database[x[0]][x[1]].name}` );
    var right_choices = stats.equipment.map( (x)=>Math.floor(equipment_database[x[0]][x[1]]["cost"]/2) + " G" );
    this.sell_item_menu = new Menu(menu_choices, display_choices, [window.innerWidth-350,0,window.innerWidth, 300], right_choices);
    this.sell_item_menu.set_icon_func((key)=> {
        return equipment_database[key[0]][key[1]].icon;
    });
    this.sell_item_menu.rect.hide_offset = [350,0]; // Because we don't slide it in.
    // Description box.
    this.desc_box = new Rectangle(window.window.innerWidth-350,300,window.innerWidth, window.innerHeight);
    this.mod_box = new Rectangle(0,0,300,window.innerHeight); // How equipment affects a character
    // Gold box
    this.gold_box = new Rectangle(window.innerWidth-700,0,window.innerWidth-500,100);
    this.gold_box.reveal(0,-200);
}
CutSceneEquip.prototype.exit = function() {
    cut_scenes.hide_window(this.gold_box);
    menu_manager.main_stats.target_offset = [-250,0];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>menu_manager.main_stats.display(hud_manager.hudBitmap),
        ()=>menu_manager.main_stats.target_offset[0] == menu_manager.main_stats.offset[0],
        ()=>menu_manager.main_stats.target_offset = [0,0]
    ]]);
    this.main_menu.rect.target_offset = [0,-200];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>this.main_menu.rect.display(hud_manager.hudBitmap),
        ()=>this.main_menu.rect.target_offset[1] == this.main_menu.rect.offset[1],
        ()=>this.main_menu.rect.target_offset = [0,0]
    ]]);
    // The second menu that will scroll off screen in this animation
    var second_menu = this.main_menu.get_choice() == "Sell" ? this.sell_item_menu : this.buy_item_menu;
    second_menu.rect.target_offset = [350,0];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>second_menu.rect.display(hud_manager.hudBitmap),
        ()=>second_menu.rect.target_offset[0] == second_menu.rect.offset[0],
        ()=>second_menu.rect.target_offset = [0,0]
    ]]);
    return {"done":1}
}
CutSceneEquip.prototype.process_key = function(key) {
    if (this.menu_state=="") {this.main_menu.scroll(key);}
    if (this.menu_state=="Buy") {this.buy_item_menu.scroll(key);}
    if (this.menu_state=="Sell") {this.sell_item_menu.scroll(key);}
    if (['RepeatLeft','RepeatRight','RepeatUp','RepeatDown'].indexOf(key)>=0) {
        return {};
    }
    if (["ArrowRight","Enter","ArrowUp","ArrowDown"," "].indexOf(key)<0) {
        if (this.menu_state == "") {return this.exit()}
        cut_scenes.hide_window(this.desc_box);
        cut_scenes.hide_window(this.mod_box);
        menu_manager.main_stats.offset = [-250,0];
        this.menu_state = "";
        return {};
    }
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        // Buy an item
        if (this.menu_state == "") {
            this.menu_state = this.main_menu.get_choice();
            if (this.menu_state == "Leave") {return this.exit()}
            this.desc_box.reveal(0,window.innerHeight-300);
            this.mod_box.reveal(-300,0);
            cut_scenes.hide_main_stats();
        }
        else if (this.menu_state == "Buy") {
            var item = this.buy_item_menu.get_choice();
            var cost = equipment_database[item[0]][item[1]]["cost"];
            if (stats.gold >= cost) {
                stats.add_equipment(item[0],item[1]);
                stats.gold -= cost;
            }
        }
        else if (this.menu_state == "Sell") {
            // Sell an item
            var item = this.sell_item_menu.get_choice();
            if (item) {
                stats.remove_equipment(item[0],item[1]);
                stats.gold += Math.floor(equipment_database[item[0]][item[1]]["cost"]/2);
            }
        }
        // Refresh the sell item menu
        var menu_choices = stats.equipment.map((x)=>[x[0],x[1]]);
        var display_choices = stats.equipment.map( (x)=>`${equipment_database[x[0]][x[1]].name}` );
        var right_choices = stats.equipment.map( (x)=>Math.floor(equipment_database[x[0]][x[1]]["cost"]/2) + " G" );
        this.sell_item_menu.regenerate_choices(menu_choices, display_choices, right_choices);
    }
    return {};
}
CutSceneEquip.prototype.display = function(hud_bmp) {
    if (this.menu_state == "") {
        menu_manager.main_stats.display(hud_bmp);
    }
    this.gold_box.display(hud_bmp);
    this.gold_box.draw_text(hud_bmp,`Gold: ${stats.gold}`);
    if (this.menu_state != "") {
        this.desc_box.display(hud_bmp);
        var item = this.menu_state == "Sell" ? this.sell_item_menu.get_choice() : this.buy_item_menu.get_choice();
        if (item) {
            var lines = [`You have ${stats.get_equipment_count(item[0],item[1])}.`,""];
            for (var i=0; i<equipment_database.attributes.length; i++) {
                if (equipment_database.attributes[i][0] in equipment_database[item[0]][item[1]]) {
                    lines = lines.concat(`${equipment_database.attributes[i][1]}: ${equipment_database[item[0]][item[1]][equipment_database.attributes[i][0]]}`);
                }
            }
            lines = lines.concat("");
            lines = lines.concat(equipment_database[item[0]][item[1]].desc);
            this.desc_box.draw_lines(hud_bmp,lines);
        }

        this.mod_box.display(hud_bmp);
        var lines = [`Gold: ${stats.gold}`,""];
        var right_lines = ["",""];
        var colors = ["rgba(255,255,255,1.0)","rgba(255,255,255,1.0)"];
        for (var i=0; i<stats.heroes.length; i++) {
            lines = lines.concat(stats.heroes[i].name);
            right_lines = right_lines.concat("");
            colors = colors.concat("rgba(255,255,255,1.0)");

            if (item) {
                var e = stats.heroes[i].equipment;
                var slot = -1;
                // The following assumes that there is only one equipment slot for each type of equipment
                // If/when that changes, this will only compare to the last slot of a given type.
                for (var j=0; j<e.length; j++) {
                    if (e[j][0] == item[0]) {slot = j;}
                }
                if (slot >= 0) {
                    for (var j=0; j<equipment_database.attributes.length; j++) {
                        var at = equipment_database.attributes[j][0];
                        if (at in equipment_database[item[0]][e[slot][1]] || at in equipment_database[item[0]][item[1]]) {
                            var new_val = at in equipment_database[item[0]][item[1]] ? equipment_database[item[0]][item[1]][at] : 0;
                            var cur_val = at in equipment_database[item[0]][e[slot][1]] ? equipment_database[item[0]][e[slot][1]][at] : 0;
                            var sign = "";
                            if (new_val > cur_val) {sign = "+"}
                            if (new_val < cur_val) {sign = "-"}
                            lines = lines.concat(`${equipment_database.attributes[j][1]}`);
                            right_lines = right_lines.concat(`${sign}${+(Math.abs(new_val-cur_val)).toFixed(1)}`);
                            colors = colors.concat({"":"rgba(160,160,160,1.0)","+":"rgba(0,255,0,1.0)","-":"rgba(255,0,0,1.0)"}[sign]);
                        }
                    }
                }
            }
            lines = lines.concat("");
            right_lines = right_lines.concat("");
            colors = colors.concat("rgba(255,255,255,1.0)");
        }
        this.mod_box.draw_lines(hud_bmp,lines);
        this.mod_box.draw_lines(hud_bmp, right_lines, 10,30,params={"right":1,"colors":colors});
    }
    if (this.main_menu.get_choice()=="Buy" || this.main_menu.get_choice()=="Leave") {
        this.buy_item_menu.render(hud_bmp,this.menu_state=="Buy",this.menu_state=="Buy");
    }
    if (this.main_menu.get_choice()=="Sell") {
        this.sell_item_menu.render(hud_bmp,this.menu_state=="Sell",this.menu_state=="Sell");
    }
    this.main_menu.render(hud_bmp,this.menu_state=="",this.menu_state=="");
}

/////////////////////////////////////////////////// Cut scene for Element shop

class CutSceneElement extends CutScene {
    constructor(input) {
        super(input);
    }
}
CutSceneElement.prototype.initialize = function(hud_bmp) {
    menu_manager.main_stats.offset = [-250,0];
    this.menu_state = ""; // Options are "", "Buy", "Sell".
    this.main_menu = new Menu(["Buy","Sell","Leave"],["Buy","Sell","Leave"],[window.innerWidth-500,0,window.innerWidth-350, 140]);
    this.main_menu.reveal(0,-140);
    // Generate the menu for buying items
    var display_choices = this.data.items.map( (x) => element_database[x]["name"] );
    var right_choices = this.data.items.map( (x) => element_database[x]["cost"] + " G" );
    this.buy_item_menu = new Menu(this.data.items, display_choices,[window.innerWidth-350,0,window.innerWidth, 300],right_choices);
    this.buy_item_menu.reveal(350,0);
    this.buy_item_menu.set_icon_func((key)=> {
        return element_database[key].icon;
    });
    // Generate the menu for selling items
    var menu_choices = stats.elements.map((x)=>x[0]);
    var display_choices = stats.elements.map( (x)=>`${element_database[x[0]].name}` );
    var right_choices = stats.elements.map( (x)=>Math.floor(element_database[x[0]].cost/2) + " G");
    this.sell_item_menu = new Menu(menu_choices, display_choices, [window.innerWidth-350,0,window.innerWidth, 300], right_choices);
    this.sell_item_menu.set_icon_func((key)=> {
        return element_database[key].icon;
    });
    // Description box
    this.description_box = new Rectangle(window.innerWidth-350,300,window.innerWidth,window.innerHeight);
    this.description_box.hide_offset = [0,window.innerHeight-300];
    // Gold box
    this.gold_box = new Rectangle(window.innerWidth-700,0,window.innerWidth-500,100);
    this.gold_box.reveal(0,-200);
}
CutSceneElement.prototype.exit = function() {
    cut_scenes.hide_window(this.gold_box);
    menu_manager.main_stats.target_offset = [-250,0];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>menu_manager.main_stats.display(hud_manager.hudBitmap),
        ()=>menu_manager.main_stats.target_offset[0] == menu_manager.main_stats.offset[0],
        ()=>menu_manager.main_stats.target_offset = [0,0]
    ]]);
    this.main_menu.rect.target_offset = [0,-200];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>this.main_menu.rect.display(hud_manager.hudBitmap),
        ()=>this.main_menu.rect.target_offset[1] == this.main_menu.rect.offset[1],
        ()=>this.main_menu.rect.target_offset = [0,0]
    ]]);
    // The second menu that will scroll off screen in this animation
    var second_menu = this.main_menu.get_choice() == "Sell" ? this.sell_item_menu : this.buy_item_menu;
    second_menu.rect.target_offset = [350,0];
    cut_scenes.animations = cut_scenes.animations.concat([[
        ()=>second_menu.rect.display(hud_manager.hudBitmap),
        ()=>second_menu.rect.target_offset[0] == second_menu.rect.offset[0],
        ()=>second_menu.rect.target_offset = [0,0]
    ]]);
    return {"done":1}
}
CutSceneElement.prototype.process_key = function(key) {
    if (this.menu_state=="") {this.main_menu.scroll(key);}
    if (this.menu_state=="Buy") {this.buy_item_menu.scroll(key);}
    if (this.menu_state=="Sell") {this.sell_item_menu.scroll(key);}
    if (['RepeatLeft','RepeatRight','RepeatUp','RepeatDown'].indexOf(key)>=0) {
        return {};
    }
    if (["ArrowRight","Enter","ArrowUp","ArrowDown"," "].indexOf(key)<0) {
        if (this.menu_state == "") {return this.exit()}
        this.menu_state = "";
        cut_scenes.hide_window(this.description_box);
        return {};
    }
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        // Buy an item
        if (this.menu_state == "") {
            this.description_box.reveal(0,window.innerHeight-300);
        }
        else if (this.menu_state == "Buy") {
            var item = this.buy_item_menu.get_choice();
            if (stats.gold >= element_database[item].cost) {
                stats.add_element(item,1);
                stats.gold -= element_database[item].cost;
            }
        }
        else if (this.menu_state == "Sell") {
            // Sell an item
            var item = this.sell_item_menu.get_choice();
            if (item) {
                stats.remove_element(item);
                stats.gold += Math.floor(element_database[item].cost/2);
            }
        }
        // Refresh the sell item menu
        var menu_choices = stats.elements.map((x)=>x[0]);
        var display_choices = stats.elements.map( (x)=>`${element_database[x[0]].name}` );
        var right_choices = stats.elements.map( (x)=>Math.floor(element_database[x[0]].cost/2) + " G" );
        this.sell_item_menu.regenerate_choices(menu_choices, display_choices, right_choices);
        // Leave menu if needed
        this.menu_state = this.main_menu.get_choice();
        return this.menu_state == "Leave" ? this.exit() : {}
    }
    return {};
}
CutSceneElement.prototype.display = function(hud_bmp) {
    menu_manager.main_stats.display(hud_bmp);
    this.gold_box.display(hud_bmp);
    this.gold_box.draw_text(hud_bmp,`Gold: ${stats.gold}`);
    if (this.menu_state != "") {
        this.description_box.display(hud_bmp);
        var elt = this.menu_state == "Sell" ? this.sell_item_menu.get_choice() : this.buy_item_menu.get_choice();
        if (elt) {
            var lines = [`You have ${stats.get_element_count(elt)}.`,""];
            for (var i=0; i<stats.heroes.length; i++) {
                var el = stats.heroes[i].element_levels;
                var cur_level = elt in el ? el[elt] : 0;
                lines = lines.concat(`${stats.heroes[i].name}: Level ${cur_level}`);
            }
            lines = lines.concat("");
            lines = lines.concat(element_database[elt].desc);
            this.description_box.draw_lines(hud_bmp,lines);
        }
    }
    if (this.main_menu.get_choice()=="Buy" || this.main_menu.get_choice()=="Leave") {
        this.buy_item_menu.render(hud_bmp,this.menu_state=="Buy",this.menu_state=="Buy");
    }
    if (this.main_menu.get_choice()=="Sell") {
        this.sell_item_menu.render(hud_bmp,this.menu_state=="Sell",this.menu_state=="Sell");
    }
    this.main_menu.render(hud_bmp,this.menu_state=="",this.menu_state=="");
}
