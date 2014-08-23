var currentAudio;
var isMuted = false;

exports = {
	play: function(music, synth) {
		currentAudio = music(synth);
		currentAudio.start();
	},
	isMuted: function() {
		return isMuted;
	},
	mute: function() {
		isMuted = true;
		if (!currentAudio) return;
		currentAudio.stop();
	},
	unmute: function() {
		isMuted = false;
		if (!currentAudio) return;
		currentAudio.start();
	},
	toggleMute: function() {
		if (isMuted) {
			this.unmute();
		} else {
			this.mute();
		}
	}
};