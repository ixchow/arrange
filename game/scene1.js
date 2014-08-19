exports = function() {
	return this;
}

exports.prototype.tick = function() {
	console.log('tick');
};

exports.prototype.init = function() {
	var synth = flock.synth({
	    synthDef: {
	        id: "carrier",
	        ugen: "flock.ugen.sinOsc",
	        freq: 440,
	        mul: {
	            id: "mod",
	            ugen: "flock.ugen.sinOsc",
	            freq: 1.0,
	            mul: 0.25
	        }
	    }
	});
  synth.play();
}
