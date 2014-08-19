#!/usr/bin/env python

import os

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
			result.js += "(function(exports) {\n"
			result.js += f.read()
			result.js += "\n})(%s = {});\n" % self.namespace
		return result

class BuildNamespace:
	def __init__(self, path):
		self.path = path
	def build(self):
		print 'Building ' + self.path
		result = BuildResult()
		result.js = 'window.%s = {};\n' % self.path
		return result

builders = []

#walk directory structure, build list of files to process
for _root, dirs, files in os.walk('.'):
	root = os.path.relpath(_root)
	#print root, dirs, files
	if root.startswith('.'):
		continue
	elif root.startswith('tmp'):
		continue
	elif root.startswith('tools'):
		continue
	else:
		builders.append(BuildNamespace(root))
		for file in files:
			if file.startswith('.'):
				continue
		  	elif file.endswith(".js"):
				builder = BuildJS(root + '/' + file)
				builders.append(builder)
		  
#somehow figure out the order to process the files in(?)

# run the builders (TODO: could be done in parallel)
builder_outputs = []
for builder in builders:
	output = builder.build()
	builder_outputs.append(output)

#write an html file (as a stream)
import subprocess

html = open('tools/skel.html', 'r').read()
resources_html = ''
resources_js = ''
for output in builder_outputs:
	resources_html += output.html
	resources_js += output.js

html = html.replace('$RESOURCES', resources_html)

import subprocess

p = subprocess.Popen(['cat'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
compiled_js, err = p.communicate(resources_js)
p.wait

html = html.replace('$JAVASCRIPT', compiled_js)

f = open('index.html', 'wb')
f.write(html)
f.close()
