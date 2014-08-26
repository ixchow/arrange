exports = function() {
	var tileMap = {
		"p": { r:0, t: game.tiles.SqueezePerson },
		"e": { r:0, t: game.tiles.Empty },
	};

	var txt = "";
	txt += "e. e. e.\n";
	txt += "e. e. e.\n";
	txt += "e. e. e.\n";

	var level = game.buildLevel(tileMap, txt);

	level.addScriptTriggers = function(arrange) {
		arrange.scriptTriggers = [];
		arrange.scriptTriggers.push({
			at:{x:1,y:-1},
			name:"intro",
			advance:true,
			script:{
				pawn:{
					mesh:meshes.characters.pawn,
					actions:[
						{narrate:'FRAGMENTS<br/>by avh4 and ix</span>'},
						{appear:{x:1,y:-1}},
						{say:"I can't remember."},
						{say:"I don't know why I'm here."},
						{walk:[{x:0,y:-2}]},
						{say:"Help me."},
						{vanish:null},
						{warp:'tut00'},
					]
				}
			}
		});
	};


	return level;
};
