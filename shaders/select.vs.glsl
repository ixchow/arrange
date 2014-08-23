uniform mat4 uMVP;
uniform vec3 uZ;

attribute vec3 aVertex;
attribute vec3 aTag;

varying vec4 vTag;

void main() {
	vTag = vec4(aTag,dot(uZ, aVertex.xyz));
	gl_Position = uMVP * vec4(aVertex, 1.0);
}
