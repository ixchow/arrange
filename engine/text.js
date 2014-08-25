var height;

function Text(text, at) {
	this.container = document.getElementById('text-container');
	this.div = document.createElement('div');

  this.text = text;
	this.moveTo(at);
	this.container.appendChild(this.div);
}

Text.prototype.moveTo = function(at) {
	if (at) {
		this.div.innerHTML = '<span></span>' + this.text;
		this.div.setAttribute('style', 'bottom: ' + at.y + 'px; left: ' + at.x + 'px');
	} else {
		this.div.innerHTML = this.text;
		this.div.setAttribute('style', 'bottom: ' + height*2/3 + 'px; left: 30px; right: 30px');
	}
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
	height = size.y;
	var tsize = (size.x - 600)*30/630 + 20
	sheet.innerHTML = "#text-container div { font-size: " + tsize + "px; }";
}

exports = Text;
