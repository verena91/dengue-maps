$(document).ready(function(){
  SMV.map = draw_map();
  //draw_table();
  draw_table_boot();
  draw_sidetag(map);
  $("#departamento").select2();
  $("#distrito").select2();
  $("#localidad").select2();
  add_filter_listeners(map);
  setup_modal_navigation();

});

function draw_map () {
  startLoading();

  L.mapbox.accessToken = 'pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg';

  var mapbox = L.tileLayer(
               'http://api.tiles.mapbox.com/v4/rparra.jmk7g7ep/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg'
                                ).on('load', finishedLoading);
  var osm = L.tileLayer(
               'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {minZoom: 3}
                                 ).on('load', finishedLoading);

  var ggl = new L.Google("HYBRID").on("MapObjectInitialized", setup_gmaps);


  var map = L.map('map', {maxZoom: 18, minZoom: 3, worldCopyJump: true, attributionControl: false}).setView([-23.388, -60.189], 7).on('baselayerchange', startLoading);
  
  var baseMaps = {
    "Calles": osm,
    "Terreno": mapbox,
    "Satélite": ggl
  };

  map.addLayer(osm);
  L.control.layers(baseMaps).addTo(map);

  var geoJson = L.mapbox.featureLayer();
  //var geoJson = L.mapbox.featureLayer(viviendas)

  geoJson.on('layeradd', function(e) {
    var marker = e.layer,
    feature = marker.feature;

    var icon_color = SMV.COLOR_MAP[feature.properties.departamento];
    var icon = L.mapbox.marker.icon();

    if(icon_color){
      icon = L.mapbox.marker.icon({'marker-color': icon_color});
    }
    marker.setIcon(icon);
  });

  //geoJson.setGeoJSON(viviendas);

  var markers = new L.MarkerClusterGroup({minZoom: 6});
  markers.addLayer(geoJson);
  markers.on('click', draw_popup);


  /*geoJson.setFilter(function(f) {
            console.log(f);
            return f.properties['distrito'] === 'PASO YOBAI';
        });

  markers.clearLayers();
  markers.addLayer(geoJson);*/
  map.addLayer(markers);
  SMV.markerLayer = markers;
  SMV.geoJsonLayer = geoJson;

  return map;
}

function draw_table_details ( d ) {
  var table = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
  for(var i = SMV.DATA_COLUMNS; i < SMV.TABLE_COLUMNS.length; i++){
    row = sprintf('<tr><td>%s:</td><td>%s</td></tr>', SMV.ATTR_TO_LABEL[SMV.TABLE_COLUMNS[i]], d[SMV.TABLE_COLUMNS[i]])
    table += row;
  }
  table += '</table>';
  return table;
}

function draw_table () {

  /*var dataset = viviendas.features.map(function(f){
                  return SMV.TABLE_COLUMNS.map(function(c){
                    return f.properties[c];
                  });
                });*/
  var dataset = viviendas.features.map(function(f){
    var result = f.properties;
    result.coordinates = f.geometry.coordinates;
    return result;
  })

  for(var i=0; i<SMV.TABLE_COLUMNS.length + SMV.BUTTON_COLUMNS; i++){
    $('#lista tfoot tr').append('<th></th>');
  }

  var columns = SMV.TABLE_COLUMNS.map(function(c, i){
    return { 
        "title": SMV.ATTR_TO_LABEL[c],
        "data": c,
        "visible": (i < SMV.DATA_COLUMNS),
        "defaultContent": ""
      };
  });

  columns.unshift({
                "class":          'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
            {
                "class":          'map-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            });

  // DataTable
  var table = $('#lista').DataTable({
    "language": {
      "sProcessing":     "Procesando...",
      "sLengthMenu":     "Mostrar _MENU_ registros",
      "sZeroRecords":    "No se encontraron resultados",
      "sEmptyTable":     "Ningún dato disponible en esta tabla",
      "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
      "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
      "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
      "sInfoPostFix":    "",
      "sSearch":         "Buscar:",
      "sUrl":            "",
      "sInfoThousands":  ",",
      "sLoadingRecords": "Cargando...",
      "oPaginate": {
          "sFirst":    "Primero",
          "sLast":     "Último",
          "sNext":     "Siguiente",
          "sPrevious": "Anterior"
      },
      "oAria": {
          "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
          "sSortDescending": ": Activar para ordenar la columna de manera descendente"
      }
    },
    "data": dataset,
    "columns": columns,
    "order": [[ 2, "asc" ]]
  });

  // Add event listener for opening and closing details
  $('#lista tbody').on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr');
      var row = table.row( tr );

      if ( row.child.isShown() ) {
          // This row is already open - close it
          row.child.hide();
          tr.removeClass('shown');
      }
      else {
          // Open this row
          row.child( draw_table_details(row.data()) ).show();
          tr.addClass('shown');
      }
  } );

  $('#lista tbody').on('click', 'td.map-control', function () {
    var tr = $(this).closest('tr');
    var row = table.row( tr );
    go_to_feature(row.data().coordinates);
  });

  // Setup - add a text input to each footer cell
  $('#lista tfoot th:not(:first, :nth-of-type(2))').each( function () {
      var title = $('#lista thead th').eq( $(this).index() ).text();
      $(this).html( '<input class="column-filter" type="text" placeholder="Buscar '+title+'" />' );
  } );

  // Apply the search
  table.columns().eq( 0 ).each( function ( colIdx ) {
      $( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {
          table
              .column( colIdx )
              .search( this.value )
              .draw();
      } );
  } );
  $('tfoot').insertAfter('thead');
}

function go_to_feature(target){
  SMV.markerLayer.eachLayer(function(marker) {
        var t = L.latLng(target[1], target[0]);
        if(t.equals(marker.getLatLng())){
          $('#section-mapa').on('transitionend', function(){
            SMV.map.setView(t, 18);
            marker.fireEvent('click', {layer: marker});
            $(this).off('transitionend');
          });

          $(".navbar-nav>li>a[href=#section-mapa]").click();
          
        }
    });

}

function draw_sidetag(map){
  $('#opener').on('click', function() {   
    var panel = $('#slide-panel');
    if (panel.hasClass("visible")) {
       panel.removeClass('visible').css({'margin-left':'-300px'});
    } else {
      panel.addClass('visible').css({'margin-left':'0px'});
    }
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-down");
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-up");
    map.invalidateSize();
    return false; 
  });

  $('.navbar-nav>li>a').bind('click', function (e) {
    if($(this).attr('href') === '#section-mapa'){
      $('#opener').show();
    }else{
      if ($('#slide-panel').hasClass("visible")) {
        $('#opener').click();
      }
      $('#opener').hide();
    }
  });
}

function draw_popup(target){
  var content = draw_popup_tabs(SMV.POPUP_ROWS);

  content += draw_popup_tables(target.layer.feature.properties, SMV.POPUP_ROWS);
  //content += draw_popup_album(["img/casa1.jpg", "img/plano1.png", "img/casa2.jpg", "img/plano2.png"]);
  var popup = new L.Popup({
    minWidth: 400,
    className: "marker-popup"
  }).setContent(content);
  target.layer.bindPopup(popup).openPopup();
  setup_modal();

  $('.flexslider').flexslider({
    animation: "slide"
  });


}

function draw_popup_tables(properties, attrs_by_tab){
  var d = '<div class="tab-content">';
  var c = 0;
  for (key in attrs_by_tab) {
    if (attrs_by_tab.hasOwnProperty(key)) {
      var id = removeAccents(key.toLowerCase().split(" ").join("-"));
      if(c == 0){
        d += sprintf('<div class="tab-pane active" id="%s">', id);
        //d += draw_popup_album(["img/casa1.jpg", "img/plano1.png", "img/casa2.jpg", "img/plano2.png"]);
        d += draw_popup_album(["img/casa1.jpg", "img/casa2.jpg"]);
      }else{
        d += sprintf('<div class="tab-pane" id="%s">', id);
      }
      
      d += draw_popup_table(properties, attrs_by_tab[key]) + "</div>";
      c++;
    }
  }
  d += "</div>";
  return d;
}

function draw_popup_table (properties, attrs){
  var t = "<table id=\'popup-table\' class=\'table table-striped popup-table table-condensed\'><tbody>";
  for (var i = 0; i < attrs.length; i++) {
    var key = attrs[i];
    if (properties.hasOwnProperty(key)) {
      t += draw_popup_table_row(key, properties[key]);
    }
  }
  t += "</tbody></table>";
  return t;
}

function draw_popup_tabs(tabs){
  var r = '<ul class="nav nav-tabs" role="tablist">'
  var c = 0
  for (k in tabs) {
    if(tabs.hasOwnProperty(k)){
      var href = removeAccents(k.toLowerCase().split(" ").join("-"));
      if(c == 0){
        r += sprintf('<li class="active"><a href="#%s" role="tab" data-toggle="tab">%s</a></li>', href, k);
      }else{
        r += sprintf('<li><a href="#%s" role="tab" data-toggle="tab">%s</a></li>', href, k);
      }
      c++;
    }
  }
  r += '</ul>'
  return r;
}

function draw_popup_table_row(key, value){
  return sprintf("<tr><td class=\'attr-title\'>%s</td><td>%s</td></tr>", SMV.ATTR_TO_LABEL[key], value);
}

function draw_popup_album(imgs){
  var a = "<div id=\'album-container\' class=\'flexslider\'><ul class=\'slides row\'>";
  for (var i = 0; i < imgs.length; i++) {
    a += draw_popup_album_photo(imgs[i]);
  }
  a += "</ul></div>"
  return a;
}

function draw_popup_album_photo(img){
  console.log(img);
  return sprintf("<li><img class=\'img-responsive\' src=\'%s\'/></li>", img);
}

function setup_modal(){
  $("#headerPreview").modal('show').css(
    {
        'margin-top': function () {
            return -($(this).height() / 2);
        },
        'margin-left': function () {
            return -($(this).width() / 2);
        }
    })

  $('li img').on('click',function(){
    var src = $(this).attr('src');
    var img = '<img src="' + src + '" class="img-responsive"/>';

    var index = $(this).parent('li').index();

    var html = '';
    html += img;                
    html += '<div style="height:25px;clear:both;display:block;">';
    html += '<a class="controls next" href="' + (index + 2) + '">siguiente &raquo;</a>';
    html += '<a class="controls previous" href="' + (index) + '">&laquo; anterior</a>';
    html += '</div>';

    $('#photo-modal').modal();
    $('#photo-modal').on('shown.bs.modal', function(){
      $('#photo-modal .modal-body').html(html);
      //this will hide or show the right links:
      $('a.controls').trigger('click');
    });
    $('#photo-modal').on('hidden.bs.modal', function(){
      $('#photo-modal .modal-body').html('');
    });
  });  
}

function setup_modal_navigation() {
  $(document).on('click', 'a.controls', function(e){
    var index = $(this).attr('href');
    var src = $('ul.row li:nth-child('+ (index) +') img').attr('src');
    $('.modal-body img').attr('src', src);

    var newPrevIndex = parseInt(index) - 1; 
    var newNextIndex = parseInt(newPrevIndex) + 2; 
 
    if($(this).hasClass('previous')){               
        $(this).attr('href', newPrevIndex); 
        $('a.next').attr('href', newNextIndex);
    }else{
        $(this).attr('href', newNextIndex); 
        $('a.previous').attr('href', newPrevIndex);
    }

    var total = ($('ul.row li').length);

    //hide next button
    if(total === newNextIndex){
        $('a.next').hide();
    }else{
        $('a.next').show()
    }            
    //hide previous button
    if(newPrevIndex === 1){
        $('a.previous').hide();
    }else{
        $('a.previous').show()
    }

    return false;
  });
}

function startLoading() {
  var spinner = new Spinner({
    color: "#5bc0de",
    radius: 30,
    width: 15,
    length: 20
  }).spin();
  $("#loader").removeClass().append(spinner.el);
}

function finishedLoading() {
  // first, toggle the class 'done', which makes the loading screen
  // fade out
  var loader = $("#loader");
  loader.addClass('done');
  setTimeout(function() {
      // then, after a half-second, add the class 'hide', which hides
      // it completely and ensures that the user can interact with the
      // map again.
      loader.addClass('hide');
      loader.empty();
  }, 200);
}

function setup_gmaps(){
  google.maps.event.addListenerOnce(this._google, 'tilesloaded', finishedLoading);
}

function add_filter_listeners(map){
  $("#resultado li input[value='Todos']").change(function(){
    var checked = $(this).prop('checked');
    $("#resultado li input").prop('checked', this.checked);
  });

  $('#resultado li input, #departamento, #distrito, #localidad').change(function(){
    update_filters(map);
  });

  $("#tipo li input[value='Todos']").change(function(){
    var checked = $(this).prop('checked');
    $("#tipo li input").prop('checked', this.checked);
  });

  $('#tipo li input, #departamento, #distrito, #localidad').change(function(){
    update_filters_2(map);
  });

  $("#anio li input[value='Todos']").change(function(){
    var checked = $(this).prop('checked');
    $("#anio li input").prop('checked', this.checked);
  });

  $('#anio li input, #departamento, #distrito, #localidad').change(function(){
    update_filters_2(map);
  });

}

// This function is called whenever someone clicks on a checkbox and changes
// the selection of markers to be displayed.
function update_filters() {
  var proyectos = get_selected_checkbox('#resultado li input');
  var departamentos = get_selected_combo('#departamento');

  SMV.geoJsonLayer.setFilter(function(feature) {
    // If this symbol is in the list, return true. if not, return false.
    // The 'in' operator in javascript does exactly that: given a string
    // or number, it says if that is in a object.
    // 2 in { 2: true } // true
    // 2 in { } // false
    var proyectoFilter =  feature.properties['Resultado'] in proyectos;
    var departamentoFilter = $.isEmptyObject(departamentos) || feature.properties['Departamento'].toLowerCase() in departamentos;

    var showMarker = departamentoFilter;
 
    return (showMarker);
  });

  SMV.markerLayer.clearLayers();
  SMV.markerLayer.addLayer(SMV.geoJsonLayer);
}

function update_filters_2() {
  var proyectos = get_selected_checkbox('#tipo li input');
  var departamentos = get_selected_combo('#departamento');

  SMV.geoJsonLayer.setFilter(function(feature) {
    // If this symbol is in the list, return true. if not, return false.
    // The 'in' operator in javascript does exactly that: given a string
    // or number, it says if that is in a object.
    // 2 in { 2: true } // true
    // 2 in { } // false
    var proyectoFilter =  feature.properties['Serotipo'] in proyectos;
    var departamentoFilter = $.isEmptyObject(departamentos) || feature.properties['Departamento'].toLowerCase() in departamentos;

    var showMarker = departamentoFilter;
 
    return (showMarker);
  });

  SMV.markerLayer.clearLayers();
  SMV.markerLayer.addLayer(SMV.geoJsonLayer);
}

function update_filters_3() {
  var proyectos = get_selected_checkbox('#anio li input');
  var departamentos = get_selected_combo('#departamento');

  SMV.geoJsonLayer.setFilter(function(feature) {
    // If this symbol is in the list, return true. if not, return false.
    // The 'in' operator in javascript does exactly that: given a string
    // or number, it says if that is in a object.
    // 2 in { 2: true } // true
    // 2 in { } // false
    var proyectoFilter =  feature.properties['Serotipo'] in proyectos;
    var departamentoFilter = $.isEmptyObject(departamentos) || feature.properties['Departamento'].toLowerCase() in departamentos;

    var showMarker = departamentoFilter;
 
    return (showMarker);
  });

  SMV.markerLayer.clearLayers();
  SMV.markerLayer.addLayer(SMV.geoJsonLayer);
}

function get_selected_checkbox(selector){
  var checkboxes = $(selector);
  var enabled = {};
  // Run through each checkbox and record whether it is checked. If it is,
  // add it to the object of types to display, otherwise do not.
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) enabled[checkboxes[i].value] = true;
  }
  return enabled;
}

function get_selected_combo(selector){
  var value = $(selector).select2('val');
  console.log(value);
  var enabled = {};
  // Run through each checkbox and record whether it is checked. If it is,
  // add it to the object of types to display, otherwise do not.
  for (var i = 0; i < value.length; i++) {
    enabled[value[i].toLowerCase()] = true;
  }
  return enabled;
}

/*Utilitario para eliminar acentos de la cadena, para poder comparar las claves
(nombre del departamento) del servicio (BD MEC) con las del GEOJSON*/
function removeAccents(strAccents) {
    var strAccents = strAccents.split('');
    var strAccentsOut = new Array();
    var strAccentsLen = strAccents.length;
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñÿý';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (var y = 0; y < strAccentsLen; y++) {
        if (accents.indexOf(strAccents[y]) != -1) {
            strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
        } else
            strAccentsOut[y] = strAccents[y];
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
}

function draw_table_boot(){
  $(function () {
        $('#table-javascript').bootstrapTable({
            method: 'get',
            url: 'dengue.json',
            cache: false,
            height: 400,
            striped: true,
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50, 100, 200],
            search: true,
            showColumns: true,
            showRefresh: true,
            minimumCountColumns: 2,
            clickToSelect: true,
            columns: [{
                field: 'state',
                valign: 'middle',
                checkbox: true
            }, {
                field: 'ID',
                title: 'ID',
                align: 'right',
                sortable: true
            }, {
                field: 'semana',
                title: 'Semana',
                align: 'center',
                sortable: true
            }, {
                field: 'anio',
                title: 'Año',
                align: 'center',
                sortable: true
            }, {
                field: 'departamento',
                title: 'Departamento',
                align: 'center',
                sortable: true
            }, {
                field: 'distrito',
                title: 'Distrito',
                align: 'center',
                sortable: true
            }, {
                field: 'barrio',
                title: 'Barrio',
                align: 'center',
                sortable: true
            }, {
                field: 'resultado',
                title: 'Resultado',
                align: 'center',
                sortable: true
            }, {
                field: 'clasificacon_clinica',
                title: 'Clasificación',
                align: 'center',
                sortable: true
            }]
        });
    });
}