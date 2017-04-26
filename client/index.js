var socket = io.connect ('http://localhost:6677/', {'forceNew': true});//se conecta en dicha direccion/puerto

var tablero = [[null, null, null], [null, null, null], [null, null, null]];

var con = 0;

var jugadores=0;

var gameParams = {
    userName:"",
    wins:0,
    losses:0,
    sessId:"",
    stalemates:0
};

var clientId;


socket.on('connect', function () {
      clientId = socket.io.engine.id;
      initializeGameParams();
      console.log("ID Assigned - " + clientId);

});


//funcion intermedia para actualizar los tableros oponentes
socket.on('tablero', function(data){ //recibe lo que se emite desde el servidor
  
  con = data.con;
  var boton = data.boton;
  if(boton!= undefined) //para evitar errores del primer envío de datos al conectarse
    render(con, boton);
});

//actualiza el numero de jugadores conectados
socket.on('jugador', function(data){

  jugadores = data;
  console.log(jugadores);
});

// Para cuando se reinica la ventana en el navegador
socket.on('recarga', function(data){

  tablero = data;
  console.log("Tablero despues de la recarga: ")
  console.log(tablero);
});


socket.on('actualizarTablero', function(data){

  limpiarTabla();
});

socket.on('messages', function(data1) {  
  console.log(data1);
  resultado(data1);
})

//renderiza el movimiento jugado dependiendo de si es un movimiento legal y hay dos jugadores
socket.on('turnoJugado', function(data){
  console.log("El turno es:" + data.turnoLegal);
  console.log(data.boton);
  console.log(data.boton.className);
  console.log(data.boton.id);
  var boton = document.getElementById(data.boton.id);
  if(jugadores==2)
    {
        if(data.turnoLegal)
        {    
            if(boton.className=="buttons")
            {
                boton.className="clicked";
                var text;
                if(con%2==0)
                {
                    text="X";
                    jugadorActual=1;
                }
                else
                {
                    text="O";
                    jugadorActual=0;
                }
                boton.value=text;
                
                boton.appendChild(document.createTextNode(text));
                con++;

                var boton = data.boton.id;
            
                socket.emit('movimiento', {"con": con, "boton": boton, "jugador":clientId, "marca": jugadorActual});//aqui se envía
         
            } 
        }
        else
        {
            alert('Movimiento no valido');
        }
    }
    else
      alert('Esperando por un segundo jugador!');
  
});


// Renderiza el movimiento en el tablero del cliente que no hizo el movimiento
function render (cont, data){

  boton = document.getElementById(data);
  console.log('Boton en render: ' + data);
  if(boton.className=="buttons")
    {
        boton.className="clicked";
        var text;
        if((cont-1)%2==0)
          {
            text="X";
          }
        else
          {
            text="O";
          }
        boton.value=text;
        boton.appendChild(document.createTextNode(text));
 
    } 
    else
      {
          alert('Ya esta casilla esta ocupada');
      }

};


function actions(boton, x, y)
{
    var jugadorActual;
    if(jugadores==2)
    {
        if(boton.className=="buttons")
        {
            boton.className="clicked";
            var text;
            if(con%2==0)
            {
                text="X";
                jugadorActual=1;
            }
            else
            {
                text="O";
                jugadorActual=0;
            }
            boton.value=text;
            boton.appendChild(document.createTextNode(text));
            con++;

            tablero[x][y]=jugadorActual;
            var boton = boton.id;
        
            socket.emit('movimiento', {"tablero": {"fil": x, "col": y}, "con": con, "boton": boton, "jugador":clientId, "marca": jugadorActual});//aqui se envía
     
        } 
        else
        {
            alert('Movimiento no valido');
        }
    }
    else
      alert('Esperando por un segundo jugador!');
}


function initializeGameParams(){

        var gameCookie = getCookie("tttGameParams");

        if (gameCookie!="") {
            getGameParams(gameCookie);
            gameParams.sessId=clientId;

        }else
        {
            gameParams.userName=clientId;
            gameParams.sessId=clientId;
        }

        saveParams();
        updateDisplay();
    }

// Utiliza el id de sesion y lo refleja en el fron-end del cliente
// Aqui se pueden mostrar los demas datos de la cookie
function updateDisplay()
{
  document.getElementById("playerName").innerHTML= "Jugador: " + gameParams.sessId;

}

// Setea los datos de la cookie
function saveParams() 
{
  var cookieStr=gameParams.userName+"|"+gameParams.sessId+"|"+gameParams.wins+"|"+gameParams.losses+"|"+gameParams.stalemates;
  setCookie("tttGameParams",cookieStr,3);
}

// Obtiene los datos de la cookie

function getGameParams(cookieParams) 
{
  var parseStr = cookieParams.split("|");
  gameParams.userName=parseStr[0];
  gameParams.sessId=parseStr[1];
  gameParams.wins=parseStr[2];
  gameParams.losses=parseStr[3];
  gameParams.stalemates=parseStr[4];
}


function setCookie(cname, cvalue, exdays) 
{
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

    /**
     * Get the Cookie from the a specif cookie name.
     *
     * @param cname
     * @returns {string}
     */
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) 
  {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}

// Funcion que recolecta la informacion del jugador que hizo el movimiento, y el movimiento
// se envia la info al serve para ser evaluada
function jugarTurno(button, fila, columna) {
        console.log("Cliente que dio click: " + clientId);
        console.log(button);
        var boton = button;
        console.log(boton.id);
        console.log(boton.className);
        var className = boton.className;

        var infoJugador = {
        "jugador": clientId, 
        "tablero": {"fil": fila,"col": columna},
        "boton": {"id": boton.id,"className": className}
        };
        socket.emit('jugarTurno', {infoJugador});

}

function resultado(data1) {  
          if(data1==2)
          {
            alert('Empate');
            document.getElementById("reinicio").style.display = "block";
          }
          else if (data1.ganador.id == clientId) 
          {
            gameParams.wins++;
            alert('¡¡¡Ganaste!!');
            document.getElementById('messages').innerHTML = '<strong>¡¡Ganaste!!</strong>';
          } 
          else 
          {
              gameParams.losses++;
              document.getElementById("reinicio").style.display = "block"
              alert('¡¡¡Perdiste!!');
              document.getElementById('messages').innerHTML= 'Perdiste ;(';
          }
}

function nuevoJuego(){
  //document.getElementById("reinicio").style.display ="none";
  socket.emit('newJuego', {"bandera": true});
}

//Limpia el tablero una vez que se presione el boton de reinicio
function limpiarTabla(){

  con=0;
  document.getElementById("reinicio").style.display ="none";
  document.getElementById('messages').innerHTML= '';
  document.getElementById('b11').innerHTML= " ";
  document.getElementById('b11').className="buttons";

  document.getElementById('b12').innerHTML= " ";
  document.getElementById('b12').className="buttons";

  document.getElementById('b13').innerHTML= " ";
  document.getElementById('b13').className="buttons";

  document.getElementById('b21').innerHTML= " ";
  document.getElementById('b21').className="buttons";

  document.getElementById('b22').innerHTML= " ";
  document.getElementById('b22').className="buttons";

  document.getElementById('b23').innerHTML= " ";
  document.getElementById('b23').className="buttons";

  document.getElementById('b31').innerHTML= " ";
  document.getElementById('b31').className="buttons";

  document.getElementById('b32').innerHTML= " ";
  document.getElementById('b32').className="buttons";

  document.getElementById('b33').innerHTML= " ";
  document.getElementById('b33').className="buttons";

  alert('Se inició un nuevo juego!!');
}

