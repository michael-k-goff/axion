// Set up HUD

class HUDManager { // Manages the heads-up display. Is not Ben Carson.
	constructor() {
		// Set up the canvas for display
		this.hudCanvas = document.createElement('canvas');
		this.hudCanvas.width = window.innerWidth;
		this.hudCanvas.height = window.innerHeight;
		this.hudBitmap = this.hudCanvas.getContext('2d');
		// Set up camera and scene
		this.cameraHUD = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0, 30 );
/*		this.sceneHUD = new THREE.Scene();
		this.hudTexture = new THREE.Texture(this.hudCanvas);
        //this.hudTexture.magFilter = THREE.NearestFilter;
		this.hudTexture.minFilter = THREE.LinearFilter;
		this.hudTexture.needsUpdate = true;
		this.hud_material = new THREE.MeshBasicMaterial( {map: this.hudTexture} );
		this.hud_material.transparent = true;
		this.planeGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
		this.plane = new THREE.Mesh( this.planeGeometry, this.hud_material );*/
		//this.sceneHUD.add( this.plane );
	}
	clear() {
		this.hudBitmap.restore(); // This line appears to fix the clipping bug.
		this.hudBitmap.save();
		this.hudBitmap.beginPath();
		this.hudBitmap.rect(-5,-5,-5,-5);
		this.hudBitmap.closePath();
		this.hudBitmap.clip();
		this.hudBitmap.restore();
		this.hudBitmap.clearRect(0, 0, window.innerWidth, window.innerHeight);
		this.hudBitmap.imageSmoothingEnabled = false;
		// Remove objects for memory purposes
		if (this.rendered) {
			this.rendered = 0;
			this.hudTexture.dispose();
			this.hud_material.dispose();
			this.planeGeometry.dispose();
		}
	}
	render() {
		// Cleanup
		this.rendered = 1;
		// Set up camera and scene
		if (this.sceneHUD) {
			this.sceneHUD.dispose();
		}
		this.sceneHUD = new THREE.Scene();
		this.hudTexture = new THREE.Texture(this.hudCanvas);
        //this.hudTexture.magFilter = THREE.NearestFilter;
		this.hudTexture.minFilter = THREE.LinearFilter;
		this.hudTexture.needsUpdate = true;
		this.hud_material = new THREE.MeshBasicMaterial( {map: this.hudTexture} );
		this.hud_material.transparent = true;
		this.planeGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
		this.plane = new THREE.Mesh( this.planeGeometry, this.hud_material );
		// Older stuff
		this.sceneHUD.add( this.plane );
		renderer.render(this.sceneHUD, this.cameraHUD);
	}
}
hud_manager = new HUDManager();
