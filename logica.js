window.onload = main;
var canvas, ctx, event, img;
var index = 0; //Variable global que utilizo para el localStorage y como id de los list items.

/*
   Este es el método main que se ejecuta cuando todo está cargado.
   Carga en el canvas la imagen del mapa, le asigna el evento onclick y si hay algun dato almacenado en la caché del navedor, 
   lo carga en el mapa y en la lista de puntos.
*/
function main() {
    canvas = document.getElementById("miCanvas")
    ctx = canvas.getContext("2d")
    img = new Image(500, 600)
    img.src = "mapa.png"
    img.onload = () => {
        ctx.drawImage(img, 0, 0)
        if (localStorage.length > 0) {
            recargarDatos(true);
        }
    }
    canvas.onclick = procesarClick;
}

/*
  Este es el manejador de eventos del canvas al hacer click. Recibe el evento para saber las coordenadas del click y
  se lo asigna a la variable global "event" para poder usarlo en la función guardarPunto si el usuario quisiera guardar 
  ese punto en el mapa. Hace visible el formulario de detalles, para que el usuario pueda rellenarlo y guardar el punto.
*/
function procesarClick(evt) {
    event = evt;
    document.getElementById("detalles").setAttribute("class", "visible");
    document.getElementById("botonGuardar").setAttribute("class", "visible");
    document.getElementById("botonEliminar").setAttribute("class", "oculto");
    document.getElementById("botonGuardar").onclick = guardarPunto;
    document.getElementById("botonCancelar").onclick = () => {
        ocultarDetalles();
    };
    canvas.onclick = null;
}

/*
  Esta es la función encargada de guardar un punto. Si el nombre y la descripción no están vacías, se pinta el punto en el mapa, 
  se añade al localstorage y se inserta en la lista. Si el nombre o la descripción están vacios sale un span de error para que el 
  usuario rellene los campos o no podrá guardar el punto.
*/
function guardarPunto() {
    let nombre = document.getElementById("nombre").value;
    let descripcion = document.getElementById("descripcion").value;

    if (nombre != "" && descripcion != "") {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        pintarPunto(x, y);
        localStorage[index] = JSON.stringify({
            "nombre": nombre, 
            "descripcion": descripcion,
            "x": x,
            "y": y
        });
        annadirPuntoALaLista(index, nombre);
        index++;
        ocultarDetalles();

    } else {
        let spanError = document.getElementById("error");
        spanError.setAttribute("class", "visible");
        let botonCancelar = document.getElementById("botonCancelar");
        botonCancelar.onclick = () => {
            ocultarDetalles();
        };
    }
}

/*
  Esta es la función encargada de pintar un círculo rojo en el canvas, para situar en el mapa el punto guardado por el usuario.
*/
function pintarPunto(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2, true);
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.fillStyle = "#ff2626";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
}

/*
  Esta función simplemente es para no repetir código. Su cometido es el de ocultar la sección de detalles si no 
  se va a necesitar para guardar o mostrar un punto.
*/
function ocultarDetalles() {
    document.getElementById("detalles").setAttribute("class", "oculto");
    document.getElementById("error").setAttribute("class", "oculto");
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    canvas.onclick = procesarClick;
}

/*
  Esta función es la encargada de añadir un list item a la lista de puntos y asociarle un evento onclick que muestre 
  en la sección de detalles los detalles del punto clickeado.
*/
function annadirPuntoALaLista(id, nombre) {
    let lista = document.getElementById("listaPuntos");
    let li = document.createElement("li");
    li.setAttribute("id", id);
    li.innerHTML = nombre;
    li.onclick = mostrarPunto;
    lista.appendChild(li);
}

/*
  Esta función es la encargada de mostrar en la sección de detalles, los detalles del punto clickeado. 
  Oculta el botón de guardar (pues sólo queremos visualizar el punto), y muestra un botón de eliminar por 
  si el usuario quiere borrar el punto seleccionado.
*/
function mostrarPunto() {
    document.getElementById("detalles").setAttribute("class", "visible");
    let id = this.getAttribute("id");
    let obj = JSON.parse(localStorage[id]);
    let botonEliminar = document.getElementById("botonEliminar");
    document.getElementById("nombre").value = obj.nombre;
    document.getElementById("descripcion").value = obj.descripcion;
    document.getElementById("botonGuardar").setAttribute("class", "oculto");
    botonEliminar.setAttribute("class", "visible");

    botonEliminar.setAttribute("name", id);
    botonEliminar.onclick = eliminarPunto;
    canvas.onclick = null;
}

/*
  Esta función es la encargada de borrar un punto. Mi forma de trabajar ha sido borrar el punto del localstorage, vaciar 
  el canvas, y llamar a la función recargarDatos que pinta el canvas con los puntos guardados en el localstorage y, por lo tanto, ya no 
  pintaría este punto eliminado y daría la sensación de que ha desaparecido.
*/
function eliminarPunto() {
    let id = this.getAttribute("name");
    localStorage.removeItem(id);
    ocultarDetalles();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    recargarDatos();
}

/*
  Esta función recorre el localStorage para pintar cada punto almacenado en el canvas y añadirlo a la lista de puntos.
  Al no ser iterable, no pude hacer un bucle foreach, por lo que recorrí las keys del localStorage y comprobaba si en esa key 
  había un punto guardado. Si lo había, lo pintaba y añadía en la lista y sumaba uno a un contador local, que me sirve para no dar 
  más vueltas innecesarias al localStorage y ahorrar algo de memoria (bastante insignificante en este programa porque no hay apenas datos).
*/
function mostrarPuntosAlmacenados() {
    let cont = 0;
    for (let key in localStorage) {
        if (localStorage.getItem(key) != null) {
            let obj = JSON.parse(localStorage.getItem(key));
            pintarPunto(obj.x, obj.y);
            annadirPuntoALaLista(key, obj.nombre);
        }
        cont++;
        if (cont == localStorage.length) {
            break;
        }
    }
}

/*
  Esta función es la encargada de recargar el canvas con los puntos almacenados en el localStorage. Puede recibir un parametro,  
  el cual me indica si es el inicio del programa o no. Si lo es, primero compruebo el índice mayor del localStorage, para sumarle uno 
  a mi variable global index y así al guardar nuevos datos en la aplicación, no sobreescribir ningún punto almacenado en la caché.
  
  Si ese parametro no me llega, significa que el programa no acaba de iniciar y simplemente el usuario ha eliminado un punto. Por 
  lo que vacío la lista de puntos (el canvas no porque ya lo hago en la función eliminarPunto) y recargo los datos del localStorage.
*/
function recargarDatos(inicioDePrograma = false) {
    if (!inicioDePrograma) {
        document.getElementById("listaPuntos").innerHTML = "";
        ctx.drawImage(img, 0, 0);
        mostrarPuntosAlmacenados();
    } else {
        let mayor = 0;
        let cont = 0;
        for (let key in localStorage) {
            if (localStorage.getItem(key) != null) {
                if (key > mayor) {
                    mayor = key;
                }
            }
            cont++;
            if (cont == localStorage.length) {
                break;
            }
        }
        index = mayor;
        index++;
        mostrarPuntosAlmacenados();
        document.getElementById("botonCancelar").onclick = () => {
            ocultarDetalles();
        };
    }
}