exports = function(tileMap, txt) {
	var groups = {};
	var rows = txt.trim().split('\n');
	var y = (rows.length / 2) | 0;
	var xt = rows.map(function (yt) {
		var x = -1;
		--y;
		return yt.split(' ').map(function(t) {
			x++;
			if (t == '..') return null;
			if (!groups[t[1]]) {
				groups[t[1]] = { tiles: [], r: 0 };
			}
			if (t[1] == '.') {
				groups[t[1]].fixed = true;
			}
			if (!groups[t[1]].at) {
				groups[t[1]].at = { x: x, y: y };
			}
			var pt = { x: x - groups[t[1]].at.x, y: y - groups[t[1]].at.y };
			var tile = tileMap[t[0]];
			if (!tile) {
				throw new Error(t);
			}
			groups[t[1]].tiles.push({ tile: tile.t, r: tile.r, at: pt});
		});
	});
	
	var newArray = []
	for (var key in groups) {
	    newArray.push(groups[key]);
	}
	
	return newArray;
};
