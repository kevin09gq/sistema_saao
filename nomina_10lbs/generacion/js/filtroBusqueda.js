//=====================================================
// FUNCIÓN PARA CARGAR EL SELECT DE DEPARTAMENTOS.
// POR CADA DEPARTAMENTO SE AGREGAN DOS OPCIONES:
// CSS = EMPLEADOS CON SEGURO SOCIAL.
// SSS = EMPLEADOS SIN SEGURO SOCIAL.
//=====================================================

function cargarFiltroDepartamentos() {

    // Limpiar el contenido actual del select
    $('#filtro-departamento').empty();

    // Recorrer todos los departamentos
    jsonNomina10lbs.departamentos.forEach(departamento => {

        // Opción para empleados con seguro social (CSS)
        $('#filtro-departamento').append(`
            <option value="${departamento.id_empresa}|${departamento.id_departamento}|CSS">
                ${departamento.nombre} CSS
            </option>
        `);

        // Opción para empleados sin seguro social (SSS)
        $('#filtro-departamento').append(`
            <option value="${departamento.id_empresa}|${departamento.id_departamento}|SSS">
                ${departamento.nombre} SSS
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

    $('#filtro-departamento').change(function () {

        // Regresar a la primera página
        paginaActual = 1;

        // Volver a llenar la tabla
        llenarTablaNomina();

    });

}

//=====================================================
// FUNCIÓN PARA FILTRAR LOS EMPLEADOS
//MIENTRAS EL USUARIO ESCRIBE EN EL BUSCADOR.
//=====================================================

function eventoBusquedaEmpleado() {

    $('#busqueda-nomina-10lbs').on('keyup', function () {

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNomina();

    });

}

//=====================================================
//FUNCIÓN PARA LIMPIAR EL TEXTO DEL BUSCADOR.
//=====================================================

function limpiarBusqueda() {

    $('#btn-clear-busqueda').click(function () {

        // Limpiar el campo de búsqueda
        $('#busqueda-nomina-10lbs').val('');

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNomina();

    });

}