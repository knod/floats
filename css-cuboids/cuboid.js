/* Cuboid.js 
* 
* Creates one cuboid element (rectangular prism) in plain
* html and css. No canvas.
* Like a cube is a 3d square, a cuboid is a 3d rectangle.
* 
* EXAMPLE USE (in your js file):


// size of your cube in whatever units you specify
var dimensions 	= { width: 40, height: 20, depth: 10, units: '%' };

// Pass this in to add perspective to some ancestor element if you want to
// (if no ancestor has the `attribute` defined, things won't look 3D)
var ancestor 	= document.body;
var perspective = { node: ancestor, value: '100px'}

// Pass in those values to recieve your cuboid (the second argument not required)
var cuboid1 = makeCuboid( dimensions, perspective );

// Add any ids to cuboid or its children
cuboid1.id = 'cuboid_1';

// Add styles here or in your css

// Add the cuboid to whatever element you want
document.querySelector('#app').appendChild( cuboid1 );


* NOTES TO USERS:
* - The cuboid is symmetrical in the z-axis as well. That is, the sides extend
* 	equally forward and back from the center plane (the parent cuboid element).
* - Things that will make stuff look weird
* 	-- if no parent has a `perspective` style attribute, everything will still look flat
* 		(I think it adds up/stacks for each child with `perspective`)
* 	-- margins on the elements will mess up spacing
* 	-- padding on the parent will mess up spacing
* 	-- borders when the element doesn't have `box-sizing: border-box` will mess up spacing
* - These styles do not get set:
* 	-- Backgrounds or borders. They'll be invisible unless you add some.
* 	-- Backface visiblity. The back-sides of the elements will be visible.
* - These styles, among others, do get set:
* 	-- `transform-style: preserve-3d` (children of any of these can be 3d)
* 	-- `position: relative` on the cuboid so its children can be `position: absolute`
* - The elements do not get created with any ids. If you want them, you have to add them yourself.
* 
* IN CASE YOU MISSED IT:
* - If you do not add styling to make the sides visible, they won't be visible.
* - Chidlren of any of the created elements can be 3d as well.
* 
* ??:
* - Should this return a whole cube, or should it attach sides
* 	to an existing node that gets passed in?
* 	[Answer: just make the whole cube to make sure the right stuff
* 	is on the parent of the sides]
* - Should it center the cube in the parent on the z-axis, or
* 	should it put it on the surface of its parent?
* 	[Answer: It should be centered inside the parent. Most use cases, and more consistent]
* - Where should it add perspective? [Answer: to whatever is desired, or nowhere]
* 
* RESOURCES USED:
* - https://desandro.github.io/3dtransforms/docs/rectangular-prism.html
* - http://davidwalsh.name/3d-transforms
*/

'use strict'

var makeCuboid = function( dimensions, perspectiveData ) {
/* 
* 
* dimensions: { width: num/str, height: num/str, depth: num, units: str }
* perspectiveData: { node: Node, value: str }
* 
* Creates a cube of the given dimensions (a node that contains 6 nodes
* of its own) and sets the given perspective on the given node if there is one
*/
	// ==========================
	// UTILITIES
	// ==========================
	var setStyles 	  = function ( styleObjArray, node ) {
	/* ( { attribute: str, value: str }, Node ) -> Node
	* 
	* Sets all the given styles onto that node
	*/
		for ( var stylei = 0; stylei < styleObjArray.length; stylei++ ) {
			var styleAttr = styleObjArray[ stylei ].attribute;
			var value 	  = styleObjArray[ stylei ].value;

			node.style[ styleAttr ] = value;
		}

		return node;
	};  // End setStyles();


	var setAttributes = function ( attrObjArray, node ) {
	/* ( { attribute: str, value: str }, Node ) -> Node
	* 
	* Sets all the given attributes onto that node
	*/
		for ( var attri = 0; attri < attrObjArray.length; attri++ ) {
			var attribute = attrObjArray[ attri ].attribute;
			var value 	  = attrObjArray[ attri ].value;

			node[ attribute ] = value;
		}

		return node;
	};  // End setAttributes();


	// ==========================
	// CUBE PARTS
	// ==========================
	var makeFrontBack = function ( side, dimensions ) {
	/* ( str ) -> Node
	* 
	* 'side' should only be 'front' or 'back'. The front and
	* back share most of their style values.
	* 
	* Front: Fill parent,
	* 		 push forward (amount - 1/2 the thickness of cuboid, so main element is in the center).
	* Back:  Fill parent,
	* 		 flip 180 (so it's facing outwards towards 'away from' the screen),
	* 		 push towards new forward (amount - 1/2 the thickness of cuboid).
	*/
		var node 		= document.createElement('div');
		node.className 	= 'side ' + side;

		var styles = [ 	{ attribute: 'height',  value: '100%' 	},
						{ attribute: 'width',  	value: '100%' 	},
						{ attribute: 'top',  	value: '0' 		},
						{ attribute: 'left', 	value: '0' 		} ];

		var x = (dimensions.depth/2) + dimensions.units;

		if ( side === 'front' ) {
			styles.push( { attribute: 'transform', value: 'rotateX( 0deg ) translateZ(' + x + ')' } );
		} else {
			styles.push( { attribute: 'transform', value: 'rotateX( 180deg ) translateZ(' + x + ')' } );
		}

		setStyles( styles, node );

		return node;
	};  // End makeFrontBack()


	var makeLeftRight = function ( side, dimensions ) {
	/* ( str ) -> Node
	* 
	* 'side' should only be 'left' or 'right'. The left and
	* right share some of their style values.
	* 
	* Left:  Start with its own left edge flush with the left edge of the parent,
	* 		 flip 90 counterclockwise around its own left edge, 
	* 		 nudge in new left direction to be flush with front face,
	* 		 width of cubiod thickness, full height.
	* Right: Start with its own right edge flush with the right edge of the parent,
	* 		 flip 90 clockwise around its own right edge,
	* 		 nudge in new right direction to be flush with front face,
	* 		 width of cubiod thickness, full height.
	*/
		var node 		= document.createElement('div');
		node.className 	= 'side ' + side;

		var styles = [
			{ attribute: 'height',  value: '100%' 					},  // Sides are as tall as parent
			{ attribute: 'width',  	value: dimensions.depth + 'px' 	},  // Creates the depth of the cuboid
			{ attribute: 'top',  	value: '0' 						},  // Starts at top...
			{ attribute:  side,  	value: '0' 						},  // ...left or right, depending
			{ attribute: 'transformOrigin', value: side				}   // Will rotate around the correct edge
		];

		var degrees = '90deg';  // Degrees to rotate (direction given later)
		var xOffset = (dimensions.depth/2) + dimensions.units;  // Amount to shift to be flush with parent again
						
		if ( side === 'left' ) {
			styles.push( { attribute: 'transform', value: 'rotateY(-' + degrees + ')' + ' translateX(-' + xOffset + ')' } );
		} else {
			styles.push( { attribute: 'transform', value: 'rotateY(' + degrees + ')' + ' translateX(' + xOffset + ')' } );
		}

		setStyles( styles, node );

		return node;
	};  // End makeLeftRight()


	var makeTopBottom = function ( side, dimensions ) {
	/* ( str ) -> Node
	* 
	* 'side' should only be 'top' or 'bottom'. The top and
	* bottom share some of their style values.
	* 
	* Top: 	  Start with its own top edge flush with the top edge of the parent,
	* 		  flip 90 clockwise around its own top edge, 
	* 		  nudge in new up direction to be flush with front face,
	* 		  height of cubiod thickness, full width.
	* Bottom: Start with its own bottom edge flush with the bottom edge of the parent,
	* 		  flip 90 counterclockwise around its own bottom edge,
	* 		  nudge in new down direction to be flush with front face,
	* 		  height of cubiod thickness, full width.
	*/
		var node 		= document.createElement('div');
		node.className 	= 'side ' + side;  // Give some classes to latch on with
		var units 		= dimensions.units;  // So we don't have to use the whole thing each time

		var styles = [
			{ attribute: 'height',  value: dimensions.depth + units },  // Creates the depth of the cuboid
			{ attribute: 'width',  	value: '100%' 					},  // Top and bottom are as wide as the parent
			{ attribute: 'left',  	value: '0' 						},  // Starts flush with the left and...
			{ attribute:  side,  	value: '0' 						},  // ...top or bottom depending
			{ attribute: 'transformOrigin', value: side 			}   // Will rotate around the correct edge
		];

		var degrees = '90deg';  // Degrees to rotate (direction given later)
		var yOffset = (dimensions.depth/2) + units;  // Amount to shift to be flush with parent again
						
		if ( side === 'top' ) {
			styles.push( { attribute: 'transform', value: 'rotateX(' + degrees + ')' + ' translateY(-' + yOffset + ')' } );
		} else {
			styles.push( { attribute: 'transform', value: 'rotateX(-' + degrees + ')' + ' translateY(' + yOffset + ')' } );
		}

		setStyles( styles, node );

		return node;
	};  // End makeTopBottom()


	var makeSide 	= function ( side, dimensions ) {
	/* 
	*/
		var sideNode = null;
		// Make the correct kind of side
		if 		( side === 'front' || side === 'back'  ) { sideNode = makeFrontBack( side, dimensions ); }
		else if ( side === 'left'  || side === 'right' ) { sideNode = makeLeftRight( side, dimensions ); }
		else if ( side === 'top'   || side === 'bottom') { sideNode = makeTopBottom( side, dimensions ); }

		// Add the styles all sides should have. Kind of wish this could
		// be in the css since it's the samefor all of them.
		var styles = [
			{ attribute: 'position',  value: 'absolute' },  // to allow for correct positioning before transformations
			{ attribute: 'display',   value: 'block' 	},  // ??: Is this needed?
			// { attribute: 'margin',    value: '0' 	},  // user decision (warning in note)
			// { attribute: 'padding',   value: '0' 	},  // user decision (warning in note)
			{ attribute: 'transformStyle',  value: 'preserve-3d' }  // so children can be 3d too
			// , { attribute: 'backfaceVisibility',  hidden: '0' }  // user decision (warning in note)
			// , { attribute: 'boxSizing',  value: 'border-box'  }  // user decision (warning in note)
		]

		setStyles( styles, sideNode );

		return sideNode
	};  // End makeSide()


	var addSides  = function ( dimensions, cuboidNode ) {
	/* ( { width, height, depth, units }, Node ) -> same Node
	* 
	* Make and add all the sides;
	*/

		var front 	= makeSide( 'front'	, 	dimensions );
		cuboidNode.appendChild(  front 	);
		var back  	= makeSide( 'back'	, 	dimensions );
		cuboidNode.appendChild(  back 	);
		var left 	= makeSide( 'left'	, 	dimensions );
		cuboidNode.appendChild(  left 	);
		var right 	= makeSide( 'right'	, 	dimensions );
		cuboidNode.appendChild(  right 	);
		var top 	= makeSide( 'top'	, 	dimensions );
		cuboidNode.appendChild(  top 	);
		var bottom 	= makeSide( 'bottom', 	dimensions );
		cuboidNode.appendChild(  bottom );

		return cuboidNode;
	};  // End addSides()


	var makeCuboid = function ( dimensions ) {

		var units = dimensions.units;  // So we don't have to use the whole thing each time
		
		// =======================
		// PARENT OF ALL THE SIDES
		// =======================
		var cuboid 		 =  document.createElement( 'div' );
		cuboid.className = 'cuboid';
		
		var styles 		 = [
			// {attribute: 'box-sizing', value: 'border-box'},  // user decision
			{attribute: 'position', 	  value: 'relative'		},  // need some non-auto for chldren to work correctly
			{attribute: 'transformStyle', value: 'preserve-3d'	},  // So children can be 3D too
			
		];

		// If non-numerical values were given for width and/or height (should be strings),
		// no units will be used. Better be done right, though. (auto, etc.)
		// ??: Honestly not sure allowing non-numeric values in is a good idea
		if ( typeof dimensions.width === 'number' ) {
			styles.push( {attribute: 'width', value: dimensions.width  + units } );
		} else if ( typeof dimensions.width === 'string' ) {
			styles.push( {attribute: 'width', value: dimensions.width } );
		} else {
			// ??: Maybe all warnings should be at the start
			console.error( "This project can't handle values for width that aren't either numbers or strings." )
		}

		if ( typeof dimensions.height === 'number' ) {
			styles.push( {attribute: 'height', value: dimensions.height + units } );
		} else if ( typeof dimensions.height === 'string' ) {
			styles.push( {attribute: 'height', value: dimensions.height } );
		} else {
			console.error( "This project can't handle values for height that aren't either numbers or strings." )
		}

		setStyles( styles, cuboid );  // Set all of those styles

		// =======================
		// THE SIDES
		// =======================
		addSides( dimensions, cuboid );

		return cuboid;
	};  // End makeCuboid();


	// ==========================
	// DO THE DEED
	// ==========================
	// If no units have been given set the units to pixels, with a message to that effect
	if ( !dimensions.hasOwnProperty('units') || typeof dimensions.units !== 'string' ) {
		console.warn("No string was provided for dimensions.units, so it's all gonna be in pixels.");
		dimensions.units = 'px';
	}

	// Make the element that contains all the stuff. This is what will be returned
	var cuboid = makeCuboid( dimensions );

	// To make the 3D show up, some parent out there will have to have its
	// `perspective` style attribute set (if there's one given)
	if ( perspectiveData.hasOwnProperty( 'node' ) ) {
		perspectiveData.node.style.perspective = perspectiveData.value;
		// perspectiveData.node.style['transformStyle'] = 'preserve-3d';  // ??: needed?
	} else {
		console.warn('No element has been passed in to add perspective. Make sure you set one yourself.');
	}

	return cuboid;
};  // End makeCuboid()
