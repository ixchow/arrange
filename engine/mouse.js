var isDown = false;

function send(e) {
	engine.CurrentScene.mouse && engine.CurrentScene.mouse(e.x, e.y, isDown);
}

exports = {
	move: function(e) {
		send(e);
	},
	down: function(e) {
		isDown = true;
		send(e);
	},
	up: function(e) {
		isDown = false;
		send(e);
	}
}