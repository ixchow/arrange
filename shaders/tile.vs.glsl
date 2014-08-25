uniform mat4 uMVP;
uniform vec4 uTint;

attribute vec3 aVertex;
attribute vec4 aColor;

varying vec4 vColor;

void main() {
	vColor = aColor * uTint;
	gl_Position = uMVP * vec4(aVertex, 1.0);
}
