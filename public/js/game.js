/*
	This script will be used client side to operate the game

 * Requests a new board state from the server's /data route.
*/

// Global vars to be used in all
var localBoard = null; // Our local copy of what the board is, update this when getting new board (Not sure if this needed)
var localMove = -1; // Local copy of who's move it is, update this when getting new board (Not sure if this needed)
var me = 0; // Our local Id, i.e if its player me's turn, its us!

var prevState = -1;

/*
*	checkIfValidMove
*	Inputs: 
* 	- Board: int[] - x by x 2D array of ints representing tokens at different locations
*	- Move: object - Object containing data about the moves location and token color {x: int, y: int, token: int}
*
*	Returns:
*	- IfValdMove: bool
*/ 
function checkIfValidMove(board, move){

	// Make sure spot is not taken
	// TODO

    if(board[x][y] != 0)
    {
        return false;
    }
    
	// Make sure spot would not be suicide
	// TODO

	// SERVER WILL CHECK KO RULE AFTER CHECKING IF MOVE IS VALID
	//if(checkifKo(board, move)) return false;

	// If we make it past all checks, it is a valid move
	return true;
}

/*
*	sendMove - Sends a request to the server to make their move
*			 - Should sent POST request to '/sendMove'
			 - Should send game id and move in the request body
			 - Don't need to send auth info, AJAX will forward cookies
*	Inputs: 
*	- Move: object - Object containing data about the moves location and token color {x: int, y: int, token: int}
*
*	Returns: 
*	- Success: bool
*/
function sendMove(x, y){
	console.log("gameId: " + gameId);
	var move = {"x": x, "y": y, pass: false, gameId: gameId};
    $.post("/sendMove", move).done(function(data){
    	if(data != {}){
    		console.log([data]);
    		drawBoard([data]);
    	}
    });   
}

function sendPass(){
    var move = {"gameId": gameId, "pass": true, "x": null, "y": null};
    $.post("/sendMove", move).done(function(data){
        if(data != {}){
            console.log([data]);
            drawBoard([data]);
        }
    })
}

function gameOver() {
    // WHAT DO WE WANT TO SEND? var board = {"gameId": gameId, (...)
    $.post("/gameOver", board).done(function(data){
        if (data != {}) {
            console.log([data]);
            drawBoard([data]);
        }
    })
}

function getData(cb){
    $.get("/getBoard?id="+gameId, function(data, textStatus, xhr){
        localBoard = data; 
        cb(data);  
    }); 
}

/*
*	getBoard - Sends a request to the server to update the game board
*			 - Should sent GET request to '/getBoard'
*			 - Should send game id in the request
*			 
*	Returns: 
*	- An object containing the board and who's turn it is
*	- Object: {board: x by x 2D array of ints representing tokens at different locations, move: int}
*/
function getBoard(){

 // This code is going to end up doing something
 // that relates to the AI and requesting moves from it
 // similar code can be seen in script.js from lab 6 I think.
 // WYLL :D
    $.ajax({
        type: 'POST',
        url : '/getBoard?id='+ gameId,
        dataType: "json",
        data : JSON.stringify(localBoard), 
        contentType : "application/json",
        success : function(data){
            console.log(data);
            //console.log(status);
            localBoard = data;
            drawBoard(data);    
        }
    });
}

/*
* showPlayerInfo - Given player name and score for each player,
*                  manipulate the DOM to display each player information
*                - Player information contains: Name/Score
*
*/
function showPlayerInfo(player1, player2, player1score, player2score) {
    
    $('#playerinfo-left-name').html(player1);
    $('#playerinfo-right-name').html(player2);
    $('#playerinfo-left-score').html("Score: " + player1score);
    $('#playerinfo-right-score').html("Score: " + player2score);
}

/*
* passButton - Have the pass button show in the appropriate
*              context (i.e. different game modes)
*
*/
function passButton(turn) {	
	var localGame = (game.userIP != null);
    if ((turn == 0 || turn == 3) && (user == game.player1 || localGame)) {
        if($('#playerinfo-left-button').css('display') == 'none') $('#playerinfo-left-button').show(500);
        $('#playerinfo-right-button').hide(500);
    } else if(turn == 0 || turn == 3){
		$('#playerinfo-left-button').hide(500);
        $('#playerinfo-right-button').hide(500);
	} else if ((turn == 1 || turn == 2) && (localGame || (user == game.player2))) {
        $('#playerinfo-left-button').hide(500);
        if($('#playerinfo-right-button').css('display') == 'none') $('#playerinfo-right-button').show(500);
    } else if(turn == 1 || turn == 2){
		$('#playerinfo-left-button').hide(500);
	} else if (turn == 4 || turn == 5) {
        $('#playerinfo-left-button').hide(500);
        $('#playerinfo-right-button').hide(500);
    }
}

//pass button functionality

    $('#playerinfo-left-button').click(function(){
        if(this.id == 'playerinfo-left-button'){
              $("#passModal").modal("show");
              $('#pass').off().click(function() {
                  sendPass();
              });
        }
    });

    $('#playerinfo-right-button').click(function(){
        if(this.id == 'playerinfo-right-button'){
              $("#passModal").modal("show");
              $('#pass').off().click(function() {
                  sendPass();
              });
        }
    });


function placeToken(board) {
 /*  setAttribute("onmouseover", 'setAttribute("fill-opacity", .5)');
   setAttribute("onmouseout", 'setAttribute("fill-opacity", 0)');*/
	console.log(click);
}

/*
*	drawBoard - Given a board, re-draws the page and manipulates the DOM to display the new board
*			  - Look at /views/play.html to figure out how to draw it
*
*/
function drawBoard(state){
	//console.log(state[0].board);
	
	$('#canvas, #playerinfo-left, #playerinfo-right').html('');
	
    var canvas = $("#canvas"); 

    // Change the height and width of the board here...
    // everything else should adapt to an adjustable
    // height and width.
    var W = 750, H = W; 
    canvas.css("height", H); 
    canvas.css("width", W); 

    // The actual SVG element to add to. 
    // we make a jQuery object out of this, so that 
    // we can manipulate it via calls to the jQuery API. 
    var svg = $(makeSVG(W, H));
	
	
	//var sz = state.size;
	var sz = state[0].boardSize-1;
	//var board = state.board;
	var board = state[0].board;
	//console.log(board[1][1]);
	var x = W;
	var inc = (x/sz);
	var offset = (W-x)/2;
	
	if( (.5*inc) > offset) {
		offset = .5*inc;
		x = W -16 - (2*offset);
		inc = x/sz;
	}
	
	svg.append(makeRectangle(0,0,W-16,H-16,"board"));
	
	for(i=0; i<=sz; i++){
		for(j=0; j<=sz; j++){
			if( i < state[0].boardSize-1 && j < state[0].boardSize-1) {
				var rect = makeRectangle( (i*inc)+offset+1,(j*inc)+offset+1,inc-2,inc-2,"square");
				svg.append(rect);
			}
			if(board[i][j] === 0)
				var click = makeClick( (i*inc)+(1.05*offset)-1,(j*inc)+(1.05*offset)-1,inc,inc,i,j);
			if(board[i][j] === 1)
				var token = makeCircle( (i*inc)+offset-1,(j*inc)+offset-1,.48*(inc),"black");
			if(board[i][j] === 2)
				var token = makeCircle( (i*inc)+offset-1,(j*inc)+offset-1,.48*(inc),"white");
			//click.setAttribute("onclick",placeToken(board));
			svg.append(token);
			svg.append(click);
			//console.log(board[i][j]);
		}
	}
	//console.log(board);

    // append the svg object to the canvas object.
    canvas.append(svg);
    showPlayerInfo(state[0].player1, state[0].player2, state[0].player1score, state[0].player2score);
    
    // PASS BUTTON ANIMATION:
     passButton(state[0].state);
	 
    // END GAME OPTION SHOW:
    if (state[0].state == 4 || state[0].state == 5) {
        $('#myModal').modal('show');
		
		// server handles calculating score/determining winner
		
        if (state[0].state == 4) {
            $('#id-modal-title').html(state[0].player1 + " (black) has won the game with a total of " + state[0].player1score + " points!");
        }
        if (state[0].state == 5) {
            $('#id-modal-title').html(state[0].player2 + " (white) has won the game with a total of " + state[0].player2score + " points!");
        }
    }
    

    // Set the game status
    switch(state[0].state){
    	case 0: $('#gameStatus').html('<b>Blacks turn</b>'); break;
    	case 1: $('#gameStatus').html('<b>Whites turn</b>'); break;
    	case 2: $('#gameStatus').html('<b>Black passed</b>'); break;
    	case 3: $('#gameStatus').html('<b>White passed</b>'); break;
    	case 4: $('#gameStatus').html('<b>Black won!</b>'); break;
    	case 5: $('#gameStatus').html('<b>White won!</b>'); break;
    }
}


/* 
*	tick - Periodically checks for game board updates if it isn't our turn
*/
function tick(){
	// If we think its the other persons turn, check for updates
	getData(drawBoard);
} 

function init(){
	// Do page load things here...
	console.log("Initalizing Page...."); 
	drawBoard([game]);
	setInterval(tick, 3000);
}