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
    
    $('#crear_sitio div h1').html('Nuevo Sitio');
    $('#sitio_form input[type="submit"]').val("Crear Sitio").button();
    $('#sitio_form input[type="submit"]').val("Crear Sitio").button('refresh');
    
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

//Funcion que lista los sitios organizados por categorias
function listarSitios(){
    //Obtenemos el id del usuario en sesion
    var usuario_id = sessionStorage.getItem('user-id');
    //Instaciamos un objeto categorias que listara la categorias en la pagina
    categorias = new Categorias();
    //Hacemos la llamado al metodo listar y le pasamos la funcion callback
    categorias.listar(usuario_id, listarCat);
    //Aqui esta la funcion callback
    function listarCat(categorias){
        //Instanciamos un objeto de sitios que listara los sitios en las categorias
        var s = new Sitios();
        //Aqui listamos los sitios SIN CATEGORIA, por eso se le pasa el atributo "is NULL"
        s.listarC(usuario_id, "is NULL", function(sitios){
            //Solo agregamos los sitios si hay existentes
            if(sitios.length>0){
                //Agregamos el contenedor donde estaran los sitios. El cual tendra como titulo (Sin categoria)
                $('#lista-sitios').append('<div id="cat-null" data-role="collapsible"><h3>(Sin Categoría)</h3></div>');
                //Concatenamos el HTML de lista <ul>
                $('#cat-null').append('<ul data-role="listview"></ul>');
                //Empesamos a iterar sobre el arreglo de sitios
                for(j=0;j<sitios.length;j++){
                    //Este es el id del contenedor de los sitios sin categorias (Agregado atras)
                    id_cat = "cat-null";
                    //Empesamos a construir el HTML con los datos del arreglo de sitios (es un arreglo de objetos "sitio", ver modelo para mas informacion)
                    stream = '<li class="sitio" id="sitio-'+sitios[j].id+'" ><a href="#">\n';
                    stream += '<img src="img/no-image.png" />\n';
                    stream += '<h3>'+sitios[j].nombre+'</h3>\n';
                    stream += '<p>'+sitios[j].descripcion+'</p>\n';
                    stream += '</a></li>\n'
                    //Concatenamos el stream que estamos construllendo en el DOM del documento
                    $('#'+id_cat+' ul').append(stream);
                    //reiniciamos la lista jQuery Mobile para que formatee correctamente
                    $('#'+id_cat+' ul').listview();
                    $('#'+id_cat+' ul').listview("refresh");
               
                }
                //Reiniciamos el contenedor de la categoria de jQuery Mobile para que formatee correctamente            
                $('#lista-sitios').collapsibleset( "refresh" );
                
                
            }
        })
        

        //Aqui vamos a listar los sitios CON CATEGORIA. Primeramente iterando sobre el arreglo de Categorias
        for (i=0;i<categorias.length;i++){
            //Aqui creamos una funcion Anomima para que la funcion Callback de listar sitios mantenga el contador del ciclo For
            (function(i){
               //Hacemos el mismo proceso anteriormente solamente que ahora se listara los sitios de la categoria correspondiente en el arreglo (dada por la posicion i)
               s.listarC(usuario_id, "="+categorias[i].id, function(sitios){
                  //Igual que en los sitios SIN CATEGORIAS, solo se agregaran las categorias que tengan sitios
                  if(sitios.length>0){
                        //Aqui se construye el id que estara en el HTML, dado por cat- + (el id de la categoria) por ejemplo cat-1, cat-2 cat-3 
                        id_cat = "cat-"+categorias[i].id;
                        //Simplemente el nombre de la categoria
                        nombre_cat = categorias[i].nombre;
                        //Concatenamos el contenedor de la categoria correspondiente y tambien su respectivo nombre
                        $('#lista-sitios').append('<div id="'+id_cat+'" data-role="collapsible"><h3>Categoria: '+nombre_cat+'</h3></div>');
                        //Concatenamos el contenedor de lista que tendra los sitios de la respectiva categoria
                        $('#'+id_cat).append('<ul data-role="listview"></ul>'); 
                        //Empezamos a iterar sobre los sitios de la respectiva categoria
                        for(j=0;j<sitios.length;j++){
                            //aqui construimos el id que estara en el html
                            id_cat = "cat-"+sitios[j].id_categoria;
                            //Empezamos a constrior el HTML a agregar con los datos del arreglo de sitios
                            stream = '<li class="sitio" id="sitio-'+sitios[j].id+'" ><a href="#">\n';
                            stream += '<img src="img/no-image.png" />\n';
                            stream += '<h3>'+sitios[j].nombre+'</h3>\n';
                            stream += '<p>'+sitios[j].descripcion+'</p>\n';
                            stream += '</a></li>\n'
                            //Concatenamos el HTML construido al DOM del documento
                            $('#'+id_cat+' ul').append(stream);
                            //refrescamos los elementos de jQuery Mobile
                            $('#'+id_cat+' ul').listview();
                            $('#'+id_cat+' ul').listview("refresh");

                        }
                        //Refrescamos el elemento jQuerymobile que lista los contenedores de las categorias
                        $('#lista-sitios').collapsibleset( "refresh" );
                   
              
                    }
               });
            })(i);//Este es el parametro de la funcion anonima (el contador del for). Esto se hace para evitar los problemas de sincronizacion con las funciones asincronas de js
           
        }
      
    }//Fin de listarCat
    
    
    //Evento para regresar a la pantalla inicial (home)
    $('#sitios .regresar').click(function(e){
        e.stopImmediatePropagation();//Se evita la propagacion
        $('#lista-sitios').html("");//Se reinicia el HTML de los sitios
        
    });

    //Evento que se dispara al hacer click en un sitio
    $('.sitio').live('click', function(e) {
        e.preventDefault(); //evitamos el comportamiento normal
        e.stopImmediatePropagation(); //evitamos propagacion bla bla bla
        //obtenemos el id del sitio del html
        id_sitio = $(this).attr('id').split("-")[1];
        //creamos el objetos sitios que nos permitira obtener el objeto del sitio que queremos
        s = new Sitios();
        //obtenemos el objeto y llamaremos a la funcion callback de llamar sitios que lo tratara
        s.consultar(id_sitio, cargarSitio);
        //Aqui creamos una variable de sesion que nos permitira saber cual es la pantalla que enlazara el boton "regresar".
        //Esto debido a que la pantalla de perfil sitio se espera ser usada en mas de una ocasion
        sessionStorage.setItem('back_perfil-sitio',"sitios");
        //Cambiamos a la pantalla de perfil sitio
        $.mobile.changePage($('#perfil-sitio'));
        
        
    });  
    
    
    
}


//Esta es la funcion (callback) que carga el sitio en la pantalla "perfil-sitio". Recibe el objeto del sitio a cargar y realiza varias operacion con el DOM de esta pantalla
function cargarSitio(sitio){
    //Cargamos los distintos datos del objeto en los contenedores del html
    $('#sitio-nombre').html(sitio.nombre);
    $('#sitio-latitud').html(sitio.latitud);
    $('#sitio-longitud').html(sitio.longitud);
    $('#sitio-fecha').html(sitio.fecha);
    //Si descripcion es null se asigna el string "Sin descripcion"
    if(sitio.descripcion==""){
        $('#sitio-descripcion').html("Sin descripción");
    }
    else{
         $('#sitio-descripcion').html(sitio.descripcion);
    }
    //Si no tiene fotografia se asigna la fotografia por defecto de "no-image"
    if(sitio.url_imagen=="null"){
        $('#sitio-imagen').html('<img src="img/no-image.png" />');
    }
    else{
         //Pendiente
    }
    //Cargamos la URL del minimapa de google con los datos de latitud y longitud del sitio
    mini_mapa = "http://maps.google.com/maps/api/staticmap?center="+sitio.latitud+","+sitio.longitud+"&"+"&zoom=16&markers=size:small|"+sitio.latitud+","+sitio.longitud+"&maptype=hybrid&size=200x200&sensor=false";
    //La cargamos en el HTML
    $('#sitio-mapa').html("<img src='"+mini_mapa+"' />");
    
    //Si la categoria NO ES NULL. Es decir SI TIENE CATEGORIA, cargamos el nombre de la categoria y su descripcion el el HTML
    if(sitio.id_categoria!=null){
        c = new Categorias(); //Creamos el objeto que consultara la determinada categoria del sitio
        c.consultar(sitio.id_categoria, function(categoria){ //Llamamos al metodo "consultar de ese objeto" que retornara el objeto de esa categoria
            stream=categoria.nombre; //Construimos la informacion de la categoria usando el objeto
            if(categoria.descripcion!=""){ //Si la categoria TIENE DESCRIPCION la agregamos al stream que se esta construyendo
                stream+=": "+categoria.descripcion; 
            }
            $('#sitio-categoria').html(stream); //Lo agregamos al HTML
        });       
    }
    else{
        $('#sitio-categoria').html("(Sin Categoria)"); //Si es null Simplemente se indica en el HTML que no hay Categoria
    }
    
    //Evento del boton regresar
    $('#perfil-sitio .regresar').click(function(e){
        //Evitamos propagacion y evitamos el comportamiento por defento del boton
        e.stopImmediatePropagation();
        e.preventDefault();
        //Desactivamos los eventos de los botones de borrar y editar para que se evite su propagacion
        $('#perfil-sitio .borrar').unbind('click');
        $('#perfil-sitio .editar').unbind('click');        
        //Obtenemos la pagina a regresar la cual se encuentra en la respectiva variable de sesion
        back_page = "#"+sessionStorage.getItem('back_perfil-sitio');
        //Cambiamos a esa pagina
        $.mobile.changePage($(back_page));
        //Reiniciamos el HTML de listar sitios y llamamos a la funcion que los cargara de nuevo.
        //Esto se hace debido a que el sitio pudo ser modificado y es necesario que esos datos sean reflejados en la pantalla de lista de sitios
        $('#lista-sitios').html("");
        listarSitios();
    
    });
    
    //Evento que borrara el sitio actual
    $('#perfil-sitio .borrar').click(function(e){
        //Evitamos el comportamiento por defecto
        e.preventDefault();
        //Le preguntamos al usuario si de verdad desea borrarlo y asi evitar accidentes
        borrar = confirm("¿Desea Borrar este sitio?");
        //Si el usuario si quiere borrarlo...
        if(borrar){
            //...llamamos al metodo de borrar del sitio en cuestion
            sitio.borrar();      
            //Desactivamos los eventos de borrar y editar para evitar propagaciones
            $('#perfil-sitio .borrar').unbind('click');
            $('#perfil-sitio .editar').unbind('click');
            //Obtenemos la pagina a regresar la cual se encuentra en la respectiva variable de sesion y cambiamos a esa pagina
            back_page = "#"+sessionStorage.getItem('back_perfil-sitio');
            $.mobile.changePage($(back_page));
            //aqui lo mismo que en el evento anterior (El de regresar)
            $('#lista-sitios').html("");
            listarSitios();
     
        }
     
    });
    
    //El evento que se disparara al darle al boton de editar
     $('#perfil-sitio .editar').click(function(e){
         //Desactivamos los eventos de borrar y editar para evitar propagaciones
        $('#perfil-sitio .borrar').unbind('click');
        $('#perfil-sitio .editar').unbind('click');
        //Se creara una variable de sesion que albergara la direccion de la pagina actual "perfil-sitio". Para que desde la pantalla de crear_sitio se puede regresar a la actual.
        //Esto debido a que se reutilizara la pantalla de crear-sitio (aunqu con otra funcion tratante) para editar el sitio en cuestion
        sessionStorage.setItem('back_crear-sitio',"perfil-sitio");
        //Cambiamos a la pantalla de crear_sitio
        $.mobile.changePage($('#crear_sitio'));
        //Llamamos a la funcion editarSitio que tratara la pantalla de crear sitio de forma diferente
        editarSitio(sitio);
       
       return false;
        
    });
    
    
    
}


//Funcion que se ejecutara cuando se de al boton de modificar sitio en la pantalla de perfil de sitio. Se reutilizara la pantalla de crear sitio
function editarSitio(sitio){
    
    //Se inicializa el objeto que manipula la creacion y enlistado de categorias en el formulario
    var categorias = new Categorias();
    //Se listan las categorias asociadas al usuario en sesion
    var usuario_id = sitio.id_usuario;
    //Cambiamos el titulo de la pantalla de crear-sitio de "Nuevo Sitio" a "Editar sitios"
    $('#crear_sitio div h1').html('Editar Sitio');
    // Asignamos el valor del campo de texto al valor actual que tiene el sitio a modificar. Lo mismo con descripcion
    $('#nombre').val(sitio.nombre);
    $('#descripcion').val(sitio.descripcion);
    //Cambiamos el nombre del boton de submit de "Crear Sitio" a "Guardar Cambios" y refrescamos el objeto jQuery Mobile
    $('#sitio_form input[type="submit"]').val("Guardar Cambios").button('refresh');
    
    //Listamos las categorias del select asi como haciamos en la funcion crearSitio pero ahora con unas diferencias
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
        
        //Aqui esta la diferencia; se coloca como seleccionada la categoria actual del sitio
        $("#opciones-categorias option[value="+sitio.id_categoria+"]").attr("selected",true);
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
    
   
    
    //Este evento se ejecuta al hacer submit al formulario principal de edicion de sitio
    $('#sitio_form').submit(function(){
        
        //Desacactivamos los eventos necesarios para evitar la propagacion e inconsistencia de datos
        $('#sitio_form').unbind('submit');
        $('#crear_sitio .regresar').unbind('click');
        // Asignamos las entradas al formulario a los atributos del objeto sitio
        // No es necesario validar su existencia o tamaño, ya que el codigo html se encarga de ello (atributos required y maxlength)
        sitio.nombre=$('#nombre').val();
        $('#nombre').val('');//Reiniciamos los valores de los formularios
        sitio.descripcion=$('#descripcion').val();
        $('#descripcion').val('');//Reiniciamos los valores de los formularios
        //Si el valor de la opcion seleccionada es "null" al sitio al id de la categoria se le asigna null
        //Esto se hace debido a que en HTML no es posible establecer valores null en los campos de los formularios. Solo strings y para JS cadena vacia ("") no es lo mismo que NULL
        if($('#opciones-categorias option:selected').val()=="null"){
            sitio.id_categoria = null;
        }
        else{
            sitio.id_categoria = $('#opciones-categorias option:selected').val();
        }
        
        //Llamamos al metodo actualizar del objeto sitio. Que actualizara los atributos actuales de este objeto a la BD local
        sitio.actualizar();

        //Notificamos al usuario del exito de la modificacion del nuevo sitio
        alert("Sitio guardado con exito");
        
        //Cambiamos a la pagina de perfil de sitio
        $.mobile.changePage($('#perfil-sitio'));
        //Llamamos a la funcion cargar sitio, que actualizara la pantalla perfil-sitio con los datos ya modificados y volvera a activar los eventos necesarios de esa pantalla
        cargarSitio(sitio);
        
        return false;
    });
    
   
    //Este evento se ejecuta al darle al boton "Cancelar" dentro del formulario de edicion de sitios
    $('#crear_sitio .regresar').click(function(){
        
        //Desacactivamos los eventos necesarios para evitar la propagacion e inconsistencia de datos
        $('#sitio_form').unbind('submit');
        $('#crear_sitio .regresar').unbind('click');
        
        $.mobile.changePage($('#perfil-sitio'));
        //Llamamos a la funcion cargar sitio que volvera a activar los eventos necesarios de esa pantalla
        cargarSitio(sitio);
        
        return false;
        
    });



}

//Funcion para cargar la lista de Checkpoints en la pantalla de Checkpoints
function listarCheckpoints(){
    //Inicialisamos la clase
    c = new Checkpoints();
    //Obtenemos el Id de usuario
    id_usuario = sessionStorage.getItem('user-id');
    //Llamamos al modelo para obtener los checkpoints asociados al usuario
    c.listar(id_usuario, function(checkpoints){
        //Si hay checkpoints iteramos sobre el arreglo
        if(checkpoints.length>0){
            for(j=0;j<checkpoints.length;j++){
                //Empezamos a construir el HTML a agregar con los datos del arreglo de checkpoints
                stream = '<li class="checkpoint" id="checkpoint-'+checkpoints[j].id+'" ><a href="#">\n';
                stream += '<img src="img/no-image.png" />\n';
                stream += '<h3>'+checkpoints[j].nombre+'</h3>\n';
                stream += '<p>'+checkpoints[j].descripcion+'</p>\n';
                stream += '</a></li>\n'
                //Concatenamos el HTML construido al DOM del documento
                $('#lista-checkpoints').append(stream);
                //refrescamos los elementos de jQuery Mobile
                $('#lista-checkpoints').listview();
                $('#lista-checkpoints').listview("refresh");

            }
            
        }
        else{
            //Si no hay checkpoints lo escribimos en el HTML del documento
            $('#lista-checkpoints').html("No hay checkpoints disponibles");
        }
    });
    
    //Evento al presionar el boton de regresar
     $('#checkpoints .regresar').click(function(e){
        e.stopImmediatePropagation();//Se evita la propagacion
        $('#lista-checkpoints').html("");//Se reinicia el HTML de la lista de checkpoints
        
    });
    
    //Evento que se dispara al hacer click en un checkpoint
    $('.checkpoint').live('click', function(e) {
        e.preventDefault(); //evitamos el comportamiento normal
        e.stopImmediatePropagation(); //evitamos propagacion bla bla bla
        //obtenemos el id del checkpoint del html
        id_checkpoint = $(this).attr('id').split("-")[1];
        //creamos el objetos checkpoints que nos permitira obtener el objeto del checkpoint que queremos recuperar de la BD
        s = new Checkpoints();
        //obtenemos el objeto checkpoint y llamaremos a la funcion callback para cargar el checkpoint en la siguiente pantalla
        s.consultar(id_checkpoint, cargarCheckpoint);
        //Aqui creamos una variable de sesion que nos permitira saber cual es la pantalla que enlazara el boton "regresar".
        //Esto debido a que la pantalla de perfil de checkpoint se usara en mas de una ocasion
        sessionStorage.setItem('back_perfil-checkpoint',"checkpoints");
        //Cambiamos a la pantalla de perfil del checkpoint
        $.mobile.changePage($('#perfil-checkpoint'));
    });  
    
    
    
}

//Funcion que carga el checkpoint en la pantalla de perfil de checkpoint
function cargarCheckpoint(checkpoint){
    
    
    //Cargamos los distintos datos del objeto en los contenedores del html
    $('#checkpoint-nombre').html(checkpoint.nombre);
    $('#checkpoint-latitud').html(checkpoint.latitud);
    $('#checkpoint-longitud').html(checkpoint.longitud);
    $('#checkpoint-fecha').html(checkpoint.fecha);
    
    
    //Si descripcion es null se asigna el string "Sin descripcion"
    if(checkpoint.descripcion==""){
        $('#checkpoint-descripcion').html("Sin descripción");
    }
    else{
         $('#checkpoint-descripcion').html(checkpoint.descripcion);
    }
    //Si no tiene fotografia se asigna la fotografia por defecto de "no-image"
    if(checkpoint.url_imagen==""){
        $('#checkpoint-imagen').html('<img src="img/no-image.png" />');
    }
    else{
         //Pendiente
    }
    
    
     //Si la informacion para el usuario es null se asigna el string "No hay informacion de este punto"
    if(checkpoint.info==""){
        $('#checkpoint-info').html("No hay información de este punto");
    }
    else{
         $('#checkpoint-info').html(checkpoint.info);
    }
    //Si el checkpoint ha sido registrado o no se realizan las siguientes acciones
    if(checkpoint.checked_in==1){
        $('#checkpoint-status').html("Ya se ha registrado en este checkpoint");
    }
    else{
         $('#checkpoint-status').html("Aun no se ha registrado en este checkpoint");
    }
    
    
    //Cargamos la URL del minimapa de google con los datos de latitud y longitud del sitio
    mini_mapa = "http://maps.google.com/maps/api/staticmap?center="+checkpoint.latitud+","+checkpoint.longitud+"&"+"&zoom=16&markers=size:small|"+checkpoint.latitud+","+checkpoint.longitud+"&maptype=hybrid&size=200x200&sensor=false";
    //La cargamos en el HTML
    $('#checkpoint-mapa').html("<img src='"+mini_mapa+"' />");
   

    
    //Evento del boton regresar
    $('#perfil-checkpoint .regresar').click(function(e){
        //Evitamos propagacion y evitamos el comportamiento por defento del boton
        e.stopImmediatePropagation();
        e.preventDefault();
        //Desactivamos los eventos de los botones de borrar y editar para que se evite su propagacion
      
        $('#perfil-checkpoint .check-in').unbind('click');
        //Obtenemos la pagina a regresar la cual se encuentra en la respectiva variable de sesion
        back_page = "#"+sessionStorage.getItem('back_perfil-checkpoint');
        //Cambiamos a esa pagina
        $.mobile.changePage($(back_page));
        

        
    
    });
    
    $('#perfil-checkpoint .check-in').click(function(e){
        //Evitamos propagacion y evitamos el comportamiento por defento del boton
       
        e.preventDefault();
        
        //Funcion que se realizara si se llego a obtener la ubicacion a traves del API del SO del dispositivo
        function ubicacion(position){
            
            //Una variable bandera que indicara la continuacion de la iteraciones o no
            var continuar;
            
            //Si hay poca precision con la ubicacion obtenida se le notifica al usuario
            if(position.coords.accuracy>350){
                
                mensaje = "Se ha obtenido una ubicacion con poca precisión\nExiste la posibiliad que la ubicación obtenida no se corresponda con la real en que se encuentra\nAsegurese de tener GPS o Wi-fi activado para mayor precisión\n¿Aun asi desea continuar?";
                
                //Aqui se le muestra el mensaje al usuario y se activa la bandera dependiendo si le dio aceptar o no
                if(confirm(mensaje)){
                    continuar=true;
                }
                else{
                    continuar=false;
                }
                
                
            }
            //Si hay buena precision simplemente la bandera queda activada
            else{
                continuar = true;
            }
        
            //aqui usamos la variable bandera
            if(continuar){
                //Si el punto al que se quiere hacer checkin se encuentra cerca (a menos de 80 metros) se realiza lo de a continuacion
                if(esta_cerca(checkpoint.latitud,checkpoint.longitud,position.coords.latitude,position.coords.longitude)){
                    //Se modifica el objeto del checkpoint al que se quiere hacer checkin
                    checkpoint.checked_in = 1;
                    checkpoint.sincronizado = 0;
                    checkpoint.actualizar(); //Se actualiza en la BD
                    $('#checkpoint-status').html("Ya se ha registrado en este checkpoint"); //Se modifica el HTML
                    //Se le informa al usuario del exito de la operacion
                    alert("Ha registrado su visita a este checkpoint con exito");
                }
                else{
                    //Si no esta cerca, se le notifica al usuario que debe estar a menos de 80 metros del punto para hacer checkin
                    alert("No puede registrar este checkpoint ya que no se encuentra cerca de el\nPor favor acerquese a menos de 80 metros del punto para registrarlo.");
                }
            }

            
        }
        //Funcion que se ejecutara si no se pudo recuperar la ubicacion del API del SO del dispositivo
        function fallo(){
            alert("No se pudo obtener su ubicación.\nAsegurese de tener GPS y/o Wi-fi activado e intentelo de nuevo");
        }
        
        //A PARTIR DE ESTA INSTRUCCION EMPIEZA LA FUNCION.
        //Se verifica si el checkpoint ya ha sido registrado o no
        if(checkpoint.checked_in==0){
            //Si no ha sido registrado se pregunta si de verdad quiere registrarlo
            if(confirm("¿Desea registrar este Checkpoint?")){
                //En caso de continuar. Se le solicita la ubicacion al SO del dispositivo. Esta ubicacion sera utilizada en la funcion callback "ubicacion" explicada atras
                //La funcion fallo se ejecutara en caso de que no se haya podido obtener la ubicacion del SO. Esta tambien fue explicada atras.
                navigator.geolocation.getCurrentPosition(ubicacion, fallo);
            }
            
        }
        else{
            //Si el checkpoint ya ha sido registrado se le notifica al usuario.
            alert("Usted ya se encuentra registrado en este sitio");
        }

        
    
    });

    
}

//Funcion que lista los puntos para hacer checkin. Que no son mas que los checkpoints cercanos a la posicion del usuario
function listarCheckins(){

   //Funcion que se realizara si se llego a obtener la ubicacion a traves del API del SO del dispositivo
   function ubicacion(position){
       
        alert("Ubicacion obtenida con exito");
        //Se cambia a la pagina donde se listaran los checkpoints cercanos
        $.mobile.changePage($('#check-in'));
       //Se inicializa el objeto de checkpoints del modelo
        c = new Checkpoints();
        //Se obtiene el id del usuario en sesion
        id_usuario = sessionStorage.getItem('user-id');
        //Se obtienen los checkpoints asosiados al usuario en sesion
        c.listar(id_usuario, function(checkpoints){
            //Variable bandera inicializada en false que se activara si se encuentra aunque sea 1 checkpoint cercano
            var hay_checkins = false;
            //Si hay checkpoints en el arreglo iteramos sobre el mismo
            if(checkpoints.length>0){
                for(j=0;j<checkpoints.length;j++){

                    //Aqui verificamos si el checkpoint en que se esta iterando sobre el arreglo se encuentra cerca.
                    if(esta_cerca(checkpoints[j].latitud,checkpoints[j].longitud,position.coords.latitude,position.coords.longitude)){
                        //Si se encuentra cerca empezamos a constrior el HTML a agregar con los datos del arreglo de checkpoints
                        stream = '<li class="checkin" id="checkin-'+checkpoints[j].id+'" ><a href="#">\n';
                        stream += '<img src="img/no-image.png" />\n';
                        stream += '<h3>'+checkpoints[j].nombre+'</h3>\n';
                        stream += '<p>'+checkpoints[j].descripcion+'</p>\n';
                        stream += '</a></li>\n'
                        //Concatenamos el HTML construido al DOM del documento
                        $('#lista-check-in').append(stream);
                        //refrescamos los elementos de jQuery Mobile
                        $('#lista-check-in').listview();
                        $('#lista-check-in').listview("refresh");
                        //Activamos la bandera ya que se encontro un checkpoint cercano
                        hay_checkins=true;
                    }

                }

            }
            
            //Si no se activo la bandera es que no hay checkpoints (ya sean cercanos o ninguno en totalidad)
            if(!hay_checkins){
                //Se escribe en el HTML que no existe ningun checkpoint cercanos a la posicion
                $('#lista-check-in').html("No hay checkpoints cercanos a su posicion");
            }

        });

       
   }
   //Funcion callback que se ejecuta si no se pudo conseguir la ubicacion del dispositivo
   function fallo(){
       alert("No se pudo obtener su ubicación.\nAsegurese de tener GPS y/o Wi-fi activado e intentelo de nuevo");
       
   }

    //AQUI INICIA LA ITERACION DE LA FUNCION.
    //Se le solicita la ubicacion al dispositivo pasandole las funciones callback para exito (ubicacion) o error (fallo)
   navigator.geolocation.getCurrentPosition(ubicacion, fallo);
   
   //Evento que se ejecuta al presionar el boton regresar
    $('#check-in .regresar').click(function(e){
        e.stopImmediatePropagation();//Se evita la propagacion
        $('#lista-check-in').html("");//Se reinicia el HTML de los sitios

    });
    
    //Evento que se ejecuta al darle click algunos de los checkpoints cercanos (si es que los hay)
    $('.checkin').live('click', function(e) {
        e.preventDefault(); //evitamos el comportamiento normal
        e.stopImmediatePropagation(); //evitamos propagacion bla bla bla
        //obtenemos el id del checkpoint del html
        id_checkpoint = $(this).attr('id').split("-")[1];
        //creamos el objeto checkpoints que nos permitira obtener el objeto del checkpoint que queremos de la BD
        s = new Checkpoints();
        //obtenemos el objeto de la bd y llamaremos a la funcion callback para cargar ese checkpoint en la pantalla de perfil de checkpoint
        //La funcion cargarCheckpoint ya fue explicada mas atras
        s.consultar(id_checkpoint, cargarCheckpoint);
        
        
        //Aqui creamos una variable de sesion que nos permitira saber cual es la pantalla que enlazara el boton "regresar".
        //Esto debido a que la pantalla de perfil de checkpoint se usa en mas de una ocasion
        sessionStorage.setItem('back_perfil-checkpoint',"check-in");
        //Cambiamos a la pantalla a perfil de checkpoint
        $.mobile.changePage($('#perfil-checkpoint'));
        
        
    });  
   
   
    
}


//Esta es una funcion utilitaria que permite saber si un punto se encuentra cercano a otro (en menos de 80 metros)
//Retorna true o false dependiendo si se encuentra cerca o no
function esta_cerca(lat1,lon1,lat2,lon2){

    //Funciones matematicas avanzadas
    rad = function(x) {return x*Math.PI/180;}

    var R     = 6371.0090667;  //Radio de la tierra en km
    var dLat  = rad( lat2 - lat1 );
    var dLong = rad( lon2 - lon1 );

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;

    distancia = (d.toFixed(3))*1000; //La distancia entre los dos puntos expresada en metros
    //console.log(distancia);
    //Aqui determinamos si se encuentra cerca o no.
    if(distancia < 80 ){
        return true;
    }
    else{
        return false;
    }


}