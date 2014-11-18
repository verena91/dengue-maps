$(document).ready(function() {
    var mapTabActive = check_url();
    SMV.map = draw_map();
    draw_table();
    draw_sidetag(map, !mapTabActive);
    //draw_or_defer_map(mapTabActive);
    $("#departamento").select2();
    $("#distrito").select2();
    $("#localidad").select2();
    add_filter_listeners(map);
    setup_modal_navigation();
    setup_intro();
    $( "#slidersemana" ).on( 'change.bfhslider', function( event ) {
        SMV.semana= event.target.innerText;
        reloadMapSem(event.target.innerText);
        SMV.geoJsonLayer.setStyle(getStyle);
        if(SMV.inzoom){
            SMV.layerActual.setStyle(getStyleDrillDown);
        }
        console.log('se movio el slide');
    });

    // Pruebas con el slider
    //var $slider2 = $("#slider2").slider({ max: 20 , value: 10 });
    //$slider2.slider("pips");
    //$('#slider2').slider().slider('pips').slider('pips');

});

function check_url(){
    // Javascript to enable link to tab
    var url = document.location.toString();
    var hash = url.split('#')[1] || 'mapa';
    if (url.match('#')) {
        $('.navbar-nav a[href=#'+hash+']').tab('show') ;
    }

    // Change hash for page-reload
    $('.navbar-nav a').on('click', function (e) {
        window.location.hash = e.target.hash;
    })
    return !_(['listado', 'acerca-de', 'contacto']).contains(hash);
}

function draw_table() {

    for(var i=0; i<SMV.TABLE_COLUMNS.length; i++){
        $('#lista tfoot tr').append('<th></th>');
    }

    /*var columns = SMV.TABLE_COLUMNS.map(function(c, i){
        return {
            "title": SMV.ATTR_TO_LABEL[c],
            "data": c,
            "visible": (i < SMV.DATA_COLUMNS),
            "defaultContent": ""
        };
    });*/

    var table = $("#lista").dataTable( {
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
        //"columns": columns,
        /*"aoColumnDefs" : [
        {
            "aTargets" : [ 0, 1, 5 , 6 ],
            //"sWidth" : "50px",
            "sClass" : "alignRight"
        }],*/
        "fnRowCallback"  : function(nRow,aData,iDisplayIndex) {
                                  $('td:eq(0)', nRow).css( "text-align", "right" );
                                  $('td:eq(1)', nRow).css( "text-align", "right" );
                                  $('td:eq(5)', nRow).css( "text-align", "right" );
                                  $('td:eq(6)', nRow).css( "text-align", "right" );
                                  return nRow;
        },
        "processing": true,
        "serverSide": true,
        "ajax": "http://localhost/denguemaps/rest/notificacion"
    } );

    $('#lista tfoot th').each( function () {
        var title = $('#lista thead th').eq( $(this).index() ).text();
        $(this).html( '<input class="column-filter form-control input-sm" type="text" placeholder="Buscar '+title+'" />' );
    });

    // Apply the search
    /*table.columns().eq(0).each( function (colIdx) {
        $( 'input', table.column(colIdx).footer()).on( 'keyup change', function(){
        table
            .column(colIdx)
            .search(this.value)
            .draw();
        });
    });*/

    $('tfoot').insertAfter('thead');
    $('#download-footer').insertAfter('.row:last');
    SMV.table = table;
}


function draw_or_defer_map(mapTabActive){
  if(mapTabActive){
    SMV.map = draw_map();
  }else{
    finishedLoading();
    $('.navbar-nav a').on('click', function (e) {
      if(e.target.hash === '#mapa' && !!! SMV.map){
        SMV.map = draw_map();
      }
    });
  }
}

function draw_map() {
    startLoading();

    L.mapbox.accessToken = 'pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg';

    var layers =  SMV.LAYERS();
    var mapbox = layers.MAPBOX.on('load', finishedLoading);
    var osm = layers.OPEN_STREET_MAPS.on('load', finishedLoading);

    var gglHybrid = layers.GOOGLE_HYBRID.on("MapObjectInitialized", setup_gmaps);
    var gglRoadmap = layers.GOOGLE_ROADMAP.on("MapObjectInitialized", setup_gmaps);

    /*var notif = JSON.parse(not_por_sem_ej);
    console.log(notif);*/
    loadDrillDownDep();
    var map = L.map('map', {
        maxZoom: 18,
        minZoom: 3,
        worldCopyJump: true,
        attributionControl: false
    }).setView([-23.388, -60.189], 7).on('baselayerchange', startLoading);

    var baseMaps = {
    "Calles OpenStreetMap": osm,
    "Terreno": mapbox,
    "Satélite": gglHybrid,
    "Calles Google Maps": gglRoadmap
    };
    SMV.inzoom = false;
    SMV.riesgoJson = riesgo13;
    SMV.riesgoDisJson = riesgoDis13;
    SMV.riesgoAsuJson =  riesgoAsu13;

    SMV.semana = $( "#slidersemana" ).data('value');
    reloadMapSem();
    map.addLayer(mapbox);
    L.control.layers(baseMaps).addTo(map);

   // var geoJson = L.mapbox.featureLayer(viviendas);
    /*Se añade capa de departamentos*/
    var statesLayer = L.geoJson(departamentos,  {style: getStyle, onEachFeature: onEachFeature}).addTo(map);
    SMV.geoJsonLayer = statesLayer;

/*
    geoJson.on('layeradd', function(e) {
        var marker = e.layer,
            feature = marker.feature;

        var icon_color = SMV.COLOR_MAP[feature.properties.departamento];
        var icon = L.mapbox.marker.icon();

        if (icon_color) {
            icon = L.mapbox.marker.icon({
                'marker-color': icon_color
            });
        }
        marker.setIcon(icon);
    });
*/

   /* var markers = new L.MarkerClusterGroup({
        minZoom: 6
    });
    markers.addLayer(geoJson);
    markers.on('click', draw_popup);*/

    /*geoJson.setFilter(function(f) {
            console.log(f);
            return f.properties['distrito'] === 'PASO YOBAI';
        });

    markers.clearLayers();
    markers.addLayer(geoJson);
    map.addLayer(markers);
    SMV.markerLayer = markers;*/
    //SMV.geoJsonLayer = geoJson;

    var MyControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            //var container = L.DomUtil.create('div', 'my-custom-control');

            var controlDiv = L.DomUtil.create('div', 'leaflet-control-command');
            L.DomEvent
                .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', drillUp);

            var controlUI = L.DomUtil.create('div', 'leaflet-control-command-interior', controlDiv);
            //var label = L.DomUtil.create('input', 'leaflet-control-label', controlUI);
            //label.value='prueba';
            controlUI.title = 'Map Commands';
            //var controlUI = L.DomUtil.create('button', 'leaflet-control-command-interior', controlDiv);
            //controlUI.label='País';
            return controlDiv;

            //return container;
        }
    });
    SMV.backClass = MyControl;
    //map.addControl(new MyControl());

    var legend = L.control({
        position: 'bottomright'
    });
    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'), labels = [];
        labels.push('<i style="background:' + getColor('E') + '"></i> ' + 'Epidemia');
        labels.push('<i style="background:' + getColor('RA') + '"></i> ' + 'Riesgo alto');
        labels.push('<i style="background:' + getColor('RM') + '"></i> ' + 'Riesgo medio');
        labels.push('<i style="background:' + getColor('RB') + '"></i> ' + 'Riesgo bajo');
        div.innerHTML = '<span>Umbrales de riesgo</span><br>' + labels.join('<br>')
        return div;
    };
    legend.addTo(map);
    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    info.update = function (props) {
        if(props){
            var anio = SMV.anio;
            var semana = SMV.semana;
            var dep = props.DPTO_DESC;
            var mapSem = SMV.mapNotif;
            var nroNS = '0';
            try{
                nroNS = mapSem[dep]["cantidad"];
            }catch(e){

            }
          this._div.innerHTML =  '<h2>Año: '+anio+'<\/h2><h2>Semana: '+semana+'<\/h2><h2>Dpto: '+dep+'<\/h2><h2>Notificaciones: '+nroNS+'<\/h2>';
        }
    };
    info.updateDrillDown = function (props){
        if(props){
            var anio = SMV.anio;
            var semana = SMV.semana;
            var dep = props.DPTO_DESC;
            var dis = props.DIST_DESC;
            var mapSem = SMV.mapNotifDis;
            var nroNS = '0';
            
            var info;
            if(dep == 'ASUNCION'){
                var key = dep+'-'+props.BARLO_DESC;
                try{
                    nroNS = mapSem[key]["cantidad"];
                }catch(e){

                }
                info = '<h2>Año: '+anio+'<\/h2><h2>Semana: '+semana+'<\/h2><h2>Dpto: '+dep+'<\/h2><h2>Distrito: '+dis+'<\/h2><h2>Barrio: '+props.BARLO_DESC+'<\/h2><h2>Notificaciones: '+nroNS+'<\/h2>';
            } else {
                var key = dep+'-'+dis;
                try{
                    nroNS = mapSem[key]["cantidad"];
                }catch(e){

                }
                info = '<h2>Año: '+anio+'<\/h2><h2>Semana: '+semana+'<\/h2><h2>Dpto: '+dep+'<\/h2><h2>Distrito: '+dis+'<\/h2><h2>Notificaciones: '+nroNS+'<\/h2>';
            }
          this._div.innerHTML =  info;
        }
    };
    info.addTo(map);
    SMV.info = info;

    return map;
}

// This function is called whenever someone clicks on a checkbox and changes
// the selection of markers to be displayed.
function update_filters() {
    var proyectos = get_selected_checkbox('#resultado li input');
    var anio = get_selected_combo('#distrito');
    SMV.anio = anio;

    var riesgo;
    var riesgoDistritos;
    var riesgoAsu;
    if(anio=='2009'){
        riesgo = riesgo9;
        riesgoDistritos = riesgoDis9;
        riesgoAsu = riesgoAsu9;
    }else if (anio=='2010'){
        riesgo = riesgo10;
        riesgoDistritos = riesgoDis10;
        riesgoAsu = riesgoAsu10;
    }else if (anio=='2011'){
        riesgo = riesgo11;
        riesgoDistritos = riesgoDis11;
        riesgoAsu = riesgoAsu11;
    }else if (anio=='2012'){
        riesgo = riesgo12;
        riesgoDistritos = riesgoDis12;
        riesgoAsu = riesgoAsu12;
    }else if (anio=='2013'){
        riesgo = riesgo13;
        riesgoDistritos = riesgoDis13;
        riesgoAsu = riesgoAsu13;
        console.log()
    }

    SMV.riesgoJson = riesgo;
    SMV.riesgoDisJson = riesgoDistritos;
    SMV.riesgoAsuJson = riesgoAsu;
    reloadMapSem();
    if(SMV.inzoom){
        console.log('hay layer');
        SMV.layerActual.setStyle(getStyleDrillDown);
    }else{
         SMV.geoJsonLayer.setStyle(getStyle);     
    }
   
    
}

function get_selected_combo(selector) {
    var value = $(selector).select2('val');

    return value;
}

function go_to_feature(target) {
    SMV.markerLayer.eachLayer(function(marker) {
        var t = L.latLng(target[1], target[0]);
        if (t.equals(marker.getLatLng())) {
            $('#mapa').on('transitionend', function() {
                SMV.map.setView(t, 18);
                marker.fireEvent('click', {
                    layer: marker
                });
                $(this).off('transitionend');
            });

            $(".navbar-nav>li>a[href=#mapa]").click();

        }
    });

}

function draw_sidetag(map, hide) {
    $('#opener').on('click', function() {
    var panel = $('#slide-panel');
    if (panel.hasClass("visible")) {
       panel.removeClass('visible').animate({'margin-left':'-300px'});
       $('#slide-tag').animate({'margin-left':'-300px'});
    } else {
      panel.addClass('visible').animate({'margin-left':'0px'});
      $('#slide-tag').animate({'margin-left':'0px'});
    }
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-down");
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-up");
    return false;
    });

    $('.navbar-nav>li>a').bind('click', function (e) {
        if($(this).attr('href') === '#mapa'){
          $('#opener').show();
          $('body').css('overflow', 'hidden');
          $('#opener').click();
        }
        if($(this).attr('href') === '#listado' ||
          $(this).attr('href') === '#acerca-de' ||
            $(this).attr('href') === '#contacto'){

          $('body').css('overflow', 'auto');
          if ($('#slide-panel').hasClass("visible")) {
            $('#opener').click();
          }
          $('#opener').hide();
        }
      });

    if(hide){
        $('#opener').hide();
    }

}

function setup_modal() {
    $("#headerPreview").modal('show').css({
        'margin-top': function() {
            return -($(this).height() / 2);
        },
        'margin-left': function() {
            return -($(this).width() / 2);
        }
    })

    $('li img').on('click', function() {
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
        $('#photo-modal').on('shown.bs.modal', function() {
            $('#photo-modal .modal-body').html(html);
            //this will hide or show the right links:
            $('a.controls').trigger('click');
        });
        $('#photo-modal').on('hidden.bs.modal', function() {
            $('#photo-modal .modal-body').html('');
        });
    });
}

function setup_modal_navigation() {

    $(document).on('click', 'a.controls', function(e) {
        var index = $(this).attr('href');
        var src = $('ul.row li:nth-child(' + (index) + ') img').attr('src');
        $('.modal-body img').attr('src', src);

        var newPrevIndex = parseInt(index) - 1;
        var newNextIndex = parseInt(newPrevIndex) + 2;

        if ($(this).hasClass('previous')) {
            $(this).attr('href', newPrevIndex);
            $('a.next').attr('href', newNextIndex);
        } else {
            $(this).attr('href', newNextIndex);
            $('a.previous').attr('href', newPrevIndex);
        }

        var total = ($('ul.row li').length);

        //hide next button
        if (total === newNextIndex) {
            $('a.next').hide();
        } else {
            $('a.next').show()
        }
        //hide previous button
        if (newPrevIndex === 1) {
            $('a.previous').hide();
        } else {
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

function setup_gmaps() {

    google.maps.event.addListenerOnce(this._google, 'tilesloaded', finishedLoading);
}

function add_filter_listeners(map) {
    $("#resultado li input[value='Todos']").change(function() {
        var checked = $(this).prop('checked');
        $("#resultado li input").prop('checked', this.checked);
    });

    $('#resultado li input, #departamento, #distrito, #localidad').change(function() {
        update_filters(map);
    });

}

function get_selected_checkbox(selector) {
    var checkboxes = $(selector);
    var enabled = {};
    // Run through each checkbox and record whether it is checked. If it is,
    // add it to the object of types to display, otherwise do not.
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) enabled[checkboxes[i].value] = true;
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

function setup_checkbox_values(name, selector){
    var values = get_unique_values(name);

    _.each(values, function(d){
        var icon = SMV.ESTADO_TO_ICON_CSS[d] || '';
        var label = sprintf('<label class="btn btn-sm btn-primary %s"><input type="checkbox">%s</label>', icon, d);
        $(selector).append(label);
    });
}

function get_unique_values(prop){
    return _.chain(viviendas.features)
        .map(function(f){ return f.properties[prop]; })
        .unique()
        .sortBy(function(d){ return d; })
        .value();
}

/*function draw_table_boot() {
    $(function() {
        $('#table-javascript').bootstrapTable({
            method: 'get',
            //url:'http://localhost/denguemaps/rest/notificacion?page=' + page + '&limit=' + pagesize + '&sortField=id&sortOrder=asc',
            url: 'dengue.json',
            cache: false,
            height: 400,
            striped: true,
            //serverSide: true,
            pagination: true,
            //pageNumber:page,
            pageSize: 10,
            //totalRows: 250000,
            pageList: [10, 25, 50, 100, 200],
            search: true,
            showColumns: true,
            showRefresh: true,
            minimumCountColumns: 2,
            clickToSelect: true,
            //root:'list',
            columns: [{
                field: 'state',
                valign: 'middle',
                checkbox: true
            }, {
                field: 'id',
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
}*/

function setup_intro(){
    console.log('entro a setup_intro');
  var stepsMapa = [
    {
      intro: "Bienvenido a esta visualización interactiva.</br></br>Este tutorial te guiará paso a paso a través de las diferentes funcionalidades disponibles. \
      </br></br>Haz click en siguiente para comenzar."
    },
    {
      element: '#tab-mapa',
      intro: "En esta sección, puedes ver el mapa de riesgo del dengue en el Paraguay.",
      position: "right"
    },
    {
      element: '#slide-panel',
      intro: "Filtra las viviendas por departamento, distrito, programa o estado de la obra.",
      position: 'right'
    },
    {
      element: '.info-box',
      intro: "Aquí puedes ver un resumen del departamento/dsitrito visible en el mapa.",
      position: "left"
    },
    {
      element: '.leaflet-control-layers',
      intro: "Cambia el mapa base con este componente.</br></br>¿Te gustaría ver una imagen satelital? Es posible!",
      position: "left"
    },
    {
      element: '#tab-descargas',
      intro: "Haciendo click aquí puedes descargar los datos en formato CSV y JSON por año.",
      position: "right"
    },
    {
      element: '#tab-listado',
      intro: "En la sección de listado, puedes ver datos de las notificaciones de dengue de forma tabular. Visítala!",
      position: "right"
    }
  ];

  var stepsListado = [
    {
      intro: "Bienvenido a esta visualización interactiva.</br></br>Este tutorial te guiará paso a paso a través de las diferentes funcionalidades disponibles. \
      </br></br>Haz click en siguiente para comenzar."
    },
    {
      element: '#tab-listado',
      intro: "En esta sección, puedes ver datos de las notificaciones de dengue de forma tabular.",
      position: "right"
    },
    {
      element: document.querySelector('#lista_length label'),
      intro: "Selecciona la cantidad de filas por página de la tabla.",
      position: 'right'
    },
    {
      element: document.querySelector('#lista_filter label'),
      intro: "Filtra los resultados de acuerdo a los valores de cualquier campo.",
      position: "left"
    },
    {
      element: document.querySelectorAll('.column-filter')[0],
      intro: "O filtra de acuerdo a los valores de una columna en particular.",
    },
    {
      element: '#lista_info',
      intro: "Aquí puedes ver un resumen de los resultados de tu búsqueda.",
      position: "right"
    },
    {
      element: '#lista_paginate',
      intro: "Si los resultados son muchos, desplázate entre las páginas de la tabla.",
      position: "left"
    },
    {
      element: '#download-button-bar',
      intro: "Descarga los resultados filtrados en JSON o CSV.",
      position: "top"
    },
    {
      element: '#tab-descargas',
      intro: "O descarga todos los datos en formato Excel, CSV y JSON.",
      position: "right"
    },
    {
      element: '#tab-mapa',
      intro: "Por último, ¿ya visitaste la sección del mapa interactivo?",
      position: "right"
    },
  ];

  $('#start-tour').click(function(){
    console.log('cick en ayuda');
    var steps;
    switch($('.menu-wrapper ul li.active').attr('id')) {
      case "tab-mapa":
          steps = stepsMapa;
          break;
      case "tab-listado":
          steps = stepsListado;
          break;
      default:
          steps = false;
    }

    introJs().setOptions({
      doneLabel: 'Salir',
      nextLabel: 'Siguiente &rarr;',
      prevLabel: '&larr; Anterior',
      skipLabel: 'Salir',
      steps: steps
    }).start();
  });
}
