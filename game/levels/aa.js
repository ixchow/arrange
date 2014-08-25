exports = function() {
	var tileMap = {
		S: { r: 1, t: game.tiles.PathStart },
		E: { r: 1, t: game.tiles.PathEnd, tag: 'exit'  },
		'.': { r: 0, t: game.tiles.Wall },
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
		w: { r: 0, t: game.tiles.FreeChair },
		a: { r: 1, t: game.tiles.FreeChair },
		s: { r: 2, t: game.tiles.FreeChair },
		d: { r: 3, t: game.tiles.FreeChair },
	};
	
	var txt = "";
	// txt += "B. B. B. B. B. B. B. B. B. ).\n";
	txt += ".. .. w. .. .. .. .. .. .. ).\n";
	txt += ".. w1 .. .. d. .. {. }. .. ).\n";
	txt += ".. a. E. .. .. .. |. |. .. ).\n";
	txt += ".. a. a. .. s. {. ]. |. .. ).\n";
	txt += ".. {. ]. s. .. |. .. |. .. ).\n";
	txt += ".. [. }. }. .. |. .. |. .. ).\n";
	txt += ".. .. [. -. -. ]. .. |. .. ).\n";
	txt += ".. .. .. .. .. .. .. S. .. ..\n";

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
