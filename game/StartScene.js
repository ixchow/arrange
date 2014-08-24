function StartScene() {
	return this;
}

StartScene.prototype.update = function(elapsed) {
	var name = window.location.search.substr(1);
	if (name in game.levels) {
		console.log("Warping to level '" + name + "'");
		engine.CurrentScene = new game.ArrangeScene(game.levels[name]);
	} else {
		engine.CurrentScene = new game.ArrangeScene(game.levels.school);
	}
};

exports = StartScene;
