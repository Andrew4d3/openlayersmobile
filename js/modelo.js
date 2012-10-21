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

a = new Alertas();
//a.crear(2, "puyol", "Hoy marcamos 2 goles e igual sufrimos", "02/12/2012", 0, 1,232);
a.crear(2, "Valdes", "Hoy la cague en la porteria", "02/12/2012", 0, 1,233);
a.crear(2, "Messi", "Hoy me volvi a llevar la pelota", "03/12/2012", 0, 1,234);
a.crear(2, "Alba", "Hoy meti un golazo normal y un autogolazo de leyenda", "04/12/2012", 0, 1,235);



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
