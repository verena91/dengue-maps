//var urlBase = "http://localhost:9000/datos/data/";
var urlBase = "http://localhost/denguemaps/rest/notificacion/lista";

var notificacionColumns = [ 
        "Año", "Semana", "Departamento", "Distrito",
		"Sexo", "Edad", "Resultado", "Fecha notificacion", "ID"]; 

var columnData = {
	// para planificacion
	'Año' : 'anio',
	'Semana' : 'semana',
	'Departamento' : 'departamento',
	'Distrito' : 'distrito',
	'Sexo' : 'sexo',
	'Edad' : 'edad',
	'Resultado' : 'clasificacon_clinica',
	'Fecha notificacion' : 'fecha_notificacion',
	'ID' : 'id'
};

var columnRenderers = {
	'Fecha notificacion' : function(data, type, full, meta) {
		var date = moment(data);
		if (type == "display" && date.isValid()) {
			return date.format('DD/MM/YYYY');
		}
		return data;
	}/*,
	'Monto' : function(data, type, full, meta) {
		return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}*/
}

function init_config(modulo) {
	/* Por medio del modulo obtener las columnas correspondientes */
	var tableColumns;
	
	if (modulo == "notificaciones") {
		tableColumns = notificacionColumns;
	} else {
		tableColumns = [];
	}
	
	var columnCount = tableColumns.length - 1;
	
	return columns = tableColumns.map(function(c, i) {
		return {
			"title" : c,
			"data" : columnData[c],
			"visible" : (i < columnCount),
			"defaultContent" : "",
			"render": columnRenderers[c]
		};
	});
}