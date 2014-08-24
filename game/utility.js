//Rotations are 0,1,2,3 corresponding to rotating CC in 90-degree increments
//rot() performs rotations around (0,0)
exports.rot = function(r, pt) {
	if (r < 0) r = (r % 4) + 4;
	else if (r >= 4) r = r % 4;

	if (r == 0) {
		return {x:pt.x, y:pt.y};
	} else if (r == 1) {
		return {x:-pt.y, y:pt.x};
	} else if (r == 2) {
		return {x:-pt.x, y:-pt.y};
	} else if (r == 3) {
		return {x:pt.y, y:-pt.x};
	}
};


