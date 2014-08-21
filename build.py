#!/usr/bin/env python

import os

from tools.builders import BuildNamespace, BuildJS, BuildMesh, BuildShader, BuildMML

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
		  	elif file.endswith(".blend"):
				builders.append(BuildMesh(root + '/' + file))
		  	elif file.endswith(".blend1"):
				continue #blender creates backups, which one can ignore
		  	elif file.endswith(".glsl"):
				builders.append(BuildShader(root + '/' + file))
			elif file.endswith(".mml"):
				builders.append(BuildMML(root + '/' + file))
		  
#somehow figure out the order to process the files in(?)

# run the builders
import tools.BuildStrategy
builder_outputs = tools.BuildStrategy.parallel(builders)

#write an html file (as a stream)
from tools.minify import minify

html = open('tools/skel.html', 'r').read()
resources_html = ''
resources_js = ''
for output in builder_outputs:
	resources_html += output.html
	resources_js += output.js

html = html.replace('$RESOURCES', resources_html)
html = html.replace('$JAVASCRIPT', minify(resources_js))

f = open('index.html', 'wb')
f.write(html)
f.close()
