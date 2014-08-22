exports.Tick = 1.0 / 60.0;
exports.DesiredAspect = undefined; //[{x:16, y:9}, {x:1,y:1}]; //can be array, object, or undefined
exports.Size = {x:NaN, y:NaN}; //updated on resize

exports.init = function(onstart) {

	//--------------------------
	//initialize canvas and WebGL:
	var canvas = document.getElementById("canvas");

	//based on:
	// https://developer.mozilla.org/en-US/docs/WebGL/Getting_started_with_WebGL

	window.gl = null;
	try {
		var attribs = {};
		attribs.antialias = false;
		gl = canvas.getContext("webgl", attribs) || canvas.getcontext("experimental-webgl", attribs);
	}
	catch(e) {
		console.log("Exception creating webgl context: " + e);
	}

	if (!gl) {
		alert("Unable to initialize WebGL.");
		//TODO: some sort of error handling that's a bit more graceful.
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//----------------------------------
	//resizing behavior:
	var me = this;

	//The idea is that the canvas fits inside the frame, and has its width and height changed [shrunk] to satisfy desired properties.
	function resized() {
		var game = document.getElementById("game");
		var game_style = getComputedStyle(game);
		var max_size = {x:game.clientWidth, y:game.clientHeight};
		max_size.x -= parseInt(game_style["padding-left"]) + parseInt(game_style["padding-right"]);
		max_size.y -= parseInt(game_style["padding-top"]) + parseInt(game_style["padding-bottom"]);

		//Lower limit to size:
		max_size.x = Math.max(100, max_size.x);
		max_size.y = Math.max(100, max_size.y);

		var best_size = {x:0, y:0};
		function tryAspect(a) {
			var mul = Math.floor(max_size.x / a.x);
			if (a.y * mul > max_size.y) {
				mul = Math.floor(max_size.y / a.y);
			}
			var test_size = {x:a.x * mul, y:a.y * mul};
			if (test_size.x * test_size.y > best_size.x * best_size.y) {
				best_size.x = test_size.x;
				best_size.y = test_size.y;
			}
		}

		if (me.DesiredAspect === undefined) {
			//great!
			best_size.x = Math.floor(max_size.x);
			best_size.y = Math.floor(max_size.y);
		} else if ('forEach' in me.DesiredAspect) {
			me.DesiredAspect.forEach(tryAspect);
		} else {
			tryAspect(me.DesiredAspect);
		}
		if (best_size.x != me.Size.x || best_size.y != me.Size.y) {
			console.log("New size is: " + best_size.x + " x " + best_size.y);
			me.Size.x = best_size.x;
			me.Size.y = best_size.y;
			canvas.style.width = me.Size.x + "px";
			canvas.style.height = me.Size.y + "px";
			console.log
			canvas.width = me.Size.x;
			canvas.height = me.Size.y;
			gl.viewport(0,0,me.Size.x,me.Size.y);
		}
	}

	window.addEventListener('resize', resized);
	resized();

	//--------------------------
	//init various openGL data:
	if (!engine.initShaders()) return;
	if (!engine.initMeshes()) return;

	//--------------------------
	//set up scene handling:
	var requestAnimFrame =
		window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
	;

	if (!requestAnimFrame) {
		alert("browser does not appear to support requestAnimationFrame");
		return;
	}

	//TODO: first scene should probably wait for resources to be loaded
	// before handing control over to the game.

	var scene = onstart();

	scene.enter && scene.enter();

	var previous = NaN;
	var acc = 0.0;
	function animate(timestamp) {
		if (isNaN(previous)) {
			previous = timestamp;
		}
		var elapsed = (timestamp - previous) / 1000.0;
		previous = timestamp;

		//Run tick (fixed timestep):
		acc += elapsed;
		while (acc > this.Tick * 0.5) {
			acc -= this.Tick;
			scene.tick && scene.tick();
		}

		//Run update (variable timestep):
		scene.update && scene.update(elapsed);

		//Draw:
		scene.draw();

		requestAnimFrame(animate);
	}

	requestAnimFrame(animate);

	//---------------------------------------------------

	console.log("  >=>       >====>     >=======> >=>        >=> ");
	console.log("  >=>       >=>   >=>  >=>       >=>        >=> ");
	console.log("  >=>       >=>    >=> >=>       >=>   >>   >=> ");
	console.log("  >=>       >=>    >=> >=====>   >=>  >=>   >=> ");
	console.log("  >=>       >=>    >=> >=>       >=> >> >=> >=> ");
	console.log("  >=>       >=>   >=>  >=>       >> >>    >===> ");
	console.log("  >=======> >====>     >=>       >=>        >=> ");
};
