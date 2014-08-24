exports = function() {
	var tileMap = {
		">": { r:0, t: game.tiles.PathStart },
		"^": { r:1, t: game.tiles.PathStart },
		"<": { r:2, t: game.tiles.PathStart },
		"v": { r:3, t: game.tiles.PathStart },
		"D": { r:0, t: game.tiles.PathEnd },
		"n": { r:1, t: game.tiles.PathEnd },
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
	};

	var txt = "";
	txt += "[. ~. ~. ~. n. ].\n";
	txt += "[. b. b. r. J. ].\n";
	txt += "[. b. b. |. .. ].\n";
	txt += "[. >. -. J. .. ].\n";
	txt += "[. _. _. _. _. ].\n";

	var morning = game.buildLevel(tileMap, txt);

	/*
		enterScript returns an animation that plays when starting the level;
		it has access to 'arrange' -- the level as a wholelevel fragments as generated.
	*/
	morning.enter = function(arrange, storyState) {
		return {
			pawn:{
				mesh:meshes.characters.pawn,
				actions:[
					{appear:{x:1,y:1}},
					{say:"I remember getting out of bed..."},
					{vanish:null},
					{emit:"next"},
				]
			},
			pawn2:{
				mesh:meshes.characters.pawn,
				actions:[
					{wait:"next"},
					{appear:{x:4,y:3}},
					{say:"...and walking out the door..."},
					{vanish:null}
				]
			}
		};
	};

	morning.leave = function(arrange, storyState) {
		return {
			pawn:{
				mesh:meshes.characters.pawn,
				actions:[
					{appear:{x:1,y:1}},
					{say:"I should be walking this path"},
					{vanish:null},
				]
			}
		};
	};

	
	return morning;
};
