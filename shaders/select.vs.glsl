uniform mat4 uMVP;

attribute vec3 aVertex;
attribute vec4 aTag;

varying vec4 vTag;

void main() {
	vTag = aTag;
	gl_Position = uMVP * vec4(aVertex, 1.0);
}
