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

	morning.music = music.mike1;
	morning.synth = synths.bells;

	var rot = game.utility.rot;

	/*
		levels control cutscenes by embedding scripts in the level based
		 on level state -- e.g. a complete level might have a cutscene
		 that transitions to the next level.
	*/
	morning.addScriptTriggers = function(arrange) {
		var bedTag = arrange.findTag("bed");
		var exitTag = arrange.findTag("exit");

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

		if (arrange.solved) {
			var points = [bedTag, exitTag];
			function p2a(p) {
				return {x:p.x + arrange.combined.min.x, y:p.y + arrange.combined.min.y};
			}
			arrange.paths.some(function(path){
				var pts = path.map(p2a);
				if (pts.length >= 2 && pts[0].x == bedTag.x && pts[1].y == bedTag.y) {
					points = pts;
					return true;
				}
				return false;
			});

			var firstPoints = points.splice(0, ((points.length + 1) / 2) | 0);

			var actions = [];
			actions.push({appear:firstPoints[0]});
			actions.push({say:"now I remember"});
			actions.push({walk:firstPoints});
			actions.push({say:"a simple jaunt"});
			actions.push({walk:points});
			actions.push({say:"and out the door"});
			actions.push({vanish:null});
			actions.push({warp:'school'});

			arrange.scriptTriggers.push({
				at:exitTag,
				advance:true,
				name:"finish",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:actions
					}
				}
			});
		}

	};

	return morning;
};
