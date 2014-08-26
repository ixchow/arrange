exports = function() {
	var tileMap = {
		"p": { r:0, t: game.tiles.SqueezePerson },
	};

	var txt = "";
	txt += ".. .. ..\n";
	txt += ".. p. ..\n";
	txt += ".. .. ..\n";

	var level = game.buildLevel(tileMap, txt);

	level.addScriptTriggers = function(arrange) {
		arrange.scriptTriggers = [];
		arrange.scriptTriggers.push({
			at:{x:1,y:0},
			name:"intro",
			advance:true,
			script:{
				pawn:{
					mesh:meshes.characters.empty,
					actions:[
						{narrate:'FRAGMENTS<br/><span style="text-align:right">by avh4 and <a href="http://tchow.com">ix</a></span>'},
						{appear:{x:0,y:1}},
						{say:"I can't remember."},
						{say:"I don't know why I'm here."},
						{vanish:null}
					]
				}
			}
		});
	};


	return level;
};
