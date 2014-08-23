var synth = T("SynthDef", {mul:0.45, poly:64});

synth.def = function(opts) {
	var f = opts.freq / 2;
	var a = T('osc', {wave: 'tri', freq:f, mul: 0.4});
	var b = T('osc', {wave: 'sin', freq:f*2*1.003, mul: 0.4});
	var c = T('osc', {wave: 'sin', freq:f*1.005, mul: 0.2});

	a = T("pan", {pos:T("sin", {freq:T("param", {value:0.1}).expTo(100, "30sec"), kr:true})}, a);

	var env = T("adsr", {a: 10}, a, b, c);
  return env.on("ended", opts.doneAction).bang();
};

var master = synth;

exports = {
	in: synth,
	out: master
};
