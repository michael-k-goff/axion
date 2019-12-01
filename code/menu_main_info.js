// The Info portion of the main menu system.

MenuManager.prototype.info_setup = function() {
    this.menu_state = "Info";
    cut_scenes.hide_menu(this.main_menu,0,-250);
    cut_scenes.hide_window(this.main_stats,-300,0);
    var choices = this.game_info.map(x=>x[0]);
    this.info_menu = new Menu(Array.from(choices.keys()), choices,[0,0,500,window.innerHeight]);
    this.info_menu.reveal(0,-window.innerHeight);
    this.info_box = new Rectangle(500,0,window.innerWidth,window.innerHeight);
    this.info_box.reveal(window.innerWidth-500,0);
    if ("Hint" in stats.plot) {
        this.game_info[0][1] = stats.plot.Hint;
    }
}

MenuManager.prototype.DisplayInfo = function(hud_bmp) {
    this.info_menu.render(hud_bmp);
    this.info_box.display(hud_bmp);
    var choice = this.info_menu.get_choice();
    this.info_box.draw_text(hud_bmp,this.game_info[choice][1]);
}

MenuManager.prototype.KeyInfo = function(key, result) {
    this.info_menu.scroll(key);
    if (["RepeatUp","RepeatDown","RepeatLeft","RepeatRight"].indexOf(key)>=0) {return;}
    if (['ArrowUp','ArrowDown','RepeatUp','RepeatDown'].indexOf(key)<0) {
        this.menu_state = "Main";
        cut_scenes.hide_menu(this.info_menu,0,-300);
        cut_scenes.hide_window(this.info_box,500,0);
    }
}

MenuManager.prototype.game_info = [
    ["What am I doing?","..."],
    ["Keys","Walk: Arrow keys or WASD.\n\nMain menu: Escape, Backspace, or M\n\nInteract with objects or talk to people: Enter or Space\n\nSelect options in menu: Enter, Space, or Right\n\nBack out of menus: Left, Backspace, or Escape."],
    ["Combat Basics I","When you meet an Anima on the map, you get into a fight. You win the fight if the Anima run out of hit points and lose if you run out of HP.\n\nCombat occurs on a two-dimensional grid. Be careful of your moves being intercepted and collatoral damage from attacks with range effects."],
    ["Combat Basics II","In battle, having a higher Attack increases HP damage you do from physical attacks, and Defense reduces damage you receive. The Magic stat influences the strength of magic.\n\nThese stats are increased mainly by leveling up Elements. Equipment, class, and status effects can also influence stats."],
    ["Combat Basics III","As time flows in battle, all characters charge up and execute moves simultaneously.\n\nTo execute a move, first your turn meter, which is displayed as bar on the right side of the screen, must fill up. Then you can select a move and a target.\n\nSecond, the move must charge; the charge is also shown as a bar on the right side.\n\nThird, you execute the move, which takes more time."],
    ["Stances","While not charging or executing a move, your characters will position themselves strategically on the battlefield. The stance governs how closely they will approach the enemy.\n\nStances can be changed under Stance in the main menu. Offensive stances are recommended for fighters, and defensive stances are recommended for magic users and long range attackers."],
    ["Equipment","You can purchase or find weapons, armor, helmets, shields, and accessories. They need to be equipped--which you can do under Equipment in the main menu--to be useful.\n\nWhen you are shopping or choosing what to equip, a description box shows what effect it will have on your stats."],
    ["Elements","Elements are the main mechanism for getting stronger. If you have Elements equipped, then when you win a battle, your Elements will gain experience points. When they reach full EXP, you master the Element and get a permanent stat bonus or ability.\n\nRemember, Elements must be equipped, which you can do through Elements in the main menu. You can purchase Elements at some shops or find them in dungeons."],
    ["Classes","Your character's class influences stats and lets you use abilities. Change class under Class in the main menu. You cannot change to a class until you gain at least one level of that class from an Element.\n\nWhen you change class, you cannot change again until after a few battles. Choose wisely."],
    ["Ability","Depending on what class your character is, you can use several abilities. Most abilities are not available until you gain at least one level from the corresponding Element."],
    ["Saving","The game is saved to your browser's local storage periodically."],
    ["About Axion","Axion is created by Michael Goff. It is inspired by the classic JPRG genre. Programming is in JavaScript and graphics are done with WebGL, using the three.js framework. This version is a demo."],
    ["Image Credits I","Most images via OpenGameArt.\n\nOverworld Tiles, by Buch; committer and creative consultant Jeffrey Kern. Licensed CC-BY.\nhttps://opengameart.org/users/buch\n\nRPG Character Sprites, by GrafxKid. Licensed CC0.\nhttps://opengameart.org/content/rpg-character-sprites\n\nRPG GUI Selection Arrow, by INFECTiON656. Licensed CC0.\nhttps://opengameart.org/content/rpg-gui-selection-arrow\n\nLPC Beetle, by Stephen \"Redshrike\" Challener. Licensed CC-BY 3.0, CC-BY-SA 3.0, GPL 2.0, OGA-BY 3.0.\nhttps://opengameart.org/content/lpc-beetle"],
    ["Image Credits II","8-Bit Adventures RPG Game Art, by Joshua Hallaran. Licensed OGA-BY 3.0.\nhttps://opengameart.org/content/\n8-bit-adventures-rpg-game-art\n\nOverworld Tiles, by Kemono. Licensed CC-BY-SA 3.0.\nhttps://opengameart.org/content/overworld-tiles-1\n\nDungeon Crawl 32X32 Tiles, maintained by Chris Hamons. Licensed CC0.\nhttps://opengameart.org/content/\ndungeon-crawl-32x32-tiles\n\nOld Frogatto Tile Art, by Guido Bos. Licensed CC0.\nhttps://opengameart.org/content/old-frogatto-tile-art\n\n10 AIM/Targets, by Matriax. Licensed CC0.\nhttps://opengameart.org/content/10-aimtargets"],
    ["Image Credits III","Tent Rework, by bluecarrot16, Sharm (Lanea Zimmerman), William Thompson, xhunterko, Jordan Irwin (AntumDeluge). Licensed CC-BY 3.0, GPL 3.0, GPL 2.0, OGA-BY 3.0.\nhttps://opengameart.org/node/77510\n\nFarming tilesets, magic animations and UI elements, by Daniel Eddeland. Licensed CC-BY-SA 3.0, GPL 3.0.\nhttps://opengameart.org/content/\nlpc-farming-tilesets-magic-animations-and-ui-elements\n\nTricolor NES RPG Character Sprite Sheets, by Ctskelgysth Inauaruat. Licensed CC-BY 4.0, OGA-BY 3.0\nhttps://opengameart.org/content/\ntricolor-nes-rpg-character-sprite-sheets"],
    ["Image Credits IV","48 animated old school RPG characters (16x16), by Trent Gamblin. Licensed CC-BY 3.0, GPL 3.0, GPL 2.0.\nhttps://opengameart.org/content/\n48-animated-old-school-rpg-characters-16x16\n\nPainterly Spell Icons, by J. W. Bjerk (eleazzaar). Licensed CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0, GPL 2.0.\nwww.jwbjerk.com/art\nhttps://opengameart.org/content/\npainterly-spell-icons-part-1\nhttps://opengameart.org/content/\npainterly-spell-icons-part-2\nhttps://opengameart.org/content/\npainterly-spell-icons-part-3\nhttps://opengameart.org/content/\npainterly-spell-icons-part-4"],
    ["Image Credits V","Button the Icon Web, from Pixabay.\nhttps://pixabay.com/vectors/\nbutton-the-button-icon-web-pages-850099/"]
];
