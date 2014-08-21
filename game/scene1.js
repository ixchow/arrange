exports = function() {
	this.fade = 0.0;
	return this;
}

exports.prototype.update = function(elapsed) {
	this.fade += elapsed;
	if (this.fade > 1.0) this.fade = this.fade % 1.0;
};

exports.prototype.enter = function() {
  //JIM: let's not do this until we have mute available
	// engine.play(music.gymnopedie, synths.bells);
	// engine.play(music.khoomii, synths.vowels);
};

exports.prototype.draw = function() {
	gl.clearColor(0.0, 0.0, this.fade, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
};
