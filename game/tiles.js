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

exports = {
	//Path tiles have an entrance to the west in their default orientation.
	PathStart: new Tile({
		//verts2:[0.0,-0.5, 0.0,0.5, 0.5,0.5, 0.
	}),
	PathEnd: new Tile({ }),
	PathStraight: new Tile({ }),
	PathLeft: new Tile({ }),
	PathRight: new Tile({ }),
	Block: new Tile({ })
};
