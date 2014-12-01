$(document).ready(function() {
    var mapTabActive = check_url();
    SMV.map = draw_map();
    draw_table();
    draw_sidetag(map, false);
    open_sidetag ();
    //draw_or_defer_map(mapTabActive);
    $("#departamento").select2();
    $("#distrito").select2();
    $("#localidad").select2();
    add_filter_listeners(map);
    setup_modal_navigation();
    setup_intro();
    setup_semana_slider();
    setup_download_buttons();
    setup_opacity_slider();
    setup_anio_slider();

    //var $slider2 = $("#slider2").slider({ max: 20 , value: 10 });
    //$slider2.slider("pips");
    //$('#slider2').slider().slider('pips').slider('pips');
   
});

function open_sidetag () {
    var panel = $('#slide-panel');
    panel.addClass('visible').animate({'margin-left':'0px'});
    $('#slide-tag').animate({'margin-left':'0px'});
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-up");
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-down");
}

function setup_anio_slider () {
    $( "#anio2" ).slider({
        value: 2013,
        orientation: "horizontal",
        range: "min",
        min: 2009,
        max: 2013,
        animate: true,
        change: anioChange
    });
    $( "#amount" ).val( $( "#anio2" ).slider( "value" ) );
}

function setup_semana_slider() {
    $( "#slidersemana" ).on( 'change.bfhslider', function( event ) {
        SMV.semana = event.target.value;
        
        reloadMapSem();
        reloadNotificaciones();
        SMV.layerNotif.setStyle(getStyleNotificaciones);
        SMV.geoJsonLayer.setStyle(getStyle);
        if(SMV.inzoom){
            SMV.layerActual.setStyle(getStyleDrillDown);
        }
        
    });

    $('#slidersemana').on('mousedown', function (e) {
      $('html').disableSelection();
    });

    $('html').on('mouseup', function (e) {
        $('html').enableSelection();
    });
}

function setup_opacity_slider() {
    $( "#opacidad" ).slider({
        value: 7,
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 10,
        animate: true,
        change: opacityChange
    }); 
}

function anioChange (e, ui) {
    $( "#amount" ).val( $( "#anio2" ).slider( "value" ) );
    update_filters();
}

function opacityChange (e, ui) {

    var opaci = ui.value * 0.1;
    SMV.opacity = opaci;
    if(SMV.inzoom){
        SMV.layerActual.setStyle(getStyleDrillDown);
    }else{
        SMV.geoJsonLayer.setStyle(getStyle);
    }
    
}

function check_url(){
    // Javascript to enable link to tab
    var url = document.location.toString();
    var hash = url.split('#')[1] || 'mapa';
    if (url.match('#')) {
        $('.navbar-nav a[href=#'+hash+']').tab('show') ;
    }

    // Change hash for page-reload
   /* $('.navbar-nav a').on('click', function (e) {
        window.location.hash = e.target.hash;
    })*/
    return !_(['listado', 'acerca-de']).contains(hash);
}

/** Tabla **/

function draw_table() {

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
        "columns": [
            { "data": "anio", "width": "10%" },
            { "data": "semana", "width": "20%" },
            { "data": "fecha_notificacion", "width": "20%"  },
            { "data": "departamento", "width": "20%"  },
            { "data": "distrito", "width": "20%"  },
            { "data": "sexo", "width": "20%"  },
            { "data": "edad", "width": "20%"  },
            { "data": "clasificacon_clinica","width": "20%"  }
        ],
        "fnRowCallback"  : function(nRow,aData,iDisplayIndex) {
                                  $('td:eq(0)', nRow).css( "text-align", "right" );
                                  $('td:eq(1)', nRow).css( "text-align", "right" );
                                  $('td:eq(5)', nRow).css( "text-align", "right" );
                                  $('td:eq(6)', nRow).css( "text-align", "right" );
                                  return nRow;
        },
        "bAutoWidth": false,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource":  "http://localhost/denguemaps/rest/notificacion"
    } );
    $('#lista').dataTable()
        .columnFilter({
            aoColumns: [ { type: "text" },
                 { type: "text" },
                 { type: "text" },
                 { type: "text" },
                 { type: "text" },
                 { type: "text" },
                 { type: "text" },
                 { type: "text" }
            ]

    });

    $('#anioH').css("width","8%");
    $('#semanaH').css("width","9%");
    $('#fechaH').css("width","13%");
    $('#departamentoH').css("width","14%");
    $('#distritoH').css("width","25%");
    $('#sexoH').css("width","7%");
    $('#edadH').css("width","7%");
    $('#resultadoH').css("width","25%");

    $('#anioF').children().children().css("width","100%");
    $('#semanaF').children().children().css("width","100%");
    $('#fechaF').children().children().css("width","100%");
    $('#departamentoF').children().children().css("width","100%");
    $('#distritoF').children().children().css("width","100%");
    $('#sexoF').children().children().css("width","100%");
    $('#edadF').children().children().css("width","100%");
    $('#resultadoF').children().children().css("width","100%");

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

$(document).on( 'shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
   
   if(e.target.id == 'riesgo'){
        SMV.onriesgo = true;
        SMV.map.removeLayer(SMV.layerNotif);
        SMV.map.removeControl(SMV.legendNoti);
        SMV.map.addLayer(SMV.geoJsonLayer);
        SMV.map.addControl(SMV.legendRiesgo);
        if(SMV.inzoom){
            SMV.map.addLayer(SMV.layerActual);
        }
        
   }else if (e.target.id == 'notif') {
        SMV.onriesgo = false;
        SMV.map.removeControl(SMV.legendRiesgo);
        SMV.map.removeLayer(SMV.geoJsonLayer);
        if(SMV.inzoom){
            SMV.map.removeLayer(SMV.layerActual);
        }
        SMV.map.addLayer(SMV.layerNotif);
        SMV.map.addControl(SMV.legendNoti);
        //actualizarMapaNotif();
   }
})



function draw_map() {
    startLoading();

    L.mapbox.accessToken = 'pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg';

    var layers =  SMV.LAYERS();
    var mapbox = layers.MAPBOX.on('load', finishedLoading);
    var osm = layers.OPEN_STREET_MAPS.on('load', finishedLoading);

    var gglHybrid = layers.GOOGLE_HYBRID.on("MapObjectInitialized", setup_gmaps);
    var gglRoadmap = layers.GOOGLE_ROADMAP.on("MapObjectInitialized", setup_gmaps);

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
    SMV.anio='2013';
    SMV.inzoom = false;
    SMV.opacity = 0.7;
    SMV.firstTime = true;
    SMV.riesgoJson = riesgo13;
    SMV.riesgoDisJson = riesgoDis13;
    SMV.riesgoAsuJson =  riesgoAsu13;
    SMV.mapatype = 'mr';
    SMV.onriesgo = true;
    SMV.f=0;
    SMV.m=0;
    SMV.c=0;
    SMV.d=0;
    SMV.s=0;
    descargarFiltradosJsonMap();

    SMV.semana = $( "#slidersemana" ).data('value');
    reloadMapSem();
    map.addLayer(gglRoadmap);
    L.control.layers(baseMaps).addTo(map);

   // var geoJson = L.mapbox.featureLayer(viviendas);
    /*Se añade capa de departamentos*/
    
    var statesLayer = L.geoJson(departamentos,  {style: getStyle, onEachFeature: onEachFeature}).addTo(map);
    SMV.geoJsonLayer = statesLayer;

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
    var legendNoti = L.control({position: 'bottomright'});
    legendNoti.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 10, 20, 50, 100, 500, 1000/*, 200, 300, 400, 500, 600, 700*/],
            labels = [],
            from, to;
        labels.push('<i style="background:' + getColorNotificaciones(0) + '"></i> ' + '0');
        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(
                '<i style="background:' + getColorNotificaciones(from + 1) + '"></i> ' +
                from + (to ? '&ndash;' + to : '+'));
        }
        div.innerHTML = '<span>N&uacutemero de Notificaciones</span><br>' + labels.join('<br>')
        return div;
    };
    SMV.legendNoti = legendNoti;

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
    SMV.legendRiesgo = legend;
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
            if(SMV.onriesgo){
                var mapSem = SMV.mapNotif;
            }else{
                var mapSem = SMV.mapSemFil;
            }
            
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
// the selection of markers to be displayed. group by"
function update_filters() {
    var proyectos = get_selected_checkbox('#resultado li input');
    var anio = $( "#anio2" ).slider( "value" );
    var sexo = get_selected_checkbox2('#sexo label');
    var clasif = get_selected_checkbox2('#clasif label');
    
    SMV.anio = anio;
    if(sexo.Masculino){
        SMV.m = 1;
    }else{
        SMV.m = 0;
    }
    if(sexo.Femenino){
        SMV.f = 1;
    }else{
        SMV.f = 0;
    }
    if(clasif.Confirmado){
        SMV.c = 1;
    }else{
        SMV.c = 0;
    }
    if(clasif.Descartado){
        SMV.d = 1;
    }else{
        SMV.d = 0;
    }
    if(clasif.Sospechoso){
        SMV.s = 1;
    }else{
        SMV.s = 0;
    }

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
    }
    descargarFiltradosJsonMap();
    SMV.riesgoJson = riesgo;
    SMV.riesgoDisJson = riesgoDistritos;
    SMV.riesgoAsuJson = riesgoAsu;
    reloadMapSem();

    if(SMV.inzoom){
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
        $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-up");
        $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-down");
       
        return false;
    });

    $('.navbar-nav>li>a').bind('click', function (e) {
        if($(this).attr('href') === '#mapa'){
            $('#menu-content').show();
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
                $('#menu-content').hide();
        }
    });

    if(hide){
        $('#opener').hide();
    }

}
function handleClick(e) {
    SMV.mapatype = e.value;
    if(SMV.mapatype=='mc'){
        $("#fcant").show();
    }else {
        $("#fcant").hide();
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

    $('#resultado li input, #departamento, #distrito, #localidad, #sexo label input, #clasif label input').change(function() {
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

function get_selected_checkbox2(selector){
  var labels = $(selector);
  var enabled = {};

  _.each(labels, function(l){ enabled[l.innerText] = l.children[0].checked; });

  return enabled;
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

/** Ayuda **/

function setup_intro(){
    
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
      intro: "Puedes ver los mapas de riesgo por año y cambiar la opacidad los colores. También puedes ver el mapa de cantidad de notificaciones por departamento con filtros por sexo y clasificación.",
      position: 'right'
    },
    {
      element: '#slide-de-semana',
      intro: "Puedes deslizar la barra para ver los mapas por semana del año seleccionado.",
      position: 'right'
    },
    {
      element: '.info',
      intro: "Aquí puedes ver los datos del departamento/distrito/barrio visible en el mapa.",
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
      element: document.querySelectorAll('#departamentoF')[0],
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

/** Descarga de archivos **/

function setup_download_buttons(){
  $('#filtered-csv').click(function(){
    descargarFiltradosCSV();
  });

  $('#filtered-json').click(function(){
    descargarFiltradosJSON();
  });

}

function descargarCSV(anio) {
    startLoading();
    var data;
    $.ajax({
        url: "/denguemaps/rest/notificacion/filtros?anio=" + anio,
        type:"get",
        success: function(response) {
            JSONData = response;
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
            var CSV = '';
            var row = "";
            // This loop will extract the label from 1st index of on array
            for ( var index in arrData[0]) {
                // Now convert each value to string and comma-seprated
                row += index + ',';
            }
            row = row.slice(0, -1);
            // append Label row with line break
            CSV += row + '\r\n';
            // 1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                var row = "";

                // 2nd loop will extract each column and convert it in string
                // comma-seprated
                for ( var index in arrData[i]) {
                    row += '"' + arrData[i][index] + '",';
                }
                row.slice(0, row.length - 1);
                // add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV == '') {
                alert("Invalid data");
                return;
            }
            finishedLoading();
            download(CSV, "notificaciones.csv", "text/csv");
        },
        error: function(xhr) {
            console.log('errror');
        }
    });
}

function descargarJSON(anio) {
    startLoading();
    var data;
    $.ajax({
        url: "/denguemaps/rest/notificacion/filtros?anio=" + anio,
        type:"get",
        success: function(response) {
            data = response;
            finishedLoading();
            download(JSON.stringify(data, null, 4), "notificaciones.json", "application/json");
        },
        error: function(xhr) {
            console.log('errror');
        }
    });
}

function descargarFiltradosCSV(){
    startLoading();
    var data;
    var anio = $("#anioF").children().children().val();
    var semana = $("#semanaF").children().children().val();
    var fechaNotificacion = $("#fechaF").children().children().val();
    var departamento = $("#departamentoF").children().children().val();
    var distrito = $("#distritoF").children().children().val();
    var sexo = $("#sexoF").children().children().val();
    var edad = $("#edadF").children().children().val();
    var resultado = $("#resultadoF").children().children().val();

    $.ajax({
        url: "/denguemaps/rest/notificacion/filtros?anio=" + anio + "&semana=" + semana
        + "&fechaNotificacion=" + fechaNotificacion + "&departamento=" + departamento 
        + "&distrito=" + distrito + "&sexo=" + sexo + "&edad=" + edad + "&resultado=" + resultado,
        type:"get",
        success: function(response) {
           // console.log(response);
            if (!response){
                alert("Debe indicar al menos un filtro.");
            } else {
                JSONData = response;
                var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
                var CSV = '';
                var row = "";
                // This loop will extract the label from 1st index of on array
                for ( var index in arrData[0]) {
                    // Now convert each value to string and comma-seprated
                    row += index + ',';
                }
                row = row.slice(0, -1);
                // append Label row with line break
                CSV += row + '\r\n';
                // 1st loop is to extract each row
                for (var i = 0; i < arrData.length; i++) {
                    var row = "";

                    // 2nd loop will extract each column and convert it in string
                    // comma-seprated
                    for ( var index in arrData[i]) {
                        row += '"' + arrData[i][index] + '",';
                    }
                    row.slice(0, row.length - 1);
                    // add a line break after each row
                    CSV += row + '\r\n';
                }

                if (CSV == '') {
                    alert("Invalid data");
                    return;
                }
                download(CSV, "notificaciones.csv", "text/csv");
            }
            finishedLoading();
            
        },
        error: function(xhr) {
            console.log('errror');
        }
    });
}

function descargarFiltradosJSON(){
    startLoading();
    var data;
    var anio = $("#anioF").children().children().val();
    var semana = $("#semanaF").children().children().val();
    var fechaNotificacion = $("#fechaF").children().children().val();
    var departamento = $("#departamentoF").children().children().val();
    var distrito = $("#distritoF").children().children().val();
    var sexo = $("#sexoF").children().children().val();
    var edad = $("#edadF").children().children().val();
    var resultado = $("#resultadoF").children().children().val();

    $.ajax({
        url: "/denguemaps/rest/notificacion/filtros?anio=" + anio + "&semana=" + semana
        + "&fechaNotificacion=" + fechaNotificacion + "&departamento=" + departamento 
        + "&distrito=" + distrito + "&sexo=" + sexo + "&edad=" + edad + "&resultado=" + resultado,
        type:"get",
        success: function(response) {
           // console.log(response);
            if (!response){
                alert("Debe indicar al menos un filtro.");
            } else {
                data = response;
                download(JSON.stringify(data, null, 4), "notificaciones.json", "application/json");
            }
            finishedLoading();    
        },
        error: function(xhr) {
            console.log('errror');
        }
    });
}
