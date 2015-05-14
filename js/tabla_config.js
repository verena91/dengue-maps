//var urlBase = "http://localhost:9000/datos/data/";
var urlBase = "http://localhost/denguemaps/rest/";

var notificacionColumns = [ 
        "Año", "Semana", "Departamento", "Distrito",
		"Sexo", "Edad", "Resultado", "Fecha notificacion", "ID"]; 
var reporteColumns = [ 
        "Cantidad", "Año", "Mes", "Día", "Semana", "Region", "País",
		"Nivel Adm. 1", "Nivel Adm. 2", "Nivel Adm. 3", "Sexo", "Grupo Edad", 
		"Estado Final", "Clasif. clínica", "Serotipo", "ID"]; 

var columnData = {
	'Año' : 'anio',
	'Semana' : 'semana',
	'Sexo' : 'sexo',
	'ID' : 'id',
	// Notificacion
	'Departamento' : 'departamento',
	'Distrito' : 'distrito',
	'Edad' : 'edad',
	'Resultado' : 'clasificacon_clinica',
	'Fecha notificacion' : 'fecha_notificacion',
	//Reporte
	'Cantidad' : 'cantidad',
	'Mes' : 'mes',
	'Día' : 'dia',
	'Region' : 'region',
	'País' : 'pais',
	'Nivel Adm. 1' : 'adm1',
	'Nivel Adm. 2' : 'adm2',
	'Nivel Adm. 3' : 'adm3',
	'Sexo' : 'sexo',
	'Grupo Edad' : 'grupo_edad',
	'Estado Final' : 'estado_final',
	'Clasif. clínica' : 'clasificacion_clinica',
	'Serotipo' : 'serotipo'
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
	
	if (modulo == "notificacion") {
		tableColumns = notificacionColumns;
	} else if (modulo == "reporte") {
		tableColumns = reporteColumns;
	} else {
		tableColumns = [];
	}

	urlBase = urlBase + modulo + "/lista";
	
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