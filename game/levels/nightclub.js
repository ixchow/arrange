exports = function() {
	var tileMap = {
		S: { r: 1, t: game.tiles.PathStart, tag: 'start' },
		E: { r: 2, t: game.tiles.PathEnd, tag: 'exit' },
		'_': { r: 2, t: game.tiles.Wall },
		')': { r: 1, t: game.tiles.Wall },
		'|': { r: 1, t: game.tiles.PathStraight },
		'*': { r: 1, t: game.tiles.PathStraight, pivot: true },
		'-': { r: 0, t: game.tiles.PathStraight },
		'}': { r: 1, t: game.tiles.PathLeft },
		'{': { r: 2, t: game.tiles.PathLeft },
		'r': { r: 2, t: game.tiles.PathLeft, pivot: true },
		'[': { r: 3, t: game.tiles.PathLeft, pivot: true },
		']': { r: 0, t: game.tiles.PathLeft },
		d: { r: 0, t: game.tiles.Desk },
		c: { r: 2, t: game.tiles.FreeChair },
		B: { r: 0, t: game.tiles.GiantSpeaker },
		P: { r: 0, t: game.tiles.BlockPerson },
		J: { r: 0, t: game.tiles.BlockPerson, tag: 'dj' },
		p: { r: 0, t: game.tiles.SqueezePerson }
	};
	
	var txt = "";
	txt += "_. _. _. ..\n";
	txt += "B. B. B. ).\n";
	txt += "[4 p4 J. ).\n";
	txt += "P4 }7 d. ).\n";
	txt += "P. p. |5 ).\n";
	txt += ".. .. P5 ).\n";
	txt += "|3 d. d. ).\n";
	txt += "|3 d. -6 ).\n";
	txt += "p. d. p. ).\n";
	txt += "|. d. |1 ).\n";
	txt += "S. d. {2 ).\n";

	var level = game.buildLevel(tileMap, txt);
	
	var txt2 = "";
	txt2 += ".. .. .. ..\n";
	txt2 += ".. .. .. ..\n";
	txt2 += ".. .. .. ..\n";
	txt2 += "E. .. .. ..\n";
	txt2 += ".. |5 .. ..\n";
	txt2 += "r5 ]5 .. ..\n";
	txt2 += ".. .. .. ..\n";
	txt2 += ".. .. .. ..\n";
	txt2 += ".. .. .. ..\n";
	txt2 += ".. .. .. ..\n";
	txt2 += ".. .. .. ..\n";
	
	level.fragments = level.fragments.concat(game.buildLevel(tileMap, txt2).fragments);
	
	level.music = music.rage;
	level.synth = synths.distortion;

	level.addScriptTriggers = function(arrange) {
		var djTag = arrange.findTag("dj");
		var exitTag = arrange.findTag("exit");
		var startTag = arrange.findTag("start");

		arrange.scriptTriggers = [];

		arrange.scriptTriggers.push({
			at:startTag,
			name:"startNightclub",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{appear:startTag},
						{say:"it's hard to remember one night from the next", cl:'char2'},
						{appear:{x: 1, y: 1}},
						{say:"if I wasn't drinking alone, I was dancing and drinking", cl:'char2'},
						{vanish:null},
					]
				}
			}
		});

		arrange.scriptTriggers.push({
			at:djTag,
			name:"dj",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{narrate:"<i>DJ Viceroy</i> was pure legend", cl:'char2'},
					]
				}
			}
		});
	// 	if (engine.Vec2.equals(hamsterTag, arrange.findTag("cage"))) {
	// 		arrange.scriptTriggers.push({
	// 			at:hamsterTag,
	// 			name:"hamsterCaged",
	// 			script:{
	// 				pawn:{
	// 					mesh:meshes.characters.pawn,
	// 					actions:[
	// 						{appear:hamsterTag},
	// 						{say:"I remember feeding the class hamster..."},
	// 						{vanish:null},
	// 					]
	// 				}
	// 			}
	// 		});
	// 	} else {
	// 		arrange.scriptTriggers.push({
	// 			at:hamsterTag,
	// 			name:"hamsterFree",
	// 			script:{
	// 				pawn:{
	// 					mesh:meshes.characters.pawn,
	// 					actions:[
	// 						{appear:hamsterTag},
	// 						{say:"What happened to our class hamster..."},
	// 						{vanish:null},
	// 					]
	// 				}
	// 			}
	// 		});
	// 	}
	//
		if (arrange.solved) {
			var points = [startTag, exitTag];
			function p2a(p) {
				return {x:p.x + arrange.combined.min.x, y:p.y + arrange.combined.min.y};
			}
			// arrange.paths.some(function(path){
			// 	var pts = path.map(p2a);
			// 	if (pts.length >= 2 && pts[0].x == startTag.x && pts[1].y == startTag.y) {
			// 		points = pts;
			// 		return true;
			// 	}
			// 	return false;
			// });
			points = arrange.paths[0].map(p2a);

			var firstPoints = points.splice(0, 2);
			var secondPoints = points.splice(0, 6);

			var actions = [];
			actions.push({appear:firstPoints[0]});
			actions.push({say:"now I remember the last drink I had", cl:'char2'});
			actions.push({walk:firstPoints});
			actions.push({say:"I pushed up to the bar for a few shots", cl:'char2'});
			actions.push({walk:secondPoints});
			actions.push({say:"I remember getting to the dance floor, but not much after that", cl:'char2'});
			actions.push({walk:points});
			actions.push({say:"the next day, I decided to change", cl:'char2'});
			actions.push({vanish:null});
			actions.push({warp:'grad'});

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

	return level;
};
