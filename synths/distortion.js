var synth = T("SynthDef", {mul:0.45, poly:8});

synth.def = function(opts) {
	var f = opts.freq / 2;
	var a = T('osc', {wave: 'saw', freq:f, mul: 0.4});
	var b = T('osc', {wave: 'saw', freq:f*2*1.003, mul: 0.4});
	var c = T('osc', {wave: 'saw', freq:f*1.005, mul: 0.2});

	var env = T("adsr", {a: 10, d: 100, s: 0.2, r: 300}, a, b, c);
  return env.on("ended", opts.doneAction).bang();
};

var master = synth;
master = T('dist', master);

exports = {
	in: synth,
	out: master
};
