exports.Tick = 1.0 / 60.0;
exports.Size = null; //Set during init {x:.., y:..}, updated on resize

exports.init = function(onstart) {

	//--------------------------
	//initialize canvas and WebGL:
	var canvas = document.getElementById("canvas");
	var base_size = {x:canvas.width, y:canvas.height};
	this.Size = {x:base_size.x, y:base_size.y};

	//based on:
	// https://developer.mozilla.org/en-US/docs/WebGL/Getting_started_with_WebGL

	window.gl = null;
	try {
		var attribs = {};
		attribs.antialias = true;
		gl = canvas.getContext("webgl", attribs) || canvas.getcontext("experimental-webgl", attribs);
	}
	catch(e) {
		console.log("Exception creating webgl context: " + e);
	}

	if (!gl) {
		alert("Unable to initialize WebGL.");
		//TODO: some sort of error handling that's a bit more graceful.
	}

	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);


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
		alert("browser does not support requestAnimationFrame");
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

	console.log("  >=>       >====>     >=======> >=>        >=> ");
	console.log("  >=>       >=>   >=>  >=>       >=>        >=> ");
	console.log("  >=>       >=>    >=> >=>       >=>   >>   >=> ");
	console.log("  >=>       >=>    >=> >=====>   >=>  >=>   >=> ");
	console.log("  >=>       >=>    >=> >=>       >=> >> >=> >=> ");
	console.log("  >=>       >=>   >=>  >=>       >> >>    >===> ");
	console.log("  >=======> >====>     >=>       >=>        >=> ");
};
