function new_game( )
{}

function make_move( )
{

	bot.buildPathTree( );
	var board = get_board( );

	// we found an item! take it!
	if ( board[ get_my_x( ) ][ get_my_y( ) ] > 0 )
	{
		return TAKE;
	}

	var rand = Math.random( ) * 4;

	if ( rand < 1 ) return NORTH;
	if ( rand < 2 ) return SOUTH;
	if ( rand < 3 ) return EAST;
	if ( rand < 4 ) return WEST;

	return PASS;
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}


// SuperBot is not yet so super.
var SuperBot = function ( )
{

	this.strategy = this.strategies.OFFENSIVE;
}

SuperBot.prototype = {

	strategies:
	{
		OFFENSIVE: 0,
		DEFENSIVE: 1
	},
	pathTree: null,
	strategy: null,

	// Very performance intensive. There must be a better way!
	buildPathTree: function ( )
	{
		this.fruits = this.getFruits( );

		this.pathTree = new PathNode( null, this.fruits );
	},
	insertPathNode: function ( ) {

	},
	getOptimalPath: function ( ) {

	},
	getFruits: function ( )
	{
		var board = get_board( );
		var fruits = [ ];
		var count = 0;
		for ( var x = 0; x < board.length; x++ )
		{
			for ( var y = 0; y < board[ x ].length; y++ )
			{
				if ( board[ x ][ y ] > 0 ) fruits.push( new Fruit( x, y, board[ x ][ y ], count++ ) );
			};
		};
		return fruits;
	}
}

var Fruit = function ( x, y, type, id )
{
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = id;
}
var PathNode = function ( fruit, fruits, level )
{
	if ( level === null || level === undefined ) level = 1;
	this.fruit = fruit;
	this.insert( fruits, level + 1 );
}
PathNode.prototype = {
	insert: function ( fruits, level )
	{
		if ( fruits === null || fruits.length === 0 ) return;

		for ( var i = 0; i < fruits.length; i++ )
		{
			var remaining = fruits.slice( 0 );
			remaining.splice( i, 1 );
			//console.log( ( "" + stringFill( "\t", level ) ) + fruits[ i ].id.toString( ) );
			this[ i ] = new PathNode( fruits[ i ], remaining, level );
		};
	},
	getShortestWinnablePath: function ( fruits ) {

	}
}

function stringFill( x, n )
{
	var s = '';
	for ( ;; )
	{
		if ( n & 1 ) s += x;
		n >>= 1;
		if ( n ) x += x;
		else break;
	}
	return s;
}
var bot = new SuperBot( );
//920415