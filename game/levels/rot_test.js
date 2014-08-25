exports = function() {
	var tileMap = {
		">": { r:0, t: game.tiles.PathStart, tag:"bed" },
		"^": { r:1, t: game.tiles.PathStart },
		"<": { r:2, t: game.tiles.PathStart },
		"v": { r:3, t: game.tiles.PathStart },
		"D": { r:0, t: game.tiles.PathEnd },
		"n": { r:1, t: game.tiles.PathEnd, tag:"exit" },
		"C": { r:2, t: game.tiles.PathEnd },
		"u": { r:3, t: game.tiles.PathEnd },
		"-": { r:0, t: game.tiles.PathStraight },
		"|": { r:1, t: game.tiles.PathStraight },
		"J": { r:0, t: game.tiles.PathLeft },
		",": { r:1, t: game.tiles.PathLeft },
		"r": { r:2, t: game.tiles.PathLeft },
		"L": { r:3, t: game.tiles.PathLeft },
		"X": { r:0, t: game.tiles.Pillar },
		"b": { r:0, t: game.tiles.Bed },
		"~": { r:0, t: game.tiles.Wall },
		"[": { r:1, t: game.tiles.Wall },
		"_": { r:2, t: game.tiles.Wall },
		"]": { r:3, t: game.tiles.Wall },
		"&": { r:0, t: game.tiles.Desk, pivot:true},
	};

	var txt = "";
	txt += "[. r0 -0 -0 ,1 X1 |1 r2 J2 L2 ].\n";
	txt += ">. J0 &0 r0 J1 &1 L1 L2 &2 r2 D.\n";
	txt += "[. r0 ,0 L0 -1 -1 -1 -2 -2 J2 ].\n";

	var level = game.buildLevel(tileMap, txt);

	level.addScriptTriggers = function(arrange) {
	};

	return level;
};
