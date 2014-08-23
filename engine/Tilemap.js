/*
 * Tilemaps work on a TileSet,
 *   which associates a Tile to one or more ASCII characters,
 *   and a 
 */
var Tilemap = function(tileset, map) {
	this.tileset = tileset;
	this.map = map;

	this.rows = this.map.length;
	this.cols = 0;
	for (var r = 0; r < this.rows; ++r) {
		if (this.map[r].length > this.cols) {
			this.cols = this.map[r].length;
		}
	}
	for (var r = 0; r < this.rows; ++r) {
		for (var c = 0; c < this.map[r].length; ++c) {
			if (!(this.map[r][c] in tileset)) {
				console.warn("Tile '" + this.map[r][c] + "' missing from tileset.");
			}
		}
	}

	return this;
};

Tilemap.prototype.at = function(x,y) {
	
};

Tilemap.prototype.draw = function(shader, MVP) {
	var vertsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);

	gl.useProgram(s.program);

	gl.enableVertexAttribArray(s.aVertex.location);
	gl.vertexAttribPointer(s.aVertex.location, 3, gl.FLOAT, false, 0, 0);

	gl.vertexAttrib4f(s.aColor.location, 0.5, 0.5, 0.0, 1.0);

	gl.uniformMatrix4fv(s.uMVP.location, false, MVP.times(tileofs).times(this.mesh.localToWorld));
	gl.bufferData(gl.ARRAY_BUFFER, this.mesh.verts3, gl.STREAM_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.verts3.length / 3);

	gl.vertexAttrib4f(s.aColor.location, 0.2, 0.7, 0.0, 1.0);
	gl.uniformMatrix4fv(s.uMVP.location, false, P.times(MV).times(this.mesh.leaves1.localToWorld));
	gl.bufferData(gl.ARRAY_BUFFER, this.mesh.leaves1.verts3, gl.STREAM_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.leaves1.verts3.length / 3);

	gl.vertexAttrib4f(s.aColor.location, 0.1, 0.8, 0.1, 1.0);
	gl.uniformMatrix4fv(s.uMVP.location, false, P.times(MV).times(this.mesh.leaves2.localToWorld));
	gl.bufferData(gl.ARRAY_BUFFER, this.mesh.leaves2.verts3, gl.STREAM_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.leaves2.verts3.length / 3);

	for (var r = 0; r < this.rows; ++r) {
		for (var c = 0; c < this.map[r].length; ++c) {
			tile = this.tileset[this.map[r][c]];
			if (tile === undefined) continue;

		}
	}

	gl.disableVertexAttribArray(s.aVertex.location);
	gl.deleteBuffer(vertsBuffer);
	delete vertsBuffer;
};


exports = Tilemap;
