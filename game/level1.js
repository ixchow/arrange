exports = function() { return [
	{
		at:{x:0, y:0}, r:0,
		tiles:[
			{at:{x:0,y:0},r:0, tile:game.tiles.PathStart},
			{at:{x:1,y:1},r:0, tile:game.tiles.Pillar}
		]
	},
	{
		at:{x:1, y:2}, r:0,
		tiles:[
			{at:{x:0,y:0},r:1, tile:game.tiles.Pillar},
			{at:{x:1,y:0},r:1, tile:game.tiles.PathEnd},
		]
	}
]; };
