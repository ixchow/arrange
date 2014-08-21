exports = function() {
	this.fade = 0.0;
	return this;
}

exports.prototype.update = function(elapsed) {
	this.fade += elapsed;
	if (this.fade > 1.0) this.fade = this.fade % 1.0;
};

exports.prototype.enter = function() {
  //JIM: let's not do this until we have mute available
	// engine.music.play(music.gymnopedie, synths.bells);
	// engine.music.play(music.khoomii, synths.vowels);
};

exports.prototype.draw = function() {
	gl.clearColor(0.0, 0.0, this.fade, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);


	var vertsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( meshes.tree.verts3 ), gl.STREAM_DRAW);

	var s = shaders.solid;

	gl.useProgram(s.program);

	gl.uniformMatrix4fv(s.uMVP.location, false, new Float32Array( [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]));
	gl.enableVertexAttribArray(s.aVertex.location);
	gl.vertexAttribPointer(s.aVertex.location, 3, gl.FLOAT, false, 0, 0);
	gl.vertexAttrib4f(s.aColor.location, 0.0, 1.0, 0.0, 1.0);

	gl.drawArrays(gl.TRIANGLES, 0, meshes.tree.verts3.length / 3);

	gl.disableVertexAttribArray(s.aVertex.location);
	gl.deleteBuffer(vertsBuffer);
	delete vertsBuffer;

};
