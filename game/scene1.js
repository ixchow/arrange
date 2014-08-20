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
			ugen: "flock.ugen.triOsc",
			freq: {
				ugen: "flock.ugen.value",
				value: 440,
				add: {
					ugen: "flock.ugen.sin",
					freq: 5,
					mul: 100
				}
			},
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
