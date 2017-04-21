var express = require ('express');
var app = express();
var server = require ('http').Server(app);
var io = require ('socket.io')(server);

app.use(express.static('client'));

var tablero = [[null, null, null], [null, null, null], [null, null, null]];
var con = 0;
var jugadores = 0;
var jugadorActual;
var players=new Array();
var jugadorX, jugadorO;

io.on('connection', function(socket){
    
    jugadores++;
    //setupPlayerAndConnection(socket);
    setupPlayerAndConnection(socket, jugadores);
    console.log('El cliente con IP: ' + socket.handshake.address + 'se ha conectado');
    io.sockets.emit('jugador', jugadores);
    console.log(tablero);
    socket.emit('tablero', {tablero, con, jugadores}); //emite el mensaje desde el servidor a todos los clientes
    socket.on('movimiento', function(data){
        
        con=data.con;
        console.log('Tablero actualizado en el server con tablero del client: ' + tablero);
        //io.sockets.emit('tablero', {tablero, con, boton});// emite un mensaje a todos los clientes conectados al server
        socket.broadcast.emit('tablero', {"con": data.con, "boton": data.boton});//emite el mensaje a todos los clientes menos el que envió el mensaje
    });

    // Jugar turno coomo un Jugador
    socket.on('jugarTurno', function(data){

        //if (data.jugador!==socket.id) console.error("Something is Up!");
        console.log("Boton: ");
        console.log(data.infoJugador.boton.className);
        console.log("Id del jugador que dio click: " + data.infoJugador.jugador);
        var jugador = getJugador(data.infoJugador.jugador);//busca al jugador que hizo el movimiento por su id   
        var turnoLegal;
        if(jugadorActual===jugador)
        {
            turnoLegal=true;
            if(jugador===jugadorX)
            {
                tablero[data.infoJugador.tablero.fil][data.infoJugador.tablero.col]=jugador.marca;
                jugadorActual=jugadorO; 
                console.log(tablero);
            }
            else
            {
               tablero[data.infoJugador.tablero.fil][data.infoJugador.tablero.col]=jugador.marca;
                jugadorActual=jugadorX; 
                console.log(tablero);
            }
        }
        else
        {
            console.log("No es tu turno");
            turnoLegal=false;
        }

        //gamePlaying.completeTurn(getPlayer(data.player),[data.action.row,data.action.quad]);
        var ganador=esGanador(jugador);
        console.log("El valor de ganador es: " + ganador);
        if (ganador==2) { //aqui debe ir el del empate

            //io.in(gameId).emit('stale_mate',gamePlaying);
            //io.in(gameId).emit('game_message',{message:"Stale Mate!"});
            //getGame(data.gameId).endGame();
            console.log("Empate");
            var boton = data.infoJugador.boton;
            socket.emit('turnoJugado', {jugadorActual, boton, turnoLegal});
        } else if (ganador==0||ganador==1) {

            /*var gameCompleted={
                game:gamePlaying,
                winner:getPlayer(socket.id)
            };
            io.in(gameId).emit('game_won',gameCompleted);
            getGame(gameId).endGame();*/
            console.log("Gano: " + ganador);
            var boton = data.infoJugador.boton;
            socket.emit('turnoJugado', {jugadorActual, boton, turnoLegal});
        }else
        {
            //io.in(gameId).emit('turn_played',gamePlaying); //necesito enviar el jugador actual  

            // sending to all clients, include sender
            //var boton = {"boton": {"id": data.infoJugador.boton.id, "className": data.infoJugador.boton.className}};
            var boton = data.infoJugador.boton;
            //io.emit('turnoJugado', {jugadorActual, boton, turnoLegal});
            console.log("Se hizo bien, y se enviara al cliente");
            socket.emit('turnoJugado', {jugadorActual, boton, turnoLegal});
            

        }



    });


    socket.on('disconnect', function () {
        tablero = [[null, null, null], [null, null, null], [null, null, null]];
        con = 0;
        jugadores--;
        io.sockets.emit('jugador', jugadores);
        io.sockets.emit('recarga', tablero);
    });
});

function setupPlayerAndConnection(socket, juga) {
    //Cookie Process for Name - Ignore Session Id since it most likely is Stale
    var cookieStr = getCookieValue(socket.request, "tttGameParams");
    //Load Game Params from Cookie
    var gameParams = extractParams(cookieStr, socket.id);
    //Set Player
    var marca, player;
    console.log(juga);
    if(juga==1)
    {
        console.log("Se entró al if 1");
        marca = 0;
        player = new Player(socket.id, gameParams.userName, gameParams.wins, gameParams.losses, gameParams.stalemate, "new", false, marca);
        jugadorActual = player;
        jugadorX = player;
        console.log(jugadorX);
        console.log(jugadorActual);
    }
    else if (juga==2)
    {
        console.log("Se entró al if 2");
        marca = 1;
        player = new Player(socket.id, gameParams.userName, gameParams.wins, gameParams.losses, gameParams.stalemate, "new", false, marca);
        jugadorO = player;
        console.log(jugadorO);
        console.log(jugadorActual);
    }

    //var player = new Player(socket.id, gameParams.userName, gameParams.wins, gameParams.losses, gameParams.stalemate, "new", false, marca);
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
function Player(clientId,userName,wins,losses,stalemate,state,ai,marca) {

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
        this.marca=marca;
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

function esGanador(playerIndex) {
    //let board = this.board;

    for (var playerIndex = 0; playerIndex < 2; playerIndex++) {
      // verifica las filas
      for (var r = 0; r < 3; r++) {
        var todosMarcados = true;
        for (var c = 0; c < 3; c++) {
          if (tablero[r][c] !== playerIndex) todosMarcados = false;
        }
        if (todosMarcados) return playerIndex;
      }

      // verifica las columnas
      for (var c = 0; c < 3; c++) {
        var todosMarcados = true;
        for (var r = 0; r < 3; r++) {
          if (tablero[r][c] !== playerIndex) todosMarcados = false;
        }
        if (todosMarcados) return playerIndex;
      }

      // verifica las diagonales
      if (tablero[0][0] === playerIndex && tablero[1][1] === playerIndex && tablero[2][2] === playerIndex) {
        return playerIndex;
      }
      if (tablero[0][2] === playerIndex && tablero[1][1] === playerIndex && tablero[2][0] === playerIndex) {
        return playerIndex;
      }
    }

    /*if(con==9)
    {
        return 2;
        console.log("Es un empate");
    }*/

    //Check StaleMate
    var empate=true;
    for (var i=0;i<3;i++) {

        for (var q=0;q<3;q++) {
            if (tablero[i][q]==null) empate=false;
        }

    }
    if (empate) {
        return 2;
    }
    

    return null;

     /*for (var i=0;i<3;i++) {
        var lastSquare=0;
        for (var q=0;q<3;q++) {
            if (q==0) {
                if (tablero[i][q]==0) break;
                lastSquare=tablero[i][q];
            } else
            {
                if (tablero[i][q]==0||lastSquare!=tablero[i][q]) break;
                lastSquare=tablero[i][q];
            }
            if (q==2) return tablero[i][q];
        }

    }

    for (var i=0;i<3;i++) {
        var lastSquare=0;
        for (var q=0;q<3;q++) {
            if (q==0) {
                if (tablero[q][i]==0) break;
                lastSquare=tablero[q][i];
            } else
            {
                if (tablero[q][i]==0||lastSquare!=tablero[q][i]) break;
                lastSquare=tablero[q][i];
            }
            if (q==2){console.log("Gano: " + tablero[q][i]); return tablero[q][i];}
        }

    }

    if (tablero[0][0]!=0&&(tablero[0][0]==tablero[1][1]&&tablero[2][2]==tablero[1][1])) {
        console.log("Diagonal 1: "+ tablero [0][0]);
        return  tablero[0][0];
    }

    //Check for ways to win
    if (tablero[0][2]!=0&&tablero[0][2]==tablero[1][1]&&tablero[2][0]==tablero[1][1]) {
        console.log("Diagonal 2: " + tablero[1][1]);
        return  tablero[1][1];
    }

    //Check StaleMate
    var mate=true;
    for (var i=0;i<3;i++) {

        for (var q=0;q<3;q++) {
            if (tablero[i][q]==0) mate=false;
        }

    }
    if (mate) {
        return 2;
    }

    return null;*/

  }


function getJugador(playerId) {

    for (var i=0;i<players.length;++i) {
        if (players[i].id==playerId) {
           return players[i];
        }
    }

    console.error("Error: No se encontro el jugador con el id: " + playerId);
}



server.listen(6677, function(){
    console.log('Servidor está funcionando en http://localhost:6677');
}); 