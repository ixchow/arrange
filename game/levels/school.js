exports = function() {
	var tileMap = {
		S: { r: 2, t: game.tiles.PathStart },
		E: { r: 0, t: game.tiles.PathEnd },
		P: { r: 0, t: game.tiles.Pillar },
		'|': { r: 1, t: game.tiles.PathStraight },
		'-': { r: 0, t: game.tiles.PathStraight },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
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

	return game.buildLevel(tileMap, txt);
};

// console.log(exports());
