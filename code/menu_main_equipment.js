// Portion of the main menu for equipment

MenuManager.prototype.equipment_setup = function() {
    this.menu_state = "Equipment";
    this.main_stats.init_menu();
    this.main_stats.active = 1;
    this.generate_equipment_type_menu(false);
    this.equipment_menu_type.set_offset(300,0);
    this.main_menu.rect.target_offset = [0,-250];
    this.animations = this.animations.concat([[
        ()=>this.main_menu.render(hud_manager.hudBitmap),
        ()=>this.main_menu.rect.target_offset[1] == this.main_menu.rect.offset[1],
        ()=>this.main_menu.rect.target_offset = [0,0]
    ]]);
    // Boxes for displaying information
    this.equipment_description = new Rectangle(window.innerWidth-700, 0, window.innerWidth-400, 300);
    this.equipment_mod = new Rectangle(window.innerWidth-700,300,window.innerWidth-400,window.innerHeight);
}

MenuManager.prototype.display_equipment_box = function(hud_bmp) {
    this.equipment_description.display(hud_bmp);
    var current_hero = stats.heroes[this.main_stats.choice];
    var equip_type = current_hero.equipment[this.equipment_menu_type.get_choice()][0];
    var equip = current_hero.equipment[this.equipment_menu_type.get_choice()][1];
    if (this.menu_state == "EquipmentItem") {
        equip = this.equipment_menu_item.get_choice();
    }
    //var lines = [equipment_database[equip_type][equip]["name"]];
    var lines = [];
    for (var i=0; i<equipment_database.attributes.length; i++) {
        if (equipment_database.attributes[i][0] in equipment_database[equip_type][equip]) {
            lines = lines.concat(`${equipment_database.attributes[i][1]}: ${equipment_database[equip_type][equip][equipment_database.attributes[i][0]]}`);
        }
    }
    lines = lines.concat("");
    lines = lines.concat(equipment_database[equip_type][equip]["desc"]);
    this.equipment_description.draw_lines(hud_bmp,lines);
}

MenuManager.prototype.display_equipment_mod = function(hud_bmp) {
    this.equipment_mod.display(hud_bmp);
    var current_hero = stats.heroes[this.main_stats.choice];
    var equip_type = current_hero.equipment[this.equipment_menu_type.get_choice()][0];
    var cur_equip = current_hero.equipment[this.equipment_menu_type.get_choice()][1];
    var new_equip = this.equipment_menu_item.get_choice();
    var lines = [];
    var right_lines = [];
    var colors = [];
    for (var i=0; i<equipment_database.attributes.length; i++) {
        var at = equipment_database.attributes[i][0];
        if (at in equipment_database[equip_type][cur_equip] || at in equipment_database[equip_type][new_equip]) {
            var new_val = at in equipment_database[equip_type][new_equip] ? equipment_database[equip_type][new_equip][at] : 0;
            var cur_val = at in equipment_database[equip_type][cur_equip] ? equipment_database[equip_type][cur_equip][at] : 0;
            var sign = "";
            if (new_val > cur_val) {sign = "+"}
            if (new_val < cur_val) {sign = "-"}
            lines = lines.concat(`${equipment_database.attributes[i][1]}`);
            right_lines = right_lines.concat(`${sign}${+(Math.abs(new_val-cur_val)).toFixed(1)}`);
            colors = colors.concat({"":"rgba(160,160,160,1.0)","+":"rgba(0,255,0,1.0)","-":"rgba(255,0,0,1.0)"}[sign]);
        }
    }
    this.equipment_mod.draw_lines(hud_bmp, lines);
    this.equipment_mod.draw_lines(hud_bmp, right_lines, 10,30,params={"right":1,"colors":colors});
}

MenuManager.prototype.DisplayEquipment = function(hud_bmp) {
    this.generate_equipment_type_menu(true);
    this.equipment_menu_type.render(hud_bmp,0,0);
    this.main_stats.display(hud_bmp);
}

MenuManager.prototype.DisplayEquipmentType = function(hud_bmp) {
    this.equipment_menu_type.render(hud_bmp);
    this.generate_equipment_item_menu(true);
    this.equipment_menu_item.render(hud_bmp,0,0);
    this.main_stats.display(hud_bmp);
    this.display_equipment_box(hud_bmp);
}

MenuManager.prototype.DisplayEquipmentItem = function(hud_bmp) {
    this.equipment_menu_type.render(hud_bmp,0,1);
    this.equipment_menu_item.render(hud_bmp);
    this.main_stats.display(hud_bmp);
    this.display_equipment_box(hud_bmp);
    this.display_equipment_mod(hud_bmp);
}

MenuManager.prototype.KeyEquipment = function(key, result) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.generate_equipment_type_menu(true);
        this.menu_state = "EquipmentType";
        this.main_stats.active = 0;
        this.generate_equipment_item_menu(false);
        this.equipment_menu_item.set_offset(300,0);
        this.equipment_description.offset = [0,-300];
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Main";
        this.main_stats.exit_menu();
        this.equipment_menu_type.rect.target_offset = [300,0];
        this.animations = this.animations.concat([[
            ()=>this.equipment_menu_type.render(hud_manager.hudBitmap),
            ()=>this.equipment_menu_type.rect.target_offset[0] == this.equipment_menu_type.rect.offset[0],
            ()=>this.equipment_menu_type.rect.target_offset = [0,0]
        ]]);
    }
}

MenuManager.prototype.KeyEquipmentType = function (key, result) {
    this.equipment_menu_type.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.generate_equipment_item_menu(true);
        this.menu_state = "EquipmentItem";
        this.equipment_mod.offset = [0,window.innerHeight-300];
        return;
    }
    if (key == 'ArrowUp' || key == 'ArrowDown') {
        this.equipment_menu_item.reset();
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Equipment";
        this.main_stats.active = 1;
        this.equipment_menu_item.rect.target_offset = [300,0];
        this.animations = this.animations.concat([[
            ()=>this.equipment_menu_item.render(hud_manager.hudBitmap),
            ()=>this.equipment_menu_item.rect.target_offset[0] == this.equipment_menu_item.rect.offset[0],
            ()=>this.equipment_menu_item.rect.target_offset = [0,0]
        ]]);
        this.equipment_description.target_offset = [0,-300];
        this.animations = this.animations.concat([[
            ()=>this.equipment_description.display(hud_manager.hudBitmap),
            ()=>this.equipment_description.target_offset[1] == this.equipment_description.offset[1],
            ()=>this.equipment_description.target_offset = [0,0]
        ]]);
    }
}

MenuManager.prototype.KeyEquipmentItem = function(key, result) {
    this.equipment_menu_item.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        stats.equip(this.main_stats.choice,
            this.equipment_menu_type.get_choice(),
            this.equipment_menu_item.get_choice()
        );
        this.generate_equipment_type_menu(true);
        this.menu_state = "EquipmentType";
        this.equipment_mod.target_offset = [0,window.innerHeight-300];
        this.animations = this.animations.concat([[
            ()=>this.equipment_mod.display(hud_manager.hudBitmap),
            ()=>this.equipment_mod.target_offset[1] == this.equipment_mod.offset[1],
            ()=>this.equipment_mod.target_offset = [0,0]
        ]]);
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "EquipmentType";
        this.equipment_mod.target_offset = [0,window.innerHeight-300];
        this.animations = this.animations.concat([[
            ()=>this.equipment_mod.display(hud_manager.hudBitmap),
            ()=>this.equipment_mod.target_offset[1] == this.equipment_mod.offset[1],
            ()=>this.equipment_mod.target_offset = [0,0]
        ]]);
    }
}

// Generate the menu for choosing the type of equipment
MenuManager.prototype.generate_equipment_type_menu = function(regenerate = false) {
    var character = this.main_stats.choice;
    var display_choices = [];
    var menu_choices = [];
    var right_choices = [];
    var equip_types = stats.heroes[character].equipment;
    for (var i=0; i<equip_types.length; i++) {
        var equip_type = equip_types[i][0];
        menu_choices = menu_choices.concat(i);
        display_choices = display_choices.concat(equipment_database[equip_type].name);
        right_choices = right_choices.concat(
            equipment_database[equip_type][equip_types[i][1]]["name"]
        );
    }
    if (regenerate) {
        this.equipment_menu_type.regenerate_choices(menu_choices, display_choices,right_choices);
    }
    else {
        this.equipment_menu_type = new Menu(menu_choices, display_choices,
            [window.innerWidth-400, 0, window.innerWidth, window.innerHeight/3],
        right_choices);
    }
    this.equipment_menu_type.set_icon_func((key)=>{
        var item_type = equip_types[key][0];
        var item_key = equip_types[key][1];
        return (equipment_database[item_type][item_key].icon);
    },"right_prefix");
}
// Generate a list of items to equip
MenuManager.prototype.generate_equipment_item_menu = function(regenerate = false) {
    var current_hero = stats.heroes[this.main_stats.choice];
    var equip_type = current_hero.equipment[this.equipment_menu_type.get_choice()][0];
    var display_choices = ["None"];
    var menu_choices = [""];
    var right_choices = [""];
    for (var i=0; i<stats.equipment.length; i++) {
        if (stats.equipment[i][0]==equip_type) {
            menu_choices = menu_choices.concat(stats.equipment[i][1]);
            var equip_name = equipment_database[equip_type][stats.equipment[i][1]]["name"];
            display_choices = display_choices.concat(equip_name);
            right_choices = right_choices.concat("x"+stats.equipment[i][2]);
        }
    }
    if (regenerate) {
        this.equipment_menu_item.regenerate_choices(menu_choices, display_choices,right_choices);
    }
    else {
        this.equipment_menu_item = new Menu(menu_choices, display_choices,
            [window.innerWidth-400, window.innerHeight/3, window.innerWidth, window.innerHeight],
            right_choices);
    }
    this.equipment_menu_item.set_icon_func((key)=>{
        return (equipment_database[equip_type][key].icon);
    });
}
