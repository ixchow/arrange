var currentAudio;

exports = {
	play: function(music, synth) {
		currentAudio = music(synth);
		currentAudio.start();
	},
	mute: function() {
		if (!currentAudio) return;
		currentAudio.stop();
	},
	unmute: function() {
		if (!currentAudio) return;
		currentAudio.start();
	}
};