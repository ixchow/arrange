var Tile = function(params) {
	for (n in params) {
		this[n] = params[n];
	}
	return this;
};

Tile.prototype.emit = function() {
	if (typeof(this.mesh) == 'string') {
		this.mesh = meshes.tiles[this.mesh];
	}
	this.mesh.emit();
};

//Directions are e,n,w,s
var dir = {
	e:0,
	n:1,
	w:2,
	s:3,
};
var o = {
	low: 1 << 0,
	high:1 << 1,
};
exports = {
	//Path tiles have an entrance to the west in their default orientation.
	PathStart: new Tile({
		mesh:'path_start',
		pathOut:dir.e,
		needClear:o.low | o.high
	}),
	PathEnd: new Tile({
		mesh:'path_end',
		pathIn:dir.w,
		needClear:o.low | o.high
	}),
	PathStraight: new Tile({
		mesh:'path_straight',
		pathIn:dir.w,
		pathOut:dir.e,
		needClear:o.low | o.high
	}),
	PathLeft: new Tile({
		mesh:'path_left',
		pathIn:dir.w,
		pathOut:dir.n,
		needClear:o.low | o.high
	}),
	PathRight: new Tile({
		mesh:'path_straight',
		pathIn:dir.w,
		pathOut:dir.s,
		needClear:o.low | o.high
	}),
	Pillar: new Tile({
		mesh:'pillar',
		fill:o.low | o.high
	})
};
