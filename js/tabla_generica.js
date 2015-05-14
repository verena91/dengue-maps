function draw_table(columns, url, id_tabla) {

	for (var i = 0; i < columns.length; i++) {
		$(id_tabla + ' tfoot tr').append('<th></th>');
	}

	$(id_tabla)
			.dataTable(
					{
						"processing" : true,
						"serverSide" : true,
						"ajax" : {
							"url" : url,
							"beforeSend" : function(xhr) {
								xhr.setRequestHeader('Accept',
										'application/json');
							}
						},
						"language" : {
							"sProcessing" : "Procesando...",
							"sLengthMenu" : "Mostrar _MENU_ registros",
							"sZeroRecords" : "No se encontraron resultados",
							"sEmptyTable" : "Ningún dato disponible en esta tabla",
							"sInfo" : "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
							"sInfoEmpty" : "Mostrando registros del 0 al 0 de un total de 0 registros",
							"sInfoFiltered" : "(filtrado de un total de _MAX_ registros)",
							"sInfoPostFix" : "",
							"sSearch" : "Buscar:",
							"sUrl" : "",
							"sInfoThousands" : ",",
							"sLoadingRecords" : "Cargando...",
							"oPaginate" : {
								"sFirst" : "Primero",
								"sLast" : "Último",
								"sNext" : "Siguiente",
								"sPrevious" : "Anterior"
							},
							"oAria" : {
								"sSortAscending" : ": Activar para ordenar la columna de manera ascendente",
								"sSortDescending" : ": Activar para ordenar la columna de manera descendente"
							}
						},
						columns : columns,
					});

	// Setup - add a text input to each footer cell
	$(id_tabla + ' tfoot th').each(
			function() {
				var title = $(id_tabla + ' thead th').eq($(this).index()).text();
				$(this).html(
						'<input class="column-filter form-control input-sm" type="text" placeholder="'
								+ title + '" style="width: 100%;" />');
			});

	var table = $(id_tabla).DataTable();

	// Apply the search
	table.columns().eq(0).each(
			function(colIdx) {
				$('input', table.column(colIdx).footer()).on('keyup change',
						_.debounce(function(e) {
						    if(this.value.length >= 1 || e.keyCode == 13){
						    	table.column(colIdx).search(this.value).draw();
						    }
                            // Ensure we clear the search if they backspace far enough
                            if(this.value == "") {
                                table.column(colIdx).search("").draw();
                            }
						}, 500));
			});

	// Call datatables, and return the API to the variable for use in our code
    // Binds datatables to all elements with a class of datatable
    var dtable = $(id_tabla).dataTable().api();
    var generalFilter;

    // Grab the datatables input box and alter how it is bound to events
    $(".dataTables_filter input")
        .unbind() // Unbind previous default bindings
        .bind("keyup change", _.debounce(function(e) { // Bind our desired behavior
            // If the length is 3 or more characters, or the user pressed ENTER, search
            if(this.value.length >= 1 || e.keyCode == 13) {
                // Call the API search function
                dtable.search(this.value).draw();
            }
            // Ensure we clear the search if they backspace far enough
            if(this.value == "") {
                dtable.search("").draw();
            }
            return;
        }, 500));

	$('tfoot').insertAfter('thead');

	/* Apply the request for CSV download */
	$("#btn-descarga").on(
			'click',
			function() {
				var oTable = $(id_tabla).dataTable();
				var oParams = oTable.oApi
						._fnAjaxParameters(oTable.fnSettings());
				// console.log(oParams);
				$.ajax({
					type : 'GET',
					//url : 'http://localhost:9000/datos/tab/planificaciones?'
						//	+ $.param(oParams),
					url : url + '?' + $.param(oParams),
					beforeSend : function(xhr) {
						xhr.setRequestHeader('Accept', 'application/csv');
					},
					success : function(response) {
						/** Definir de donde sacar el nombre para el archivo de descarga **/
						var nameAux = url.split("/");
						var name = nameAux[nameAux.length - 1];
						// console.log(name);
						download(response, name + ".csv", "text/csv");
					},
					error : function() {
						console.log("error");
					}
				});
			});
	
	$(id_tabla).on( 'draw.dt', function () {
		var search = $('[type="search"]');
		search.addClass('form-control input-sm lista-search');

		var listaLength = $(id_tabla + '#lista_length select');
		listaLength.addClass('form-control input-sm lista-length');
		
		var spanToReplace = $('span > a + span');
		spanToReplace.replaceWith("<a class=\"paginate_button disabled\">...</a>");	
	} );

}
