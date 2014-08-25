function StartScene() {
	return this;
}

StartScene.prototype.enter = function() {
	game.tiles.linkTiles();
};

StartScene.prototype.update = function(elapsed) {
	var name = window.location.search.substr(1);
	if (name.split('.').pop() in game.levels) {
		console.log("Warping to level '" + name + "'");
		engine.CurrentScene = new game.ArrangeScene(name);
	} else {
		engine.CurrentScene = new game.ArrangeScene('morning');
	}
};

exports = StartScene;
