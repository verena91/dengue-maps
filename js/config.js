var SMV = SMV || {};

SMV.ATTR_TO_LABEL = {
            Anio: 'Año',
            Semana: 'Semana',
            'Fecha de notificacion': 'Fecha de notificación',
            Departamento: 'Departamento',
            Distrito: 'Distrito',
            Sexo: 'Sexo',
            Edad: 'Edad',
            Clasificacion: 'Clasificación',
        };


SMV.TABLE_COLUMNS = ["Anio", "Semana", "Fecha de notificacion", "Departamento", "Distrito", "Sexo", "Edad",
              "Clasificacion"];

SMV.DATA_COLUMNS = 8;

SMV.LAYERS = function(){
    var mapbox = L.tileLayer(
        'http://api.tiles.mapbox.com/v4/rparra.jmk7g7ep/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg');
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {minZoom: 3});
    var gglHybrid = new L.Google("HYBRID");
    var gglRoadmap = new L.Google("ROADMAP");
    return {
        MAPBOX: mapbox,
        OPEN_STREET_MAPS: osm,
        GOOGLE_HYBRID: gglHybrid,
        GOOGLE_ROADMAP: gglRoadmap
    } 
}