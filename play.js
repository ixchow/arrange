#!/usr/bin/env node

var T = require('timbre');

var argv = require('minimist')(process.argv.slice(2));

function showUsage() {
	console.log('Usage: play.js <music.js|music.mml}> <synth.js>');
	process.exit();
}

if (argv._.length != 2) {
	showUsage();
}

var fs = require('fs');
if (/\.mml$/.test(argv._[0])) {
	var mml = fs.readFileSync(argv._[0]) + '';
	mml = mml.replace('\n', ' ');
	var mmls = mml.split(';');
	var music = function(synth) {
		return T("mml", {mml: mmls}, synth.in).set({buddies: synth.out});
	};
} else {
	var music = eval(fs.readFileSync(argv._[0])+'');
}
var synth = eval(fs.readFileSync(argv._[1])+'');
music(synth).start();