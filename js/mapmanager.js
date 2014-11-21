
// Carga el map de los riesgos de la semana seleccionada
function reloadMapSem(){
    var semana = SMV.semana;
    var rasu;
    var rcen;
    var mapSem = new Object();
    var mapSemDis = new Object();
    
    //Cargar el json de los riesgos por semana
    //riesgos de todas las semanas de los departamentos
    var riesgo = SMV.riesgoJson;
    //riesgos de todas las semana de los distritos
    var riesgoDis = SMV.riesgoDisJson;
    //riesgos de todas las semanas de los barrios de asuncion
    var riesgoAsu = SMV.riesgoAsuJson;

    for(var i=0; i<riesgo.length; i++){
        var obj = riesgo[i];
        if(obj["semana"]==semana ){
            
            mapSem[obj["departamento"]]= obj;
            if(obj["departamento"]=="CENTRAL"){
                rcen = obj;
            }
            if(obj["departamento"]=="ASUNCION"){
                rasu = obj;
            }
        }
    }
    if(rasu){
       try{
            rasu["riesgo"] = rcen["riesgo"];
        }catch(e){
            rasu["riesgo"] = 'RB';
        }
        mapSem["ASUNCION"] = rasu;
    }
    //Riesgo de los departamentos de la semana seleccionada
    SMV.mapNotif = mapSem;

    for(var i=0; i<riesgoDis.length; i++){
        var obj = riesgoDis[i];
        if(obj["semana"]==semana ){
            
            mapSemDis[obj["distrito"]]= obj;
            /*if(obj["departamento"]=="CENTRAL"){
                rcen = obj;
            }*/
            if(obj["distrito"] == "ASUNCION"){
                //rasu = obj;
            }
        }
    }
    //Incluir en el mapSemDis los barrios de Asuncion
    for(var i=0; i<riesgoAsu.length; i++){
        var obj = riesgoAsu[i];
        if(obj["semana"] == semana){
            mapSemDis[obj["barrio"]] = obj;
        }
        
    }
   	//Riesgos de los distritos de la semana seleccionada
    SMV.mapNotifDis = mapSemDis;
    console.log('reload');

    //if(!SMV.firstTime){
       
    //}
}

function reloadNotificaciones () {
    var semana = SMV.semana;
    var mapSemFil = new Object();
    var resFiltro = SMV.resFiltro;
        for(var i=0; i<resFiltro.length; i++){
            var obj = resFiltro[i];

            if(obj["semana"] == semana){
                mapSemFil[obj["departamento"]] = obj;
            }
        }

        SMV.mapSemFil = mapSemFil;
        console.log(SMV.mapSemFil);
}
 /*Eventos para cada departamento*/
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: mouseover,
        mouseout: mouseout,
        click: zoomToFeature
    });
    //content = '<h2>'+feature.properties.DPTO_DESC+'<\/h2>';
    //layer.bindPopup(content);
}


/*Evento al ubicarse el puntero en un departamento*/
function mouseover(e) {
    var layer = e.target;
     layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: ''
        
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    SMV.info.update(layer.feature.properties);
}

/*Evento al salir el puntero de un departamento*/
function mouseout(e) {
    SMV.geoJsonLayer.resetStyle(e.target);
    SMV.info.update();
   
}

/*Zoom al hacer click en un departamento*/
function zoomToFeature(e) {
    var target = e.target;
    var json = SMV.drillDown[target.feature.properties.DPTO_DESC];
    if(!SMV.inzoom){
        var button = new SMV.backClass();
        SMV.map.addControl(button);
        SMV.backButton = button;
        console.log(SMV.backButton);    
    }
   	SMV.inzoom = true;
   	SMV.geoJsonLayer.setStyle(getStyle);
    if(SMV.layerActual){
        console.log('removiendo capa')
        SMV.map.removeLayer(SMV.layerActual);
    }
    SMV.layerActual = L.geoJson(json,  {style: getStyleDrillDown, onEachFeature: onEachFeatureDrillDown}).addTo(SMV.map);
    SMV.map.fitBounds(target.getBounds());

    
   // SMV.map.removeLayer(SMV.geoJsonLayer);
}
/*Color de cada riesgo*/
function getColor(d) {
    return d == 'E' ? '#FE0516' :
        d == 'RA' ? '#FF6905' :
        d == 'RM' ? '#FFB905' :
        d == 'RB' ? '#FFF96D' :
        '#FFFFFF';
}
/*Estilo de la capa de departamento de acuedo a los valores de riesgo*/
function getStyle(feature) {
    var n = feature.properties.DPTO_DESC;
    var mapSem = SMV.mapNotif;
    var color = 'NONE';
    try{
        //color = mapSem[n]
        color = mapSem[n]["riesgo"];
    }catch(e){
    }
    if(SMV.inzoom){
    	return { weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0, 
            fillColor: getColor(color) 
        };
    }
  	else{
  		return { weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: SMV.opacity, 
            fillColor: getColor(color) 
        };
  	}
    
}
/*Estilo de la capa de distritos de acuedo a los valores de riesgo*/
function getStyleDrillDown(feature) {
    var prop = feature.properties;
    var n = prop.DPTO_DESC+'-'+prop.DIST_DESC;
    var mapSem = SMV.mapNotifDis;
    var color = 'NONE';
    if(prop.DPTO_DESC == 'ASUNCION'){
        n = prop.DPTO_DESC+'-'+prop.BARLO_DESC;
        console.log('es asuncion');
        console.log(n);
    }
   try{
        color = mapSem[n]["riesgo"];
        //console.log("hay valor");
    }catch(e){
    }
  
    return { weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: SMV.opacity, 
            fillColor: getColor(color) 
        };
}
/*Eventos para cada distrito*/
function onEachFeatureDrillDown(feature, layer) {
    layer.on({
        mouseover: mouseoverDrillDown,
        mouseout: mouseoutDrillDown,
    });
}
/*Evento al ubicarse el puntero sobre un distrito*/
function mouseoverDrillDown(e) {
    var layer = e.target;
     layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: ''
        
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    SMV.info.updateDrillDown(layer.feature.properties);
}

/*Evento al salir el puntero de un distrito*/
function mouseoutDrillDown(e) {
    SMV.layerActual.resetStyle(e.target);
    SMV.info.updateDrillDown();
   
}

function loadDrillDownDep(){

    var drillDown = new Object();
    drillDown['ASUNCION'] = asuncion;
    drillDown['ALTO PARAGUAY'] = altoparaguay;
    drillDown['ALTO PARANA'] = altoparana;
    drillDown['AMAMBAY'] = amambay;
    drillDown['BOQUERON'] = boqueron;
    drillDown['CAAGUAZU'] = caaguazu;
    drillDown['CAAZAPA'] = caazapa;
    drillDown['CANINDEYU'] = canindeyu;
    drillDown['CENTRAL'] = central;
    drillDown['CONCEPCION'] = concepcion;
    drillDown['CORDILLERA'] = cordillera;
    drillDown['GUAIRA'] = guaira;
    drillDown['ITAPUA'] = itapua;
    drillDown['MISIONES'] = misiones;
    drillDown['ÑEEMBUCU'] = neembucu;
    drillDown['PARAGUARI'] = paraguari;
    drillDown['PRESIDENTE HAYES'] = presidentehayes;
    drillDown['SAN PEDRO'] = sanpedro;
    SMV.drillDown = drillDown;

}

function drillUp(){
    console.log('Volver a vista de departamentos');
    map = SMV.map;
    //map.fitBounds(SMV.geoJsonLayer.getBounds());
    SMV.map.removeLayer(SMV.layerActual);
    SMV.inzoom = false;
    SMV.geoJsonLayer.setStyle(getStyle);
    SMV.backButton.removeFrom(map);
    SMV.map.setView([-23.388, -60.189], 7);
    SMV.map = map;
}


function descargarFiltradosJsonMap(){
    console.log('entro a descargar json filtrado mapa');
    var data;
    //mientras hasta leer los filtros de la tabla
    var anio = SMV.anio;

    var variables = "&confirmado="+SMV.c+"&descartado="+SMV.d+"&sospechoso="+SMV.s;
    if(SMV.f==1 && SMV.m==1){
        variables =  variables + "&f=0&m=0";
    }else{
        variables =  variables + "&f="+SMV.f+"&m="+SMV.m;
    }
    console.log(variables);
    $.ajax({
        url: "http://localhost/denguemaps/rest/notificacion/filtrosmapa?anio=" + anio + variables,
        type:"get", //send it through get method
        //data: {ajaxid:4, UserID: UserID, EmailAddress:encodeURIComponent(EmailAddress)} 
        success: function(response) {
            SMV.resFiltro = response;
            console.log("volvio");
            reloadNotificaciones();
            if(SMV.layerNotif){
                SMV.layerNotif.setStyle(getStyleNotificaciones);
            }else{
                SMV.layerNotif = L.geoJson(departamentos,  {style: getStyleNotificaciones, onEachFeature:onEachFeatureNotificaciones});   
            }
            
        },
        error: function(xhr) {
            console.log('errror');
        }
    });
}


function getColorNotificaciones(d) {
    
    return    d > 700    ? '#FE0516' :
            d > 600    ? '#FD1E0F' :
            d > 500    ? '#FD4619' :
            d > 400    ? '#FD6C24' :
            d > 300    ? '#FD8E2E' :
            d > 200    ? '#FDAE39' :
            d > 100    ? '#FDCB43' :
            d > 90    ? '#FDE54E' :
            d > 70    ? '#FDFC58' :
            d > 30    ? '#E9FD62' :
            d > 20    ? '#D7FD6D' :
            d > 10    ? '#C8FD77' :
            d > 1    ? '#BCFD82' :
                        '#FFFFFF';
}

function getStyleNotificaciones (feature) {
    var n = feature.properties.DPTO_DESC;
    var mapSem = SMV.mapSemFil;    
    var color = 'NONE';

    try{
        color = mapSem[n]["cantidad"];
    }catch(e){
    }
 
    return { weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.8, 
        fillColor: getColorNotificaciones(color) 
    };
    
}


function onEachFeatureNotificaciones(feature, layer) {
    layer.on({
        mouseover: mouseoverNotificaciones,
        mouseout: mouseoutNotificaciones,
    });
}
/*Evento al ubicarse el puntero sobre un distrito*/
function mouseoverNotificaciones(e) {
    var layer = e.target;
     layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: ''
        
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    SMV.info.update(layer.feature.properties);
}

/*Evento al salir el puntero de un distrito*/
function mouseoutNotificaciones(e) {
    SMV.layerNotif.resetStyle(e.target);
    SMV.info.update();
}