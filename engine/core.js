exports.init = function() {
	var canvas = document.getElementById("canvas");
	ctxWidth = canvas.width;
	ctxHeight = canvas.height;
	ctx = canvas.getContext("3d");

	window.requestAnimFrame =
		window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

	window.requestAnimFrame(game.scene1.tick);

	console.log("  >=>       >====>     >=======> >=>        >=> ");
	console.log("  >=>       >=>   >=>  >=>       >=>        >=> ");
	console.log("  >=>       >=>    >=> >=>       >=>   >>   >=> ");
	console.log("  >=>       >=>    >=> >=====>   >=>  >=>   >=> ");
	console.log("  >=>       >=>    >=> >=>       >=> >> >=> >=> ");
	console.log("  >=>       >=>   >=>  >=>       >> >>    >===> ");
	console.log("  >=======> >====>     >=>       >=>        >=> ");
}
