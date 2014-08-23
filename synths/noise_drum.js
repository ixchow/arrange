var synth = T("SynthDef", {mul:0.45, poly:2});

synth.def = function(opts) {
	var n = T("fnoise", {freq:opts.freq, mul:0.7});
	var w = T("noise", {freq:opts.freq, mul:0.2});
	var env   = T("adsr", {a: 100, d:200, s:0, r:100}, n);
	return env.on("ended", opts.doneAction).bang();
};

var master = synth;
master = T("reverb", master);

exports = {
	in: synth,
	out: master
};
