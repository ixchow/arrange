exports = function() {
	var tileMap = {
		S: { r: 1, t: game.tiles.PathStart, tag: 'start1' },
		T: { r: 1, t: game.tiles.PathStart, tag: 'start2' },
		E: { r: 1, t: game.tiles.PathEnd, tag: 'exit2' },
		F: { r: 3, t: game.tiles.PathEnd, tag: 'exit1' },
		')': { r: 1, t: game.tiles.Wall },
		'|': { r: 1, t: game.tiles.PathStraight },
		'*': { r: 1, t: game.tiles.PathStraight, pivot: true },
		'-': { r: 0, t: game.tiles.PathStraight },
		'}': { r: 1, t: game.tiles.PathLeft },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		B: { r: 0, t: game.tiles.Pillar }, // shelves
		d: { r: 0, t: game.tiles.Desk },
		// D: { r: 0, t: game.tiles.Desk },
		c: { r: 0, t: game.tiles.Desk }, // chest
	};
	
	var txt = "";
	txt += ".. B. B. B. B. B. B. B. B. B. ).\n";
	txt += ".. {1 -. -. -. }. .. .. .. .. ).\n";
	txt += ".. |1 .. .. .. [. -. -. }. .. ).\n";
	txt += ".. |1 c1 c. .. .. c. c. |. .. ).\n";
	txt += ".. |. .. .. {. -. -. }. |. .. ).\n";
	txt += ".. |. |. B2 |2 .. B. |. |. B. ).\n";
	txt += ".. |. |. B2 *2 .. B. |. F. B. ).\n";
	txt += ".. |. |. B2 [2 }2 B. |. E. B. ).\n";
	txt += "{. ]. |a Ba .. |. B9 |8 |8 B8 ).\n";
	txt += "|. .. ]a Ba .. |. B9 |8 *8 B8 ).\n";
	txt += "|. .. .. Ba .. |3 B9 [8 ]8 B8 ).\n";
	txt += "|. .. .. {. -3 ]3 .. .. .. .. ).\n";
	txt += "|. {. -. ]. .. .. .. .. B5 .. ).\n";
	txt += "|. |. d5 |5 d4 .. d7 .. B5 .. ).\n";
	txt += "S. T. .. .. .. .. .. .. .. .. ..\n";

	var level = game.buildLevel(tileMap, txt);

	level.music = music.mikeover;
	level.synth = synths.bells;
	
	level.addScriptTriggers = function(arrange) {
		var end1 = arrange.findTag("exit1");
		var end2 = arrange.findTag("exit2");
		var start1 = arrange.findTag("start1");
		var start2 = arrange.findTag("start2");

		arrange.scriptTriggers = [];

		arrange.scriptTriggers.push({
			at:start1,
			name:"groceryStart1",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
  					{do:function() { engine.music.play(music.mikeover, synths.bells)}},
						{appear:start1},
						{say:"I remember brushing past you before I ever caught your attention"},
						{vanish:null},
					]
				}
			}
		});
		
		arrange.scriptTriggers.push({
			at:start2,
			name:"groceryStart1",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
  					{do:function() { engine.music.play(music.rage, synths.distortion)}},
						{appear:end2},
						{narrate:"I remember the day we met...", cl:'char2'},
						{appear:start2},
						{say:"... I was in such a hurry...", cl:'char2'},
						{vanish:null},
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
			var points1 = [start1, end1];
			var points2 = [start2, end2];
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
			points1 = arrange.paths[0].map(p2a);
			points2 = arrange.paths[1].map(p2a);

			var firstPoints1 = points1.splice(0, ((points1.length + 1) / 2) | 0);
			var firstPoints2 = points2.splice(0, ((points2.length + 1) / 2) | 0);
			// var secondPoints = points.splice(0, 6);
			
			arrange.scriptTriggers.push({
				at:end2,
				advance:true,
				name:"finish",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:firstPoints1[0]},
							{say:"now we remember!"},
							{walk:firstPoints1},
							{say:"it started as an ordinary day of chores"},
							{walk:points1},
							{narrate:'but ended in a connection we will remember forever'},
						]
					},
					pawn2:{
						mesh:meshes.characters.pawn,
						actions:[
							{appear:firstPoints2[0]},
							{say:"now we remember!"},
							{walk:firstPoints2},
							{say:"it started as an ordinary day of chores", cl:'char2'},
							{walk:points2},
						]
					}
				}
			});
		}
	};

	return level;
};
