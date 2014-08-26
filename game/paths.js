var rot = function() { return game.utility.rot.apply(this, arguments); }

exports = {
	determinePaths: function(combined) {
		var paths = [];

		//Start paths with sources:
		combined.forEach(function(stack, idx){
			stack.forEach(function(s, si){
				if (s.hasProblem) return;
				if (('pathOut' in s.tile) && !('pathIn' in s.tile)) {
					var d = (s.r + s.tile.pathOut) % 4;
					paths.push([{
						x:idx % combined.size.x,
						y:(idx / combined.size.x) | 0,
						s:s,
						d:d
					}]);
					s.path = paths[paths.length-1];
				}
			});
		});

		//While paths aren't finished, step each still-unfinished path:
		var active = paths;
		while (active.length) {
			active = active.filter(function(path){
				var a = path[path.length-1];
				var step = rot(a.d, {x:1,y:0});
				var next = {x:a.x + step.x, y:a.y + step.y};
				if (next.x >= 0 && next.x < combined.size.x && next.y >= 0 && next.y < combined.size.y) {
					//see if there is an unused pathIn in here somewhere
					var idx = next.y * combined.size.x + next.x;
					var stack = combined[idx];
					var found = null;
					var foundForward = true;
					stack.some(function(s){
						if (s.hasProblem) return false;
						if ('pathIn' in s.tile) {
							var d = (s.r + s.tile.pathIn) % 4;
							if (d == (a.d + 2) % 4) {
								found = s;
								foundForward = true;
								return true;
							}
							if ('pathOut' in s.tile) {
								//s is a connecting-style path, so check reverse
								var d = (s.r + s.tile.pathOut) % 4;
								if (d == (a.d + 2) % 4) {
									found = s;
									foundForward = false;
									return true;
								}
							}
						}
					});
					if (found) {
						if (found.path) {
							//collision!
							if (found.path.length > path.length) {
								//if other path is longer, overlap on this tile:
								path.push({
									x:next.x,
									y:next.y,
									s:found
								});
							}
							return false;
						} else {
							found.path = path;
							if ('pathOut' in found.tile) {
								var d;
								if (foundForward) {
									d = (found.tile.pathOut + found.r) % 4;
								} else {
									d = (found.tile.pathIn + found.r) % 4;
								}
								path.push({
									x:next.x,
									y:next.y,
									s:found,
									d:d
								});
								return true;
							} else {
								//end of the line at a sink.
								path.push({
									x:next.x,
									y:next.y,
									s:found
								});
								return false;
							}
						}
					}
				}
				return false;
			});
		}

		return paths;
	}
}
