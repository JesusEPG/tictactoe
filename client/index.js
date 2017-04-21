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


/*socket.on('messages', function(data){ //recibe lo que se emite desde el servidor
  console.log(data);
  render(data);
});*/

socket.on('connect', function () {
      clientId = socket.io.engine.id;
      initializeGameParams();
      console.log("ID Assigned - " + clientId);

});


//funcion intermedia para actualizar los tableros oponentes
socket.on('tablero', function(data){ //recibe lo que se emite desde el servidor
  
  con = data.con;
  var boton = data.boton;
  if(boton!= undefined)//para evitar errores del primer envío de datos al conectarse
    render(con, boton);
});

socket.on('jugador', function(data){

  jugadores = data;
  console.log(jugadores);
});

socket.on('recarga', function(data){

  tablero = data;
  console.log("Tablero despues de la recarga: ")
  console.log(tablero);
});

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
                //  alert(boton.name);
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
                //alert(boton.value);
                boton.appendChild(document.createTextNode(text));
                con++;

                //tablero[x][y]=jugadorActual;
                var boton = data.boton.id;
            
                socket.emit('movimiento', {"con": con, "boton": boton, "jugador":clientId, "marca": jugadorActual});//aqui se envía

                //socket.emit('movimiento', tablero);
         
            } 
        }
        else
        {
            //alert("Yei!!!");
            alert('Movimiento no valido');
        }
    }
    else
      alert('Esperando por un segundo jugador!');

  
});

function render (cont, data){

  boton = document.getElementById(data);
  console.log('Boton en render: ' + data);
  if(boton.className=="buttons")
    {
      //  alert(boton.name);
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
        //alert(boton.value);
        boton.appendChild(document.createTextNode(text));
 
    } 
    else
      {
          //alert("Yei!!!");
          //alert(boton.value);
      }

};


function actions(boton, x, y)
{
    console.log(x);
    //console.log(boton);
    console.log(boton.id);
    console.log(y);
    var jugadorActual;
    if(jugadores==2)
    {
        if(boton.className=="buttons")
        {
            //  alert(boton.name);
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
            //alert(boton.value);
            boton.appendChild(document.createTextNode(text));
            con++;

            tablero[x][y]=jugadorActual;
            var boton = boton.id;
        
            socket.emit('movimiento', {"tablero": {"fil": x, "col": y}, "con": con, "boton": boton, "jugador":clientId, "marca": jugadorActual});//aqui se envía

            //socket.emit('movimiento', tablero);
     
        } 
        else
        {
            //alert("Yei!!!");
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

/**
     * Update Display with Player info.
     *
     */
function updateDisplay()
{
  //$("#playerName").empty().append("Player: " + gameParams.userName);
  console.log(gameParams.userName);
  document.getElementById("playerName").innerHTML= "Jugador: " + gameParams.sessId;
  //$("#wins").empty().append(gameParams.wins);
  //$("#losses").empty().append(gameParams.losses);
  //$("#ties").empty().append(gameParams.stalemates);

}


/**
     * Save Params to cookie.
     *
     */

function saveParams() 
{
  var cookieStr=gameParams.userName+"|"+gameParams.sessId+"|"+gameParams.wins+"|"+gameParams.losses+"|"+gameParams.stalemates;
  setCookie("tttGameParams",cookieStr,3);
}

/**
     * Get the Game Params from the Cookie.
     *
     * @param cookieParams
     */

function getGameParams(cookieParams) 
{
  var parseStr = cookieParams.split("|");
  gameParams.userName=parseStr[0];
  gameParams.sessId=parseStr[1];
  gameParams.wins=parseStr[2];
  gameParams.losses=parseStr[3];
  gameParams.stalemates=parseStr[4];
}


    /**
     * Set the Cookie.
     *
     * @param cname
     * @param cvalue
     * @param exdays
     */

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

/**
     *
     * Intermediate function for pass thru...
     *
     * @param row
     * @param quad
     * @returns {Function}
     
    function playSetup(row, quad) {
        // alert(selection);
        return function () {
            playTurn(row, quad);
        }
    }*/

/**
     * Play client turn and update the row.
     *
     * @param row
     * @param quad
     */
    function jugarTurno(button, fila, columna) {
        console.log("Cliente que dio click: " + clientId);
        console.log(button);
        var boton = button;
        console.log(boton.id);
        console.log(boton.className);
        var className = boton.className;
        //var infoJugador = {"jugador": clientId, "tablero": {"fil": fila, "col": columna}, "boton": boton};
        var infoJugador = {"jugador": clientId, "tablero": {"fil": fila, "col": columna}, "boton": {"id": boton.id, "className": className}};
        //$("#row" + row + "_" + quad).toggleClass("selecting");
        socket.emit('jugarTurno', {infoJugador});

    }