//Path tiles have an entrance to the west in their default orientation.
var PathStart = {
};
var PathEnd = {
};
var PathStraight = {
};
var PathLeft = {
};
var PathRight = {
};

var Block = {
};

//Rotations are 0,1,2,3 corresponding to rotating CC in 90-degree increments.
//rot() performs rotations around the center of tile (0,0)
function rot(r, pt) {
	if (r < 0) r = (r % 4) + 4;
	else if (r >= 4) r = r % 4;

	if (r == 0) {
		return {x:pt.x, y:pt.y};
	} else if (r == 1) {
		return {x:-pt.y, y:pt.x};
	} else if (r == 2) {
		return {x:-pt.x, y:-pt.y};
	} else if (r == 3) {
		return {x:pt.y, y:-pt.x};
	}
}

var ArrangeScene = function(level) {
	//TODO: actually load level from level.
	this.fragments = [
		{
			offset:{x:0, y:0}, r:0,
			tiles:[
				{at:{x:0,y:0},r:0, tile:PathStart},
				{at:{x:1,y:1},r:0, tile:Block}
			]
		},
		{
			offset:{x:10, y:10}, r:0,
			tiles:[
				{at:{x:0,y:0},r:1, tile:PathEnd},
				{at:{x:0,y:0},r:1, tile:Block},
			]
		}
	];

	this.currentFragment = null;

	this.buildCombined();

	return this;
};

ArrangeScene.prototype.buildCombined = function() {
	//Splat all fragments into this.combined (a rectangular grid)

	//First figure out the size of grid we need:
	var min = {x:Infinity, y:Infinity};
	var max = {x:-Infinity, y:-Infinity};
	fragments.forEach(function(f){
		f.tiles.forEach(function(t){
			var at = rot(f.r, t.at);
			at.x += f.at.x;
			at.y += f.at.y;
			min.x = Math.min(min.x, at.x);
			min.y = Math.min(min.y, at.y);
			max.x = Math.max(max.x, at.x);
			max.y = Math.max(max.y, at.y);
		});
	});

	//Allocate the grid:
	if (min.x > max.x || min.y > max.y) {
		this.combined = [];
		this.combined.min = {x:0, y:0};
		this.combined.size = {x:0, y:0};
		return;
	}
	this.combined = Array((max.x - min.x + 1) * (max.y - min.y + 1));
	this.combined.min = min;
	this.combined.size = {x:max.x - min.x + 1, y:max.y - min.y + 1};

	this.combined.index = function(at) {
		return (at.y - this.min.y) * this.size.x + (at.x - this.min.x);
	};

	//Each cell of combined stores a list of tiles:
	for (var i = 0; i < this.combined.length; ++i) {
		this.combined[i] = [];
	}

	//Fill in the lists:
	var combined = this.combined;
	fragments.forEach(function(f){
		f.tiles.forEach(function(t){
			var at = rot(f.r, t.at);
			at.x += f.at.x;
			var r = (t.r + f.r) % 4;

			var idx = combined.index(at);
			combined[idx].push({at:at, r:r, tile:t.tile});
		});
	});

	//TODO: check consistency
};

ArrangeScene.prototype.draw = function() {
	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
};


exports = ArrangeScene;
