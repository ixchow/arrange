var Mesh = function(data) {
	//TODO: create vertex buffer for mesh, upload mesh data.
	this.verts3 = data.verts3;
	this.colors4 = data.colors4;
	this.localToWorld = data.localToWorld;
	this.localToParent = data.localToParent;
	return this;
};

Mesh.prototype.emit = function() {
	var s = gl.getParameter(gl.CURRENT_PROGRAM);

	var vertsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.verts3, gl.STREAM_DRAW);
	gl.vertexAttribPointer(s.aVertex.location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(s.aVertex.location);

	var colorsBuffer = null;
	if (s.aColor) {
		colorsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
		gl.BufferData(gl.ARRAY_BUFFER, this.colors4, gl.STREAM_DRAW);
		gl.vertexAttribPointer(s.aColor.location, 5, gl.UNSIGNED_BYTE, true, 0, 0);
		gl.enableVertexAttribArray(s.aColor.location);
	}

	gl.drawArrays(gl.TRIANGLES, 0, this.verts3.length / 3);

	if (s.aColor) {
		gl.disableVertexAttribArray(s.aColor.location);
		gl.deleteBuffer(colorsBuffer);
		delete colorsBuffer;
	}

	gl.disableVertexAttribArray(s.aVertex.location);
	gl.deleteBuffer(vertsBuffer);
	delete vertsBuffer;
};

exports = Mesh;
