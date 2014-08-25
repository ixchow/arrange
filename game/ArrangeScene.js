var Vec2 = engine.Vec2;
var Vec3 = engine.Vec3;
var Mat4 = engine.Mat4;

var TagZScale = 0.2;

var rot = function() { return game.utility.rot.apply(this, arguments); }

function rot_fragment(r, fragment, pivot) {
	if (!pivot) {
		pivot = {x:fragment.at.x, y:fragment.at.y};
	}
	//Figure out current local space of fragment:
	var xd = rot(fragment.r, {x:1, y:0});
	var yd = rot(fragment.r, {x:0, y:1});

	//transform pivot to local space of fragment:
	var local = {x:pivot.x - fragment.at.x, y:pivot.y - fragment.at.y};
	local = {
		x: local.x * xd.x + local.y * xd.y,
		y: local.x * yd.x + local.y * yd.y
	};

	//update fragment rotation:
	fragment.r = (fragment.r + r) % 4;

	//Get new local space of fragment:
	var xd = rot(fragment.r, {x:1, y:0});
	var yd = rot(fragment.r, {x:0, y:1});

	//see where local ended up:
	var next = {
		x:xd.x * local.x + yd.x * local.y + fragment.at.x,
		y:xd.y * local.x + yd.y * local.y + fragment.at.y
	};

	//Move fragment center to keep pivot in a uniform place:
	fragment.at.x += pivot.x - next.x;
	fragment.at.y += pivot.y - next.y;
}

var ArrangeScene = function(levelPath) {

	//stored info about the last mouse event:
	this.mouse2d = null; //screen position of mouse
	this.mouseDown = false; //was button down
	this.hoverInfo = null; //info about what the mouse is hovering over
	this.dragInfo = null; //info about what the mouse is dragging

	this.scriptPlayer = null; //if not null, there is a script a-playin' on this

	//camera is a simple lookAt camera:
	this.camera = {
		eye:new Vec3(5.0, 5.0, 5.0),
		target:new Vec3(0.0, 0.0, 0.0),
		up:new Vec3(0.0, 0.0, 1.0)
	};

	//this is reset when select is redrawn:
	this.selectTagMin = {x:0, y:0};


	//graphical flourish stuff:
	this.spin = 0.0;
	this.problemPulse = new game.vfx.pulse(
		{r:200, g:170, b:100, a:170},
		{r:255, g:100, b:0, a:0}
	);
	this.hoverPulse = new game.vfx.pulse(
		{r:170, g:170, b:170, a:170},
		{r:255, g:255, b:255, a:0}
	);
	this.requirePulse = new game.vfx.pulse(
		{r:200, g:50, b:0, a:170},
		{r:255, g:0, b:0, a:0}
	);

	//This actually takes care of building the level:
	this.setLevelPath(levelPath);

	return this;
};

ArrangeScene.prototype.setLevelPath = function(levelPath) {
	this.levelPath = levelPath;

	//TODO: look up localState and storyState in some sort of state manager.
	this.localState = {
		played:{}
	};
	this.storyState = {};
	/*
	//TODO: if story state wasn't found, look up *previous* story state and move to this level.
	if (previousStoryState) {
		for (prop in previousStoryState) {
			this.storyState[prop] = previousStoryState[prop];
		}
	}
	*/

	var buildLevel = game.levels[this.levelPath.split('.').pop()];

	//build a new copy of the level:
	this.level = buildLevel();
	this.fragments = this.level.fragments;
	//(TODO: copy fragment positions from localState as needed)
	//builds this.combined, populates this.problems, and updates this.scriptTriggers:
	this.buildCombined();

	//reset all be book-keeping stuff:
	this.camera.target.x = this.combined.min.x + 0.5 * this.combined.size.x - 0.5;
	this.camera.target.y = this.combined.min.y + 0.5 * this.combined.size.y - 0.5;
	this.camera.eye = this.camera.target.plus(new Vec3(5.0, 5.0, 5.0));

	//Okay, against my better judgement, I'm going to try not clearing this.
	// Scripts can get into a weird execution environment this way:
	//this.scriptPlayer = null;

	this.mouseDown = false;

	this.hoverInfo = null; //info about tile mouse is hovering over
	this.dragInfo = null; //info about tile mouse is dragging

	this.selectDirty = true;

	if (this.level.music) {
		engine.music.play(this.level.music, this.level.synth);
	}
};

ArrangeScene.prototype.toNextLevel = function(levelName) {
	var newPath = this.levelPath + '.' + levelName;
	this.setLevelPath(newPath);
};

ArrangeScene.prototype.toPreviousLevel = function() {
	var path = this.levelPath.split('.');
	path.pop();
	if (path.length == 0) {
		//TODO: possibly back to start scene?
		this.restartLevel();
	} else {
		this.setLevelPath('.'.join(path));
	}
};

ArrangeScene.prototype.restartLevel = function() {
	//TODO: clear localState and storyState in the state manager.
	this.setLevelPath(this.levelPath);
};

var selectFb = null;

ArrangeScene.prototype.enter = function() {
	this.resize();
	this.update(0.0);
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

ArrangeScene.prototype.findTag = function(tag) {
	var found = undefined;
	this.fragments.some(function(f){
		f.tiles.some(function(t){
			if (t.tag == tag) {
				var dx = rot(f.r, {x:1, y:0});
				var dy = rot(f.r, {x:0, y:1});
				found = new Vec2(
					dx.x * t.at.x + dy.x * t.at.y + f.at.x,
					dx.y * t.at.x + dy.y * t.at.y + f.at.y
				);
			}
			return found;
		});
		return found;
	});
	if (!found) {
		throw "Missing tag '" + tag + "'";
	}
	return found;
};


ArrangeScene.prototype.update = function(elapsed) {

	
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


	if (this.scriptPlayer) {
		this.scriptPlayer.update(elapsed);
		if (this.scriptPlayer.finished) {
			//Mark script as played:
			this.localState.played[this.scriptPlayer.trigger.name] = true;
			delete this.scriptPlayer;
			//Update level (and script triggers), just in case:
			this.buildCombined();

			//...and continue with update as per normal...
		} else {
			return;
		}
	}

	this.problemPulse.advance(elapsed);
	this.hoverPulse.advance(elapsed*1.7);
	this.requirePulse.advance(elapsed);

	//--- if dragging something, update mouse2d ---

	if (this.dragInfo && this.mouse2d) {
		this.updateDrag();
	}
	if (!this.dragInfo && this.needScriptTriggers) {
		this.updateScriptTriggers();
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
			combined[idx].push({r:r, t:t, tile:t.tile, fragment:f});
		});
	});

	//Check consistency:
	this.checkCombined();

	//Mark that we need script triggers (will be updated when drag is finished):
	this.scriptTriggers = [];
	if (this.dragInfo) {
		this.needScriptTriggers = true;
	} else {
		this.updateScriptTriggers();
	}

	//building combined changes the scene, so mark select as dirty:
	this.selectDirty = true;
};

ArrangeScene.prototype.updateScriptTriggers = function() {
	delete this.needScriptTriggers;
	this.scriptTriggers = [];
	this.level.addScriptTriggers && this.level.addScriptTriggers(this);
};

ArrangeScene.prototype.checkCombined = function() {
	var combined = this.combined;
	this.problems = game.problems.determineProblems(combined);
	this.paths = game.paths.determinePaths(combined, this.problems);
	this.require_problems = game.provides_requires.check(combined);
	var pathsSolved = this.paths.every(function(path){
		if (path.length < 2) return false;
		var last = path[path.length-1];
		if (!last.s) return false;
		if ('pathOut' in last.s.tile) return false;
		return true;
	});
	this.solved = (this.problems.length == 0) && (this.require_problems.length == 0) && pathsSolved;
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
		this.selectTagMin = {
			x:this.combined.min.x,
			y:this.combined.min.y
		};
		//TODO: if we want to allow script triggers outside the level,
		//  adjust the min based on script trigger positions.
	}

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

	//Updates the transformation matrix in the current shader for a given
	// rotation and position:
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
			var stack = this.combined[y * this.combined.size.x + x];
			var at = {x:this.combined.min.x + x, y:this.combined.min.y + y};

			var tag = {x:at.x - this.selectTagMin.x, y:at.y - this.selectTagMin.y};

			if (stack.length && !drawSelect) {
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

			stack.forEach(function(t, ti){
				if (!drawSelect && t.path) return;

				tr(t.r, at);
				if (drawSelect) {
					gl.vertexAttrib3f(s.aTag.location, tag.x / 255.0, tag.y / 255.0, ti / 255.0);
				}
				t.tile.emit();
				//draw rotation action icons:
				if (!this.scriptPlayer && t.t.pivot) {
					var xf = new Mat4(
						0.5, 0.0, 0.0, 0.0,
						0.0, 0.5, 0.0, 0.0,
						0.0, 0.0, 0.5, 0.0,
						at.x, at.y, 0.0, 1.0
					);
					if (drawSelect) {
						gl.vertexAttrib3f(s.aTag.location, tag.x / 255.0, tag.y / 255.0, ti / 255.0);
					}
					gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
					meshes.icons.rotate.emit();
				}
			});

		}
	}

	//Draw action icons (script triggers):
	if (!this.scriptPlayer) {
		var selectTagMin = this.selectTagMin;
		this.scriptTriggers.forEach(function(st){
			//TODO: if script has played already, skip drawing
			var xf = new Mat4(
				0.5, 0.0, 0.0, 0.0,
				0.0, 0.5, 0.0, 0.0,
				0.0, 0.0, 0.5, 0.0,
				st.at.x, st.at.y, 0.0, 1.0
			);
			gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));
			//TODO: select icon based on script info (e.g. different icon for exit)
			//TODO: orient for viewing direction
			if (drawSelect) {
				var tag = {
					x:st.at.x - selectTagMin.x,
					y:st.at.y - selectTagMin.y
				};
				gl.vertexAttrib3f(s.aTag.location, tag.x / 255.0, tag.y / 255.0, 255);
			}

			meshes.icons.play.emit();
		});
	}

	if (!drawSelect && this.paths && this.paths.length > 0) {
		s = shaders.select; //temp, will be shaders.path at some pt
		gl.useProgram(s);
		var combined = this.combined;
		this.paths.forEach(function(path, pi){
			gl.vertexAttrib3f(s.aTag.location, (0.5 + pi * 0.6234) % 1.0, 0.0, 1.0);
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

	if (!this.scriptPlayer && !drawSelect) {
		gl.uniformMatrix4fv(s.uMVP.location, false, MVP);
		this.problemPulse.draw(this.problems, MVP);
		if (this.hoverInfo) {
			if (this.hoverInfo.scriptTrigger) {
				this.hoverPulse.draw([{at:this.hoverInfo.at}], MVP);
			} else if (this.hoverInfo.fragment) {
				var f = this.hoverInfo.fragment;
				var dx = rot(f.r,{x:1,y:0});
				var dy = rot(f.r,{x:0,y:1});
				this.hoverPulse.draw(f.tiles.map(function (t) {
					return {at: {
						x: t.at.x * dx.x + t.at.y * dy.x + f.at.x,
						y: t.at.x * dx.y + t.at.y * dy.y + f.at.y}};
				}), MVP);
			}
		}
		this.requirePulse.draw(this.require_problems, MVP);
	}

	if (!this.scriptPlayer && !drawSelect) {
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

	if (!drawSelect && this.scriptPlayer) {
		this.scriptPlayer.draw(this.MVP);
	}

	if (drawSelect) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.selectDirty = false;
	}
};

ArrangeScene.prototype.pixelToPlane = function(x,y,z) {
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

ArrangeScene.prototype.mouseToPlane = function(z) {
	return this.pixelToPlane(this.mouse2d.x, this.mouse2d.y, z);
};

ArrangeScene.prototype.setHoverInfo = function(x, y) {
	this.hoverInfo = null;

	if (x < 0 || x >= engine.Size.x || y < 0 || y >= engine.Size.y) {
		return;
	}

	var hoverInfo = {};
	this.hoverInfo = hoverInfo;

	if (this.selectDirty) {
		this.drawHelper(true);
	}

	var tag = new Uint8Array(4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, selectFb)
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, tag);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);


	//Fill in what we can about the hover info from the tag:

	var idx = 255; //idx of '255' is "don't know"
	if (tag[0] != 255 && tag[1] != 255) {
		//If we didn't hit the background, can get info from tag:
		hoverInfo.at = {
			x:tag[0] + this.selectTagMin.x,
			y:tag[1] + this.selectTagMin.y
		};
		hoverInfo.z = tag[3] / (255.0 * TagZScale);
		idx = tag[2];
	} else {
		//hit background, so project to ground plane:
		var mouse3d = this.pixelToPlane(x,y,0.0);
		hoverInfo.at = {x:Math.round(mouse3d.x), y:Math.round(mouse3d.y)};
		hoverInfo.z = 0.0;
	}

	this.scriptTriggers.some(function(st){
		//TODO: check if script trigger has been played
		if (st.at.x == hoverInfo.at.x && st.at.y == hoverInfo.at.y) {
			hoverInfo.scriptTrigger = st;
			return true;
		}
		return false;
	});

	//If there is a script trigger in this tile, it takes precedence over
	// all other actions:
	if (hoverInfo.scriptTrigger) {
		return;
	}

	//See if there is a fragment under this hover:
	if (hoverInfo.at.x >= this.combined.min.x
	 && hoverInfo.at.y >= this.combined.min.y
	 && hoverInfo.at.x < this.combined.min.x + this.combined.size.x
	 && hoverInfo.at.y < this.combined.min.y + this.combined.size.y) {
		var stack = this.combined[this.combined.index(hoverInfo.at)];
		if (idx == 255) {
			//hit the ground, so find something interesting
			stack.some(function(s,i){
				if (!s.fragment.fixed) {
					idx = i;
					return true;
				}
				return false;
			});
		} else if (idx > stack.length) {
			console.warn("tag index " + idx + " greater than stack count (" + stack.length + ") here.");
		}
		if (idx < stack.length) {
			var fragment = stack[idx].fragment;
			if (!fragment.fixed) {
				//store info about hovered fragment:
				hoverInfo.t = stack[idx].t;
				hoverInfo.fragment = fragment;
				var mouse3d = this.pixelToPlane(x,y,this.hoverInfo.z);
				hoverInfo.mouseToFragment = {x:fragment.at.x - mouse3d.x, y:fragment.at.y - mouse3d.y};
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

	if (this.scriptPlayer) {
		this.hoverInfo = null;
		this.dragInfo = null;
		if (!isDown && this.mouseDown) {
			this.mouseDown = false;
		} else if (isDown && !this.mouseDown) {
			this.scriptPlayer.advance = true;
			this.mouseDown = true;
		}
		return;
	}

	if (!isDown && this.mouseDown) {
		this.mouseDown = false;
		//release drag, if dragging:
		if (this.dragInfo) {
			this.updateDrag();
			this.dragInfo = null;
			if (this.needScriptTriggers) {
				this.updateScriptTriggers();
			}
		}
	}

	//if we aren't dragging, adjust hover info:
	if (!this.dragInfo) {
		this.setHoverInfo(x,y);
	}

	//if mouse was just pressed down, take action:
	if (isDown && !this.mouseDown) {
		if (this.hoverInfo) {
			if (this.hoverInfo.scriptTrigger) {
				//console.log("Will play script '" + this.hoverInfo.scriptTrigger.name + "'");
				this.scriptPlayer = new game.ScriptPlayer(this.hoverInfo.scriptTrigger.script);
				//stash this reference for later use:
				this.scriptPlayer.trigger = this.hoverInfo.scriptTrigger;
			} else if (this.hoverInfo.fragment) {
				if (this.hoverInfo.t.pivot) {
					console.log("Rotating");
					rot_fragment(1, this.hoverInfo.fragment, this.hoverInfo.at);
					this.buildCombined();
				} else {
					this.dragInfo = this.hoverInfo;
				}
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
		this.mouseDown = true;
	}
};

exports = ArrangeScene;
