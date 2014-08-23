
exports = function(wave, start_freq, end_freq, attack, decay) {
	// var wave = ['sin', 'saw', 'tri', 'square', 'fnoise'][4];
	// var start_freq = 440;
	// var end_freq = 880;
	// var attack = 0;
	// var decay = 400;

	var len = attack + decay;

	var n = T(wave, {freq: T('param', {value: start_freq}).expTo(end_freq, len + 'ms')});

	var env   = T("adsr", {a: attack, d:decay, s:0, r:0}, n);
	env.play().bang();
}
