//=====================================================
// FUNCIÓN PARA CARGAR EL SELECT DE DEPARTAMENTOS.
// POR CADA DEPARTAMENTO SE AGREGAN DOS OPCIONES:
//=====================================================

function cargarFiltroDepartamentos() {

    // Limpiar el contenido del select
    $('#filtro-departamento').empty();

    // Recorrer todos los departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {

        // Guardar id_empresa e id_departamento separados por |
        $('#filtro-departamento').append(`
            <option value="${departamento.id_empresa}|${departamento.id_departamento}">
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

    $('#busqueda-nomina-confianza').on('keyup', function () {

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
        $('#busqueda-nomina-confianza').val('');

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNomina();

    });

}