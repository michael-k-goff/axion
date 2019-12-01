// Main menu for class system

MenuManager.prototype.class_setup = function() {
    this.menu_state = "Class";
    this.main_stats.init_menu();
    this.main_stats.active = 1;
    this.generate_class_menu(false);
    this.class_menu.reveal(0,-300);
    cut_scenes.hide_menu(this.main_menu);
    // Box for displaying the current class
    this.cur_class_box = new Rectangle(window.innerWidth-800,0,window.innerWidth-300,65);
    this.cur_class_box.reveal(0,-300);
    // Box for displaying stat changes from class change
    this.stat_change_box = new Rectangle(window.innerWidth-300, 300, window.innerWidth, window.innerHeight);
}

MenuManager.prototype.KeyClass = function(key) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.menu_state = "ClassSelect";
        this.main_stats.active = 0;
        this.stat_change_box.reveal(300,0);
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Main";
        this.main_stats.exit_menu();
        cut_scenes.hide_menu(this.class_menu);
    }
}

MenuManager.prototype.KeyClassSelect = function(key) {
    this.class_menu.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        if (stats.heroes[this.main_stats.choice].battles_to_class_change() <= 0) {
            stats.heroes[this.main_stats.choice].change_class(this.class_menu.get_choice());
            this.menu_state = "Class";
            cut_scenes.hide_window(this.stat_change_box);
        }
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Class";
        this.main_stats.active = 1;
        cut_scenes.hide_window(this.stat_change_box);
    }
}

MenuManager.prototype.display_class_box = function(hud_bmp) {
    this.cur_class_box.display(hud_bmp);
    var current_class = stats.heroes[this.main_stats.choice].class;
    this.cur_class_box.draw_text(hud_bmp,`Current Class: ${class_database[current_class].name}`);
}

MenuManager.prototype.display_stat_change_box = function(hud_bmp) {
    // Maybe move the following into an attributes key in class_database, like with equipment.
    var stat_changes = ["strength","stamina","agility","magic","maxhp","maxmp"];
    var stat_names = ["Strength","Stamina","Agility","Magic","Max HP","Max MP"];
    var cur_class = stats.heroes[this.main_stats.choice].class;
    var next_class = this.class_menu.get_choice();
    var lines = [];
    var right_lines = [];
    var colors = [];
    var main_colors = [];
    for (var i=0; i<stat_changes.length; i++) {
        var cur_stat = stat_changes[i] in class_database[cur_class] ? class_database[cur_class][stat_changes[i]] : 1.0;
        var next_stat = stat_changes[i] in class_database[next_class] ? class_database[next_class][stat_changes[i]] : 1.0;
        var cur_stat_level = (stat_changes[i]+"_level") in class_database[cur_class] ? class_database[cur_class][stat_changes[i]+"_level"] : 0.0;
        cur_stat_level = cur_stat_level * (cur_class in stats.heroes[this.main_stats.choice].element_levels ? stats.heroes[this.main_stats.choice].element_levels[cur_class] : 0);
        var next_stat_level = (stat_changes[i]+"_level") in class_database[next_class] ? class_database[next_class][stat_changes[i]+"_level"] : 0.0;
        next_stat_level = next_stat_level * (next_class in stats.heroes[this.main_stats.choice].element_levels ? stats.heroes[this.main_stats.choice].element_levels[next_class] : 0);
        var mod = (100*(next_stat + next_stat_level - cur_stat - cur_stat_level)).toFixed(0);
        var sign = "";
        if (mod>0) {sign = "+"}
        if (mod<0) {sign = "-"}
        lines = lines.concat(`${stat_names[i]}:`);
        right_lines = right_lines.concat(`${sign}${Math.abs(mod)}%`);
        colors = colors.concat({"":"rgba(160,160,160,1.0)","+":"rgba(0,255,0,1.0)","-":"rgba(255,0,0,1.0)"}[sign]);
        main_colors = main_colors.concat("#FFFFFF");
    }
    main_colors = main_colors.concat(["#FFFFFF","#FF0000"]);
    var num_battles_left = stats.heroes[this.main_stats.choice].battles_to_class_change();
    if (num_battles_left > 0) {
        lines = lines.concat(["",`${num_battles_left} more battles needed.`]);
    }
    this.stat_change_box.display(hud_bmp);
    this.stat_change_box.draw_lines(hud_bmp,lines, 10,30, params={"colors":main_colors});
    this.stat_change_box.draw_lines(hud_bmp, right_lines, 10,30,params={"right":1,"colors":colors});
}

MenuManager.prototype.DisplayClass = function(hud_bmp) {
    this.generate_class_menu(true);
    this.main_stats.display(hud_bmp);
    this.class_menu.render(hud_bmp,0,0);
    this.display_class_box(hud_bmp);
}

MenuManager.prototype.DisplayClassSelect = function(hud_bmp) {
    this.class_menu.render(hud_bmp);
    this.main_stats.display(hud_bmp);
    this.display_class_box(hud_bmp);
    this.display_stat_change_box(hud_bmp);
}

MenuManager.prototype.generate_class_menu = function(regenerate=false) {
    var current_hero = stats.heroes[this.main_stats.choice];
    var display_choices = [];
    var menu_choices = [];
    var right_choices = [];
    var colors = [];
    for (var i=0; i<class_database.menu_order.length; i++) {
        var k = class_database.menu_order[i]
        if (k == "") {
            menu_choices = menu_choices.concat(k);
            display_choices = display_choices.concat(class_database[k].name);
            right_choices = right_choices.concat("");
        }
        else if (current_hero.element_levels[k]) {
            menu_choices = menu_choices.concat(k);
            display_choices = display_choices.concat(class_database[k].name);
            right_choices = right_choices.concat(current_hero.element_levels[k]);
        }
        colors = colors.concat(
            current_hero.battles_to_class_change() > 0 ? "#777777" : "#FFFFFF"
        );
    }
    if (regenerate) {
        this.class_menu.regenerate_choices(
            menu_choices, display_choices,right_choices,{"color":colors}
        );
    }
    else {
        this.class_menu = new Menu(menu_choices, display_choices,
            [window.innerWidth-300, 0, window.innerWidth, 300],
            right_choices, {"color":colors});
    }
}
