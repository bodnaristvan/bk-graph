/*jslint node: true */
"use strict";

var blessed = require('blessed');
var blessedcontrib = require('blessed-contrib');
var lineReader = require('line-reader');

// point conf
var pointValue = {
	'!': 5,
	'1': 4,
	'D': 3,
	'd': 2,
	')': 1,
	'/': -3,
	'\\': -3,
	'(': -5
};
var data = [];

// split array a into n equal pieces
function split (a, n) {
    var len = a.length, out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    return out;
}

function getLinePoints (line, last) {
	// sum points in each line, based on `pointValue`
	var linePoints = line.split('').reduce(function (acc, currVal) {
		return acc + (pointValue[currVal] ? pointValue[currVal] : 0);
	}, 0);
	data.push(linePoints);

	// exit at the last line
	if (last) {
		return false;
	}
}

// create chart data from points
function prepareData (data) {
	var n = 30,
		ret = {
			x: [],
			y: []
		},
		addFunc = function (a, b) {
			return a + b;
		};

	// x axis with minutes
	for (var i = 0; i < n; i++) {
		ret.x.push(i + ':00');
	}

	// y axis with average points
	split(data, n).forEach(function (chunk) {
		ret.y.push((chunk.reduce(addFunc, 0) / chunk.length));
	});
	
	return ret;
}

lineReader
	.eachLine('datasource.txt', getLinePoints)
	.then(function () {
		// get renderable data
		var d = prepareData(data);

		// setup renderer
		var screen = blessed.screen();
		var line = blessedcontrib.line({
			style: {
				line: 'green',
				text: 'yellow',
				baseline: 'red'
			},
			xLabelPadding: 3,
			xPadding: 5,
			label: 'Title'
		});

		// render line
		screen.append(line);
		line.setData(d.x, d.y);

		screen.key(['escape', 'q', 'C-c'], function () {
			return process.exit(0);
		});

		screen.render();
	});
