var win;

exports = {
	win: function() {
		if (!win) {
			win = engine.sfx('tri', 600, 2400, 100, 0, 20, 20);
		}
		win.bang();
	}
}