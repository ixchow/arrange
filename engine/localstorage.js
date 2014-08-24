
// Calling this make a new prop.  A prop is a function:
//  () -> get the value
//  (v) -> set the value
//  (fn) -> register a value-change listener
function prop(v) {
	var value = v;
	var callbacks = [];
	return function() {
		if (arguments.length == 0) {
			return value;
		} else if (typeof arguments[0] == 'function') {
			callbacks.push(arguments[0]);
		} else {
			value = arguments[0];
			callbacks.forEach(function(c) {
				c(value);
			});
		}
	}
}

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

exports = {
	bool: function(name, initialValue) {

		if (supports_html5_storage) {
			initialValue = localStorage.getItem(name) == 'true';
		}

		var p = prop(!!initialValue);
		if (supports_html5_storage) {
			p(function(v) {
				localStorage.setItem(name, !!v);
			});
		}

		return p;
	}
}