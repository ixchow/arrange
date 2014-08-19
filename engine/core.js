
function ldfwInit() {
	var canvas = document.getElementById("canvas");
	ctxWidth = el.width;
	ctxHeight = el.height;
	ctx = el.getContext("3d");

	window.requestAnimFrame =
		window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

	window.requestAnimFrame(each_frame);
}
window['ldfwInit'] = ldfwInit;
