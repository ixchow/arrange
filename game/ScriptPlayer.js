function ScriptPlayer(script) {
	this.script = script;
	this.pawnState = {};
	this.signals = {};
	for (var name in this.script) {
		this.pawnState[name] = {
			actionIdx:0
		};
	}
	return this;
}


ScriptPlayer.prototype.update = function(elapsed) {
};

ScriptPlayer.prototype.draw = function(MVP) {
	var s = gl.getParameter(gl.CURRENT_PROGRAM);
	for (var name in this.pawnState) {
		var ps = this.pawnState[name];
		if (ps.at) {
			var xf = new Mat4(
				0.5, 0.0, 0.0, 0.0,
				0.0, 0.5, 0.0, 0.0,
				0.0, 0.0, 0.5, 0.0,
				at.x, at.y, 0.0, 1.0
			);
			gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
			this.script.pawns[name].mesh.emit();
		}
	}
};

ScriptPlayer.prototype.isFinished = function() {
	return true;
};

ScriptPlayer.prototype.skip = function() {
};

ScriptPlayer.prototype.advance = function() {
};

exports = ScriptPlayer;
