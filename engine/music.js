var currentAudio;
var isMuted = false;

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

if (supports_html5_storage) {
	isMuted = localStorage.getItem("mute");
}

exports = {
	play: function(music, synth) {
		currentAudio = music(synth);
		if (!isMuted) {
			currentAudio.start();
		}
	},
	isMuted: function() {
		return isMuted;
	},
	mute: function() {
		isMuted = true;
		if (supports_html5_storage) {
			isMuted = localStorage.setItem("mute", isMuted);
		}
		if (!currentAudio) return;
		currentAudio.stop();
	},
	unmute: function() {
		isMuted = false;
		if (supports_html5_storage) {
			isMuted = localStorage.setItem("mute", isMuted);
		}
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