//=====================================================
// FUNCIÓN PARA CARGAR EL SELECT DE DEPARTAMENTOS.
// POR CADA DEPARTAMENTO 
//=====================================================

function cargarFiltroDepartamentos() {

    // Limpiar el contenido del select
    $('#detalle-filtro-departamento').empty();

    // Recorrer todos los departamentos
    jsonHistorialPilar.departamentos.forEach(departamento => {

        // Agregar la opción de empleados con seguro social
        $('#detalle-filtro-departamento').append(`
            <option value="${departamento.id_departamento}">
                ${departamento.nombre}
            </option>
        `);

    });

}

//=====================================================
//FUNCIÓN PARA DETECTAR EL CAMBIO DEL SELECT.
//CADA VEZ QUE EL USUARIO CAMBIE DE DEPARTAMENTO
//SE MOSTRARÁN LOS EMPLEADOS CORRESPONDIENTES.
//=====================================================

function eventoFiltroDepartamento() {

    $('#detalle-filtro-departamento').change(function () {

        // Regresar a la primera página
        paginaActual = 1;

        // Volver a llenar la tabla
        llenarTablaNominaHistorial();

    });

}

//=====================================================
// FUNCIÓN PARA FILTRAR LOS EMPLEADOS
//MIENTRAS EL USUARIO ESCRIBE EN EL BUSCADOR.
//=====================================================

function eventoBusquedaEmpleado() {

    $('#detalle-busqueda-nomina-pilar').on('keyup', function () {

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNominaHistorial();

    });

}

//=====================================================
//FUNCIÓN PARA LIMPIAR EL TEXTO DEL BUSCADOR.
//=====================================================

function limpiarBusqueda() {

    $('#detalle-btn-clear-busqueda').click(function () {

        // Limpiar el campo de búsqueda
        $('#detalle-busqueda-nomina-pilar').val('');

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNominaHistorial();

    });

}