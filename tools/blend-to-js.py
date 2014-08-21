import bpy
import math
import sys
import json

#Write a mesh with just position:
def mesh_data(obj):
	bpy.ops.object.mode_set(mode='OBJECT')
	obj.data = obj.data.copy() #"make single user" (?)
	bpy.context.scene.layers = obj.layers
	#First, triangulate the mesh:
	bpy.ops.object.select_all(action='DESELECT')
	obj.select = True
	bpy.context.scene.objects.active = obj
	bpy.ops.object.mode_set(mode='EDIT')
	bpy.ops.mesh.select_all(action='SELECT')
	#use_beauty went away in 2.70, now use:
	bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
	bpy.ops.object.mode_set(mode='OBJECT')

	#Consider possibly using code to bake color:
	#if do_flags & BakeColor:
	#	bpy.ops.mesh.vertex_color_add()
	#	bpy.context.scene.render.bake_type = 'FULL'
	#	bpy.context.scene.render.use_bake_to_vertex_color = True
	#	bpy.ops.object.bake_image()

	verts = []
	#if do_flags & BakeTransform:
	if True:
		for poly in obj.data.polygons:
			assert(len(poly.vertices) == 3)
			for vi in poly.vertices:
				xf = obj.matrix_world * obj.data.vertices[vi].co
				verts.append((xf[0],xf[1],xf[2]))
	# else:
	# 	for poly in obj.data.polygons:
	# 		assert(len(poly.vertices) == 3)
	# 		for vi in poly.vertices:
	# 			verts.append(tuple(obj.data.vertices[vi].co))

	#if do_flags & DoColor:
	#	colors = []
	#	for poly in obj.data.polygons:
	#		assert(len(poly.vertices) == 3)
	#		if do_flags & BakeColor:
	#			vcs = obj.data.vertex_colors[-1].data
	#			for idx in poly.loop_indices:
	#				col = tuple(map(to_normalized_uint8, vcs[idx].color))
	#				assert(len(col) == 3)
	#				colors.append((col[0], col[1], col[2], 255))
	#			
	#		else:
	#			mat = obj.material_slots[poly.material_index].material
	#			if mat.use_transparency:
	#				alpha = mat.alpha
	#			else:
	#				alpha = 1.0
	#			color = tuple(mat.diffuse_color) + (alpha,)
	#			color = tuple(map(to_normalized_uint8, color))
	#
	#			for vi in poly.vertices:
	#				colors.append(color)
	
	#if do_flags & DoTexture0:
	#	texcoords = []
	#	assert(len(obj.data.uv_layers) == 1)
	#	uvs = obj.data.uv_layers[0].data
	#	for poly in obj.data.polygons:
	#		for v in poly.loop_indices:
	#			uv = uvs[v].uv
	#			texcoords.append((uv[0], 1.0 - uv[1])) #upper-left pixel origin

	
	#this code would trim trailing zeros from 1D or 2D attribs:
	#shrink_attrib(verts)
	#if do_flags & DoColor:
	#	shrink_attrib(colors)
	#if do_flags & DoTexture0:
	#	shrink_attrib(texcoords)

	#TODO: consider tristripping

	data = {'verts3' : [] }

	#Write mesh as triangles:
	for i in range(0,len(verts)):
		data['verts3'].extend(verts[i])
			#out.write(struct.pack('f',v))
			#assert(len(struct.pack('f',v)) == 4)
		# if do_flags & DoColor:
		# 	for v in colors[i]:
		# 		blob.write(struct.pack('B',v))
		# 		assert(len(struct.pack('B',v)) == 1)
		# if do_flags & DoTexture0:
		# 	for v in texcoords[i]:
		# 		blob.write(struct.pack('f',v))
		# 		assert(len(struct.pack('f',v)) == 4)
	return data

data = {}
for obj in bpy.data.objects:
	print(obj.name)
	if obj.type == 'MESH':
		path = []
		at = obj
		while at != None:
			path.append(at.name)
			at = at.parent
		obj_data = data
		while len(path):
			key = path.pop()
			if key not in obj_data:
				obj_data[key] = {}
			obj_data = obj_data[key]
		mesh = mesh_data(obj)
		for k, v in mesh.items():
			obj_data[k] = v


#Using our own dump function so we can create Float32Arrays directly:
def dump(data):
	first = True
	for k, v in sorted(data.items()):
		if first:
			first = False
		else:
			sys.stderr.write(",\n")
		sys.stderr.write(k + ":")
		if type(v) == dict:
			sys.stderr.write("{\n")
			dump(v)
			sys.stderr.write("}")
		elif type(v) == list:
			sys.stderr.write("new Float32Array([")
			for i in range(0,len(v)):
				if i > 0: sys.stderr.write(",")
				if i % 6 == 0: sys.stderr.write("\n")
				sys.stderr.write("%g8" % v[i])
			sys.stderr.write("])")
		else:
			raise Exception("Don't know how to deal with something that isn't a list or dict.")

dump(data)
