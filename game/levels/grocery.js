exports = function() {
	var tileMap = {
		S: { r: 0, t: game.tiles.PathStart },
		E: { r: 0, t: game.tiles.PathEnd, tag: 'exit', pivot: true  },
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
	txt += "B. B. B. B. B. B. B. B. B. ).\n";
	txt += ".. .. .. .. .. .. .. .. .. ).\n";
	txt += ".. S1 -1 }1 [. -. -. }. .. ).\n";
	txt += ".. c. c. .. .. c. c. |. .. ).\n";
	txt += ".. .. .. {. -. -. }. |. .. ).\n";
	txt += ".. |. B2 |2 .. B. |. |. B. ).\n";
	txt += ".. |. B2 *2 .. B. |. |. B. ).\n";
	txt += ".. |. B2 [2 }2 B. |. |. B. ).\n";
	txt += ".. |a Ba .. |. B9 |8 |8 B8 ).\n";
	txt += ".. ]a Ba .. |. B9 |8 *8 B8 ).\n";
	txt += ".. .. Ba .. |3 B9 [8 ]8 B8 ).\n";
	txt += ".. .. .. {3 ]3 .. .. .. .. ).\n";
	txt += ".. .. .. [4 }4 .. .. B5 .. ).\n";
	txt += ".. d5 |5 d4 |7 d7 .. B5 .. ).\n";
	txt += ".. .. .. .. E6 .. .. .. .. ..\n";

	var level = game.buildLevel(tileMap, txt);
	
	// level.addScriptTriggers = function(arrange) {
	// 	var hamsterTag = arrange.findTag("hamster");
	// 	var exitTag = arrange.findTag("exit");
	//
	// 	arrange.scriptTriggers = [];
	//
	// 	console.log(hamsterTag);
	// 	console.log(arrange.findTag("cage"));
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
	// 	if (arrange.solved) {
	// 		arrange.scriptTriggers.push({
	// 			at:exitTag,
	// 			advance:true,
	// 			name:"finish",
	// 			script:{
	// 				pawn:{
	// 					mesh:meshes.characters.pawn,
	// 					actions:[
	// 						{appear:exitTag},
	// 						{say:"I should be walking this path"},
	// 						{vanish:null},
	// 					]
	// 				}
	// 			}
	// 		});
	// 	}
	// };

	return level;
};
