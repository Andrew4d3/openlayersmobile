//Controlador que organiza y maneja los eventos de la lista de alertas
var ordenarAlertas = function (alertas){
    
    //Numero total de alertas, se decrementara a medida que se eliminen
    var total_alertas = alertas.length;
    //Empezamos a crear el HTML que mostrara las alertas
    stream ="<h3>Tienes <span id='total-alertas'>"+total_alertas+"</span> alerta(s)</h3>\n";

    //console.log(stream);
    
    //Iteramos sobre el arreglo de alertas que viene del modelo
    for(i=alertas.length-1; i>=0; i--){
        item = alertas[i];
        stream += '<div class="alerta" id="alerta-'+i+'" data-role="collapsible" >\n';
        stream += '<h3>Enviado por: '+item.supervisor+' el '+item.fecha+'</h3>\n';
        stream += '<p>'+item.mensaje+'</p>\n';
        stream += '<a class="borra" href="#alerta-'+i+'" data-role="button" data-icon="delete" data-mini="true" data-inline="true">Borrar Alerta</a>';
        stream += '</div>\n';
        console.log(stream);
    }

    //Lo integramos con el HTML
    $('#lista-alertas').html(stream);
    //Reiniciamos los formatos de jquery mobile
    $( "#lista-alertas" ).collapsibleset( "refresh" );
    $('.alerta a').button();

    //Manejamos el evento "expandir" que indica que una alerta ya fue vista por el usuario
    $('.alerta').bind('expand',function(e){
        posicion = $(this).attr("id").split("-")[1];

        if(alertas[posicion].visto==1){
            return;
        }
        else{

            alertas[posicion].visto=1;
            alertas[posicion].actualizar();
            //console.log("actualizado");
            return;
        }


    });

    //Manejamos el evento del boton "borrar alerta" que borra el registo de la alerta determinada
    $('.borra').click(function(){
       
        nodo = $(this).attr('href');
        posicion = nodo.split("-")[1];


        alertas[posicion].borrar();

        //Aqui decrementamos el numero de alertas totales en 1 y lo indicamos en el mensaje que esta en la parte superior
        total_alertas--;
        $('#total-alertas').html(total_alertas);
        
        //Aqui retiramos el contenedor de la alerta del HTML (la vista)
        console.log("borrado");
        $($(this).attr('href')).fadeOut(function(){
            $($(this).attr('href')).remove();
        });
    });



}

// Funcion que obtiene las coordenadas de longitud y latitud de la aplicacion movil asi como la fecha

function nuevoSitio(){
     
     //Ocultamos el footer para que no se pueda realizar ninguna opcion en sus botones mientras no se encuentren los datos requeridos
    $('#nuevo_sitio div[data-role="footer"]').hide();

    //Esta funcion callback se ejecutara si la aplicacion movil pudo obtener los datos de geolocalizacion (latitud, longitud, etc...)
    var onSuccess = function(position) {
        //Se le notifica al usuario que los datos fueron obtenidos con exito
        alert("Posicion obtenida con exito");
        //Se guardan los datos en variables globales de alcance dentro de la funcion
        var latitud = position.coords.latitude;
        var longitud = position.coords.longitude;
        var presicion = position.coords.accuracy;
        var o_fecha = new Date(position.timestamp );
        var fecha = formatearFecha(o_fecha); //Formateamos la fecha y hora en el formato deseado

        
        
        //Se construye la informacion la informacion a mostrar al usuario para que este tenga idea de los datos que se van a guardar, asi como la precision de los mismos
        stream = "<p><strong>Latitud:</strong> "+latitud+"<br />\n";
        stream += "<strong>Longitud:</strong> "+longitud+"<br />\n";
        stream += "<strong>Precisión:</strong> "+presicion+" metros<br />\n";
        stream += "<strong>Fecha y Hora:</strong> "+fecha+"</p>\n";
        //Se carga una imagen que mostrara un minimapa de google con la posicion especifica, si no hay acceso a la red, la imagen no se mostrara.
        mini_mapa = "http://maps.google.com/maps/api/staticmap?center="+latitud+","+longitud+"&"+"&zoom=16&markers=size:small|"+latitud+","+longitud+"&maptype=hybrid&size=200x200&sensor=false";
        //Se agrega el html del stream a imprimir
        stream +="<div style='text-align:center;'><img src='"+mini_mapa+"' /></div>";

        //Se imprime el stream en el HTML
        $('#datos-coordenadas').html(stream);
        //Se muestra el footer con los botones de accion que ahora si podra usar el usuario
        $('#nuevo_sitio div[data-role="footer"]').show();
        
        //Se crea el evento de "Continuar" el cual translada al usuario al formulario de creacion de sitio
        $('#nuevo_sitio .continuar').click(function(e){
            //Se desactuvan los eventos pertinentes para evitar problemas de propagacion y no consistencia de datos
            $('#nuevo_sitio .continuar').unbind('click');
            $('#nuevo_sitio .actualizar').unbind('click');
            $('#nuevo_sitio .regresar').unbind('click');
            //Se llama a la funcion que administrara la creacion del Sitio en la BD local
            crearSitio(latitud, longitud, fecha,sessionStorage.getItem('user-id'),ordenarAlertas);
        });

    }

    //Si por alguna razon no se pudieron obtener los datos de la ubicacion se ejecutara esta funcion callback
    function onError(error) {

        //Se construye el mensaje con su error correspondiente
        stream = "<p style='color:red;'>No se ha podido obtener su ubicacion actual. Intentelo mas tarde.<br />\n";
        stream += "ERROR: "+error.message+"</p>";
        //Se imprime el mensaje en el HTML
        $('#datos-coordenadas').html(stream);
        //Se oculta el footer para que el usuario no pueda ejecutar ninguna accion de crear sitios en sus botones
        $('#nuevo_sitio div[data-role="footer"]').hide();

        return;

    }
    //Aqui se hace la llamada para obtner los datos de geolocalizacion, se le pasa como argumenta las funciones callback de exito y fallo explicadas anteriormente.
    //Esta accion es la que se ejecuta despues de ocultar el footer
    navigator.geolocation.getCurrentPosition(onSuccess, onError)

    //Si se da al boton regresar, se regresa a la pantalla de inicio y se ejecuta esta funcion
    $('#nuevo_sitio .regresar').click(function(){
        
        //se desactiva los eventos necesarios para evitar propagacion y falta de consistencia de datos
        $('#nuevo_sitio .continuar').unbind('click');
        $('#nuevo_sitio .actualizar').unbind('click');
        $('#nuevo_sitio .regresar').unbind('click');
        
        //Se limpia el HTML
        $('#datos-coordenadas').html("");
        $('#nuevo_sitio div[data-role="footer"]').hide(); //Se desactiva el footer
    });

    //Esta funcion se ejecuta cuando el usuario le da al boton actualizar, el cual refresca los datos de geolocalizaciona  los mas actuales
    $('#nuevo_sitio .actualizar').click(function(){
        
        //Se desactuva el evento de continuar, ya que este sera iniciado nuevamente en la funcion de exito de la llamada a geolocalizacion, y asi se evita la propagacion innecesaria
        $('#nuevo_sitio .continuar').unbind('click');
        //Se hace la misma llamada de geolocalizacion con sus respectivas funciones callback de fallo y exito
        navigator.geolocation.getCurrentPosition(onSuccess, onError);

    });
                    
                   
                    
  
}

//Funcion que se ejecutara cuando el usuario este en la pantalla del formulario de crear sitio. La cual recibe los datos de geolocalizacion que el usuario confirmo en la pantalla anterior
function crearSitio(latitud,longitud,fecha,usuario_id){
    
    //Se inicializa el objeto que manipula la creacion y enlistado de categorias en el formulario
    var categorias = new Categorias();
    //Se listan las categorias asociadas al usuario en sesion 
    categorias.listar(usuario_id, listarCategorias);
    
    //Funcion callback que imprime las categorias en el fornulario
    function listarCategorias(categorias){
        
        //Se reinicia el select
        $('#opciones-categorias').html("");
        //Se coloca la opcion por defecto (Sin categoria)
        $('#opciones-categorias').append('<option value="null">(Sin Categoría)</option>');
        //Se concatenan las categorias obtenidas de la funcion listar (en el modelo)
        for(i=0; i<categorias.length; i++){
            $('#opciones-categorias').append('<option value="'+categorias[i].id+'">'+categorias[i].nombre+'</option>');
        }
        //Se agrega la otra opcion por defecto. (La de crear nueva categoria)
        $('#opciones-categorias').append('<option value="new">Otra (Crear categoría)</option>   ');
        //Se refresca el menu de jquery mobile
        $('#opciones-categorias').selectmenu('refresh',true);
    }
     
     //Evento que se ejecuta cuando se cambia una opcion en el seleccionador de categorias
    $('#opciones-categorias').change(function(){
        //Si la categoria seleccionada tiene como valor "new" se abre el popup con el formulario de creacion de categoria
        op = $('#opciones-categorias option:selected').val();
        if(op==="new"){
            
            $('#nueva_categoria').popup();
            $('#nueva_categoria').popup("open");
            
        }        
    });
    
    //Esta evento se ejecuta luego que el popup de creacion de categorias se cierra
    $('#nueva_categoria').bind('popupafterclose',function(e){
            e.stopImmediatePropagation();//evitamos propagacion
            //Reiniciamos el seleccionador de categorias, con la categoria que se pudo haber creado o no
            categorias.listar(usuario_id, listarCategorias);

    });
    
    //Esta accion se ejecuta al hacer submit en el formulario de creacion de categorias (popup)
    $('#nueva_categoria form').submit(function(e){
        e.stopImmediatePropagation(); //evitamos propagacion
        //Guardamos los datos del formulario en variables. No es necesario validar su existencia o tamaña, ya que el codigo html se encarga de ello (atributos required y maxlength)
        nombre=$('#nombre_cat').val();
        descripcion=$('#descripcion_cat').val();
        //Creamos la categoria en la Base de datos. La variable de sincronizado esta en 0 (de falso) y la de servidor_id en null ya que todavia no se ha sincronizado con el servidor
        categorias.crear(usuario_id, nombre, descripcion, 0, null);
        
        //Cerramos el popup e indicamos el mensaje de categoria creada con exito al usuario
        $('#nueva_categoria').popup();
        $('#nueva_categoria').popup("close");
        alert("Categoria Creada con exito");
        return false; 
    });
    
    //Este evento se ejecuta al hacer submit al formulario principal de creacion de sitio
    $('#sitio_form').submit(function(){
        
        //Desacactivamos los eventos necesarios para evitar la propagacion e inconsistencia de datos
        $('#sitio_form').unbind('submit');
        $('#crear_sitio .regresar').unbind('click');
        // Guardamos las entradas en el formulario para ser enviadas como atributos al modelo. 
        // No es necesario validar su existencia o tamaña, ya que el codigo html se encarga de ello (atributos required y maxlength)
        nombre=$('#nombre').val();
        $('#nombre').val('');
        descripcion=$('#descripcion').val();
        $('#descripcion').val('');
        id_categoria = $('#opciones-categorias option:selected').val();

        //Creamos el sitio en la BD. La variable de sincronizado esta en 0 (de falso) y la de servidor_id en null ya que todavia no se ha sincronizado con el servidor
        sitios = new Sitios();
        sitios.crear(usuario_id, latitud, longitud, fecha, nombre, descripcion, null, id_categoria, 0, null);
        //Notificamos al usuario del exito de la creacion del nuevo sitio
        alert("Sitio creado con exito");
        
        //Cambiamos a la pagina de inicio
        $.mobile.changePage($('#home'));
        
        
        return false;
    });

    //Este evento se ejecuta al darle al boton "Cancelar" dentro del formulario de creacion de sitios
    $('#crear_sitio .regresar').click(function(){
        //Desacactivamos los eventos necesarios para evitar la propagacion e inconsistencia de datos
        $('#sitio_form').unbind('submit');
        $('#crear_sitio .regresar').unbind('click');
    });



}