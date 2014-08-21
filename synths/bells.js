// Example from http://mohayonao.github.io/timbre.js/satie.html

var env   = T("adsr", {d:3000, s:0, r:600});
var synth = T("SynthDef", {mul:0.45, poly:8});

synth.def = function(opts) {
  var op1 = T("sin", {freq:opts.freq*6, fb:0.25, mul:0.4});
  var op2 = T("sin", {freq:opts.freq, phase:op1, mul:opts.velocity/128});
  return env.clone().append(op2).on("ended", opts.doneAction).bang();
};

var master = synth;
var mod    = T("sin", {freq:2, add:3200, mul:800, kr:1});
master = T("eq", {params:{lf:[800, 0.5, -2], mf:[6400, 0.5, 4]}}, master);
master = T("phaser", {freq:mod, Q:2, steps:4}, master);
master = T("delay", {time:"BPM60 L16", fb:0.65, mix:0.25}, master);

exports = {
	in: synth,
	out: master
};
