// Portion of the main menu for Elements

MenuManager.prototype.elements_setup = function() {
    this.menu_state = "Element";
    this.main_stats.init_menu();
    this.main_stats.active = 1;
    this.generate_element_type_menu(false);
    this.element_menu_type.set_offset(400,0);
    this.main_menu.rect.target_offset = [0,-250];
    this.animations = this.animations.concat([[
        ()=>this.main_menu.render(hud_manager.hudBitmap),
        ()=>this.main_menu.rect.target_offset[1] == this.main_menu.rect.offset[1],
        ()=>this.main_menu.rect.target_offset = [0,0]
    ]]);
    // Set up boxes to display stuff
    this.element_description = new Rectangle(300, 0, window.innerWidth-450, 200);
}

// Display the element description box.
MenuManager.prototype.display_element_desc = function(hud_bmp) {
    this.element_description.display(hud_bmp);
    var cur_hero = this.main_stats.choice;
    var cur_element = "";
    if (this.menu_state == "ElementType") {
        var cur_slot = this.element_menu_type.get_choice();
        cur_element = stats.heroes[cur_hero].elements[cur_slot][0];
    }
    else if (this.menu_state == "ElementItem") {
        cur_element = this.element_menu_item.get_choice();
    }
    var elt_desc = cur_element.length > 0 ? element_database[cur_element]["desc"]: "No Element. Will not gain EXP.";
    var el = stats.heroes[cur_hero].element_levels;
    var cur_level = cur_element in el ? el[cur_element] : 0;
    var cur_level_text = cur_element.length > 0 ? `Level ${cur_level}` : "";
    var exp_needed = cur_element.length > 0 ? element_database[cur_element].levelup(cur_level) : 0;
    var exp_text = cur_element.length > 0 ? `EXP to Level Up: ${exp_needed}` : "";
    var full_desc = [elt_desc,"",cur_level_text,exp_text,""].concat(
        stats.missing_element_prereqs(stats.heroes[cur_hero], cur_element)
    );
    // Rather that get the right number of red colors, just putting on a whole bunch.
    var colors = ["#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FF0000",
        "#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000"];
    this.element_description.draw_lines(hud_bmp,full_desc,10,30,{"colors":colors});
}

MenuManager.prototype.DisplayElement = function(hud_bmp) {
    this.generate_element_type_menu(true);
    this.element_menu_type.render(hud_bmp,0,0);
    this.main_stats.display(hud_bmp);
}

MenuManager.prototype.DisplayElementType = function(hud_bmp) {
    this.element_menu_type.render(hud_bmp);
    this.generate_element_item_menu(true);
    this.element_menu_item.render(hud_bmp,0,0);
    this.display_element_desc(hud_bmp);
    this.main_stats.display(hud_bmp);
}

MenuManager.prototype.DisplayElementItem = function(hud_bmp) {
    this.element_menu_type.render(hud_bmp,0,1);
    this.element_menu_item.render(hud_bmp);
    this.display_element_desc(hud_bmp);
    this.main_stats.display(hud_bmp);
}

MenuManager.prototype.KeyElement = function(key, result) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.generate_element_type_menu(true);
        this.main_stats.active = 0;
        this.menu_state = "ElementType";
        this.element_menu_type.reset();
        this.generate_element_item_menu(false);
        this.element_menu_item.set_offset(400,0);
        this.element_description.offset = [0,-200];
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Main";
        this.main_stats.exit_menu();
        this.element_menu_type.rect.target_offset = [400,0];
        this.animations = this.animations.concat([[
            ()=>this.element_menu_type.render(hud_manager.hudBitmap),
            ()=>this.element_menu_type.rect.target_offset[0] == this.element_menu_type.rect.offset[0],
            ()=>this.element_menu_type.rect.target_offset = [0,0]
        ]]);
    }
}

MenuManager.prototype.KeyElementType = function(key, result) {
    this.element_menu_type.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.generate_element_item_menu(true);
        this.menu_state = "ElementItem";
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Element";
        this.main_stats.active = 1;
        this.element_menu_item.rect.target_offset = [400,0];
        this.animations = this.animations.concat([[
            ()=>this.element_menu_item.render(hud_manager.hudBitmap),
            ()=>this.element_menu_item.rect.target_offset[0] == this.element_menu_item.rect.offset[0],
            ()=>this.element_menu_item.rect.target_offset = [0,0]
        ]]);
        this.element_description.target_offset = [0,-200];
        this.animations = this.animations.concat([[
            ()=>this.element_description.display(hud_manager.hudBitmap),
            ()=>this.element_description.target_offset[1] == this.element_description.offset[1],
            ()=>this.element_description.target_offset = [0,0]
        ]]);
    }
}

MenuManager.prototype.KeyElementItem = function(key, result) {
    this.element_menu_item.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        if (stats.can_equip_element(stats.heroes[this.main_stats.choice],this.element_menu_item.get_choice())) {
            stats.equip_element(this.main_stats.choice,
                this.element_menu_type.get_choice(),
                this.element_menu_item.get_choice()
            );
            this.menu_state = "ElementType";
        }
        this.generate_element_type_menu(true);
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "ElementType";
    }
}

// Generate the menu for choosing element slot
MenuManager.prototype.generate_element_type_menu = function(regenerate = false) {
    var character = this.main_stats.choice;
    var display_choices = [];
    var menu_choices = [];
    var right_choices = [];
    var elts = stats.heroes[character].elements;
    for (var i=0; i<elts.length; i++) {
        var elt_type = elts[i][0];
        menu_choices = menu_choices.concat(i);
        display_choices = display_choices.concat(element_database[elt_type].name);
        if (elt_type.length == 0) {right_choices = right_choices.concat("")}
        else {
            var elt_levels = stats.heroes[character].element_levels;
            var elt_level = elt_type in elt_levels ? elt_levels[elt_type] : 0;
            var exp_needed = element_database[elt_type].levelup(elt_level);
            right_choices = right_choices.concat(
                `${elts[i][1]}/${exp_needed}`
            );
        }
    }
    if (regenerate) {
        this.element_menu_type.regenerate_choices(menu_choices, display_choices,right_choices);
    }
    else {
        this.element_menu_type = new Menu(menu_choices, display_choices,
            [window.innerWidth-400, 0, window.innerWidth, window.innerHeight/3],
            right_choices);
    }
    this.element_menu_type.set_icon_func((key)=> {
        return element_database[elts[key][0]].icon;
    });
}

// Make the list of elements that can be equipped
MenuManager.prototype.generate_element_item_menu = function(regenerate = false) {
    var current_hero = stats.heroes[this.main_stats.choice];
    var element_slot = this.element_menu_type.get_choice();
    var display_choices = ["None"];
    var menu_choices = [""];
    var right_choices = [""];
    var colors = ["#FFFFFF"];
    for (var i=0; i<stats.elements.length; i++) {
        menu_choices = menu_choices.concat(stats.elements[i][0]);
        var elt_name = element_database[stats.elements[i][0]]["name"];
        display_choices = display_choices.concat(elt_name);
        // Might revise this to show the number of EXP to master the element
        right_choices = right_choices.concat("x"+stats.elements[i][1]);
        // White for elements that can be equipped, gray for those that cannot.
        if (stats.can_equip_element(current_hero, stats.elements[i][0])) {
            colors = colors.concat("#FFFFFF");
        }
        else {
            colors = colors.concat("#777777");
        }
    }
    if (regenerate) {
        this.element_menu_item.regenerate_choices(
            menu_choices, display_choices, right_choices,{"color":colors}
        );
    }
    else {
        this.element_menu_item = new Menu(menu_choices, display_choices,
            [window.innerWidth-400, window.innerHeight/3, window.innerWidth, window.innerHeight],
            right_choices,{"color":colors});
        this.element_menu_item.set_icon_func((key)=> {
            return element_database[key].icon;
        });
    }
}
