var synth = T("SynthDef", {mul:0.45, poly:2});

synth.def = function(opts) {
	var f = opts.freq / 2;
	var a = T('osc', {wave: 'saw', freq:f});
	var b = T('osc', {wave: 'saw', freq:f*2*1.003});
	var c = T('osc', {wave: 'saw', freq:f*1.005});
	
	a = T("pan", {pos:T("sin", {freq:T("param", {value:0.1}).expTo(100, "30sec"), kr:true})}, a);
	
	var env = T("+", a, b, c);
  return env.on("ended", opts.doneAction).bang();
};

var master = synth;

exports = {
	in: synth,
	out: master
};
