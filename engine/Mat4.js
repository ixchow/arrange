var Mat4 = function() {
	var mat4 = null;
	if (arguments.length == 16) {
		mat4 = new Float32Array(arguments);
	} else if (arguments.length == 4) {
		mat4 = new Float32Array([
			arguments[0].x, arguments[0].y, arguments[0].z, arguments[0].w,
			arguments[1].x, arguments[1].y, arguments[1].z, arguments[1].w,
			arguments[2].x, arguments[2].y, arguments[2].z, arguments[2].w,
			arguments[3].x, arguments[3].y, arguments[3].z, arguments[3].w
			]);
	} else if (arguments.length == 1) {
		mat4 = new Float32Array([
			arguments[0], 0.0, 0.0, 0.0,
			0.0, arguments[0], 0.0, 0.0,
			0.0, 0.0, arguments[0], 0.0,
			0.0, 0.0, 0.0, arguments[0]
			]);
	} else {
		throw "Invalid arguments to Mat4 constructor";
	}

	mat4.times = function(b) {
		var ret = new Mat4(0.0);
		for (var c = 0; c < 4; ++c) {
			for (var r = 0; r < 4; ++r) {
				for (var i = 0; i < 4; ++i) {
					ret[c * 4 + r] += this[i * 4 + r] * b[c * 4 + i];
				}
			}
		}
		return ret;
	};

	return mat4;
};

exports = Mat4;
