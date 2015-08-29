// tests.js

'use strict'

window.addEventListener( 'load', function () {

	var runTest1 = true;

	if (runTest1) {

		var parent 	= document.body;

		var dimensions 	= { width: 400, height: 200, depth: 40, units: null };
		var perspective = { node: parent, value: '100px'}

		var cuboid1 = makeCuboid( dimensions, perspective );

		parent.appendChild( cuboid1 );

	}

} );  // End on load
