function new_game()
{}

function make_move()
{
	var board = get_board();

	// we found an item! take it!
	if ( board[ get_my_x() ][ get_my_y() ] > 0 )
	{
		return TAKE;
	}

	var rand = Math.random() * 4;

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
var SuperBot = function () {

}

Superbot.prototype = {

	this.strategies = {
		OFFENSIVE: 0,
		DEFENSIVE: 1
	};

	this.paths = [];

	this.strategy = this.strategies.OFFENSIVE;


	buildPathTree: function ()
	{

		this.fruit_locations = this.getFruits();

	},
	insertPathNode: function () {

	},
	getOptimalPath: function () {

	},
	getFruits: function ()
	{
		var board = get_board();
		var fruit_locations = [];
		for ( var x = 0; x < board.length; x++ )
		{
			for ( var y = 0; y < board[ x ].length; y++ )
			{
				if ( board[ x ][ y ] > 0 ) fruit_locations.push( new FruitLocation( x, y, board[ x ][ y ] ) );
			};
		};
		return fruit_locations;
	}
}

var FruitLocation = function ( x, y, fruit )
{
	this.x = x;
	this.y = y;
	this.fruit = fruit;
}
var PathNode = function ( fruitlocation, fruits )
{
	this.fruit_location = fruitlocation;
	this.children = [];
	this.insert( fruits );
}
PathNode.prototype = {
	insert: function ( fruits )
	{
		for ( var i = 0; i < fruits.length; i++ )
		{
			var remaining = fruits.splice( i, 1 );
			this.children.push( new PathNode( fruits[ i ], remaining ) );
		};
	}
}