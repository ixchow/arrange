exports = function() {
	var tileMap = {
		S: game.tiles.PathStart,
		E: game.tiles.PathEnd,
		P: game.tiles.Pillar
	};
	
	var txt = "";
	txt += ".. .. S1 P1 P2 E2\n";
	txt += ".. .. P1 P1 P1 ..\n";
	
	var groups = {};
	var y = -1;
	var xt = txt.trim().split('\n').map(function (yt) {
		var x = 0;
		y++;
		return yt.split(' ').map(function(t) {
			if (t == '..') return null;
			if (!groups[t[1]]) {
				groups[t[1]] = { tiles: [], r: 0 };
			}
			var pt = { x: x++, y: y };
			if (!groups[t[1]].at) {
				groups[t[1]].at = pt;
			}
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