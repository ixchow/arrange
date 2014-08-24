function Pulse(base, tip) {
	this.pulse = 0.0;
	this.base = base;
	this.tip = tip;
}

Pulse.prototype.advance = function(elapsed) {
	this.pulse += elapsed * 2.5;
	if (this.pulse > 2.0 * Math.PI) this.pulse = this.pulse % (2.0 * Math.PI);
}

Pulse.prototype.draw = function(list, MVP) {
	var xZ = MVP[2];
	var yZ = MVP[6];
	var pulse = this.pulse;

	if (list && list.length > 0) {
		list.forEach(function(p){
			p.z = xZ * p.at.x + yZ * p.at.y;
		});
		list.sort(function(a,b){ return b.z - a.z; });

		var verts3 = [];
		var colors4 = [];
		var v = [
			{x:-0.5, y:-0.5},
			{x: 0.5, y:-0.5},
			{x: 0.5, y: 0.5},
			{x:-0.5, y: 0.5}
		];
		v.forEach(function(p){
			p.z = p.x * xZ + p.y * yZ;
		});
		for (var i = 0; i < 4; ++i) {
			if (v[0].z < v[1].z && v[0].z > v[3].z) {
				break;
			}
			v.push(v.shift());
		}

		var base = this.base;
		var tip = this.tip;
		list.forEach(function(p){
			var h = 1.6 + 0.3 * Math.cos(pulse + p.at.x + p.at.y);
			verts3.push(p.at.x + v[0].x, p.at.y + v[0].y, 0.0);
			colors4.push(base.r, base.g, base.b, base.a);
			[0,1,2,3,0].forEach(function(i){
				verts3.push(p.at.x + v[i].x, p.at.y + v[i].y, 0.0);
				verts3.push(p.at.x + v[i].x, p.at.y + v[i].y, h);
				colors4.push(base.r, base.g, base.b, base.a);
				colors4.push(tip.r, tip.g, tip.b, tip.a);
			});
			verts3.push(p.at.x + v[0].x, p.at.y + v[0].y, h);
			colors4.push(tip.r, tip.g, tip.b, tip.a);
		});

		var s = shaders.solid;


		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(s);

		var vertsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts3), gl.STREAM_DRAW);
		gl.vertexAttribPointer(s.aVertex.location, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(s.aVertex.location);

		var colorsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors4), gl.STREAM_DRAW);
		gl.vertexAttribPointer(s.aColor.location, 4, gl.UNSIGNED_BYTE, true, 0, 0);
		gl.enableVertexAttribArray(s.aColor.location);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, verts3.length / 3);

		gl.disableVertexAttribArray(s.aColor.location);
		gl.deleteBuffer(colorsBuffer);
		delete colorsBuffer;

		gl.disableVertexAttribArray(s.aVertex.location);
		gl.deleteBuffer(vertsBuffer);
		delete vertsBuffer;
	}
}

exports = Pulse;
