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
	};

	var txt = "";
	txt += "[. ~. ~. ~. n. ].\n";
	txt += "[. b. b. r. J. ].\n";
	txt += "[. b. b. |. .. ].\n";
	txt += "[. >. -. J. .. ].\n";
	txt += "[. _. _. _. _. ].\n";

	var morning = game.buildLevel(tileMap, txt);

	var introScript = {
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

	var exitScript = {
		pawn:{
			mesh:meshes.characters.pawn,
			actions:[
				{appear:{x:1,y:1}},
				{say:"I should be walking this path"},
				{vanish:null},
			]
		}
	};

	var rot = game.utility.rot;

	function findTag(tag) {
		var found = undefined;
		this.fragments.some(function(f){
			f.tiles.some(function(t){
				if (t.tag == tag) {
					var dx = rot((f.r + t.r) % 4, {x:1, y:0});
					var dy = rot((f.r + t.r) % 4, {x:0, y:1});
					found = {
						x:dx.x * t.at.x + dy.x * t.at.y + f.at.x,
						y:dx.y * t.at.x + dy.y * t.at.y + f.at.y
					};
				}
				return found;
			});
			return found;
		});
		if (!found) {
			throw "Missing tag '" + tag + "'";
		}
		return found;
	}


	/*
		levels control cutscenes by embedding scripts in the level based
		 on level state -- e.g. a complete level might have a cutscene
		 that transitions to the next level.
	*/
	morning.addScriptTriggers = function(arrange) {
		var bedTag = findTag("bed");
		var exitTag = findTag("exit");

		arrange.scriptTriggers = [];

		arrange.scriptTriggers.push({
			at:bedTag,
			name:"wakeMemory",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{appear:bedTag},
						{say:"I remember getting out of bed..."},
						{vanish:null},
						{emit:"next"},
					]
				},
				pawn2:{
					mesh:meshes.characters.pawn,
					actions:[
						{wait:"next"},
						{appear:exitTag},
						{say:"...and walking out the door..."},
						{vanish:null}
					]
				}
			}
		});

		if (arrange.consistent()) {
			arrange.scriptTriggers.push({
				at:exitTag,
				name:"finish",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:{x:1,y:1}},
							{say:"I should be walking this path"},
							{vanish:null},
						]
					}
				}
			});
		}

	};

	return morning;
};
