import bpy
import struct
import json
import sys

filename = sys.argv[5]

def get_vertices(mesh):
	verts = []
	for poly in mesh.polygons:
		if not len(poly.vertices) == 3:
			print("WARNING: {0}/{1} has polygons with != 3 vertices; skipping".format(filename, mesh.name))
			return None
		assert(len(poly.vertices) == 3)
		verts.extend(tuple(poly.vertices))
	return verts

data = {}
with bpy.data.libraries.load(filename) as (data_from, data_to):
	data_to.meshes = data_from.meshes
for mesh in data_to.meshes:
	if mesh.name is not None:
		data[mesh.name] = {"verts3": get_vertices(mesh)}

print(json.dumps(data), file=sys.stderr)