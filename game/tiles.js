var Tile = function(params) {
	for (n in params) {
		this[n] = params[n];
	}
	return this;
};

Tile.prototype.emit = function() {
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

/* How conflicts between tiles work:
 *
 * - Only one tile may have a given 'fill' bit set in a stack.
 * - If any tile in a stack has a 'needClear' bit set, no tile may have the
 *   corresponding 'fill' bit set.
 *
 * So a low table might fill o.low, while a path might needClear: o.low | o.high
 *
 * It is possible to have tiles that have problems in the same stack as tiles
 *   that don't have problems.
 *
 * Paths are handled 
 *
 */

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
	Pillar: new Tile({
		mesh:'pillar',
		fill:o.low | o.high
	}),
	Blackboard: new Tile({
		mesh:'wall',
		fill: o.high
	}),
	Wall: new Tile({
		mesh:'wall',
		fill: o.high | o.low,
	}),
	Chair: new Tile({
		mesh:'chair',
		fill:o.low,
		requires: { n: 'desk' }
	}),
	HamsterCage: new Tile({
		mesh:'hamster_cage',
		fill:o.low | o.high,
		requires: { c: 'hamster' }
	}),
	Hamster: new Tile({
		mesh:'hamster',
		provides: { c: 'hamster' }
	}),
	Desk: new Tile({
		mesh:'desk',
		fill:o.low | o.high,
		provides: { n: 'desk', s: 'desk', e: 'desk', w: 'desk' }
	}),
	SmallDesk: new Tile({
		mesh:'small_desk',
		fill:o.low | o.high
	}),
	Bed: new Tile({
		mesh:'desk',
		fill:o.low,
	})
};

exports.linkTiles = function() {
	for (var tn in exports) {
		var t = exports[tn];
		if (t instanceof Tile) {
			//hook up meshes:
			if (typeof(t.mesh) == 'string') {
				var name = t.mesh;
				t.mesh = meshes.tiles[name];
				if (t.mesh === undefined) {
					throw "Missing tile mesh '" + name + "'";
				}
			}
		}
	}
	exports.linkTiles = function () { };
};
