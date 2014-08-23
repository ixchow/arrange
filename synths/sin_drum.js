var synth = T("SynthDef", {mul:0.45, poly:2});

synth.def = function(opts) {
	var n = T("sin", {freq:opts.freq});
	var env   = T("adsr", {a: 0, d:100, s:0, r:0}, n);
	return env.on("ended", opts.doneAction).bang();
};

var master = synth;

exports = {
	in: synth,
	out: master
};
