exports = function() {
	var scripts = document.getElementsByTagName("script");
	var shaders = [];

	function getObject(id) {
		var ret = window;
		id.split('.').forEach(function(name){
			if (!ret.hasOwnProperty(name)) {
				ret[name] = {};
			}
			ret = ret[name];
		});
		return ret;
	}

	function readScript(script) {
		var ret = "";
		var currentChild = script.firstChild;
	 
		while(currentChild) {
			if (currentChild.nodeType == currentChild.TEXT_NODE) {
				ret += currentChild.textContent;
			}
			currentChild = currentChild.nextSibling;
		}
		return ret;
	}

	var vertCount = 0; //keep track of number of vertex shaders loaded, to error check against number of fragment shaders. They should be paired.

	for (var i = 0; i < scripts.length; ++i) {
		var script = scripts[i];
		if (script.type == "x-shader/x-fragment") {
			var id = script.id;
			if (id.substr(id.length-3,3) != ".fs") {
				console.log("Shader has id '" + id + "'; expecting suffix '.fs'");
				return false;
			}
			id = id.substr(0, id.length-3);
			var shader = getObject(id);
			if (shader.hasOwnProperty("fs")) {
				console.log("Shader '" + id + "' has two fragment shaders defined.");
				return false;
			}
			shader.fs = readScript(script);
			shaders.push(shader);
		} else if (script.type == "x-shader/x-vertex") {
			var id = script.id;
			if (id.substr(id.length-3,3) != ".vs") {
				console.log("Shader has id '" + id + "'; expecting suffix '.vs'");
				return false;
			}
			id = id.substr(0, id.length-3);
			var shader = getObject(id);
			if (shader.hasOwnProperty("vs")) {
				console.log("Shader '" + id + "' has two vertex shaders defined.");
				return false;
			}
			shader.vs = readScript(script);
			++vertCount;
		}
	}

	if (shaders.length != vertCount) {
		console.log("Loaded " + vertCount + " vertex shaders and " + shaders.length + " fragment shaders; they can't all be properly paired.");
		return false;
	}
	var success = true;
	shaders.forEach(function(s){
		if (!s.hasOwnProperty("vs")) {
			console.log("Shader missing a paired vertex shader.");
			success = false;
			return;
		}

		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, s.vs);
		gl.compileShader(vs);
		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			console.log("Failed to compile vertex shader: " + gl.getShaderInfoLog(vs));
			success = false;
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, s.fs);
		gl.compileShader(fs);
		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			console.log("Failed to compile fragment shader: " + gl.getShaderInfoLog(fs));
			success = false;
			return;
		}

		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.log("Unable to link shader program.");
			success = false;
			return;
		}

		s.program = program;

		var na = gl.getProgramParameter(s.program, gl.ACTIVE_ATTRIBUTES);
		for (var i = 0; i < na; ++i) {
			var a = gl.getActiveAttrib(s.program, i);
			s[a.name] = {
				location:i,
				type:a.type,
				size:a.size
			};
		}

		var nu = gl.getProgramParameter(s.program, gl.ACTIVE_UNIFORMS);
		for (var i = 0; i < nu; ++i) {
			var u = gl.getActiveUniform(s.program, i);
			s[u.name] = {
				location:i,
				type:a.type,
				size:a.size
			};
		}
		delete s.vs;
		delete s.fs;

	});
	return success;
};
