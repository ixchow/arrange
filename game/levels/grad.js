exports = function() {
	var tileMap = {
		S: { r: 2, t: game.tiles.PathStart, tag: 'start' },
		E: { r: 1, t: game.tiles.PathEnd, tag: 'exit' },
		'|': { r: 1, t: game.tiles.PathStraight },
		'*': { r: 1, t: game.tiles.PathStraight, pivot: true },
		'-': { r: 0, t: game.tiles.PathStraight },
		'}': { r: 1, t: game.tiles.PathLeft },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		B: { r: 0, t: game.tiles.Pillar, tag: 'podium' },
		d: { r: 0, t: game.tiles.Desk },
		n: { r: 0, t: game.tiles.SmallDesk },
		c: { r: 2, t: game.tiles.FreeChair },
		C: { r: 2, t: game.tiles.FreeChair, pivot: true },
		P: { r: 0, t: game.tiles.GiantSpeaker },
	};
	
	var txt = "";
	txt += "d. d. d8 d8 d. d. d. d. d. ..\n";
	txt += "d. d. d8 d8 d. d. d9 d9 d. ..\n";
	txt += "d. d. d8 d8 B. d. d9 d. d. ..\n";
	txt += "d. n. d8 d8 d8 d. d9 d. d. ..\n";
	txt += ".. E. .. .. .. .. .. .. .. ..\n";
	txt += "{. ]. .. .. .. .. .. .. .. ..\n";
	txt += "|. c. c. c. c. c1 c1 c1 .. ..\n";
	txt += "|. c. c6 c6 c1 c1 C1 c1 .. ..\n";
	txt += "|. c6 c6 C6 c6 c. c1 c1 .. ..\n";
	txt += "|. c. c4 c4 c3 c3 c3 C3 .. ..\n";
	txt += ".. c5 c5 c4 c4 c2 c2 c3 .. ..\n";
	txt += ".. c5 c4 c4 .. c2 c2 c3 .. ..\n";
	txt += ".. c5 c. c. .. c2 c2 c2 .. ..\n";
	txt += ".. .. .. .. .. .. .. .. .. ..\n";
	txt += ".. .. .. .. .. .. .. .. .. ..\n";

	var level = game.buildLevel(tileMap, txt);
	
	var txt2 = "";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. P1 .. .. .. .. .. .. P1 ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += "[. -. S. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. n1 .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. ..\n";
	txt2 += ".. .. .. .. .. .. .. .. .. P1\n";
	
	level.fragments = level.fragments.concat(game.buildLevel(tileMap, txt2).fragments);
	
	level.fragments.forEach(function(f) {
		if (f.fixed) return;
		f.at.x += Math.floor(Math.random() * 4) - 2;
		f.at.y += Math.floor(Math.random() * 4) - 2;
		if (f.tiles.some(function(t) { return !!t.pivot })) {
			f.r += Math.floor(Math.random() * 4);
		}
	});

	level.music = music.mikeover;
	level.synth = synths.bells;
	
	level.addScriptTriggers = function(arrange) {
		var podiumTag = arrange.findTag("podium");
		var exitTag = arrange.findTag("exit");
		var startTag = arrange.findTag("start");

		arrange.scriptTriggers = [];

		arrange.scriptTriggers.push({
			at:podiumTag,
			name:"podium",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{narrate:"I remember my parents cheering on my graduation"},
					]
				}
			}
		});
		
		if (arrange.solved) {
			var points = [startTag, exitTag];
			function p2a(p) {
				return {x:p.x + arrange.combined.min.x, y:p.y + arrange.combined.min.y};
			}
			points = arrange.paths[0].map(p2a);

			var actions = [];
			actions.push({appear:points[0]});
			actions.push({say:"now I remember"});
			actions.push({walk:points});
			actions.push({say:"I took the stage and accepted my diploma"});
			actions.push({vanish:null});
			actions.push({warp:'aa'});

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
