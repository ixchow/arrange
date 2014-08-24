var currentAudio;
var isMuted;

exports = {
	init: function() {
		isMuted = engine.localstorage.bool("mute");
	},
	play: function(music, synth) {
		currentAudio = music(synth);
		if (!isMuted()) {
			currentAudio.start();
		}
	},
	isMuted: function() {
		return isMuted();
	},
	mute: function() {
		isMuted(true);
		if (!currentAudio) return;
		currentAudio.stop();
	},
	unmute: function() {
		isMuted(false);
		if (!currentAudio) return;
		currentAudio.start();
	},
	toggleMute: function() {
		if (isMuted()) {
			this.unmute();
		} else {
			this.mute();
		}
	}
};