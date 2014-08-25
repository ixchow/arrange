exports = function() {
	var tileMap = {
		S: { r: 1, t: game.tiles.PathStart },
		E: { r: 1, t: game.tiles.PathEnd, tag: 'exit' },
		'_': { r: 2, t: game.tiles.Wall },
		')': { r: 1, t: game.tiles.Wall },
		'|': { r: 1, t: game.tiles.PathStraight },
		'*': { r: 1, t: game.tiles.PathStraight, pivot: true },
		'-': { r: 0, t: game.tiles.PathStraight },
		'}': { r: 1, t: game.tiles.PathLeft },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		d: { r: 0, t: game.tiles.Desk },
		c: { r: 2, t: game.tiles.FreeChair },
		B: { r: 0, t: game.tiles.GiantSpeaker },
		P: { r: 0, t: game.tiles.BlockPerson },
		p: { r: 0, t: game.tiles.SqueezePerson }
	};
	
	var txt = "";
	txt += "_. _. _. ..\n";
	txt += "B. B. B. ).\n";
	txt += "[. p4 P. ).\n";
	txt += "P4 }. d. ).\n";
	txt += "P. p. |. ).\n";
	txt += "{. ]. P. ).\n";
	txt += "|3 d. d. ).\n";
	txt += "|3 d. E. ).\n";
	txt += "p. d. p. ).\n";
	txt += "|. d. -1 ).\n";
	txt += "S. d. {2 ).\n";

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
