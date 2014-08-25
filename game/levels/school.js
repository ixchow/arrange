exports = function() {
	var tileMap = {
		S: { r: 2, t: game.tiles.PathStart, tag: 'start' },
		E: { r: 0, t: game.tiles.PathEnd, tag: 'exit' },
		P: { r: 0, t: game.tiles.Pillar },
		'|': { r: 1, t: game.tiles.PathStraight },
		'-': { r: 0, t: game.tiles.PathStraight },
		'{': { r: 2, t: game.tiles.PathLeft },
		'[': { r: 3, t: game.tiles.PathLeft },
		']': { r: 0, t: game.tiles.PathLeft },
		')': { r: 1, t: game.tiles.Wall },
		H: { r: 0, t: game.tiles.HamsterCage, tag: 'cage' },
		h: { r: 0, t: game.tiles.Hamster, tag: 'hamster' },
		D: { r: 0, t: game.tiles.Desk },
		B: { r: 0, t: game.tiles.Blackboard },
		d: { r: 0, t: game.tiles.SmallDesk },
		j: { r: 0, t: game.tiles.SmallDesk, tag: 'jamie' },
		c: { r: 0, t: game.tiles.Chair, tag: 'chair' },
		k: { r: 0, t: game.tiles.Pillar },
		K: { r: 0, t: game.tiles.Pillar, tag: 'bookshelf' }
	};
	
	var txt = "";
	txt += ".. .. .. .. B2 B2 .. .. .. ..\n";
	txt += "H5 .. B1 B1 .. .. .. .. .. ).\n";
	txt += "{5 -5 D1 D1 D1 .. {4 -4 -. E.\n";
	txt += "h1 .. D1 D1 D1 .. |4 .. .. ).\n";
	txt += ".. .. -6 -6 -6 -6 ]4 .. .. ).\n";
	txt += "|. d. .. .. c3 .. .. .. k. ).\n";
	txt += "|. .. .. d2 .. j2 .. .. k. ).\n";
	txt += "|. d. .. .. .. .. .. .. K. ).\n";
	txt += "[. S. .. .. .. .. .. .. k. ).\n";
	txt += ".. .. .. .. d3 .. d3 .. .. ).\n";

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
	
	level.music = music.mikeover;
	level.synth = synths.bells;

	level.addScriptTriggers = function(arrange) {
		var hamsterTag = arrange.findTag("hamster");
		var exitTag = arrange.findTag("exit");
		var startTag = arrange.findTag("start");
		var bookshelfTag = arrange.findTag("bookshelf");
		var jamieTag = arrange.findTag("jamie");
		var chairTag = arrange.findTag("chair");

		arrange.scriptTriggers = [];
		
		arrange.scriptTriggers.push({
			at:bookshelfTag,
			name:"bookshelf",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{appear:{x: bookshelfTag.x-1, y: bookshelfTag.y}},
						{say:"I remember <i>A Wrinkle In Time</i>, my favorite book"},
						{vanish:null},
					]
				}
			}
		});
		
		arrange.scriptTriggers.push({
			at:jamieTag,
			name:"jamie",
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{narrate:"that was Jamie's desk..."},
					]
				}
			}
		});

		if (arrange.require_problems.desk) {
			arrange.scriptTriggers.push({
				at:chairTag,
				name:"chair",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{narrate:"I don't remember that chair being there..."},
						]
					}
				}
			});
		} else {
			arrange.scriptTriggers.push({
				at:chairTag,
				name:"chair",
				script:{
					pawn:{
						mesh:meshes.characters.pawn,
						actions:[
							{narrate:"yes, teacher's chair never strayed from behind the desk..."},
						]
					}
				}
			});
		}

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
							{narrate:"what happened to our class hamster..."},
						]
					}
				}
			});
		}

		if (arrange.solved) {
			var points = [startTag, exitTag];
			function p2a(p) {
				return {x:p.x + arrange.combined.min.x, y:p.y + arrange.combined.min.y};
			}
			arrange.paths.some(function(path){
				var pts = path.map(p2a);
				if (pts.length >= 2 && pts[0].x == startTag.x && pts[1].y == startTag.y) {
					points = pts;
					return true;
				}
				return false;
			});

			var firstPoints = points.splice(0, ((points.length + 1) / 3) | 0);
			var secondPoints = points.splice(0, ((points.length + 1) / 2) | 0);

			var actions = [];
			actions.push({appear:firstPoints[0]});
			actions.push({say:"now I remember"});
			actions.push({walk:firstPoints});
			actions.push({say:"one day we found the hamster had died"});
			actions.push({walk:secondPoints});
			actions.push({say:"I carried him out behind the gym"});
			actions.push({walk:points});
			actions.push({vanish:null});
			actions.push({warp:'nightclub'});
			actions.push({narrate:'elsewhere, another soul remembers a very different life...'});

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
