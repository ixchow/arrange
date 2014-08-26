exports = function() {
	var tileMap = {
		">": { r:0, t: game.tiles.PathStart, tag:"start" },
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
	txt += ".. ]. .. .. n. .. ..\n";
	txt += ".. ]. .. .. |. .. ..\n";
	txt += ".. .. ~. ~. |. ~. X.\n";
	txt += ">. -. -. -. J. .. ..\n";

	var level = game.buildLevel(tileMap, txt);

	level.addScriptTriggers = function(arrange) {
		arrange.scriptTriggers = [];
		var startTag = arrange.findTag("start");

		if (arrange.solved) {
			function p2a(p) {
				return {x:p.x + arrange.combined.min.x, y:p.y + arrange.combined.min.y};
			}
			var points = arrange.paths[0].map(p2a);

			var actions = [];
			actions.push({appear:startTag});
			actions.push({say:"I remember some things clearly."});
			actions.push({walk:points});
			actions.push({vanish:null});
			actions.push({warp:'tut01'});

			arrange.scriptTriggers.push({
				at:startTag,
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


	return level;
};
