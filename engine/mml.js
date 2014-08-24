// Returns a music object given an MML input string

exports = function(mml) {
	mml = mml.replace(/\n/g, ' ');
  mml = mml.toLowerCase();
  mml = mml.replace(/p/g, 'r');
	var mmls = mml.split(';');
	return function(synth) {
		var gen = T("mml", {mml: mmls}, synth.in);
		gen.on('ended', function() {
			gen.stop();
			gen.start();
		});
		return gen;
  };
}
