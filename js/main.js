/* 

 */



var db = openDatabase('georef', '1.0', 'GeoRef Local DB', 2 * 1024 * 1024);

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