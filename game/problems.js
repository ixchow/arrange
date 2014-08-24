exports = {
	determineProblems: function(combined) {
		//clear problems lists:
		var problems = [];

		//Check collision consistency:
		for (var y = 0; y < combined.size.y; ++y) {
			for (var x = 0; x < combined.size.x; ++x) {
				var stack = combined[y * combined.size.x + x];

				var fill = 0; //accumulate bits for filled area
				var needClear = 0; //accumulate bits that must be clear
				var conflict = 0; //accumulate bits where fills overlap
				stack.forEach(function(s){
					if (s.tile.fill) {
						conflict |= (fill & s.tile.fill);
						fill |= s.tile.fill;
					}
					if (s.tile.needClear) {
						needClear |= s.tile.needClear;
					}
				});
				conflict |= (needClear & fill);
				if (conflict != 0) {
					stack.forEach(function(s){
						var conflicted = 0;
						if (s.tile.fill) conflicted |= s.tile.fill & conflict;
						if (s.tile.needClear) conflicted |= s.tile.needClear & conflict;
						if (conflicted) {
							s.hasProblem = true;
						}
					});
				}
			}
		}

		//Check for paths that collide in terms of ins or outs:
		combined.forEach(function(stack){
			function build_d(s) {
				var d = 0;
				if ('pathIn' in s.tile) {
					d |= 1 << ((s.tile.pathIn + s.r) % 4);
				}
				if ('pathOut' in s.tile) {
					d |= 1 << ((s.tile.pathOut + s.r) % 4);
				}
				return d;
			}
			var used = 0;
			var conflict = 0;
			stack.forEach(function(s){
				var d = build_d(s);
				conflict |= used & d;
				used |= d;
			});
			stack.forEach(function(s){
				var d = build_d(s);
				if (d & conflict) {
					s.hasProblem = true;
				}
			});
		});

		//---------------------------------------
		//Actually read out list of problems:
		combined.forEach(function(stack, idx){
			var hasProblem = stack.some(function(s){
				return s.hasProblem;
			});
			if (hasProblem) {
				var at = {
					x:(idx % combined.size.x) + combined.min.x,
					y:((idx / combined.size.x) | 0) + combined.min.y
				};
				problems.push({at:at});
			}
		});

		return problems;
	}
}