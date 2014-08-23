var Vec3 = engine.Vec3;
var Mat4 = engine.Mat4;

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

function rot_group(r, group) {
	group.tiles.forEach(function(f) {
		f.at = rot(r, f.at);
	});
}

var ArrangeScene = function(level) {
	//TODO: actually load level from level.

	//The first tile in every fragment is the 'key' to the fragment,
	//and generally the point of interaction for that fragment.
	//It should be located at (0,0), since fragments rotate around (0,0)
	this.fragments = game.level1();

	this.currentFragment = null;

	this.buildCombined();

	this.camera = {
		eye:new Vec3(5.0, 5.0, 5.0),
		target:new Vec3(0.0, 0.0, 0.0),
		up:new Vec3(0.0, 0.0, 1.0)
	};

	this.mouseDown = false;
	this.hoverInfo = null; //info about tile mouse is hovering over
	this.dragInfo = null; //info about tile mouse is dragging

	this.spin = 0.0;

	return this;
};

var selectFb = null;

ArrangeScene.prototype.enter = function() {
	this.resize();
	engine.music.play(music.mike1, synths.bells);
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

ArrangeScene.prototype.update = function(elapsed) {
	this.spin += elapsed;
	if (this.spin > 2.0 * Math.PI) this.spin = this.spin % (2.0 * Math.PI);

	var ang = (Math.sin(this.spin) * 0.01- 0.75) * Math.PI;
	this.camera.eye.x = Math.cos(ang) * 5.0;
	this.camera.eye.y = Math.sin(ang) * 5.0;
}

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
	var z = eye.minus(target).normalized();
	var y = up.minus(z.times(z.dot(up))).normalized();
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

	//drawSelect = true; //DEBUG

	if (drawSelect) {
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
	} else {
		gl.clearColor(0.2, 0.2, 0.2, 1.0);
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);


	var s = drawSelect?shaders.select:shaders.solid;
	gl.useProgram(s);

	var MV = lookAt(this.camera.eye, this.camera.target, this.camera.up);
	var P = new Mat4(
		0.1, 0.0, 0.0, 0.0,
		0.0, 0.1 * (engine.Size.x / engine.Size.y), 0.0, 0.0,
		0.0, 0.0,-0.1, 0.0,
		0.0, 0.0, 0.0, 1.0
	);
	//P = perspective(45.0, engine.Size.x / engine.Size.y, 0.1, 100.0);

	var MVP = P.times(MV);

	this.MVP = MVP;

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
					0.5 * xd.x, 0.5 * xd.y, 0.0, 0.0,
					0.5 * yd.x, 0.5 * yd.y, 0.0, 0.0,
					0.0, 0.0, 0.5, 0.0,
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

	if (!drawSelect && this.mouse3d) {
		var ofs = new Mat4(
			0.1, 0.0, 0.0, 0.0,
			0.0, 0.1, 0.0, 0.0,
			0.0, 0.0, 0.1, 0.0,
			this.mouse3d.x, this.mouse3d.y, this.mouse3d.z, 1.0
		);
		gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(ofs));
		meshes.shapes.sphere.emit();
	}

	if (drawSelect) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
};

ArrangeScene.prototype.mouseToPlane = function(x,y,z) {
	//Convert x,y into screen units:
	x = 2.0 * ((x + 0.5) / engine.Size.x - 0.5);
	y = 2.0 * ((y + 0.5) / engine.Size.y - 0.5);

	//project mouse position into plane at height 'z':
	// Have px * MVP[ ... ] + py * MVP[ ... ] = pt
	// Want:
	// pt.x = x * pt.w
	// pt.y = y * pt.w

	//pt.x == px * MVP[0,0] + py * MVP[0,1] + z * MVP[0,2] + MVP[0,3]
	//pt.y == px * MVP[1,0] + py * MVP[1,1] + z * MVP[1,2] + MVP[1,3]
	//pt.w == px * MVP[3,0] + py * MVP[3,1] + z * MVP[3,2] + MVP[3,3]

	//Set up as matrix:
	// [m00 m01 m02] [px] = [0]
	// [m10 m11 m12] [py]   [0]
	//               [ 1]

	var MVP = this.MVP;

	//start with matrix that computes pt.x, pt.y:
	var ptx = [ MVP[0], MVP[4], z * MVP[8] + 1.0 * MVP[12] ];
	var pty = [ MVP[1], MVP[5], z * MVP[9] + 1.0 * MVP[13] ];
	var ptw = [ MVP[3], MVP[7], z * MVP[11] + 1.0 * MVP[15] ];
	var mat = [
		[ ptx[0] - x * ptw[0], ptx[1] - x * ptw[1], ptx[2] - x * ptw[2] ],
		[ pty[0] - y * ptw[0], pty[1] - y * ptw[1], pty[2] - y * ptw[2] ]
	];

	var det = mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
	if (det == 0.0) {
		return new Vec3(0.0, 0.0, z);
	} else {
		var invDet = 1.0 / det;
		var invMat = [
			[invDet * mat[1][1],-invDet * mat[0][1]],
			[-invDet * mat[1][0], invDet * mat[0][0]]
		];
		var px = invMat[0][0] * mat[0][2] + invMat[0][1] * mat[1][2];
		var py = invMat[1][0] * mat[0][2] + invMat[1][1] * mat[1][2];

		var pt = new Vec3(-px, -py, z);

		//CHECK:
		var mul = [
			mat[0][0] * pt.x + mat[0][1] * pt.y + mat[0][2],
			mat[1][0] * pt.x + mat[1][1] * pt.y + mat[1][2]
		];
		//console.log("Should be 0,0-ish: ",mul);

		return pt;
	}
};

ArrangeScene.prototype.setHoverInfo = function(x, y) {
	this.hoverInfo = null;

	this.mouse3d = null; //DEBUG

	if (x < 0 || x >= engine.Size.x || y < 0 || y >= engine.Size.y) {
		return;
	}

	var tag = new Uint8Array(4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb)
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, tag);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)

	if (tag[0] != 255 && tag[1] != 255) {
		var tiles = this.combined[tag[1] * this.combined.size.y + tag[0]];
		var idx = tag[2];
		if (idx == 255) {
			//hmm, hitting floor, need to figure that out.
			idx = 0;
		} else if (idx > tiles.length) {
			console.log("Got index " + idx + " which exceeds " + tiles.length);
			idx = 0;
		} else {
			var z = 0.0;
			//TODO: read z from tag
			var mouse3d = this.mouseToPlane(x,y,z);

			var fragment = tiles[idx].fragment;
			//var tile = tiles[idx].tile;
			this.hoverInfo = {
				at:{x:tag[0], y:tag[1]},
				fragment:fragment,
				//tile:tile,
				toMouse:mouse3d.minus(new Vec3(fragment.at.x, fragment.at.y, 0.0))
			};

			this.mouse3d = mouse3d; //DEBUG
		}
	}

};

ArrangeScene.prototype.mouse = function(x, y, isDown) {
	if (this.dragInfo) {
		//update thing we are dragging.
	}

	if (!isDown && this.mouseDown) {
		//release drag:
		this.mouseDown = false;
		this.dragInfo = null;
	}

	//if we aren't dragging, adjust hover info:
	if (!this.dragInfo) {
		this.setHoverInfo(x,y);
	}

	//if mouse was just pressed down, start dragging:
	if (isDown && !this.mouseDown) {
		this.mouseDown = true;
		if (this.hoverInfo) {
			this.dragInfo = this.hoverInfo;
		}
	}

};

ArrangeScene.prototype.debug_move = function(n, x, y) {
	this.fragments[n].at.x += x;
	this.fragments[n].at.y += y;
	this.buildCombined();
}

ArrangeScene.prototype.debug_rot = function(n) {
	rot_group(1, this.fragments[n]);
	this.buildCombined();
}

exports = ArrangeScene;
