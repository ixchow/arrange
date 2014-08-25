exports = function() {
	var tileMap = {
		">": { r:0, t: game.tiles.PathStart },
		"^": { r:1, t: game.tiles.PathStart, tag:"start" },
		"<": { r:2, t: game.tiles.PathStart },
		"v": { r:3, t: game.tiles.PathStart },
		"D": { r:0, t: game.tiles.PathEnd, tag:"end" },
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
	txt += "r. .. .. ..\n";
	txt += "|. ,0 X0 ..\n";
	txt += "|. L0 -0 D0\n";
	txt += "^. .. .. ..\n";

	var level = game.buildLevel(tileMap, txt);

	level.addScriptTriggers = function(arrange) {
		arrange.scriptTriggers = [];
		var startTag = arrange.findTag("start");
		var endTag = arrange.findTag("end");

		if (!arrange.solved) {
			arrange.scriptTriggers.push({
				at:{x:0,y:1},
				name:"intro",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:{x:0,y:1}},
							{say:"Some things just don't line up."},
							{vanish:null}
						]
					}
				}
			});
		} else {
			function p2a(p) {
				return {x:p.x + arrange.combined.min.x, y:p.y + arrange.combined.min.y};
			}
			var points = arrange.paths[0].map(p2a);

			var actions = [];
			actions.push({appear:startTag});
			actions.push({say:"But I'll piece it together."});
			actions.push({walk:points});
			actions.push({vanish:null});
			actions.push({warp:'tut02'});

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
