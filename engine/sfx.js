var sfx_master;
var volume;

exports = function(wave, start_freq, end_freq, attack, decay, vib_freq, vib_effect) {
	// var wave = ['sin', 'saw', 'tri', 'square', 'fnoise'][4];
	// var start_freq = 440;
	// var end_freq = 880;
	// var attack = 0;
	// var decay = 400;

	var len = attack + decay;

	var fp = T('param', {value: start_freq});
  var f = T('+', 
		fp,
		T('sin', {freq: vib_freq, mul: vib_effect})
	);
	var n = T(wave, {freq: f});

	var env   = T("adsr", {a: attack, d:decay, s:0, r:0}, n);
	env.on('bang', function() {
		fp.set({value: start_freq}).expTo(end_freq, len + 'ms');
	});

	sfx_master.append(env);
	return env;
}

exports.init = function() {
	volume = engine.localstorage.float('sfx_volume', 1);
	sfx_master = 	T('+', { mul: volume() });
	sfx_master.play();
	volume(function(v) {
		sfx_master.set({mul: v});
	});
}

exports.destroy = function(sfx) {
	sfx_master.remove(sfx);
}

exports.toggleMute = function() {
	if (volume() > 0) {
		volume(0);
	} else {
		volume(1);
	}
}