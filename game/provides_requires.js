// input: size = x:5, y:2
// 0 1 2 3 4
// 5 6 7 8 9
//
// output: size = x:11, y:5
//  0:x   1:0n  2:x   3:1n  4:x   5:2n  6:x   7:3n  8:x   9:4n  10:x
// 11:0w 12:0c 13:0e 14:1c 15:1e 16:2c 17:2e 18:3c 19:3e 20:4c 21:4e
//             13:1w       15:2w       17:3w       19:4w
// 22:x  23    24    25    26    27    28    29    30    31    32
// 33:5w 34:5c

function to_idx(combined, x, y) {
	return y * combined.size.x + x;
}

function convert_index(combined, idx, d) {
	var x = (idx % combined.size.x);
	var y = ((idx / combined.size.x) | 0);
	var size = { x: combined.size.x*2 + 1 };
	var d = {
		c: { x: 0, y: 0 },
		n: { x: 0, y: -1 },
		s: { x: 0, y: 1 },
		e: { x: 1, y: 0 },
		w: { x: -1, y: 0 }
	}[d];
	return to_idx({size: size}, 1+2*x+d.x, 1+2*y+d.y );
}

exports = {
	check: function(combined) {
		var max = convert_index(combined, to_idx(combined, combined.size.x-1, combined.size.y-1), 's') + 1;
		var connection_points = new Array(max);

		combined.forEach(function(stack, idx) {
			stack.forEach(function (s) {
				['c', 'n', 's', 'e', 'w'].forEach(function (d) {
					var x = (idx % combined.size.x);
					var y = ((idx / combined.size.x) | 0);
					var new_idx = convert_index(combined, idx, d);
					var requires = s.tile.requires && s.tile.requires[d];
					var provides = s.tile.provides && s.tile.provides[d];
					if (!requires && !provides) return;
					if (!connection_points[idx]) {
						connection_points[idx] = {provides: {}, requires: {}, at: {x: x + combined.min.x, y: y + combined.min.y}};
					}
					if (requires) connection_points[idx].requires[requires] = true;
					if (provides) connection_points[idx].provides[provides] = true;
				});
			});
		});

		var problems = [];
		connection_points.forEach(function(d) {
			for (r in d.requires) {
				if (d.requires[r] && !d.provides[r]) {
					problems.push({ at: d.at, message: "requires " + r });
				}
			}
		});

		console.log("problems", problems);
		return problems;
	}
};

// Tests
// combined = {size: { x:5, y:2 }}
// function check(x, y, d, result) {
// 	var r = convert_index(combined, to_idx(combined, x, y), d);
// 	if (r != result) console.log(r + " != " + result);
// }
//
// check(0, 0, 'c', 12);
// check(1, 0, 'c', 14);
// check(0, 1, 'c', 34);
// check(0, 0, 'n', 1);
// check(1, 1, 'w', 35);
// check(0, 1, 'e', 35);
