exports = function() {
	var tileMap = {
		">": { r:0, t: game.tiles.PathStart, tag:"start" },
		"^": { r:1, t: game.tiles.PathStart },
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
		"X": { r:0, t: game.tiles.Box },
		"o": { r:0, t: game.tiles.Pole },
		"~": { r:0, t: game.tiles.Wall },
		"[": { r:1, t: game.tiles.Wall },
		"_": { r:2, t: game.tiles.Wall },
		"]": { r:3, t: game.tiles.Wall },
	};

	var txt = "";
	txt += ">. ,. .. o.\n";
	txt += ".. L0 ,0 |0\n";
	txt += "X. X. |0 |0\n";
	txt += ".. r0 J0 |0\n";
	txt += ".. L. D. ..\n";

	var level = game.buildLevel(tileMap, txt);

	level.fragments[0].pivots.push({x:1,y:-1});
	level.fragments[0].r = 2;
	level.fragments[0].at.x = 3;
	level.fragments[0].at.y =-2;
	level.fragments[0].fixed = true;

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
							{say:"Some of my memories are turned around."},
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
			actions.push({say:"Okay, I've got that straight."});
			actions.push({walk:points});
			actions.push({vanish:null});
			actions.push({warp:'morning'});

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
