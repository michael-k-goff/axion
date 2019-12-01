// Stances

MenuManager.prototype.stance_setup = function() {
    this.menu_state = "Stance";
    cut_scenes.hide_menu(this.main_menu,0,-250);
    this.stance_box = new Rectangle(window.innerWidth-600,0,window.innerWidth-250,200);
    this.stance_box.reveal(0,-300);
    this.main_stats.init_menu();
    this.main_stats.active = 1;
}

MenuManager.prototype.display_stance_box = function(hud_bmp) {
    this.stance_box.display(hud_bmp);
    var stance_dict = {"normal":"Normal","offensive":"Offensive","defensive":"Defensive"};
    var lines = [`Current Stance`,``];
    var lines2 = [``,``];
    for (var i=0; i<stats.heroes.length; i++) {
        lines = lines.concat(`${stats.heroes[i].name}:`);
        lines2 = lines2.concat(`${stance_dict[stats.heroes[i].stance_type]}`);
    }
    this.stance_box.draw_lines(hud_bmp, lines);
    this.stance_box.draw_lines(hud_bmp, lines2, 150,30);
}

MenuManager.prototype.DisplayStance = function(hud_bmp) {
    this.main_stats.display(hud_bmp);
    this.display_stance_box(hud_bmp);
}

MenuManager.prototype.KeyStance = function(key) {
    this.main_stats.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        this.stance_menu = new Menu(
            ["normal","offensive","defensive"],
            ["Normal","Offensive","Defensive"],
            [window.innerWidth-250,0,window.innerWidth,200]
        );
        this.stance_menu.reveal(0,-300);
        this.menu_state = "StanceChoose";
        this.main_stats.active = 0;
        return;
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Main";
        this.main_stats.exit_menu();
        cut_scenes.hide_window(this.stance_box);
    }
}

MenuManager.prototype.DisplayStanceChoose = function(hud_bmp) {
    this.stance_menu.render(hud_bmp);
    this.main_stats.display(hud_bmp);
    this.display_stance_box(hud_bmp);
}

MenuManager.prototype.KeyStanceChoose = function(key) {
    this.stance_menu.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (["Enter","ArrowRight"," "].indexOf(key)>=0) {
        stats.heroes[this.main_stats.choice].stance_type = this.stance_menu.get_choice();
    }
    if (key != 'ArrowUp' && key != 'ArrowDown') {
        this.menu_state = "Stance";
        this.main_stats.active = 1;
        cut_scenes.hide_menu(this.stance_menu);
    }
}
