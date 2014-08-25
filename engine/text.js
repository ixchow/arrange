function Text(text, at) {
	this.container = document.getElementById('text-container');
	this.div = document.createElement('div');

	this.div.innerHTML = '<span></span>' + text;
	this.div.setAttribute('style', 'bottom: ' + at.y + 'px; left: ' + at.x + 'px');
	this.container.appendChild(this.div);
}

Text.prototype.dismiss = function() {
	this.container.removeChild(this.div);
}

exports = Text;
