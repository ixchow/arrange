var currentAudio;
var currentSynth;
var volume;
var music_master;

exports = {
	init: function() {
		volume = engine.localstorage.float("music_volume", 0.6);
		music_master = 	T('+', { mul: volume() });
		music_master.play();
		volume(function(v) {
			music_master.set({mul: v});
		});
	},
	play: function(music, synth) {
		if (currentAudio) currentAudio.stop();
		if (currentAudio) currentAudio.removeAll();
		if (currentSynth) currentSynth.removeAll();
		music_master.removeAll();

		currentAudio = music;
		currentSynt = synth;

		synth.in.removeFrom(music);
		music.append(synth.in);

		synth.out.removeFrom(music_master);
		music_master.append(synth.out);
		music.start();
	},
	toggleMute: function() {
		if (volume() > 0.5) {
			volume(0);
		} else {
			volume(0.6);
		}
	}
};