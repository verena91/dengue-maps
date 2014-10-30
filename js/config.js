var SMV = SMV || {};

SMV.ATTR_TO_LABEL = {
            Proyecto: 'Proyecto',
            Localidad: 'Localidad',
            Distrito: 'Distrito',
            Departamento: 'Departamento',
            Empresa: 'Empresa Constructora',
            'Fiscal de Obras': 'Fiscal de Obras',
            'Supervisor de Obras': 'Supervisor de Obras',
            'Cantidad de Viviendas': 'Cantidad de Viviendas',
            Programa: 'Programa',
            'LPN Nº': 'LPN Nº',
            'Monto de Contrato': 'Monto de Contrato',
            'Plazo de Ejecucion de Obras': 'Plazo de Ejecucion de Obras',
            'Estado Obra': 'Estado Obra',
            'Año de Ejercicio': 'Año de Ejercicio',
            'Fecha de Inicio': 'Fecha de Inicio',
            'Adenda Contrato': 'Adenda Contrato',
            'Hasta': 'Hasta',
            'Seg.Cumplimiento' : 'Seg.Cumplimiento',
            'Seg.Anticipo': 'Seg.Anticipo',
            'Seg.Accidentes': 'Seg.Accidentes',
            'Seg.c/Terceros': 'Seg.c/Terceros',
            'Seg.Todo Riesgo': 'Seg.Todo Riesgo',
            'Observaciones': 'Observaciones'
        };


SMV.COLOR_MAP = {
  "Guaira": '#ff8888'
}

SMV.TABLE_COLUMNS = ["Departamento", "Proyecto", "Programa", "LPN Nº", "Empresa", "Distrito", "Localidad",
              "Fiscal de Obras", "Supervisor de Obras", "Cantidad de Viviendas", "Monto de Contrato", "Plazo de Ejecucion de Obras", "Estado Obra",
              "Año de Ejercicio", "Fecha de Inicio", "Adenda Contrato"];

SMV.POPUP_ROWS = {
            "General": ["Proyecto", "Programa", "LPN Nº", "Empresa", "Estado Obra", "Año de Ejercicio", "Cantidad de Viviendas"],
            "Detalles": ["Departamento", "Distrito", "Localidad", "Fiscal de Obras", "Supervisor de Obras", "Monto de Contrato",
                          "Plazo de Ejecucion de Obras", "Fecha de Inicio", "Adenda Contrato"]
}

SMV.DATA_COLUMNS = 4;

SMV.BUTTON_COLUMNS = 2;