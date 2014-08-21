exports = {
	play: function(music, synth) {
		exports = music(synth).start();
	}
};