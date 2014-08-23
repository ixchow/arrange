// Example from http://mohayonao.github.io/timbre.js/satie.html

// var env   = T("adsr", {d:3000, s:0, r:600});
var synth = T("SynthDef", {mul:0.45, poly:2});

synth.def = function(opts) {
	var f = opts.freq / 2;
	var a = T('osc', {wave: 'saw', freq:f});
	var b = T('osc', {wave: 'saw', freq:f*2*1.003});
	var c = T('osc', {wave: 'saw', freq:f*1.005});
	
	a = T("pan", {pos:T("sin", {freq:T("param", {value:0.1}).expTo(100, "30sec"), kr:true})}, a);
	
  // var op1 = T("osc", {wave: 'sin', freq:opts.freq*6, fb:0.25, mul:0.4});
  //
  // var op2 = T("osc", {wave: 'saw', freq:opts.freq, phase:op1, mul:opts.velocity/128});
	// var env   = T("adsr", {d:3000, s:0, r:600}, a, b, c);
	var env = T("+", a, b, c);
  return env.on("ended", opts.doneAction).bang();
};

var master = synth;
// var mod    = T("sin", {freq:2, add:3200, mul:800, kr:1});
// master = T("eq", {params:{lf:[800, 0.5, -2], mf:[6400, 0.5, 4]}}, master);
// master = T("phaser", {freq:mod, Q:2, steps:4}, master);
// master = T("delay", {time:"BPM60 L16", fb:0.65, mix:0.25}, master);

exports = {
	in: synth,
	out: master
};
