/* 

 */



var db = openDatabase('georef', '1.0', 'GeoRef Local DB', 2 * 1024 * 1024);
localStorage.setItem('tipo_mapa',"osm");
localStorage.setItem('wms_url',"http://129.206.228.72/cached/osm?");
localStorage.setItem('wms_layers',"osm_auto:all");
function init_db(){
    
   
    
   //Creamos la tabla sino se encuentra creada

    if(localStorage.getItem('tablas_hechas')!=1){

        db.transaction(function(tx){
            tx.executeSql("CREATE TABLE if NOT EXISTS usuarios (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, usuario TEXT UNIQUE, pass TEXT)");

            tx.executeSql("CREATE TABLE IF NOT EXISTS alertas (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id_usuario INTEGER, supervisor TEXT, mensaje TEXT, fecha TEXT, visto NUMERIC, sincronizado NUMERIC, servidor_id INTEGER, FOREIGN KEY(id_usuario) REFERENCES usuarios(id))");

            tx.executeSql("CREATE TABLE IF NOT EXISTS categorias (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, descripcion TEXT, color TEXT, id_usuario INTEGER NOT NULL, sincronizado NUMERIC NOT NULL, servidor_id INTEGER, FOREIGN KEY(id_usuario) REFERENCES usuarios(id))");

            tx.executeSql("CREATE TABLE IF NOT EXISTS sitios (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, latitud REAL NOT NULL, longitud REAL NOT NULL, fecha TEXT NOT NULL, descripcion TEXT, url_imagen TEXT, id_categoria INTEGER, id_usuario INTEGER NOT NULL, sincronizado NUMERIC NOT NULL, servidor_id INTEGER, FOREIGN KEY(id_usuario) REFERENCES usuarios(id), FOREIGN KEY(id_categoria) REFERENCES categorias(id) )");

            tx.executeSql("CREATE TABLE IF NOT EXISTS checkpoints (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, latitud REAL NOT NULL, longitud REAL NOT NULL, fecha TEXT NOT NULL, descripcion TEXT, info TEXT, supervisor TEXT NOT NULL, url_imagen TEXT, id_usuario INTEGER NOT NULL, sincronizado NUMERIC NOT NULL, checked_in NUMERIC NOT NULL, servidor_id INTEGER, FOREIGN KEY(id_usuario) REFERENCES usuarios(id))");

            localStorage.setItem('tablas_hechas', 1);
            console.log("Se crearon las tablas");

        });

    }
    else{
       // console.log("Tablas ya creadas");
    }
    

    
    
    
}



//Funcion para autenticar usuario
function autentica_usuario(user, pass, auto){
    //Hacemos el query
    var query = "SELECT * FROM usuarios WHERE usuario='"+user+"' AND pass='"+md5(pass)+"'"
    var len = 0;
    
    var callback = function(tx,results){
        //Si no hay columnas significa que el usuario o contraseña es incorrecto
        len =results.rows.length;
        
        
        if(len==0){
            alert("Usuaro o Contraseña Incorrecta");
        }
        else{
            alert("Bienvenido "+user);
            user_id = results.rows.item(0).id;
            
            if(auto){
                
                localStorage.setItem('auto',true);
                localStorage.setItem('auto-user',user);
                localStorage.setItem('auto-user-id',user_id);
                
            }
            
            sessionStorage.setItem('user',user);
            sessionStorage.setItem('user-id',user_id);
            //$.mobile.changePage('sesion.html');
            location.href="sesion.html";
        }
       
    };
    
    var result = function(callback){
        db.transaction(function(tx){
             tx.executeSql(query,[],callback);
             
        });
    }

    result(callback);


}




function crear_usuario(user,pass){
    var query = "SELECT * FROM usuarios WHERE usuario='"+user+"'";
    
    var callback = function(tx,results){
        len =results.rows.length;
        if(len==1){
            alert("Nombre de usuario no disponible");
        }
        else{
            var query = "INSERT INTO usuarios(usuario,pass) VALUES('"+user+"','"+md5(pass)+"')";
            db.transaction(function(tx){
                tx.executeSql(query);
                 alert("Usuario Creado con Exito");
                 $.mobile.changePage($('#login'));
            });
           
        }
       
    };
    
    var result = function(callback){
        db.transaction(function(tx){
             tx.executeSql(query,[],callback);
             
        });
    }

    result(callback);   
    
    
}

//Funcion que inicializa los valores iniciales del mapa openlayers en map.html
function mapaInicial(){

    
    //Revisamos el storage local para ver que servicio de mapa se utilizara
    //En caso de utilizar google creamos las layers correspondientes para el mapa hibrido, urbano o satelite
    if(localStorage.getItem('tipo_mapa')=="google"){
        var ghyb = new OpenLayers.Layer.Google(
                "Google Hybrid",
                {type: G_HYBRID_MAP, numZoomLevels: 20}
        );
        var gmap = new OpenLayers.Layer.Google(
                "Google Streets", // the default
                {numZoomLevels: 20}
        );
        var gsat = new OpenLayers.Layer.Google(
                "Google Satellite",
                {type: G_SATELLITE_MAP, numZoomLevels: 20}
        );
        //Agregamos las layers(capas) al objeto map de Openlayers    
        map.addLayers([ghyb,gmap,gsat]);
        //Establecemos como mapa base inicial al mapa Hibrido
        map.setBaseLayer(ghyb);
        //Agregamos las opciones al select para que el usuario pueda cambiar el tipo de mapa cuando lo prefiera
        $('#select-mapa').html("");
        $('#select-mapa').append('<option value="1">Hibrido</option>');
        $('#select-mapa').append('<option value="2">Urbano</option>');
        $('#select-mapa').append('<option value="3">Satelite</option>');
        $('#select-mapa').selectmenu('refresh',true); //Refrescamos el objeto de jquerymobile
        
        
    }
    //En caso de utilizar bing creamos las layers correspondientes para el mapa hibrido, urbano o satelite (igual que con google)
    else if(localStorage.getItem('tipo_mapa')=="bing"){
        //Esta es la key obtenida en la pag de microsoft
        apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
        
        var hybrid = new OpenLayers.Layer.Bing({
                name: "Hybrid",
                key: apiKey,
                type: "AerialWithLabels"
        });
        
        var road = new OpenLayers.Layer.Bing({
                name: "Road",
                key: apiKey,
                type: "Road"
        });
        var aerial = new OpenLayers.Layer.Bing({
                name: "Aerial",
                key: apiKey,
                type: "Aerial"
        });
        //Agregamos las capas al objeto map de openlayers
        map.addLayers([hybrid,road,aerial]);
        /* NOTA IMPORTANTE: Aqui deberia haber un setBaseLayer con una de las capas de Bing, sin embargo por una extraña razon causa error en la app (solo con Bing
           Se agrega al final, despues que todos los scripts y listeners han sido cargados para que no de problemas */
        //Ocultamos las etiquetas de informacion de Bing para que no interfieran con los controles de Zoom de la app       
        $('#OpenLayers_Control_Attribution_10').hide();  
        //Agregamos las opciones al select para que el usuario pueda cambiar el tipo de mapa cuando lo prefiera
        $('#select-mapa').html("");
        $('#select-mapa').append('<option value="1">Hibrido</option>');
        $('#select-mapa').append('<option value="2">Urbano</option>');
        $('#select-mapa').append('<option value="3">Satelite</option>');
        $('#select-mapa').selectmenu('refresh',true); //Refrescamos el objeto de jquerymobile
        
    }
    else if(localStorage.getItem('tipo_mapa')=="wms"){
        //En caso de utilizar el mapa de un WMS solo se utiliza un layer
        //La URL del WMS y las capas se obtienen del storage local ya que estos forman parte de los parametros de configuracion de la app
        var url = localStorage.getItem('wms_url'); 
        var wms_layers = localStorage.getItem('wms_layers');
        
        //Creamos el Layer WMS
        var wms = new OpenLayers.Layer.WMS("OpenLayers WMS",
            url,
            {layers: wms_layers},
            {transitionEffect: 'resize'}
        );
        //Agregamos la capa al objeto map de openlayers
        map.addLayers([wms]);
        //Establecemos como capa base la capa agregada anteriormente
        map.setBaseLayer(wms);
        
    }
    //Creamos un objeto de Coordenadas con la posicion de Venezuela
    coord_p = new OpenLayers.LonLat(-66.698534606726,10.036719859033);
    //Hacemos la transformacion de proyecciones para que coincida con las proyeciones que maneja el objeto map de openlayers
    coord_p = coord_p.transform(new OpenLayers.Projection("EPSG:4326"),map.getProjectionObject());
    //Establecemos el centro en el objeto de coordenadas creado y el zoom para que se pueda apreciar el territorio nacional
    map.setCenter(coord_p,5);
    
    
}

//Esta funcion lista LAS CATEGORIAS de sitios en el select de "Mostrar sitios" de los controles del Mapa (map.html)
function selectSitios(){
    
    $('#select-sitios').parent().hide();
    //Creamos el objeto de Categorias
    var categorias = new Categorias();
    //Obtenemos el id del usuario
    id_usuario = sessionStorage.getItem('user-id');
    //Listamos las categorias asociados al usuario en sesion
    categorias.listar(id_usuario, function(categorias){
        
        $('#select-sitios').html("");
        //Categoria por defecto (sitios sin categorias)
        $('#select-sitios').append('<option value="null">(Sin Categoría)</option>');
        //Aqui se listan las demas categorias
        for(i=0; i<categorias.length; i++){
            $('#select-sitios').append('<option value="'+categorias[i].id+'">'+categorias[i].nombre+'</option>');
        }
        
        //Se refresca el menu de jquery mobile
        $('#select-sitios').selectmenu('refresh',true);
        
        
        
    });
    
    
    
}