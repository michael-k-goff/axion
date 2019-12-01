// Ability portion of the main menu

MenuManager.prototype.ability_setup = function() {
    this.menu_state = "Ability";
    this.main_stats.init_menu();
    this.main_stats.active = 1;
    // Since the main stat menu will be used for multiple purposes, we are
    // storing the character that is casting an ability
    this.ability_user = 0;
    cut_scenes.hide_menu(this.main_menu);
    this.generate_ability_bundle_menu(false);
    this.ability_bundle_menu.reveal(0,-300);
    this.ability_description = new Rectangle(window.innerWidth-300, window.innerHeight-150, window.innerWidth, window.innerHeight);
}

MenuManager.prototype.KeyAbility = function(key) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    this.ability_user = this.main_stats.choice;
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.menu_state = "AbilityBundle";
        this.main_stats.active = 0;
        this.generate_ability_menu(false);
        this.ability_menu.reveal(0,-300);
        this.ability_description.reveal(0,150);
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Main";
        this.main_stats.exit_menu();
        cut_scenes.hide_menu(this.ability_bundle_menu);
    }
}

MenuManager.prototype.DisplayAbility = function(hud_bmp) {
    this.generate_ability_bundle_menu(true);
    this.main_stats.display(hud_bmp);
    this.ability_bundle_menu.render(hud_bmp,0,0);
}

MenuManager.prototype.KeyAbilityBundle = function(key) {
    this.ability_bundle_menu.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    this.generate_ability_menu(true);
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.menu_state = "AbilitySingle";
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Ability";
        this.main_stats.active = 1;
        cut_scenes.hide_menu(this.ability_menu);
    }
}

MenuManager.prototype.DisplayAbilityBundle = function(hud_bmp) {
    this.ability_bundle_menu.render(hud_bmp);
    this.ability_menu.render(hud_bmp,0,0);
    this.main_stats.display(hud_bmp);
}

MenuManager.prototype.KeyAbilitySingle = function(key) {
    this.ability_menu.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        var choice = this.ability_menu.get_choice();
        if (choice in ability_database.map_abilities) {
            if (ability_database.map_abilities[choice].target == "Single") {
                this.menu_state = "AbilityTarget";
                this.main_stats.init_menu({"icon":ability_database.abilities[choice].icon});
            }
            else if (ability_database.map_abilities[choice].target == "None") {
                ability_database.map_abilities[choice].effect(this.ability_user);
                this.generate_ability_menu(true);
            }
        }
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "AbilityBundle";
        cut_scenes.hide_window(this.ability_description);
    }
}

MenuManager.prototype.DisplayAbilitySingle = function(hud_bmp) {
    this.ability_bundle_menu.render(hud_bmp,0,0);
    this.ability_menu.render(hud_bmp);
    this.main_stats.display(hud_bmp);
    this.AbilityDescriptionBox(hud_bmp);
}

MenuManager.prototype.KeyAbilityTarget = function(key) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        var ability_choice = this.ability_menu.get_choice();
        ability_database.map_abilities[ability_choice].effect(
            this.ability_user, this.main_stats.choice
        );
        if (!(ability_database.abilities[ability_choice].can_use(stats.heroes[this.ability_user]))) {
            this.menu_state = "AbilitySingle";
            this.main_stats.init_menu();
            this.main_stats.choice = this.ability_user;
            this.main_stats.display_choice = this.ability_user;
            this.generate_ability_menu(true);
        }
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "AbilitySingle";
        this.generate_ability_menu(true);
        this.main_stats.init_menu();
        this.main_stats.choice = this.ability_user;
        this.main_stats.display_choice = this.ability_user;
    }
}

MenuManager.prototype.DisplayAbilityTarget = function(hud_bmp) {
    this.ability_bundle_menu.render(hud_bmp,0,0);
    this.ability_menu.render(hud_bmp,0,0);
    this.main_stats.display(hud_bmp);
}

MenuManager.prototype.AbilityDescriptionBox = function(hud_bmp) {
    this.ability_description.display(hud_bmp);
    var choice = this.ability_menu.get_choice().split('!')[0];
    if (choice in ability_database.abilities) {
        var description = ability_database.abilities[choice].desc;
        this.ability_description.draw_text(hud_bmp,description);
    }
}

MenuManager.prototype.generate_ability_menu = function(regenerate=false) {
    var display_choices = [];
    var menu_choices = [];
    var colors = [];
    var right_text = [];
    var ability_bundle = this.ability_bundle_menu.get_choice();
    for (var i=0; i<ability_database.ability_bundles[ability_bundle].abilities.length; i++) {
        var ability = ability_database.ability_bundles[ability_bundle].abilities[i];
        var can_use = true;
        if (!(ability in ability_database.map_abilities)) {
            can_use = false;
        }
        if (!(ability_database.abilities[ability].can_use(stats.heroes[this.ability_user]))) {
            can_use = false;
        }
        if (ability_database.abilities[ability].is_listed(stats.heroes[this.ability_user])) {
            menu_choices = menu_choices.concat(can_use ? ability : ability+"!");
            display_choices = display_choices.concat(ability_database.abilities[ability].name);
            colors = colors.concat(can_use ? "#FFFFFF" : "#777777");
            if ("mpcost" in ability_database.abilities[ability]) {
                right_text = right_text.concat(ability_database.abilities[ability].mpcost)
            }
            else {
                right_text = right_text.concat("");
            }
        }
    }
    if (regenerate) {
        this.ability_menu.regenerate_choices(
            menu_choices, display_choices, right_text, {"color":colors}
        );
    }
    else {
        this.ability_menu = new Menu(menu_choices, display_choices,
            [window.innerWidth-300, 0, window.innerWidth, 300],
            right_text, {"color":colors}
        );
        this.ability_menu.set_icon_func((key)=>{
            var ability_key = key.split('!')[0];
            return ability_database.abilities[ability_key].icon;
        });
    }
}

MenuManager.prototype.generate_ability_bundle_menu = function(regenerate=false) {
    var display_choices = [];
    var menu_choices = [];
    var ability_bundles = stats.heroes[this.ability_user].ability_bundles();
    for (var i=0; i<ability_bundles.length; i++) {
        if (ability_bundles[i] in ability_database.ability_bundles) {
            menu_choices = menu_choices.concat(ability_bundles[i]);
            display_choices = display_choices.concat(ability_database.ability_bundles[ability_bundles[i]].name);
        }
    }
    if (regenerate) {
        this.ability_bundle_menu.regenerate_choices(menu_choices, display_choices);
    }
    else {
        this.ability_bundle_menu = new Menu(menu_choices, display_choices,
            [window.innerWidth-600, 0, window.innerWidth-300, 200]
        );
    }
}
