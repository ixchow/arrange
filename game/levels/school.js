exports = function() {
	var tileMap = {
		S: { r: 2, t: game.tiles.PathStart },
		E: { r: 0, t: game.tiles.PathEnd, tag: 'exit' },
		P: { r: 0, t: game.tiles.Pillar },
		'|': { r: 1, t: game.tiles.PathStraight },
		'-': { r: 0, t: game.tiles.PathStraight },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		H: { r: 0, t: game.tiles.HamsterCage, tag: 'cage' },
		h: { r: 0, t: game.tiles.Hamster, tag: 'hamster' },
		D: { r: 0, t: game.tiles.Desk },
		B: { r: 0, t: game.tiles.Blackboard },
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

	var level = game.buildLevel(tileMap, txt);
	
  // function p2a(p) {
  // 	return {
  // 		x: p.x + arrange.combined.min.x,
  // 		y: p.y + arrange.combined.min.y
  // 	};
  // }
  // arrange.paths.some(function(path) {
  // 	var pts = path.map(p2a);
  // 	if (pts.length >= 2 && pts[0].x == bedTag.x && pts[1].y == bedTag.y) {
  // 		points = pts;
  // 		return true;
  // 	}
  // 	return false;
  // });
	
	level.addScriptTriggers = function(arrange) {
		var hamsterTag = arrange.findTag("hamster");
		var exitTag = arrange.findTag("exit");

		arrange.scriptTriggers = [];

		console.log(hamsterTag);
		console.log(arrange.findTag("cage"));
		if (engine.Vec2.equals(hamsterTag, arrange.findTag("cage"))) {
			arrange.scriptTriggers.push({
				at:hamsterTag,
				name:"hamsterCaged",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:hamsterTag},
							{say:"I remember feeding the class hamster..."},
							{vanish:null},
						]
					}
				}
			});
		} else {
			arrange.scriptTriggers.push({
				at:hamsterTag,
				name:"hamsterFree",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:hamsterTag},
							{say:"What happened to our class hamster..."},
							{vanish:null},
						]
					}
				}
			});
		}

		if (arrange.solved) {
			arrange.scriptTriggers.push({
				at:exitTag,
				advance:true,
				name:"finish",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:exitTag},
							{say:"I should be walking this path"},
							{vanish:null},
						]
					}
				}
			});
		}
	};

	return level;
};
