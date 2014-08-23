var Mesh = function(data) {
	//TODO: create vertex buffer for mesh, upload mesh data.
	this.verts3 = data.verts3;
	this.colors4 = data.colors4;
	this.localToWorld = data.localToWorld;
	this.localToParent = data.localToParent;
	return this;
};

Mesh.prototype.emit = function(MVP) {
	//TODO: multiply local matrix with 
};

exports = Mesh;
