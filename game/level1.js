exports = function() {
	var tileMap = {
		S: { r: 2, t: game.tiles.PathStart },
		E: { r: 0, t: game.tiles.PathEnd },
		P: { r: 0, t: game.tiles.Pillar },
		'|': { r: 1, t: game.tiles.PathStraight },
		'-': { r: 0, t: game.tiles.PathStraight },
		'{': { r: 3, t: game.tiles.PathLeft },
		'[': { r: 2, t: game.tiles.PathLeft },
		']': { r: 1, t: game.tiles.PathLeft },
		H: { r: 0, t: game.tiles.HamsterCage },
		h: { r: 0, t: game.tiles.Hamster },
		D: { r: 0, t: game.tiles.Desk },
		B: { r: 0, t: game.tiles.Pillar },
		d: { r: 0, t: game.tiles.SmallDesk },
		c: { r: 0, t: game.tiles.Chair },
		k: { r: 0, t: game.tiles.Pillar }
	};
	
	var txt = "";
	txt += "H5 .. B1 B1 B2 B2 .. .. .. ..\n";
	txt += "{5 -5 D1 D1 D1 .. {4 -4 -. E.\n";
	txt += "h1 .. D1 D1 D1 .. |4 .. .. ..\n";
	txt += ".. .. -6 -6 -6 -6 ]4 .. .. ..\n";
	txt += "|. d. .. .. c3 .. .. .. k. ..\n";
	txt += "|. .. .. .. .. .. .. .. k. ..\n";
	txt += "|. d. .. d2 .. d2 .. .. k. ..\n";
	txt += "[. S. .. .. .. .. .. .. k. ..\n";
	txt += ".. .. .. .. d3 .. d3 .. .. ..\n";
	
	var groups = {};
	var y = -1;
	var xt = txt.trim().split('\n').map(function (yt) {
		var x = -1;
		y++;
		return yt.split(' ').map(function(t) {
			x++;
			if (t == '..') return null;
			if (!groups[t[1]]) {
				groups[t[1]] = { tiles: [], r: 0 };
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
	
	// return [
	// {
	// 	at:{x:0, y:0}, r:0,
	// 	tiles:[
	// 		{at:{x:0,y:0},r:0, tile:game.tiles.PathStart},
	// 		{at:{x:1,y:1},r:0, tile:game.tiles.Pillar}
	// 	]
	// },
	// {
	// 	at:{x:1, y:2}, r:0,
	// 	tiles:[
	// 		{at:{x:0,y:0},r:1, tile:game.tiles.Pillar},
	// 		{at:{x:1,y:0},r:1, tile:game.tiles.PathEnd},
	// 	]
	// }
// ];
};

// console.log(exports());