var Tile = function(params) {
	for (n in params) {
		this[n] = params[n];
	}
	return this;
};

//Eventually tiles will have their own meshes.
Tile.prototype.emit = function() {
	if (typeof(this.mesh) == 'string') {
		this.mesh = meshes.tiles[this.mesh];
	}
	this.mesh.emit();
};

exports = {
	//Path tiles have an entrance to the west in their default orientation.
	PathStart: new Tile({ mesh:'path_start' }),
	PathEnd: new Tile({ mesh:'path_end' }),
	PathStraight: new Tile({ mesh:'path_straight' }),
	PathLeft: new Tile({ }),
	PathRight: new Tile({ }),
	Pillar: new Tile({ mesh:'pillar' })
};
