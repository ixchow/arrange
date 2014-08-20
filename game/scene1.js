exports = function() {
	return this;
}

exports.prototype.tick = function() {
	console.log('tick');
};

exports.prototype.init = function() {
	var musicName = ['gymnopedie', 'khoomii'][Math.floor(Math.random()*2)];
	music[musicName].start();
}
