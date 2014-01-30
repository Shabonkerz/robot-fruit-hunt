function new_game()
{}

function make_move()
{
	var start = new Date();
	var move = bot.moveTo( bot.buildPathTree()[ 1 ].fruit );
	var end = new Date();
	console.log( "Moving to " + move + ". Building the path tree took: " + ( end.valueOf() - start.valueOf() ) + "ms" );
	return move;
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}

var Game = function () {

}
Game.prototype = {
	number_of_players: 2
}


// SuperBot is not yet so super.
var SuperBot = function ()
{

	this.strategy = this.strategies.OFFENSIVE;

}
var shortest_winning_distance;
var total_fruits;
var total_inserts = 0;
var debug_count = 0;
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
		total_fruits = this.fruits.length;
		total_inserts = 0;
		this.pathTree = new PathNode( null, null, this.fruits );
		console.log( "Total inserts: " + total_inserts + " for " + total_fruits + " fruits." );
		if ( shortest_winning_distance === 99999 ) throw new Error( "Shortest winning distance not set." );
		return this.pathTree.getShortestWinnablePath();
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
var PathNode = function ( parent, fruit, fruits )
{
	// debug_count++;
	this.parent = parent || null;
	this.children = [];

	this.fruit = fruit;

	if ( this.fruit !== null )
	{
		if ( this.parent.fruit !== null ) this.distance = this.parent.distance + Math.abs( this.fruit.x - this.parent.fruit.x ) + Math.abs( this.fruit.y - this.parent.fruit.y ) + 1;
		if ( this.distance > shortest_winning_distance ) return;
	}
	// if ( level === undefined || level === null ) level = 1;

	if ( parent === undefined || parent === null )
	{
		this.counts = [];
		for ( var i = 0; i < get_number_of_item_types(); i++ )
		{
			// this.counts.push( get_total_item_count( i + 1 ) );
			this.counts.push( 0 );
		};
	}
	else
	{
		this.counts = this.parent.counts.slice( 0 );
	}


	// The only time it would be null is when it is the root.
	if ( this.fruit !== null )
	{
		// if ( this.parent.fruit !== null ) this.distance = this.parent.distance + Math.abs( this.fruit.x - this.parent.fruit.x ) + Math.abs( this.fruit.y - this.parent.fruit.y ) + 1;
		// if ( this.distance > shortest_winning_distance ) return;

		this.counts[ this.fruit.type - 1 ]++;

		if ( this.exceedsLimit() === true ) return;

		// If we reach part of the winning condition, check the others.
		if ( this.counts[ this.fruit.type - 1 ] + get_my_item_count( this.fruit.type ) + get_opponent_item_count( this.fruit.type ) == get_total_item_count( this.fruit.type ) && this.isWinningPath() )
		{
			shortest_winning_distance = this.distance;
			return;
		}
	}
	else
	{
		this.fruit = new Fruit( get_my_x(), get_my_y(), null, null );
		// If we're the root, there is not distance because it is the starting point.
		this.distance = 0;
	}

	this.insert( fruits );
}

PathNode.prototype = {
	exceedsLimit: function ()
	{
		var total = 0;
		for ( var i = 0; i < get_number_of_item_types(); i++ )
		{
			// this.counts.push( get_total_item_count( i + 1 ) );
			total += this.counts[ i ];
		};

		return total > Math.floor( total_fruits / 2 ) + 1;
	},
	breadth_search: function ( search_callback, queue_condition )
	{
		var queue = new Queue();

		queue.enqueue( this );

		while ( queue.isEmpty() === false )
		{
			var current_node = queue.dequeue();

			if ( search_callback( current_node ) === true )
			{
				return current_node;
			}
			else
			{
				for ( var i = 0; i < current_node.children.length; i++ )
				{
					if ( queue_condition( current_node ) === true )
					{
						queue.enqueue( current_node.children[ i ] );
					}
				};
			}
		}
	},

	/**
	 * Gets all of the nodes in the path to the node.
	 * @return {[Array]}
	 */
	get_path: function ()
	{
		var path = [ this ];

		var parent = this.parent;

		while ( parent !== null )
		{
			path.push( parent );
			parent = parent.parent;
		}

		return path.reverse();
	},
	isWinningPath: function ()
	{
		var winningFruits = 0;

		for ( var i = 1; i < get_number_of_item_types() + 1; i++ )
		{
			if ( this.counts[ i - 1 ] + get_my_item_count( i ) + get_opponent_item_count( i ) == get_total_item_count( i ) ) winningFruits++;
		};

		// Is this path a winning one????
		return winningFruits >= Math.floor( get_number_of_item_types() / 2 ) + 1;
	},
	insert: function ( fruits, level )
	{
		total_inserts++;
		if ( fruits === undefined || fruits === null || fruits.length === 0 ) return;

		for ( var i = 0; i < fruits.length; i++ )
		{
			var remaining = fruits.slice( 0 );
			remaining.splice( i, 1 );
			// for (var i = 0; i < remaining.length; i++) {
			//    if( this.distance + remaining[i]
			// };
			this.children.push( new PathNode( this, fruits[ i ], remaining ) );
		};
	},
	getShortestWinnablePath: function ()
	{

		return this.breadth_search( function ( node )
		{
			return ( node.distance === shortest_winning_distance && node.children.length === 0 );
		}, function ( node )
		{
			return node.distance <= shortest_winning_distance;
		} ).get_path();

		// get_path( breadth_search( bot.pathTree,  ) );
	},
	getShortestWinnablePath2: function ()
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
var bot = new SuperBot();
//920415