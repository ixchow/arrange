var Mat4 = engine.Mat4;
var Vec4 = engine.Vec4;

var warpFunc = function() {};

function PawnState(actions, signals) {
	this.actions = actions;
	this.signals = signals;
	this.action = -1;
	this.wait = {}; //don't need to wait on anything
	return this;
};

PawnState.prototype.isFinished = function() {
	return this.action >= this.actions.length;
};

PawnState.prototype.nextAction = function() {
	if (this.action >= this.actions.length) return;
	this.action += 1;

	//Cleanup:
	delete this.txt;
	delete this.nar;
	if ('txtObj' in this) {
		this.txtObj.dismiss();
		delete this.txtObj;
	}
	if ('narObj' in this) {
		this.narObj.dismiss();
		delete this.narObj;
	}

	if (this.action >= this.actions.length) return;

	//Look at first (one hopes only) key in the new action:
	for (var op in this.actions[this.action]) {
		var param = this.actions[this.action][op];
		if (op == 'appear') {
			this.at = param;
		} else if (op == 'vanish') {
			delete this.at;
		} else if (op == 'wait') {
			if (typeof(param) == "number") {
				this.wait = {time:param};
			} else {
				this.wait = {signal:param};
			}
		} else if (op == 'emit') {
			this.signals[param] = true;
		} else if (op == 'say') {
			this.txt = param;
			this.cl = this.actions[this.action].cl || 'char1';
			this.wait = {advance:true};
		} else if (op == 'narrate') {
			this.nar = param;
			this.cl = this.actions[this.action].cl || 'char1';
			this.wait = {advance:true};
		} else if (op == 'walk') {
			//make a copy of the walk path:
			var path = [];
			if (this.at) {
				path.push({x:this.at.x, y:this.at.y});
			}
			param.forEach(function(p){
				path.push({x:p.x, y:p.y});
			});
			if (!this.at && path.length > 0) {
				this.at = {x:path[0].x, y:path[0].y};
			}
			this.wait = {animate:function(have){
				var Speed = 1.9;
				var travel = have.time * Speed;
				while (path.length > 0 && travel >= 0.0) {
					var next = path[0];
					var to = {x:next.x - this.at.x, y:next.y - this.at.y};
					var dis = Math.sqrt(to.x * to.x + to.y * to.y);
					if (dis <= travel) {
						path.shift();
						this.at = {x:next.x, y:next.y};
						travel -= dis;
					} else {
						var fac = travel / dis;
						this.at = {x:this.at.x + to.x * fac, y:this.at.y + to.y * fac};
						travel = 0.0;
						break;
					}
				}
				have.time = travel / Speed;
				return(path.length > 0);
			}};
		} else if (op == 'warp') {
			warpFunc(param);
		} else if (op == 'do') {
			param.call(null);
		} else {
			console.error("Unknown operation '" + op + "' in script.");
		}
		break;
	}
};

function ScriptPlayer(script) {
	this.script = script;
	this.signals = {};
	this.pawnState = {};
	for (var name in this.script) {
		this.pawnState[name] = new PawnState(this.script[name].actions, this.signals);
	}
	this.finished = false;
	this.needAdvance = false;
	this.advance = false;
	return this;
}

ScriptPlayer.prototype.update = function(elapsed) {
	if (this.finished) return;

	if (engine.CurrentScene && engine.CurrentScene.scriptPlayer === this) {
		warpFunc = function(x) {
			engine.CurrentScene.toNextLevel(x);
		};
	} else {
		warpFunc = function(x) {
			console.warn("Wanted to warp to '" + x + "', but we aren't the active script.");
		};
	}

	this.needAdvance = false;

	//record available resources for each pawn:
	for (var name in this.pawnState) {
		this.pawnState[name].have = {
			time:elapsed,
			advance:this.advance
		};
	}

	//now keep advancing pawns while they can make progress and have resources:
	var progress = true;
	while (progress) {
		progress = false;
		for (var name in this.pawnState) {
			var ps = this.pawnState[name];
			var haveAdvance = this.advance;
			while (ps.have.time >= 0.0 && !ps.isFinished()) {
				//Clear any waiting we can:
				var needWait = false;
				if ('advance' in ps.wait) {
					if (ps.have.advance) {
						ps.have.advance = false;
						delete ps.wait.advance;
					} else {
						this.needAdvance = true;
						needWait = true;
					}
				}
				if ('signal' in ps.wait) {
					if (ps.wait.signal in this.signals) {
						delete ps.wait.signal;
					} else {
						needWait = true;
					}
				}
				if ('time' in ps.wait) {
					ps.wait.time -= ps.have.time;
					if (ps.wait.time <= 0.0) {
						ps.have.time = -ps.wait.time;
						delete ps.wait.time;
					} else {
						needWait = true;
					}
				}
				if ('animate' in ps.wait) {
					if (!ps.wait.animate.call(ps, ps.have)) {
						delete ps.wait.animate;
					} else {
						needWait = true;
					}
				}
				if (needWait) {
					break;
				}
				//Great, don't have any waiting to do, so advance:
				if (Object.getOwnPropertyNames(ps.wait).length > 0) {
					console.error("Deleting unknown waits", ps.wait);
				}
				ps.wait = {};
				//If if no waiting remains, advance:
				ps.nextAction();
				progress = true;
				ps.have.time -= 0.1; //DEBUG
			}
		}
	}

	//clean up pawn resources, update finished state:
	this.finished = true;
	for (var name in this.pawnState) {
		var ps = this.pawnState[name];
		delete ps.have;
		this.finished = this.finished && ps.isFinished();
	}

	this.advance = false;
};

ScriptPlayer.prototype.draw = function(MVP) {
	var s = gl.getParameter(gl.CURRENT_PROGRAM);
	for (var name in this.pawnState) {
		var ps = this.pawnState[name];
		if (ps.at) {
			var xf = new Mat4(
				0.5, 0.0, 0.0, 0.0,
				0.0, 0.5, 0.0, 0.0,
				0.0, 0.0, 0.5, 0.0,
				ps.at.x, ps.at.y, 0.0, 1.0
			);
			gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(xf));

			if (this.script[name].mesh) {
				this.script[name].mesh.emit();
			}

			if ('txt' in ps) {
				var proj = MVP.times(new Vec4(ps.at.x, ps.at.y, 1.5, 1.0));
				var pos = {
					x:proj.x / proj.w,
					y:proj.y / proj.w
				};
				pos.x = (pos.x * 0.5 + 0.5) * engine.Size.x;
				pos.y = (pos.y * 0.5 + 0.5) * engine.Size.y;
				if (!('txtObj' in ps)) {
					ps.txtObj = new engine.text(ps.txt, pos, ps.cl);
				} else {
					ps.txtObj.moveTo(pos);
				}
			}
		} else {
			if ('txt' in ps) {
				if (!('txtObj' in ps)) {
					ps.txtObj = new engine.text(ps.txt,null, ps.cl);
				} else {
					ps.txtObj.moveTo(null);
				}
			}
		}
		if ('nar' in ps) {
			if (!('narObj' in ps)) {
				ps.narObj = new engine.text(ps.nar,null, ps.cl);
			} else {
				ps.narObj.moveTo(null);
			}
		}
	}
};

ScriptPlayer.prototype.skip = function() {
};

exports = ScriptPlayer;
