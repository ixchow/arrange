exports = function() {
	var tileMap = {
		S: { r: 2, t: game.tiles.PathStart },
		E: { r: 1, t: game.tiles.PathEnd, tag: 'exit' },
		'|': { r: 1, t: game.tiles.PathStraight },
		'*': { r: 1, t: game.tiles.PathStraight, pivot: true },
		'-': { r: 0, t: game.tiles.PathStraight },
		'}': { r: 1, t: game.tiles.PathLeft },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		B: { r: 0, t: game.tiles.Pillar }, // shelves
		d: { r: 0, t: game.tiles.Desk },
		n: { r: 0, t: game.tiles.SmallDesk },
		// D: { r: 0, t: game.tiles.Desk },
		c: { r: 2, t: game.tiles.FreeChair },
		P: { r: 0, t: game.tiles.GiantSpeaker },
	};
	
	var txt = "";
	txt += "d. d. d. d. d. d. d. d. d.\n";
	txt += "d. d. d. d. d. d. d. d. d.\n";
	txt += "d. d. d. d. B. d. d. d. d.\n";
	txt += "d. n. d. d. d. d. d. d. d.\n";
	txt += "P. E. .. .. .. .. .. P. ..\n";
	txt += "{. ]. .. .. .. .. .. .. ..\n";
	txt += "|. c. c. c. c. c. c. c. ..\n";
	txt += "|. c. c. c. c. c. c. c. ..\n";
	txt += "|. c. c. c. c. c. c. c. ..\n";
	txt += "|. c. c. c. c. c. c. c. ..\n";
	txt += "[. -. S. c. c. c. c. c. ..\n";
	txt += ".. c. c. c. n. c. c. c. ..\n";
	txt += ".. c. c. c. .. c. c. c. ..\n";
	txt += ".. .. .. .. .. .. .. .. ..\n";
	txt += ".. .. .. .. .. .. .. .. P.\n";

	var level = game.buildLevel(tileMap, txt);

	level.music = music.mike1;
	level.synth = synths.bells;
	
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
