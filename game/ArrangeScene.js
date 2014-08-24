var Vec3 = engine.Vec3;
var Mat4 = engine.Mat4;

var TagZScale = 0.2;

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
	this.fragments = level();

	this.currentFragment = null;

	this.buildCombined();

	this.camera = {
		eye:new Vec3(5.0, 5.0, 5.0),
		target:new Vec3(0.0, 0.0, 0.0),
		up:new Vec3(0.0, 0.0, 1.0)
	};

	this.mouse2d = null; //screen position of mouse, if we have it

	this.mouseDown = false;
	this.hoverInfo = null; //info about tile mouse is hovering over
	this.dragInfo = null; //info about tile mouse is dragging

	this.spin = 0.0;
	this.problemPulse = new game.vfx.pulse(
		{r:200, g:170, b:100, a:170},
		{r:255, g:100, b:0, a:0}
	);

	this.selectDirty = true;

	return this;
};

var selectFb = null;

ArrangeScene.prototype.enter = function() {
	this.resize();
	this.update(0.0);
	engine.music.play(music.mike1, synths.bells);
};

ArrangeScene.prototype.leave = function() {
};

ArrangeScene.prototype.resize = function() {
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
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, selectFb.colorTex, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, selectFb.depthRb);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

ArrangeScene.prototype.update = function(elapsed) {
  this.problemPulse.advance(elapsed);
	
	//--- move the camera a bit just for the heck of it ---
	this.spin += elapsed;
	if (this.spin > 2.0 * Math.PI) this.spin = this.spin % (2.0 * Math.PI);

	var ang = (Math.sin(this.spin) * 0.01- 0.75) * Math.PI;
	this.camera.eye.x = this.camera.target.x + Math.cos(ang) * 5.0;
	this.camera.eye.y = this.camera.target.y + Math.sin(ang) * 5.0;

	var MV = lookAt(this.camera.eye, this.camera.target, this.camera.up);
	var P = new Mat4(
		0.1, 0.0, 0.0, 0.0,
		0.0, 0.1 * (engine.Size.x / engine.Size.y), 0.0, 0.0,
		0.0, 0.0,-0.01, 0.0,
		0.0, 0.0,-0.5, 1.0
	);
	//Alt: use perspective projection:
	//P = perspective(45.0, engine.Size.x / engine.Size.y, 0.1, 100.0);

	this.MVP = P.times(MV);

	//since the view is changing, mark select as dirty:
	this.selectDirty = true;

	//--- if dragging something, update mouse2d ---

	if (this.dragInfo && this.mouse2d) {
		this.updateDrag();
	}
}

ArrangeScene.prototype.buildCombined = function() {
	//Splat all fragments into this.combined (a rectangular grid)

	this.paths = [];

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
			at.y += f.at.y;
			var r = (t.r + f.r) % 4;

			var idx = combined.index(at);
			combined[idx].push({r:r, tile:t.tile, fragment:f});
		});
	});

	//Check consistency:
	this.checkCombined();

	//building combined changes the scene, so mark select as dirty:
	this.selectDirty = true;
};

ArrangeScene.prototype.checkCombined = function() {
	var combined = this.combined;
	this.problems = game.problems.determineProblems(combined);
	this.paths = game.paths.determinePaths(combined, this.problems);
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
		gl.disable(gl.BLEND);
	} else {
		gl.disable(gl.BLEND); //unclear if we want to or not
	}

	//drawSelect = true; //DEBUG

	if (drawSelect) {
		gl.clearColor(1.0, 1.0, 1.0, 0.0);
	} else {
		gl.clearColor(0.2, 0.2, 0.2, 1.0);
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);


	var s = drawSelect?shaders.select:shaders.solid;
	gl.useProgram(s);

	var MVP = this.MVP;

	if (drawSelect) {
		gl.uniform3f(s.uZ.location, 0.0, 0.0, 0.5 * TagZScale);
	}

	//Figure out direction x and y axes point in, so we can draw back-to-front:
	var xZ = MVP[2];
	var yZ = MVP[6];
	//(TODO: set x/y limits and steps based on this data)

	function tr(r, at) {
		var xd = rot(r,{x:1, y:0});
		var yd = rot(r,{x:0, y:1});
		var xf = new Mat4(
			0.5 * xd.x, 0.5 * xd.y, 0.0, 0.0,
			0.5 * yd.x, 0.5 * yd.y, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			at.x, at.y, 0.0, 1.0
		);
		gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
	}

	for (var x = 0; x < this.combined.size.x; ++x) {
		for (var y = 0; y < this.combined.size.y; ++y) {
			var tiles = this.combined[y * this.combined.size.x + x];
			var at = {x:this.combined.min.x + x, y:this.combined.min.y + y};

			if (tiles.length && !drawSelect) {
				//draw floor
				var xf = new Mat4(
					0.5, 0.0, 0.0, 0.0,
					0.0, 0.5, 0.0, 0.0,
					0.0, 0.0, 0.5, 0.0,
					at.x, at.y, 0.0, 1.0
				);
				gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
				meshes.tiles.empty.emit();
			}

			tiles.forEach(function(t, ti){
				if (!drawSelect && t.path) return;

				tr(t.r, at);
				if (drawSelect) {
					gl.vertexAttrib4f(s.aTag.location, x / 255.0, y / 255.0, ti, 255);
				}
				t.tile.emit();
			});

		}
	}

  tr(0, { x: 0, y: 0});
	// t.tile.emit();

	if (!drawSelect && this.paths && this.paths.length > 0) {
		s = shaders.select; //temp, will be shaders.path at some pt
		gl.useProgram(s);
		var combined = this.combined;
		this.paths.forEach(function(path, pi){
			gl.vertexAttrib4f(s.aTag.location, (0.5 + pi * 0.6234) % 1.0, 0.0, 1.0, 1.0);
			path.forEach(function(p){
				var t = p.s;
				var at = {x:p.x+combined.min.x, y:p.y+combined.min.y};
				var xd = rot(t.r,{x:1, y:0});
				var yd = rot(t.r,{x:0, y:1});
				var xf = new Mat4(
					0.5 * xd.x, 0.5 * xd.y, 0.0, 0.0,
					0.5 * yd.x, 0.5 * yd.y, 0.0, 0.0,
					0.0, 0.0, 0.5, 0.0,
					at.x, at.y, 0.0, 1.0
				);
				gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
				t.tile.emit();
			});
		});

		s = shaders.solid;
		gl.useProgram(s);
	}

	if (!drawSelect) {
		gl.uniformMatrix4fv(s.uMVP.location, false, MVP);
		this.problemPulse.draw(this.problems, MVP);
	}

	if (!drawSelect) {
		if (this.mouse2d) {
			var mouse3d;
			if (this.dragInfo) {
				mouse3d = this.mouseToPlane(this.dragInfo.z);
			} else if (this.hoverInfo) {
				mouse3d = this.mouseToPlane(this.hoverInfo.z);
			} else {
				mouse3d = this.mouseToPlane(0.0);
			}
			var ofs = new Mat4(
				0.1, 0.0, 0.0, 0.0,
				0.0, 0.1, 0.0, 0.0,
				0.0, 0.0, 0.1, 0.0,
				mouse3d.x, mouse3d.y, mouse3d.z, 1.0
			);
			gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(ofs));
			meshes.shapes.sphere.emit();
		}
	}

	if (drawSelect) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.selectDirty = false;
	}
};

ArrangeScene.prototype.mouseToPlane = function(z) {
	//Convert x,y into screen units:
	x = 2.0 * ((this.mouse2d.x + 0.5) / engine.Size.x - 0.5);
	y = 2.0 * ((this.mouse2d.y + 0.5) / engine.Size.y - 0.5);

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

	if (x < 0 || x >= engine.Size.x || y < 0 || y >= engine.Size.y) {
		return;
	}

	if (this.selectDirty) {
		this.drawHelper(true);
	}

	var tag = new Uint8Array(4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb)
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, tag);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)

	if (tag[0] != 255 && tag[1] != 255) {
		var tiles = this.combined[tag[1] * this.combined.size.x + tag[0]];
		var idx = tag[2];
		var z = tag[3] / 255.0 / TagZScale;
		if (idx == 255) {
			//hmm, hitting floor, need to figure that out.
			idx = 0;
		} else if (idx > tiles.length) {
			console.log("Got index " + idx + " which exceeds " + tiles.length);
			idx = 0;
		} else {
			var mouse3d = this.mouseToPlane(z);

			var fragment = tiles[idx].fragment;
			//var tile = tiles[idx].tile;
			if (!fragment.fixed) {
				this.hoverInfo = {
					at:{x:tag[0], y:tag[1]},
					z:mouse3d.z,
					fragment:fragment,
					//tile:tile,
					mouseToFragment:{x:fragment.at.x - mouse3d.x, y:fragment.at.y - mouse3d.y}
				};
			}
		}
	}

};

ArrangeScene.prototype.updateDrag = function() {
	var mouse3d = this.mouseToPlane(this.dragInfo.z);
	if (this.dragInfo.fragment) {
		var want = {
			x:mouse3d.x + this.dragInfo.mouseToFragment.x,
			y:mouse3d.y + this.dragInfo.mouseToFragment.y
		};
		want.x = Math.round(want.x);
		want.y = Math.round(want.y);
		if (this.dragInfo.fragment.at.x != want.x || this.dragInfo.fragment.at.y != want.y) {
			this.dragInfo.fragment.at.x = Math.round(want.x);
			this.dragInfo.fragment.at.y = Math.round(want.y);
			this.buildCombined();
			this.drawHelper(true);
		}
	} else {
		var ofs = {
			x:mouse3d.x - this.dragInfo.prevMouse3d.x,
			y:mouse3d.y - this.dragInfo.prevMouse3d.y
		};
		/*
		var mouse3d = this.mouseToPlane(this.dragInfo.z);
		this.dragInfo.prevMouse3d.x = mouse3d.x;
		this.dragInfo.prevMouse3d.y = mouse3d.y;
		*/

		this.camera.target.x -= ofs.x;
		this.camera.target.y -= ofs.y;
	}
};

ArrangeScene.prototype.mouse = function(x, y, isDown) {
	this.mouse2d = {x:x, y:y};

	if (!isDown && this.mouseDown) {
		//release drag:
		if (this.dragInfo) {
			this.updateDrag();
			this.dragInfo = null;
		}
		this.mouseDown = false;
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
		} else {
			var mouse3d = this.mouseToPlane(0.0);
			this.dragInfo = {
				z:0,
				prevMouse3d:{
					x:mouse3d.x,
					y:mouse3d.y
				}
			};
		}
	}

};

ArrangeScene.prototype.debug_rot = function(n) {
	rot_group(1, this.fragments[n]);
	this.buildCombined();
}

exports = ArrangeScene;
