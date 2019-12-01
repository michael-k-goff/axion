// Keyboard management
keys = {"ArrowLeft":0,"ArrowRight":0,"ArrowDown":0,"ArrowUp":0}
document.addEventListener('keydown',function(evt) {
	key_dict = {"w":"ArrowUp","W":"ArrowUp","a":"ArrowLeft","A":"ArrowLeft","s":"ArrowDown",
		"S":"ArrowDown","d":"ArrowRight","D":"ArrowRight"};
	var key = evt.key;
	if (key_dict[key]) {key = key_dict[key];}
	var was_down = keys[key];
	keys[key] = 1;
	if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].indexOf(key) > -1) {
		evt.preventDefault();
	}
	if (!(was_down)) {
		state_system.process_key(key);
	}
	if (was_down && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].indexOf(key) > -1) {
		state_system.process_key({"ArrowLeft":"RepeatLeft","ArrowRight":"RepeatRight",
			"ArrowUp":"RepeatUp","ArrowDown":"RepeatDown"}[key]);
	}
}, false)

document.addEventListener('keyup',function(evt) {
	key_dict = {"w":"ArrowUp","W":"ArrowUp","a":"ArrowLeft","A":"ArrowLeft","s":"ArrowDown",
		"S":"ArrowDown","d":"ArrowRight","D":"ArrowRight"};
	var key = evt.key;
	if (key_dict[key]) {key = key_dict[key];}
	keys[key] = 0;
}, false)
