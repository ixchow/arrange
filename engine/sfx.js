
exports = function(wave, start_freq, end_freq, attack, decay, vib_freq, vib_effect) {
	// var wave = ['sin', 'saw', 'tri', 'square', 'fnoise'][4];
	// var start_freq = 440;
	// var end_freq = 880;
	// var attack = 0;
	// var decay = 400;

	var len = attack + decay;

  var f = T('+', 
		T('param', {value: start_freq}).expTo(end_freq, len + 'ms'),
		T('sin', {freq: vib_freq, mul: vib_effect})
	);
	var n = T(wave, {freq: f});

	var env   = T("adsr", {a: attack, d:decay, s:0, r:0}, n);
	env.play().bang();
}
