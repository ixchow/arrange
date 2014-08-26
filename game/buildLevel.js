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
				groups[t[1]] = { tiles: [], r: 0, pivots: [] };
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
				console.error("Can't parse: " + t);
				throw new Error(t);
			}
			//copy all properties from the tilemap (will get 'tag:' if it exists)
			var tileClone = {
				at:pt,
				r:tile.r,
				tile:tile.t
			};
			if (tile.tag) {
				tileClone.tag = tile.tag;
			}
			if (tile.pivot) {
				groups[t[1]].pivots.push({x:pt.x, y:pt.y});
				//tileClone.pivot = tile.pivot;
			}
			groups[t[1]].tiles.push(tileClone);
		});
	});
	
	var fragments = []
	for (var key in groups) {
	    fragments.push(groups[key]);
	}

	return {
		fragments:fragments
	};
};
