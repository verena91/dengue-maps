
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
       
}
 /*Eventos para cada departamento*/
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: mouseover,
        mouseout: mouseout,
        click: zoomToFeature
    });
   
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
    }
   	SMV.inzoom = true;
   	SMV.geoJsonLayer.setStyle(getStyle);
    if(SMV.layerActual){
        SMV.map.removeLayer(SMV.layerActual);
    }
    SMV.layerActual = L.geoJson(json,  {style: getStyleDrillDown, onEachFeature: onEachFeatureDrillDown}).addTo(SMV.map);
    SMV.map.fitBounds(target.getBounds());

}
/*Color de cada riesgo*/
function getColor(d) {
    return d == 'E' ? '#FE0516' :
        d == 'RA' ? '#FF6905' :
        d == 'RM' ? '#FFB905' :
        '#FFF96D';
}
/*Estilo de la capa de departamento de acuedo a los valores de riesgo*/
function getStyle(feature) {
    var n = feature.properties.DPTO_DESC;
    var mapSem = SMV.mapNotif;
    var color = 'NONE';
    try{
        
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
    }
   try{
        color = mapSem[n]["riesgo"];
       
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
/*Se transforman los topojsons a geojson*/
function loadDrillDownDep(){

    var drillDown = new Object();
    drillDown['ASUNCION'] = topojson.feature(asuncion, asuncion.objects.asuncionGEO);
    drillDown['ALTO PARAGUAY'] = topojson.feature(altoparaguay, altoparaguay.objects.altoparaguayGEO);
    drillDown['ALTO PARANA'] = topojson.feature(altoparana, altoparana.objects.altoparanaGEO);
    drillDown['AMAMBAY'] =  topojson.feature(amambay, amambay.objects.amambayGEO);
    drillDown['BOQUERON'] = topojson.feature(boqueron, boqueron.objects.boqueronGEO);
    drillDown['CAAGUAZU'] = topojson.feature(caaguazu, caaguazu.objects.caaguazuGEO);
    drillDown['CAAZAPA'] = topojson.feature(caazapa, caazapa.objects.caazapaGEO);
    drillDown['CANINDEYU'] = topojson.feature(canindeyu, canindeyu.objects.canindeyuGEO);
    drillDown['CENTRAL'] = topojson.feature(central, central.objects.centralGEO);
    drillDown['CONCEPCION'] = topojson.feature(concepcion, concepcion.objects.concepcionGEO);
    drillDown['CORDILLERA'] = topojson.feature(cordillera, cordillera.objects.cordilleraGEO);
    drillDown['GUAIRA'] = topojson.feature(guaira, guaira.objects.guairaGEO);
    drillDown['ITAPUA'] = topojson.feature(itapua, itapua.objects.itapuaGEO);
    drillDown['MISIONES'] = topojson.feature(misiones, misiones.objects.misionesGEO);
    drillDown['ÑEEMBUCU'] = topojson.feature(neembucu, neembucu.objects.neembucuGEO);
    drillDown['PARAGUARI'] = topojson.feature(paraguari, paraguari.objects.paraguariGEO);
    drillDown['PRESIDENTE HAYES'] = topojson.feature(presidentehayes, presidentehayes.objects.presidentehayesGEO);
    drillDown['SAN PEDRO'] = topojson.feature(sanpedro, sanpedro.objects.sanpedroGEO);
    SMV.drillDown = drillDown;

}

function drillUp(){
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
    var data;
    //mientras hasta leer los filtros de la tabla
    var anio = SMV.anio;

    var variables = "&confirmado="+SMV.c+"&descartado="+SMV.d+"&sospechoso="+SMV.s;
    if(SMV.f==1 && SMV.m==1){
        variables =  variables + "&f=0&m=0";
    }else{
        variables =  variables + "&f="+SMV.f+"&m="+SMV.m;
    }
    $.ajax({
        url: "/denguemaps/rest/notificacion/filtrosmapa?anio=" + anio + variables,
        type:"get", //send it through get method
        //data: {ajaxid:4, UserID: UserID, EmailAddress:encodeURIComponent(EmailAddress)} 
        success: function(response) {
            SMV.resFiltro = response;
            
            reloadNotificaciones();
            if(SMV.layerNotif){
                SMV.layerNotif.setStyle(getStyleNotificaciones);
            }else{
                SMV.layerNotif = L.geoJson(SMV.departamentos,  {style: getStyleNotificaciones, onEachFeature:onEachFeatureNotificaciones});   
            }
            
        },
        error: function(xhr) {
            console.log('errror');
        }
    });
}


function getColorNotificaciones(d) {
    
    return    d > 1000    ? '#FE0516' :
            d > 500    ? '#FD6C24' :
            d > 100    ? '#FFC56E' :
            d > 50    ? '#FDFC58' :
            d > 20    ? '#DBFB69' :
            d > 10    ? '#BCFD82' :
            d > 1    ? '#8EF435' :
                        '#FFFFFF';
    /* return    d > 700    ? '#FE0516' :
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
                        '#FFFFFF';*/
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