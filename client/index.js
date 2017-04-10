var socket = io.connect ('http://192.168.56.1:6677', {'forceNew': true});//se conecta en dicha direccion/puerto

var tablero = [[null, null, null], [null, null, null], [null, null, null]];

var con = 0;

var jugadores=0;

/*socket.on('messages', function(data){ //recibe lo que se emite desde el servidor
	console.log(data);
	render(data);
});*/

socket.on('tablero', function(data){ //recibe lo que se emite desde el servidor
	console.log('Tablero recibido desde el server: ' + data.tablero);
	tablero = data.tablero;
	con = data.con;
	var boton = data.boton;
	//tablero = data;
	console.log('Tablero actualizado con info del server: ' + tablero + ' boton desde el server: ' + boton);
	if(boton!= undefined)
		render(con, boton);
});

socket.on('jugador', function(data){

  jugadores = data;
  console.log(jugadores);
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

/*function render (data){

	var html = data.map(function(message, index){
		return (`
			<div class="message"> 
				<strong>${message.nickname}</strong> dice:
				<p>${message.text}</p>
			</div>

		`);


	}).join(' ');

	var div_msgs = document.getElementById('messages');
	div_msgs.innerHTML = html;
	div_msgs.scrollTop = div_msgs.scrollHeight;

};*/

/*function addMessage(e){
	var message = {
		nickname: document.getElementById('nickname').value,
		text: document.getElementById('text').value
	};

	document.getElementById('nickname').style.display = 'none';
	socket.emit('add-message', message);
	return false;
}*/


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
        //socket.emit('movimiento', {tablero, con});
        socket.emit('movimiento', {tablero, con, boton});
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