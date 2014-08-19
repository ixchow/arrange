#!/usr/bin/env python

import os

from tools.builders import BuildNamespace, BuildJS

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

if subprocess.call(['which', '-s', 'uglifyjs']) == 0:
	jscmd = ['uglifyjs']
else:
	print "!!! WARNING !!! uglifyjs is not installed; skipping js minification"
	print "!!! Try `npm install -g uglify-js`"
	jscmd = ['cat']

p = subprocess.Popen(jscmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
compiled_js, err = p.communicate(resources_js)
p.wait

html = html.replace('$JAVASCRIPT', compiled_js)

f = open('index.html', 'wb')
f.write(html)
f.close()
