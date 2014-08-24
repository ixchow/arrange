exports = function() {
	var tileMap = {
		S: game.tiles.PathStart,
		E: game.tiles.PathEnd,
		P: game.tiles.Pillar,
		'|': game.tiles.PathStraight
	};
	
	var txt = "";
	txt += ".. .. S1 P1 .. ..\n";
	txt += ".. .. |1 P1 P1 ..\n";
	txt += ".. |3 .. P1 P1 ..\n";
	txt += ".. .. E2 P2 P2 ..\n";
	txt += ".. .. P1 P1 P2 ..\n";
	txt += ".. .. .. .. .. ..\n";
	txt += ".. .. .. P3 .. ..\n";
	txt += ".. .. P3 P3 P3 ..\n";
	txt += ".. .. .. P3 .. ..\n";
	
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
			groups[t[1]].tiles.push({ tile: tileMap[t[0]], r: 0, at: pt});
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