// Portion of the main menu for items

MenuManager.prototype.items_setup = function() {
    this.menu_state = "Items";
    this.generate_item_menu();
    this.item_menu.set_offset(300,0);
    // Set up a few boxes for displaying stuff
    this.item_description = new Rectangle(window.innerWidth-300, window.innerHeight/3, window.innerWidth, window.innerHeight/3+150);
    this.item_description.offset = [300,0];
    this.item_result = new Rectangle(300,0,window.innerWidth-300,100);
    this.item_result_active = 0;

    this.main_menu.rect.target_offset = [0,-250];
    this.animations = this.animations.concat([[
        ()=>this.main_menu.render(hud_manager.hudBitmap),
        ()=>this.main_menu.rect.target_offset[1] == this.main_menu.rect.offset[1],
        ()=>this.main_menu.rect.target_offset = [0,0]
    ]]);
}

MenuManager.prototype.DisplayItems = function(hud_bmp) {
    this.item_menu.render(hud_bmp);
    this.main_stats.display(hud_bmp);
    this.DisplayDescriptionBox(hud_bmp);
    this.DisplayResultBox(hud_bmp);
}

MenuManager.prototype.DisplayItemTarget = function(hud_bmp) {
    this.item_menu.render(hud_bmp,0,1);
    this.main_stats.display(hud_bmp);
    this.DisplayDescriptionBox(hud_bmp);
    this.DisplayResultBox(hud_bmp);
}

MenuManager.prototype.DisplayDescriptionBox = function(hud_bmp) {
    this.item_description.display(hud_bmp);
    var choice = this.item_menu.get_choice();
    if (typeof choice !== 'undefined') {
        var selected_item = stats.items[choice][0];
        var description = "desc" in item_database.items[selected_item] ? item_database.items[selected_item]["desc"] : "";
        this.item_description.draw_text(hud_bmp,description);
    }
}

MenuManager.prototype.DisplayResultBox = function(hud_bmp) {
    if (this.item_result_active) {
        this.item_result.display(hud_bmp);
        this.item_result.draw_text(hud_bmp,stats.item_result);
    }
}

// If the item result box is being displayed, get rid of it
MenuManager.prototype.deactivate_result = function() {
    if (this.item_result_active) {
        this.item_result_active = 0;
        this.item_result.target_offset = [0,-100];
        this.animations = this.animations.concat([[
            ()=>this.item_result.display(hud_manager.hudBitmap),
            ()=>this.item_result.target_offset[1] == this.item_result.offset[1],
            ()=>this.item_result.target_offset = [0,0]
        ]]);
    }
}

MenuManager.prototype.KeyItems = function(key,result) {
    this.item_menu.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (stats.item_result) {this.deactivate_result();}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        var choice = this.item_menu.get_choice();
        if (!(choice) && choice != 0) {return;}
        if (item_database.items[stats.items[choice][0]].can_use && !(item_database.items[stats.items[choice][0]].can_use())) {return;}
        stats.selected_item = stats.items[choice][0];
        if (item_database.items[stats.selected_item].target == "Single") {
            this.menu_state = "ItemTarget";
            this.main_stats.init_menu({"icon":item_database.items[stats.selected_item].icon});
            return;
        }
        stats.use_item(stats.selected_item, -1);
        this.generate_item_menu(true);
        if (stats.item_result) {
            this.item_result.offset = [0,-100];
            this.item_result_active = 1;
        }
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Main";
        this.main_menu.set_offset(0,-250);
        this.item_menu.rect.target_offset = [400,0];
        this.animations = this.animations.concat([[
            ()=>this.item_menu.render(hud_manager.hudBitmap),
            ()=>this.item_menu.rect.target_offset[0] == this.item_menu.rect.offset[0],
            ()=>this.item_menu.rect.target_offset = [0,0]
        ]]);
        this.item_description.target_offset = [400,0];
        this.animations = this.animations.concat([[
            ()=>this.item_description.display(hud_manager.hudBitmap),
            ()=>this.item_description.target_offset[0] == this.item_description.offset[0],
            ()=>this.item_description.target_offset = [0,0]
        ]]);
    }
}

MenuManager.prototype.KeyItemTarget = function(key,result) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    this.deactivate_result();
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        if (stats.use_item(stats.selected_item, this.main_stats.choice)) {
            this.generate_item_menu(true);
            this.menu_state = "Items";
            this.main_stats.exit_menu();
        }
        else {
            this.generate_item_menu(true);
        }
        if (stats.item_result) {
            this.item_result.offset = [0,-100];
            this.item_result_active = 1;
        }

        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Items";
        this.main_stats.exit_menu();
    }
}

// This generates the item menu in place
MenuManager.prototype.generate_item_menu = function(regenerate = false) {
    var display_choices = [];
    var menu_choices = [];
    var quantities = [];
    var colors = [];
    for (var i=0; i<stats.items.length; i++) {
        menu_choices = menu_choices.concat(i);
        display_choices = display_choices.concat(item_database.items[stats.items[i][0]].name);
        quantities = quantities.concat("x"+stats.items[i][1].toString());
        if (!(item_database.items[stats.items[i][0]].can_use) || item_database.items[stats.items[i][0]].can_use()) {
            colors = colors.concat("#FFFFFF");
        }
        else {
            colors = colors.concat("#777777");
        }
    }
    if (regenerate) {
        this.item_menu.regenerate_choices(menu_choices, display_choices,quantities,{"color":colors});
    }
    else {
        this.item_menu = new Menu(menu_choices, display_choices,
                  [window.innerWidth-300, 0, window.innerWidth, window.innerHeight/3],quantities,{"color":colors});
    }
    this.item_menu.set_icon_func((key)=>{
        return item_database.items[stats.items[key][0]].icon;
    });
}
