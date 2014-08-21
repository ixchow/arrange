// Example from http://mohayonao.github.io/timbre.js/khoomii.html

var formants = {
  a:[700, 1200, 2900],
  i:[300, 2700, 2700],
  u:[390, 1200, 2500],
  e:[450, 1750, 2750],
  o:[460,  880, 2800]
};

exports = function(synth) {
	if (!synth.f1 || !synth.f2 || !synth.f3) {
		throw "khoomii music requires vowels synth";
	}
	return T("interval", {interval:1250}, function() {
	  var f = formants["aiueo"[(Math.random()*5)|0]];
	  synth.f1.freq.linTo(f[0], 150);
	  synth.f2.freq.linTo(f[1], 150);
	  synth.f3.freq.linTo(f[2], 150);
	}).set({buddies:synth.out});
}

