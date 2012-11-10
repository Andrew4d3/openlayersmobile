/* // Codigo de Prueba

a = new Alertas();

//

a.crear(2, "puyol", "mensaje2", "12/12/2012", 0, 1,232);
a.listar(2,function(alertas){
    
    //alertas[0].visto = 1;
    //console.log(alertas);
    alertas[0].borrar();
   
});



*/
/*
a = new Alertas();
//a.crear(2, "puyol", "Hoy marcamos 2 goles e igual sufrimos", "02/12/2012", 0, 1,232);
a.crear(2, "Valdes", "Hoy la cague en la porteria", "02/12/2012", 0, 1,233);
a.crear(2, "Messi", "Hoy me volvi a llevar la pelota", "03/12/2012", 0, 1,234);
a.crear(2, "Alba", "Hoy meti un golazo normal y un autogolazo de leyenda", "04/12/2012", 0, 1,235);
*/


/** CLASE DE alertas **/

function alerta (id, id_usuario, supervisor, mensaje, fecha, visto, sincronizado, servidor_id) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.supervisor = supervisor;
    this.mensaje = mensaje;
    this.fecha = fecha;
    this.visto = visto;
    this.sincronizado = sincronizado;
    this.servidor_id = servidor_id;
    
    
    
    
    this.actualizar = function() {
        
        //El usuario solo esta permitido a modificar las variables visto y sincronizado
        var query = "UPDATE alertas SET visto="+this.visto+", "+"sincronizado="+this.sincronizado+" WHERE id="+this.id;
        //console.log(query);
        
        db.transaction(function(tx){
            tx.executeSql(query);
        })
    };
    
    this.borrar = function() {
        
        
        var query = "DELETE FROM alertas WHERE id="+this.id;
        //console.log(query);
        db.transaction(function(tx){
            tx.executeSql(query);
        })
    };
    
       
}

function Alertas(){

    //NO ESTA DEFINIDIO QUE EL EL USUARIO CREE ALERTAS, Esta funcion es solo para crear alertas de prueba
    this.crear = function(id_usuario, supervisor, mensaje, fecha, visto, sincronizado, servidor_id){
        
        var query = "INSERT INTO alertas(id_usuario,supervisor,mensaje,fecha,visto,sincronizado, servidor_id) VALUES("+id_usuario+",'"+supervisor+"','"+mensaje+"','"+fecha+"',"+visto+","+sincronizado+","+servidor_id+")";
        //console.log(query);
        
        
        
        db.transaction(function(tx){
            tx.executeSql(query);
            //console.log(query);
        })
    }
    
   
   //Lista todas las alertas de un respectivo usuario movil
    this.listar = function(id_usuario,callback){
        
        var query = "SELECT * FROM alertas WHERE id_usuario="+id_usuario;
        //console.log(query);
        
        db.transaction(function(tx){
            tx.executeSql(query,[],function(tx,result){
                n = result.rows.length;
                var alertas = new Array(n);
                
                for(i = 0; i< n; i++){
                    
                    item = result.rows.item(i);
                    alertas[i] = new alerta(item.id,item.id_usuario,item.supervisor,item.mensaje,item.fecha,item.visto,item.sincronizado,item.servidor_id);
                    
                    //console.log(alertas[i]);
                    
                }
                
                callback(alertas);
            });
            
            
            
        })
    }
    
    

    
    
}


/************** CLASE SITIOS ***************/

function sitio (id, id_usuario, latitud, longitud, fecha, nombre, descripcion, url_imagen, id_categoria, sincronizado, servidor_id) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.latitud = latitud;
    this.longitud = longitud;
    this.fecha = fecha;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.url_imagen = url_imagen;
    this.id_categoria = id_categoria;
    this.sincronizado = sincronizado;
    this.servidor_id = servidor_id;
    
   
    this.actualizar = function() {
        
        //El usuario solo esta permitido a modificar las variables visto y sincronizado
        
        if(this.id_categoria==null){
            id_categoria="null";
        }
        else{
            id_categoria=this.id_categoria;
        }
        
        
        var query = "UPDATE sitios SET nombre='"+this.nombre+"', "+"descripcion='"+this.descripcion+"', "+"id_categoria="+id_categoria+" WHERE id="+this.id;
        //console.log(query);

        db.transaction(function(tx){
            tx.executeSql(query);
        })
    };
    
    this.borrar = function() {
        
        
        var query = "DELETE FROM sitios WHERE id="+this.id;
        //console.log(query);
        db.transaction(function(tx){
            tx.executeSql(query);
        })
    };
    
       
}

s = new Sitios();
//s.crear(2,10.474577130065,-66.89487218575,'21/12/2012 13:30','Las ciencias','Calle por ahi',null,null,0,null);

function Sitios(){

    
    this.crear = function(id_usuario, latitud, longitud, fecha, nombre, descripcion, url_imagen, id_categoria, sincronizado, servidor_id){
        
        var query = "INSERT INTO sitios(id_usuario, latitud, longitud, fecha, nombre, descripcion, url_imagen, id_categoria, sincronizado, servidor_id) VALUES("+id_usuario+","+latitud+","+longitud+",'"+fecha+"','"+nombre+"','"+descripcion+"','"+url_imagen+"',"+id_categoria+","+sincronizado+","+servidor_id+")";
        
        //console.log(query);
            
         db.transaction(function(tx){
            tx.executeSql(query);
            //console.log(query);
        })
    }
    
   
   //Lista todas los sitios de un usuario
    this.listarU = function(id_usuario,callback){
        
        var query = "SELECT * FROM sitios WHERE id_usuario="+id_usuario;
        //console.log(query);
        return;
        db.transaction(function(tx){
            tx.executeSql(query,[],function(tx,result){
                n = result.rows.length;
                var sitios = new Array(n);
                
                for(i = 0; i< n; i++){
                    
                    item = result.rows.item(i);
                    sitios[i] = new sitio(item.id, item.id_usuario, item.latitud, item.longitud, item.fecha, item.nombre, item.descripcion, item.url_imagen, item.id_categoria, item.sincronizado, item.servidor_id);
                    
                    
                }
                
                callback(sitios);
            });
            
            
            
        })
    }
    
    //Lista todas los sitios de un usuario por categoria
     this.listarC = function(id_usuario, id_categoria, callback){
        
        var query = "SELECT * FROM sitios WHERE id_usuario="+id_usuario+" AND id_categoria "+id_categoria;
        //console.log(query);
        
        db.transaction(function(tx){
            tx.executeSql(query,[],function(tx,result){
                n = result.rows.length;
                var sitios = new Array(n);
                
                for(i = 0; i< n; i++){
                    
                    item = result.rows.item(i);
                    sitios[i] = new sitio(item.id, item.id_usuario, item.latitud, item.longitud, item.fecha, item.nombre, item.descripcion, item.url_imagen, item.id_categoria, item.sincronizado, item.servidor_id);
                    

                    
                }
                
                callback(sitios);
            });
            
            
            
        })
    }


//Sitio unico por ID

     this.consultar = function(id, callback){
        
        var query = "SELECT * FROM sitios WHERE id="+id;
        //console.log(query);
        
        db.transaction(function(tx){
            tx.executeSql(query,[],function(tx,result){
                
                
                item = result.rows.item(0);
                s = new sitio(item.id, item.id_usuario, item.latitud, item.longitud, item.fecha, item.nombre, item.descripcion, item.url_imagen, item.id_categoria, item.sincronizado, item.servidor_id);
                
                
                callback(s);
            
            });
      
            
        })
    }
    
    

    
    
}


/*********** CLASE CATEGORIAS ************/

function categoria (id, id_usuario, nombre, descripcion, sincronizado, servidor_id) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.sincronizado = sincronizado;
    this.servidor_id = servidor_id;

    
   
    this.actualizar = function() {
        
        //El usuario solo esta permitido a modificar las variables visto y sincronizado
        var query = "UPDATE alertas SET visto="+this.visto+", "+"sincronizado="+this.sincronizado+" WHERE id="+this.id;
        //console.log(query);
        return;
        db.transaction(function(tx){
            tx.executeSql(query);
        })
    };
    
    this.borrar = function() {
        
        
        var query = "DELETE FROM alertas WHERE id="+this.id;
        return;
        //console.log(query);
        db.transaction(function(tx){
            tx.executeSql(query);
        })
    };
    
       
}


c = new Categorias();
//c.crear(2,"Prueba2",'Esta es una categoria de prueba',0,null);
/*
c.listar(2,function(categorias){
    console.log(categorias);
});
*/

function Categorias(){

    
    this.crear = function(id_usuario, nombre, descripcion, sincronizado, servidor_id){
        
        var query = "INSERT INTO categorias(id_usuario, nombre, descripcion, sincronizado, servidor_id) VALUES("+id_usuario+",'"+nombre+"','"+descripcion+"',"+sincronizado+","+servidor_id+")";
        
        
        //console.log(query);
        
        
        db.transaction(function(tx){
            tx.executeSql(query);
            //console.log(query);
        })
    }
    
   
   //Lista todas los sitios de un usuario
    this.listar = function(id_usuario,callback){
        
        var query = "SELECT * FROM categorias WHERE id_usuario="+id_usuario;
        //console.log(query);
        
        db.transaction(function(tx){
            tx.executeSql(query,[],function(tx,result){
                n = result.rows.length;
                var categorias = new Array(n);
                
                for(i = 0; i< n; i++){
                    
                    item = result.rows.item(i);
                    categorias[i] = new categoria(item.id, item.id_usuario, item.nombre, item.descripcion, item.sincronizado, item.servidor_id);
                    
                    //console.log(alertas[i]);
                    
                }
                
                callback(categorias);
            });
            
            
            
        })
    }
    
    
     this.consultar = function(id, callback){
        
        var query = "SELECT * FROM categorias WHERE id="+id;
        //console.log(query);
        
        db.transaction(function(tx){
            tx.executeSql(query,[],function(tx,result){
                
                
                item = result.rows.item(0);
                c = new categoria(item.id, item.id_usuario, item.nombre, item.descripcion, item.sincronizado, item.servidor_id);
                
                
                callback(c);
            
            });
      
            
        })
    }    
   
    
}