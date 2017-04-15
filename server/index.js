var express = require ('express');
var app = express();
var server = require ('http').Server(app);
var io = require ('socket.io')(server);

app.use(express.static('client'));

var tablero = [[null, null, null], [null, null, null], [null, null, null]];
var con = 0;
var jugadores = 0;
var players=new Array();

io.on('connection', function(socket){
	setupPlayerAndConnection(socket);
	console.log('El cliente con IP: ' + socket.handshake.address + 'se ha conectado');
	jugadores++;
	io.sockets.emit('jugador', jugadores);
	console.log(tablero);
	socket.emit('tablero', {tablero, con, jugadores}); //emite el mensaje desde el servidor a todos los clientes
	socket.on('movimiento', function(data){
		console.log('Tablero recibido desde el client: ' + data.tablero + ' cont: ' + data.con + ' id: ' + data.boton);
		tablero=data.tablero;
		con=data.con;
		var boton = data.boton;
		console.log('Tablero actualizado en el server con tablero del client: ' + tablero);
		//io.sockets.emit('tablero', tablero);// emite un mensaje a todos los clientes conectados al server
		//io.sockets.emit('tablero', {tablero, con});// emite un mensaje a todos los clientes conectados al server
		io.sockets.emit('tablero', {tablero, con, boton});// emite un mensaje a todos los clientes conectados al server
	});

	socket.on('disconnect', function () {
    	tablero = [[null, null, null], [null, null, null], [null, null, null]];
    	con = 0;
    	jugadores--;
    	io.sockets.emit('jugador', jugadores);
  	});
});

function setupPlayerAndConnection(socket) {
    //Cookie Process for Name - Ignore Session Id since it most likely is Stale
    var cookieStr = getCookieValue(socket.request, "tttGameParams");
    //Load Game Params from Cookie
    var gameParams = extractParams(cookieStr, socket.id);
    //Set Player
    var player = new Player(socket.id, gameParams.userName, gameParams.wins, gameParams.losses, gameParams.stalemate, "new", false);
    players.push(player);
    socket.emit('available_games', players);
    io.emit('player_update', player);
}

//Gets cookie data from Request and returns Cookie with name
function getCookieValue(request,cookie) {
    var list = {},
        rc = request.headers.cookie;
    var match="";
    rc && rc.split(';').forEach(function( cookie ) {

       var parts = cookie.split('=');

       if (parts[0].trim()=="tttGameParams") match = parts[1];
//        list[parts.shift().trim()] = unescape(parts.join('='));
    });

    return match;
}

//Player Object
function Player(clientId,userName,wins,losses,stalemate,state,ai) {

        this.id=clientId;
        this.state=state;
        if (userName !== undefined) {
            this.playerName=userName;
        }else
        {
            this.playerName=this.id;
        }
        this.wins=wins;
        this.losses=losses;
        this.stalemate=stalemate;
       // this.icon=playerIcon;
        this.computerai=ai;
        return this;
}


//Game functions
//Extract User Game details from Cookie
function extractParams(cookieParams,socketId) {
    //console.log(cookieParams);
    var gameParams;
    if (cookieParams === "") {
        return {
            userName:socketId,
            sessId:socketId,
            wins:0,
            losses:0,
            stalemates:0

        };
    }else
    {
        var parseStr = cookieParams.split("|");
        return {
            userName:parseStr[0],
            sessId:parseStr[1],
            wins:parseStr[2],
            losses:parseStr[3],
            stalemates:parseStr[4]
        };

    }




}

server.listen(6677, function(){
	console.log('Servidor está funcionando en http://localhost:6677');
}); 