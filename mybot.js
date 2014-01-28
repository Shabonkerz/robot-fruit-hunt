function new_game()
{}

function make_move()
{
	console.log( "Making move!" );
	var move = bot.moveTo( bot.buildPathTree()[ 1 ].fruit )
	console.log( move );
	return move;
	// var board = get_board();

	// // we found an item! take it!
	// if ( board[ get_my_x() ][ get_my_y() ] > 0 )
	// {
	// 	return TAKE;
	// }

	// var rand = Math.random() * 4;

	// if ( rand < 1 ) return NORTH;
	// if ( rand < 2 ) return SOUTH;
	// if ( rand < 3 ) return EAST;
	// if ( rand < 4 ) return WEST;

	// return PASS;
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}


// SuperBot is not yet so super.
var SuperBot = function ()
{

	this.strategy = this.strategies.OFFENSIVE;

}
var shortest_winning_distance;
SuperBot.prototype = {

	strategies:
	{
		OFFENSIVE: 0,
		DEFENSIVE: 1
	},
	pathTree: null,
	strategy: null,
	moveTo: function ( fruit )
	{
		var x = fruit.x - get_my_x();
		var y = fruit.y - get_my_y();

		if ( x > 0 )
		{
			return EAST;
		}
		else if ( x < 0 )
		{
			return WEST;
		}
		else if ( y > 0 )
		{
			return SOUTH;
		}
		else if ( y < 0 )
		{
			return NORTH;
		}
		else if ( get_board()[ get_my_x() ][ get_my_y() ] > 0 )
		{
			return TAKE;
		}
		else
		{
			return PASS;
		}
	},
	// Very performance intensive. There must be a better way!
	buildPathTree: function ()
	{
		shortest_winning_distance = 99999;
		this.fruits = this.getFruits();

		this.pathTree = new PathNode( null, null, this.fruits );

		return this.pathTree.getShortestWinnablePath().reverse();
	},
	insertPathNode: function () {

	},
	getOptimalPath: function () {

	},
	getFruits: function ()
	{
		var board = get_board();
		var fruits = [];
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
var PathNode = function ( parent, fruit, fruits, level, counts )
{
	this.parent = parent || null;
	this.children = [];

	if ( level === undefined || level === null ) level = 1;

	if ( counts === undefined || counts === null )
	{
		this.counts = [];
		for ( var i = 0; i < get_number_of_item_types(); i++ )
		{
			this.counts.push( get_total_item_count( i + 1 ) );
		};
	}
	else
	{
		this.counts = counts.slice( 0 );
	}

	this.fruit = fruit;

	// The only time it would be null is when it is the root.
	if ( this.fruit !== null )
	{
		if ( this.parent.fruit !== null ) this.distance = this.parent.distance + Math.abs( this.fruit.x - this.parent.fruit.x ) + Math.abs( this.fruit.y - this.parent.fruit.y );
		if ( this.distance > shortest_winning_distance ) return;

		this.counts[ fruit.type - 1 ]--;

		// If we reach part of the winning condition, check the others.
		if ( this.counts[ fruit.type - 1 ] < ( get_total_item_count( fruit.type ) / 2 ) && this.isWinningPath() )
		{
			shortest_winning_distance = this.distance;
			// this.win = true;
			// var parent = this.parent;
			// while ( parent !== null )
			// {
			//    parent.win = true;
			//    parent = parent.parent;
			// }
			return;
		}
		// else
		// {
		//    // this.win = false;
		// }
	}
	else
	{
		this.fruit = new Fruit( get_my_x(), get_my_y(), null, null );
		// If we're the root, there is not distance because it is the starting point.
		this.distance = 0;
	}

	this.insert( fruits, level + 1 );
}
PathNode.prototype = {
	isWinningPath: function ()
	{
		var winningFruits = 0;

		for ( var i = 1; i < get_number_of_item_types() + 1; i++ )
		{
			if ( this.counts[ i - 1 ] < ( get_total_item_count( i ) / 2 ) ) winningFruits++;
		};

		// Is this path a winning one????
		return winningFruits >= Math.floor( get_number_of_item_types() / 2 ) + 1;
	},
	insert: function ( fruits, level )
	{
		if ( fruits === undefined || fruits === null || fruits.length === 0 ) return;

		for ( var i = 0; i < fruits.length; i++ )
		{
			var remaining = fruits.slice( 0 );
			remaining.splice( i, 1 );
			//console.log( ( "" + stringFill( "\t", level ) ) + fruits[ i ].id.toString( ) );
			this.children.push( new PathNode( this, fruits[ i ], remaining, level, this.counts ) );
		};
	},
	getShortestWinnablePath: function ()
	{

		if ( this.distance = shortest_winning_distance && this.children.length === 0 ) return [ this ];

		// var paths = [];
		for ( var i = 0; i < this.children.length; i++ )
		{
			if ( this.children[ i ].distance > shortest_winning_distance ) continue;
			var path = this.children[ i ].getShortestWinnablePath();
			if ( path !== null )
			{
				path.push( this );
				return path;
			}
		};

		return null;

	},
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
var bot = new SuperBot();
//920415