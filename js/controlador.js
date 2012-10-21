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

        //

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
