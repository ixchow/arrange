// Example from http://mohayonao.github.io/timbre.js/khoomii.html

var freq, synth, f1, f2, f3;

freq = 174.61412048339844;
freq = T("+.kr", freq, T("sin.kr", {freq:3, mul:0.8}));

synth = T("saw", {freq:freq});

f1 = T("bpf", {freq:T("param", {value: 700}), Q:9}, synth);
f2 = T("bpf", {freq:T("param", {value:1200}), Q:9}, synth);
f3 = T("bpf", {freq:T("param", {value:2900}), Q:9}, synth);
synth = T("+", f1, f2, f3);
synth = T("bpf", {freq:3200, Q:0.5}, synth);

exports = {
	in: synth,
	out: synth,
	f1: f1,
	f2: f2,
	f3: f3
};
