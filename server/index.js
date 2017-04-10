var express = require ('express');
var app = express();
var server = require ('http').Server(app);
var io = require ('socket.io')(server);

app.use(express.static('client'));

var tablero = [[null, null, null], [null, null, null], [null, null, null]];
var con = 0;
var jugadores = 0;

io.on('connection', function(socket){
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

server.listen(6677, function(){
	console.log('Servidor está funcionando en http://localhost:6677');
}); 