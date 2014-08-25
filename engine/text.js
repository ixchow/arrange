function Text(text, at) {
	this.container = document.getElementById('text-container');
	this.div = document.createElement('div');

	this.div.innerHTML = '<span></span>' + text;
	this.div.setAttribute('style', 'bottom: ' + at.y + 'px; left: ' + at.x + 'px');
	this.container.appendChild(this.div);
}

Text.prototype.moveTo = function(at) {
	this.div.setAttribute('style', 'bottom: ' + at.y + 'px; left: ' + at.x + 'px');
}

Text.prototype.dismiss = function() {
	this.container.removeChild(this.div);
}

var sheet;
Text.init = function() {
	sheet = document.createElement('style')
	sheet.innerHTML = "#text-container div { font-size: 150px; }";
	document.body.appendChild(sheet);
}

Text.resize = function(size) {
	console.log(size);
	var tsize = (size.x - 600)*30/630 + 20
	sheet.innerHTML = "#text-container div { font-size: " + tsize + "px; }";
}

exports = Text;
