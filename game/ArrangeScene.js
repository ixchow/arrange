var Vec3 = engine.Vec3;
var Mat4 = engine.Mat4;

var Tile = function(params) {
	this.verts2 = [-0.4,-0.4, -0.4,0.4, 0.4,0.4, 0.4,-0.4];
	this.color = {r:1.0, g:0.0, b:1.0};
	for (n in params) {
		this[n] = params[n];
	}
	return this;
};

//Eventually tiles will have their own meshes.
Tile.prototype.emit = function() {
	var vertsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts2), gl.STREAM_DRAW);

	var s = gl.getParameter(gl.CURRENT_PROGRAM);

	gl.enableVertexAttribArray(s.aVertex.location);
	gl.vertexAttribPointer(s.aVertex.location, 2, gl.FLOAT, false, 0, 0);

	if (s.aColor) {
		gl.vertexAttrib4f(s.aColor.location, this.color.r, this.color.g, this.color.b, 1.0);
	}

	gl.drawArrays(gl.LINE_LOOP, 0, this.verts2.length / 2);

	gl.disableVertexAttribArray(s.aVertex.location);
	gl.deleteBuffer(vertsBuffer);
	delete vertsBuffer;
};

//Path tiles have an entrance to the west in their default orientation.
var PathStart = new Tile({
	//verts2:[0.0,-0.5, 0.0,0.5, 0.5,0.5, 0.
});
var PathEnd = new Tile({ });
var PathStraight = new Tile({ });
var PathLeft = new Tile({ });
var PathRight = new Tile({ });
var Block = new Tile({ });

//Rotations are 0,1,2,3 corresponding to rotating CC in 90-degree increments.
//rot() performs rotations around the center of tile (0,0)
function rot(r, pt) {
	if (r < 0) r = (r % 4) + 4;
	else if (r >= 4) r = r % 4;

	if (r == 0) {
		return {x:pt.x, y:pt.y};
	} else if (r == 1) {
		return {x:-pt.y, y:pt.x};
	} else if (r == 2) {
		return {x:-pt.x, y:-pt.y};
	} else if (r == 3) {
		return {x:pt.y, y:-pt.x};
	}
}

var ArrangeScene = function(level) {
	//TODO: actually load level from level.

	//The first tile in every fragment is the 'key' to the fragment,
	//and generally the point of interaction for that fragment.
	//It should be located at (0,0), since fragments rotate around (0,0)
	this.fragments = [
		{
			at:{x:0, y:0}, r:0,
			tiles:[
				{at:{x:0,y:0},r:0, tile:PathStart},
				{at:{x:1,y:1},r:0, tile:Block}
			]
		},
		{
			at:{x:1, y:2}, r:0,
			tiles:[
				{at:{x:0,y:0},r:1, tile:PathEnd},
				{at:{x:0,y:0},r:1, tile:Block},
			]
		}
	];

	this.currentFragment = null;

	this.buildCombined();

	this.camera = {
		eye:new Vec3(0.0, 0.0, 5.0),
		target:new Vec3(0.0, 0.0, 0.0),
		up:new Vec3(0.0, 1.0, 0.0)
	};

	this.mouseTile = null; //null when mouse is outside game

	return this;
};

var selectFb = null;

ArrangeScene.prototype.enter = function() {
	this.resize();
};

ArrangeScene.prototype.leave = function() {
};

ArrangeScene.prototype.resize = function() {
	console.log(arguments);

	if (!selectFb) {
		selectFb = gl.createFramebuffer();
		selectFb.colorTex = gl.createTexture();
		selectFb.depthRb = gl.createRenderbuffer();
	}
	selectFb.width = engine.Size.x;
	selectFb.height = engine.Size.y;

	gl.bindRenderbuffer(gl.RENDERBUFFER, selectFb.depthRb);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, selectFb.width, selectFb.height);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	gl.bindTexture(gl.TEXTURE_2D, selectFb.colorTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, selectFb.width, selectFb.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, selectFb.colorTex, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, selectFb.depthRb);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

ArrangeScene.prototype.buildCombined = function() {
	//Splat all fragments into this.combined (a rectangular grid)

	//First figure out the size of grid we need:
	var min = {x:Infinity, y:Infinity};
	var max = {x:-Infinity, y:-Infinity};
	this.fragments.forEach(function(f){
		f.tiles.forEach(function(t){
			var at = rot(f.r, t.at);
			at.x += f.at.x;
			at.y += f.at.y;
			min.x = Math.min(min.x, at.x);
			min.y = Math.min(min.y, at.y);
			max.x = Math.max(max.x, at.x);
			max.y = Math.max(max.y, at.y);
		});
	});

	//Allocate the grid:
	if (min.x > max.x || min.y > max.y) {
		this.combined = [];
		this.combined.min = {x:0, y:0};
		this.combined.size = {x:0, y:0};
		return;
	}
	this.combined = Array((max.x - min.x + 1) * (max.y - min.y + 1));
	this.combined.min = min;
	this.combined.size = {x:max.x - min.x + 1, y:max.y - min.y + 1};

	this.combined.index = function(at) {
		return (at.y - this.min.y) * this.size.x + (at.x - this.min.x);
	};

	//Each cell of combined stores a list of tiles:
	for (var i = 0; i < this.combined.length; ++i) {
		this.combined[i] = [];
	}

	//Fill in the lists:
	var combined = this.combined;
	this.fragments.forEach(function(f){
		f.tiles.forEach(function(t){
			var at = rot(f.r, t.at);
			at.x += f.at.x;
			var r = (t.r + f.r) % 4;

			var idx = combined.index(at);
			combined[idx].push({r:r, tile:t.tile, fragment:f});
		});
	});

	//TODO: check consistency
};

//These should probably get moved:
function lookAt(eye, target, up) {
	var y = up.normalized();
	var z = eye.minus(target).normalized();
	var x = y.cross(z);
	//matrix (column-major order):
	return new Mat4(
		x.x, y.x, z.x, 0.0,
		x.y, y.y, z.y, 0.0,
		x.z, y.z, z.z, 0.0,
		-eye.dot(x), -eye.dot(y), -eye.dot(z), 1.0
	);
}

function perspective(fovy, aspect, near, far) {
	var f =  Math.tan(fovy * 0.5 / 180.0 * Math.PI);
	return new Mat4(
		f / aspect, 0.0, 0.0, 0.0,
		0.0, f, 0.0, 0.0,
		0.0, 0.0, (far + near) / (near - far), -1.0,
		0.0, 0.0, 2 * (far * near) / (near - far), 0.0
	);
}

ArrangeScene.prototype.draw = function() {
	this.drawHelper(false);
	this.drawHelper(true);
};

ArrangeScene.prototype.drawHelper = function(drawSelect) {

	if (drawSelect) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb);
	}

	drawSelect = true; //DEBUG

	if (drawSelect) {
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
	} else {
		gl.clearColor(0.2, 0.2, 0.2, 1.0);
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	var s = drawSelect?shaders.select:shaders.solid;
	gl.useProgram(s);

	var MV = lookAt(this.camera.eye, this.camera.target, this.camera.up);
	var P = new Mat4(
		0.1, 0.0, 0.0, 0.0,
		0.0, 0.1 * (engine.Size.x / engine.Size.y), 0.0, 0.0,
		0.0, 0.0, 0.1, 0.0,
		0.0, 0.0, 0.0, 1.0
	);
	P = perspective(45.0, engine.Size.x / engine.Size.y, 0.1, 100.0);

	var MVP = P.times(MV);


	for (var x = 0; x < this.combined.size.x; ++x) {
		for (var y = 0; y < this.combined.size.y; ++y) {
			var tiles = this.combined[y * this.combined.size.x + x];
			var at = {x:this.combined.min.x + x, y:this.combined.min.y + y};

			if (drawSelect) {
				gl.vertexAttrib4f(s.aTag.location, x / 255.0, y / 255.0, 255, 255);
				//TODO: draw floor, somehow.
			}

			tiles.forEach(function(t, ti){
				//set up transform based on at,r:
				var xd = rot(t.r,{x:1, y:0});
				var yd = rot(t.r,{x:0, y:1});
				var xf = new Mat4(
					xd.x, xd.y, 0.0, 0.0,
					yd.x, yd.y, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					at.x, at.y, 0.0, 1.0
				);
				gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
				if (drawSelect) {
					gl.vertexAttrib4f(s.aTag.location, x / 255.0, y / 255.0, ti, 255);
				}
				t.tile.emit();
			});

		}
	}

	if (drawSelect) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	if (!drawSelect) {
		this.draw(true);
	}
};

ArrangeScene.prototype.mouse = function(x, y, isDown) {
	this.mouseTile = null;

	if (x < 0 || x >= engine.Size.x || y < 0 || y >= engine.Size.y) {
		return;
	}

	var tag = new Uint8Array(4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb)
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, tag);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)

	if (tag[0] == 255 || tag[1] == 255) {
		//mouse isn't over any tile.
		return;
	} else {
		this.mouseTile = {x: tag[0], y:tag[1]};
		console.log(this.mouseTile);
	}

};


exports = ArrangeScene;
