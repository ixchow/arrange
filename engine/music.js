var currentAudio;
var volume;
var music_master;

exports = {
	init: function() {
		volume = engine.localstorage.float("music_volume", 0.6);
		music_master = 	T('+', { mul: volume() });
		console.log(volume());
		music_master.play();
		volume(function(v) {
			music_master.set({mul: v});
		});
	},
	play: function(music, synth) {
		if (currentAudio) currentAudio.stop();
		if (currentAudio) music_master.remove(currentAudio);
		currentAudio = music(synth);
		music_master.append(synth.out);
		currentAudio.start();
	},
	toggleMute: function() {
		if (volume() > 0.5) {
			volume(0);
		} else {
			volume(0.6);
		}
	}
};