class BuildResult:
	def __init__(self):
		self.html = ""
		self.js = ""

class BuildJS:
	"""This will somehow build javascript files"""
	def __init__(self, path):
		self.path = path
		self.namespace = path[0:path.rfind('.')].replace('/','.')
	def build(self):
		print 'Building ' + self.path
		result = BuildResult()
		with open(self.path, 'rb') as f:
			result.js += "%s = (function(exports) {\n" % self.namespace
			result.js += f.read()
			result.js += "\nreturn exports;\n"
			result.js += "})({});\n"
		return result

class BuildNamespace:
	def __init__(self, path):
		self.path = path
	def build(self):
		print 'Building ' + self.path
		result = BuildResult()
		result.js = 'window.%s = {};\n' % self.path
		return result

class BuildMesh:
	"""This will somehow build meshes from blender files"""
	def __init__(self, path):
		self.path = path
		self.namespace = path[0:path.rfind('.')].replace('/','.')
	def build(self):
		print 'Building ' + self.path
		import subprocess
		import os.path
		result = BuildResult()
		blender_cmd = [None, "--background", "--python", "tools/blend-to-js-aaron.py", "--", "meshes/tree.blend", "Icosphere", "meshes.tree"]
		mac_blender = "/Applications/blender.app/Contents/MacOS/blender"
		if os.path.isfile(mac_blender):
			blender_cmd[0] = mac_blender
		elif subprocess.call(['which', '-s', 'blender']) == 0:
			blender_cmd[0] = "blender"
		else:
			raise Exception("blender not found on $PATH or in /Applications")
		p = subprocess.Popen(blender_cmd, stderr=subprocess.PIPE)
		output, err = p.communicate()
		p.wait
		result.js = "{0} = {1};\n".format(self.namespace, err)
		return result

class BuildShader:
	"""Builds a shader by copying to a script tag and setting a type."""
	def __init__(self, path):
		self.path = path
		if path.endswith('.fs.glsl'):
			self.shader_type = "fragment"
		elif path.endswith('.vs.glsl'):
			self.shader_type = "vertex"
		else:
			assert(False)
		self.namespace = path[0:path.rfind('.')].replace('/','.')
	def build(self):
		print 'Building ' + self.path
		result = BuildResult()
		with open(self.path, 'rb') as f:
			result.html += '<script id="' + self.namespace + '" type="x-shader/x-' + self.shader_type + '">\n';
			result.html += f.read()
			result.html += '</script>\n';
		#No js; will get assembled by engine.init
		#result.js += "%s = (function(exports) {\n" % self.namespace
		#result.js += f.read()
		#result.js += "\nreturn exports;\n"
		#result.js += "})({});\n"
		return result


class BuildMML:
	def __init__(self, path):
		self.path = path
		self.namespace = path[0:path.rfind('.')].replace('/','.')
	def build(self):
		print 'Building ' + self.path
		result = BuildResult()
		with open(self.path, 'rb') as f:
			mml = f.read()
			mml = mml.replace("\n", " ")
			mmls = mml.split(';')
			mml_js = '["{0}"]'.format('","'.join(mmls))
			result.js = '{0} = function(synth) {{\nreturn T("mml", {{mml:{1}}}, synth.in).set({{buddies:synth.out}});\n}}\n'.format(self.namespace, mml_js)
		return result
