var win;
var test;

exports = {
	win: function() {
		if (!win) {
			win = engine.sfx('tri', 600, 2400, 100, 0, 20, 20);
		}
		win.bang();
	},
	test: function() {
		if (!test) {
			test = engine.sfx('square', 800, 100, 300, 0, 10, 5);
		}
		test.bang();
	}
}