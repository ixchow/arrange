exports = function() {
	var tileMap = {
		S: { r: 1, t: game.tiles.PathStart, tag: 'start' },
		E: { r: 1, t: game.tiles.ChairPathEnd, tag: 'exit'  },
		'.': { r: 0, t: game.tiles.Wall },
		')': { r: 1, t: game.tiles.Wall },
		'|': { r: 1, t: game.tiles.PathStraight },
		'*': { r: 1, t: game.tiles.PathStraight, pivot: true },
		'-': { r: 0, t: game.tiles.PathStraight },
		'}': { r: 1, t: game.tiles.PathLeft },
		'{': { r: 2, t: game.tiles.PathLeft },
		'r': { r: 2, t: game.tiles.PathLeft, pivot: true },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		B: { r: 0, t: game.tiles.Pillar }, // shelves
		d: { r: 0, t: game.tiles.Desk },
		w: { r: 0, t: game.tiles.FreeChair },
		a: { r: 1, t: game.tiles.FreeChair },
		s: { r: 2, t: game.tiles.FreeChair },
		C: { r: 2, t: game.tiles.FreeChair, pivot: true },
		d: { r: 3, t: game.tiles.FreeChair, tag: 'leader' },
	};
	
	var txt = "";
	txt += ".. .. w. .. .. .. .. .. .. ).\n";
	txt += ".. w1 .. .. d. .. r6 }6 .. ).\n";
	txt += ".. a2 .. .. .. .. |6 |6 .. ).\n";
	txt += ".. a2 E. .. C5 {5 ]6 |6 .. ).\n";
	txt += "a3 {. ]2 s4 .. |5 .. |. .. ).\n";
	txt += ".. [. }1 }. .. |. .. |. .. ).\n";
	txt += ".. .. [. -4 -4 ]4 .. |. .. ).\n";
	txt += ".. .. .. .. .. .. .. S. .. ..\n";

	var level = game.buildLevel(tileMap, txt);

	level.music = music.rage;
	level.synth = synths.distortion;
	
	level.fragments.forEach(function(f) {
		if (f.fixed) return;
		f.at.x += Math.floor(Math.random() * 4) - 2;
		f.at.y += Math.floor(Math.random() * 4) - 2;
		if (f.tiles.some(function(t) { return !!t.pivot })) {
			f.r += Math.floor(Math.random() * 4);
		}
	});

	level.addScriptTriggers = function(arrange) {
		var startTag = arrange.findTag("start");
		var exitTag = arrange.findTag("exit");
		var leaderTag = arrange.findTag("leader");

		arrange.scriptTriggers = [];

		arrange.scriptTriggers.push({
			at:startTag,
			name:"welcomeToAA",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{appear:startTag},
						{say:"I remember my first AA meeting...", cl:'char2'},
						{appear:exitTag},
						{say:"...everyone was sitting in a circle...", cl:'char2'},
						{vanish:null},
					]
				}
			}
		});

		arrange.scriptTriggers.push({
			at:leaderTag,
			name:"aaLeader",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{narrate:"that was Riley's chair...", cl:'char2'},
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
			
			var firstPoints = points.splice(0, 6);
			var secondPoints = points.splice(0, 6);

			var actions = [];
			actions.push({appear:firstPoints[0]});
			actions.push({say:"now I remember", cl:'char2'});
			actions.push({walk:firstPoints});
			actions.push({say:"I felt shame as I entered the room", cl:'char2'});
			actions.push({walk:secondPoints});
			actions.push({say:"I avoided eye contact as everyone watched", cl:'char2'});
			actions.push({walk:points});
			actions.push({say:"but I finally took a seat...", cl:'char2'});
			actions.push({vanish:null});
			actions.push({warp:'grocery'});

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
